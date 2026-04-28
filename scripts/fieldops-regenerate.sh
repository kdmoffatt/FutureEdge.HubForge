#!/usr/bin/env bash
set -euo pipefail

TARGET_PATH="."
INITIALIZE_IF_MISSING="false"
FORCE_UPGRADE="false"
SKIP_VALIDATION="false"
FEATURE_PROFILE="none"

while [[ $# -gt 0 ]]; do
  case "$1" in
    --target)
      TARGET_PATH="$2"
      shift 2
      ;;
    --initialize-if-missing)
      INITIALIZE_IF_MISSING="true"
      shift
      ;;
    --force-upgrade)
      FORCE_UPGRADE="true"
      shift
      ;;
    --skip-validation)
      SKIP_VALIDATION="true"
      shift
      ;;
    --feature-profile)
      FEATURE_PROFILE="${2,,}"
      shift 2
      ;;
    *)
      echo "[hubforge-regenerate] Unknown argument: $1" >&2
      exit 1
      ;;
  esac
done

SCRIPT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_ROOT/.." && pwd)"
TARGET_ABSOLUTE="$(cd "$REPO_ROOT" && node -e "console.log(require('path').resolve(process.argv[1]))" "$TARGET_PATH")"

run_step() {
  local label="$1"
  shift
  echo "[hubforge-regenerate] $label"
  echo "[hubforge-regenerate] > pnpm $*"
  pnpm "$@"
}

run_hubforge() {
  run_step "HubForge command" hubforge -- "$@"
}

FEATURES=()
if [[ "$FEATURE_PROFILE" == "fieldops" ]]; then
  FEATURES=(
    "marketing-site|public-page|apps/ui/app/routes/marketing-site.tsx"
    "billing|billing-module|apps/portal/app/routes/_app.billing._index.tsx"
    "notifications|notifications-module|packages/notifications/package.json"
    "customers|api-resource|apps/api/src/routes/customers.ts"
    "customer-contacts|api-resource|apps/api/src/routes/customer-contacts.ts"
    "technicians|api-resource|apps/api/src/routes/technicians.ts"
    "technician-skills|api-resource|apps/api/src/routes/technician-skills.ts"
    "jobs|api-resource|apps/api/src/routes/jobs.ts"
    "appointments|api-resource|apps/api/src/routes/appointments.ts"
    "service-contracts|api-resource|apps/api/src/routes/service-contracts.ts"
    "invoices|api-resource|apps/api/src/routes/invoices.ts"
    "payments|api-resource|apps/api/src/routes/payments.ts"
    "inventory|tenant-module|packages/modules/inventory/seed.mjs"
    "dispatch-board|tenant-module|packages/modules/dispatch-board/seed.mjs"
    "customer-portal|tenant-module|packages/modules/customer-portal/seed.mjs"
    "audit-log|tenant-module|packages/modules/audit-log/seed.mjs"
    "reporting-dashboard|tenant-module|packages/modules/reporting-dashboard/seed.mjs"
  )
fi

cd "$REPO_ROOT"
echo "[hubforge-regenerate] Repo root: $REPO_ROOT"
echo "[hubforge-regenerate] Target: $TARGET_ABSOLUTE"
echo "[hubforge-regenerate] Feature profile: $FEATURE_PROFILE"

run_step "Build HubForge CLI" hubforge:build

if [[ ! -f "$TARGET_ABSOLUTE/hubforge.json" ]]; then
  if [[ "$INITIALIZE_IF_MISSING" != "true" ]]; then
    echo "[hubforge-regenerate] Target missing or not a HubForge project: $TARGET_ABSOLUTE" >&2
    echo "[hubforge-regenerate] Re-run with --initialize-if-missing to scaffold it first." >&2
    exit 1
  fi

  echo "[hubforge-regenerate] Target missing. Initializing HubForge baseline..."
  run_hubforge init "$TARGET_ABSOLUTE" --template full-local --db sqlite --tenant shared --auth local --ai fastapi --force
fi

UPGRADE_ARGS=(upgrade --target "$TARGET_ABSOLUTE")
if [[ "$FORCE_UPGRADE" == "true" ]]; then
  UPGRADE_ARGS+=(--force)
fi
run_hubforge "${UPGRADE_ARGS[@]}"

APPLIED=0
SKIPPED=0
for feature in "${FEATURES[@]}"; do
  IFS='|' read -r name type marker <<< "$feature"
  if [[ -e "$TARGET_ABSOLUTE/$marker" ]]; then
    echo "[hubforge-regenerate] Skipping existing feature '$name' ($type)"
    SKIPPED=$((SKIPPED + 1))
    continue
  fi

  echo "[hubforge-regenerate] Applying feature '$name' ($type)"
  run_hubforge feature add "$name" --type "$type" --target "$TARGET_ABSOLUTE"
  APPLIED=$((APPLIED + 1))
done

if [[ "$SKIP_VALIDATION" != "true" ]]; then
  run_step "Install dependencies in target project" --dir "$TARGET_ABSOLUTE" install
  run_step "Run target DB migrate" --dir "$TARGET_ABSOLUTE" db:migrate
  run_step "Run target DB seed" --dir "$TARGET_ABSOLUTE" db:seed
fi

echo "[hubforge-regenerate] Complete. Applied=$APPLIED Skipped=$SKIPPED"
if [[ "$SKIP_VALIDATION" == "true" ]]; then
  echo "[hubforge-regenerate] Validation was skipped."
fi
