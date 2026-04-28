$ErrorActionPreference = 'Stop'

$TargetPath = '../fieldops-workhub-local'
$InitializeIfMissing = $false
$ForceUpgrade = $false
$SkipValidation = $false

for ($i = 0; $i -lt $args.Count; $i += 1) {
  $arg = $args[$i]
  if ([string]::IsNullOrWhiteSpace($arg) -or $arg -eq '--') {
    continue
  }

  switch ($arg) {
    '-TargetPath' {
      if ($i + 1 -ge $args.Count) {
        throw 'Missing value for -TargetPath'
      }
      $TargetPath = $args[$i + 1]
      $i += 1
      continue
    }
    '-InitializeIfMissing' {
      $InitializeIfMissing = $true
      continue
    }
    '-ForceUpgrade' {
      $ForceUpgrade = $true
      continue
    }
    '-SkipValidation' {
      $SkipValidation = $true
      continue
    }
    default {
      throw "Unknown argument: $arg"
    }
  }
}

$scriptRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$repoRoot = Resolve-Path (Join-Path $scriptRoot "..")
$targetAbsolute = [System.IO.Path]::GetFullPath((Join-Path $repoRoot $TargetPath))

function Invoke-Step {
  param(
    [Parameter(Mandatory=$true)][string]$Label,
    [Parameter(Mandatory=$true)][string[]]$Arguments
  )

  Write-Host "[fieldops-regenerate] $Label"
  Write-Host "[fieldops-regenerate] > pnpm $($Arguments -join ' ')"
  & pnpm @Arguments
  if ($LASTEXITCODE -ne 0) {
    throw "Command failed: pnpm $($Arguments -join ' ')"
  }
}

function Invoke-Hubforge {
  param([Parameter(Mandatory=$true)][string[]]$Arguments)
  $hubforgeArgs = @('hubforge', '--')
  $hubforgeArgs += $Arguments
  Invoke-Step -Label "HubForge command" -Arguments $hubforgeArgs
}

$features = @(
  @{ Name='marketing-site'; Type='public-page'; Marker='apps/ui/app/routes/marketing-site.tsx' },
  @{ Name='billing'; Type='billing-module'; Marker='apps/portal/app/routes/_app.billing._index.tsx' },
  @{ Name='notifications'; Type='notifications-module'; Marker='packages/notifications/package.json' },
  @{ Name='customers'; Type='api-resource'; Marker='apps/api/src/routes/customers.ts' },
  @{ Name='customer-contacts'; Type='api-resource'; Marker='apps/api/src/routes/customer-contacts.ts' },
  @{ Name='technicians'; Type='api-resource'; Marker='apps/api/src/routes/technicians.ts' },
  @{ Name='technician-skills'; Type='api-resource'; Marker='apps/api/src/routes/technician-skills.ts' },
  @{ Name='jobs'; Type='api-resource'; Marker='apps/api/src/routes/jobs.ts' },
  @{ Name='appointments'; Type='api-resource'; Marker='apps/api/src/routes/appointments.ts' },
  @{ Name='service-contracts'; Type='api-resource'; Marker='apps/api/src/routes/service-contracts.ts' },
  @{ Name='invoices'; Type='api-resource'; Marker='apps/api/src/routes/invoices.ts' },
  @{ Name='payments'; Type='api-resource'; Marker='apps/api/src/routes/payments.ts' },
  @{ Name='inventory'; Type='tenant-module'; Marker='packages/modules/inventory/seed.mjs' },
  @{ Name='dispatch-board'; Type='tenant-module'; Marker='packages/modules/dispatch-board/seed.mjs' },
  @{ Name='customer-portal'; Type='tenant-module'; Marker='packages/modules/customer-portal/seed.mjs' },
  @{ Name='audit-log'; Type='tenant-module'; Marker='packages/modules/audit-log/seed.mjs' },
  @{ Name='reporting-dashboard'; Type='tenant-module'; Marker='packages/modules/reporting-dashboard/seed.mjs' }
)

Push-Location $repoRoot
try {
  Write-Host "[fieldops-regenerate] Repo root: $repoRoot"
  Write-Host "[fieldops-regenerate] Target: $targetAbsolute"

  Invoke-Step -Label 'Build HubForge CLI' -Arguments @('hubforge:build')

  $targetExists = Test-Path $targetAbsolute
  $hubforgeMetadataPath = Join-Path $targetAbsolute 'hubforge.json'

  if (-not $targetExists -or -not (Test-Path $hubforgeMetadataPath)) {
    if (-not $InitializeIfMissing) {
      throw "Target project is missing or not a HubForge project: $targetAbsolute. Re-run with -InitializeIfMissing to scaffold it first."
    }

    Write-Host '[fieldops-regenerate] Target missing. Initializing FieldOps sample baseline...'
    $initArgs = @(
      'init',
      $targetAbsolute,
      '--template', 'full-local',
      '--db', 'sqlite',
      '--tenant', 'shared',
      '--auth', 'local',
      '--ai', 'fastapi',
      '--force'
    )
    Invoke-Hubforge -Arguments $initArgs
  }

  $upgradeArgs = @('upgrade', '--target', $targetAbsolute)
  if ($ForceUpgrade) {
    $upgradeArgs += '--force'
  }
  Invoke-Hubforge -Arguments $upgradeArgs

  $applied = 0
  $skipped = 0
  foreach ($feature in $features) {
    $markerPath = Join-Path $targetAbsolute $feature.Marker
    if (Test-Path $markerPath) {
      Write-Host "[fieldops-regenerate] Skipping existing feature '$($feature.Name)' ($($feature.Type))"
      $skipped += 1
      continue
    }

    Write-Host "[fieldops-regenerate] Applying feature '$($feature.Name)' ($($feature.Type))"
    Invoke-Hubforge -Arguments @('feature', 'add', $feature.Name, '--type', $feature.Type, '--target', $targetAbsolute)
    $applied += 1
  }

  if (-not $SkipValidation) {
    Invoke-Step -Label 'Install dependencies in FieldOps' -Arguments @('--dir', $targetAbsolute, 'install')
    Invoke-Step -Label 'Run FieldOps DB migrate' -Arguments @('--dir', $targetAbsolute, 'db:migrate')
    Invoke-Step -Label 'Run FieldOps DB seed' -Arguments @('--dir', $targetAbsolute, 'db:seed')
  }

  Write-Host "[fieldops-regenerate] Complete. Applied=$applied Skipped=$skipped"
  if ($SkipValidation) {
    Write-Host '[fieldops-regenerate] Validation was skipped.'
  }
} finally {
  Pop-Location
}
