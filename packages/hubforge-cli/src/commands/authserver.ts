import { access, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { getFlagValue, hasFlag } from '../lib/args.js';
import { getExecutionCwd } from '../lib/runtime.js';
import { runUpgradeCommand } from './upgrade.js';

type HubForgeMetadata = {
  authServer?: boolean;
  [key: string]: unknown;
};

export async function runAuthServerCommand(args: string[]): Promise<void> {
  const [subcommand, ...rest] = args;
  if (subcommand !== 'enable') {
    throw new Error('Unknown authserver command. Usage: hubforge authserver enable [--target <path>] [--force]');
  }

  const cwd = getExecutionCwd();
  const targetDir = path.resolve(cwd, getFlagValue(rest, '--target') ?? '.');
  const force = hasFlag(rest, '--force');

  const metadataPath = path.join(targetDir, 'hubforge.json');
  if (!(await pathExists(metadataPath))) {
    throw new Error('hubforge.json not found in target. Run from a generated HubForge project or use --target.');
  }

  const metadata = JSON.parse(await readFile(metadataPath, 'utf8')) as HubForgeMetadata;
  const alreadyEnabled = metadata.authServer === true;

  if (!alreadyEnabled) {
    metadata.authServer = true;
    await writeFile(metadataPath, `${JSON.stringify(metadata, null, 2)}\n`, 'utf8');
    console.log('[hubforge] authServer has been enabled in hubforge.json');
  } else {
    console.log('[hubforge] authServer is already enabled in hubforge.json');
  }

  await runUpgradeCommand(['--target', targetDir, ...(force ? ['--force'] : [])]);

  console.log('[hubforge] Auth-server scaffold sync complete.');
  console.log('[hubforge] Next step: run pnpm --dir ' + targetDir + ' db:migrate');
}

async function pathExists(filePath: string): Promise<boolean> {
  try {
    await access(filePath);
    return true;
  } catch {
    return false;
  }
}
