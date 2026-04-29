import path from 'node:path';
import { access } from 'node:fs/promises';
import { spawn } from 'node:child_process';
import { getFlagValue, hasFlag } from '../lib/args.js';
import { getExecutionCwd } from '../lib/runtime.js';

const REQUIRED_PATHS = [
  'hubforge.json',
  'apps/api/src/server.ts',
  'apps/portal/app/routes/_app.tsx',
  'apps/ui/app/routes/_index.tsx',
  'packages/db/prisma/schema.prisma',
  'infra/k8s/namespace.yaml',
];

export async function runValidateCommand(args: string[]): Promise<void> {
  const cwd = getExecutionCwd();
  const targetDir = path.resolve(cwd, getFlagValue(args, '--target') ?? '.');
  const quick = hasFlag(args, '--quick');
  const skipInstall = hasFlag(args, '--skip-install');

  const missing = await getMissingPaths(targetDir, REQUIRED_PATHS);
  if (missing.length > 0) {
    throw new Error(
      'Validation failed. Missing required files:\n' +
      missing.map((item) => `  - ${item}`).join('\n'),
    );
  }

  console.log(`[hubforge] Baseline structure check passed (${REQUIRED_PATHS.length} required files).`);

  if (quick) {
    console.log('[hubforge] Quick validation complete.');
    return;
  }

  if (!skipInstall) {
    await runPnpm(targetDir, ['install'], 'install dependencies');
  }
  await runPnpm(targetDir, ['build'], 'workspace build');
  await runPnpm(targetDir, ['--filter', '@hubforge/api', 'typecheck'], 'API typecheck');
  await runPnpm(targetDir, ['--filter', '@hubforge/portal', 'typecheck'], 'Portal typecheck');

  console.log('[hubforge] Validation complete.');
}

async function getMissingPaths(targetDir: string, required: string[]): Promise<string[]> {
  const missing: string[] = [];
  for (const relativePath of required) {
    const absolutePath = path.join(targetDir, relativePath);
    try {
      await access(absolutePath);
    } catch {
      missing.push(relativePath);
    }
  }
  return missing;
}

async function runPnpm(cwd: string, args: string[], label: string): Promise<void> {
  const pnpmCommand = process.platform === 'win32' ? 'pnpm.cmd' : 'pnpm';
  console.log(`[hubforge] Running ${label}: pnpm ${args.join(' ')}`);

  const code = await new Promise<number>((resolve, reject) => {
    const child = spawn(pnpmCommand, args, {
      cwd,
      stdio: 'inherit',
      env: process.env,
    });

    child.on('error', (error) => reject(error));
    child.on('close', (exitCode) => resolve(exitCode ?? 1));
  });

  if (code !== 0) {
    throw new Error(`Validation command failed in ${cwd}: pnpm ${args.join(' ')}`);
  }
}
