import path from 'node:path';
import { spawn } from 'node:child_process';
import { getFlagValue } from '../lib/args.js';
import { getExecutionCwd } from '../lib/runtime.js';

export async function runDbCommand(args: string[]): Promise<void> {
  const subcommand = args[0];
  if (subcommand !== 'seed') {
    throw new Error('Unsupported db command. Use: hubforge db seed [--target <path>]');
  }

  const cwd = getExecutionCwd();
  const targetDir = path.resolve(cwd, getFlagValue(args, '--target') ?? '.');

  await runPnpm(targetDir, ['db:seed'], 'db:seed');
  console.log(`[hubforge] DB seed complete in ${targetDir}`);
}

export async function runSeedWorkflow(targetDir: string): Promise<void> {
  await runPnpm(targetDir, ['install'], 'install dependencies');
  await runPnpm(targetDir, ['db:migrate'], 'run migrations');
  await runPnpm(targetDir, ['db:seed'], 'seed database');
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

    child.on('error', (error) => {
      reject(error);
    });

    child.on('close', (exitCode) => {
      resolve(exitCode ?? 1);
    });
  });

  if (code !== 0) {
    throw new Error(`Command failed in ${cwd}: pnpm ${args.join(' ')}`);
  }
}
