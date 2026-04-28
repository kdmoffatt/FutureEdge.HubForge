import path from 'node:path';
import { access, cp, mkdtemp, readdir, readFile, rm, stat } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { getExecutionCwd } from '../lib/runtime.js';
import { getFlagValue, hasFlag } from '../lib/args.js';
import { scaffoldFullTemplatePack } from '../template-packs/full-pack.js';
import { scaffoldFullPostgresRlsTemplatePack } from '../template-packs/full-postgres-rls-pack.js';
import type { InitScaffoldOptions, TemplatePack } from '../template-packs/types.js';
import { loadHooks } from '../lib/plugins.js';

type Metadata = {
  name: string;
  templatePack?: TemplatePack;
  dbProvider?: InitScaffoldOptions['dbProvider'];
  tenantMode?: InitScaffoldOptions['tenantMode'];
  aiMode?: InitScaffoldOptions['aiMode'];
  aiProvider?: InitScaffoldOptions['aiProvider'];
  authMode?: InitScaffoldOptions['authMode'];
  authProvider?: InitScaffoldOptions['authProvider'];
  authServer?: boolean;
};

async function pathExists(filePath: string): Promise<boolean> {
  try {
    await access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function listFilesRecursive(rootDir: string): Promise<string[]> {
  const out: string[] = [];
  async function walk(current: string): Promise<void> {
    const entries = await readdir(current, { withFileTypes: true });
    for (const entry of entries) {
      const abs = path.join(current, entry.name);
      if (entry.isDirectory()) {
        if (entry.name === 'node_modules' || entry.name === '.git') {
          continue;
        }
        await walk(abs);
      } else {
        out.push(path.relative(rootDir, abs));
      }
    }
  }
  await walk(rootDir);
  return out;
}

export async function runUpgradeCommand(args: string[]): Promise<void> {
  const cwd = getExecutionCwd();
  const targetDir = path.resolve(cwd, getFlagValue(args, '--target') ?? '.');
  const force = hasFlag(args, '--force');

  const hubforgeJson = path.join(targetDir, 'hubforge.json');
  if (!(await pathExists(hubforgeJson))) {
    throw new Error('hubforge.json not found in target. Run from a generated HubForge project or use --target.');
  }

  const metadata = JSON.parse(await readFile(hubforgeJson, 'utf8')) as Metadata;
  const hooks = await loadHooks(targetDir);
  await hooks.beforeUpgrade?.({ cwd: targetDir, command: 'upgrade', args, targetDir, force });

  const tempRoot = await mkdtemp(path.join(tmpdir(), 'hubforge-upgrade-'));
  const metadataName = (metadata.name ?? '').trim();
  const safeName = path.basename(metadataName || 'upgraded-project').replace(/[^a-zA-Z0-9._-]/g, '-');
  const scaffoldDir = path.join(tempRoot, safeName || 'upgraded-project');

  const options: InitScaffoldOptions = {
    projectName: path.basename(scaffoldDir),
    dbProvider: metadata.dbProvider ?? 'sqlite',
    tenantMode: metadata.tenantMode ?? 'shared',
    aiMode: metadata.aiMode ?? 'fastapi',
    aiProvider: metadata.aiProvider ?? 'mock',
    aiKey: 'change-me',
    authMode: metadata.authMode ?? 'local',
    authProvider: metadata.authProvider ?? 'zitadel',
    authServer: metadata.authServer ?? false,
    seed: false,
    templatePack: metadata.templatePack ?? 'full',
    force: true,
  };

  if (options.templatePack === 'full-postgres-rls') {
    await scaffoldFullPostgresRlsTemplatePack(scaffoldDir, options);
  } else {
    await scaffoldFullTemplatePack(scaffoldDir, options);
  }

  const generatedFiles = await listFilesRecursive(scaffoldDir);
  const upgradedFiles: string[] = [];
  for (const rel of generatedFiles) {
    const source = path.join(scaffoldDir, rel);
    const destination = path.join(targetDir, rel);
    const destinationExists = await pathExists(destination);

    if (!destinationExists || force) {
      await cp(source, destination, { force: true });
      upgradedFiles.push(rel);
      continue;
    }

    const sourceStat = await stat(source);
    if (sourceStat.size === 0) {
      continue;
    }
  }

  await rm(tempRoot, { recursive: true, force: true });
  await hooks.afterUpgrade?.({ cwd: targetDir, command: 'upgrade', args, targetDir, upgradedFiles });

  console.log(`[hubforge] Upgrade complete. ${upgradedFiles.length} file(s) applied${force ? ' (force mode)' : ''}.`);
  if (upgradedFiles.length > 0) {
    console.log('[hubforge] Updated files:');
    for (const file of upgradedFiles.slice(0, 25)) {
      console.log(`  - ${file}`);
    }
    if (upgradedFiles.length > 25) {
      console.log(`  ... and ${upgradedFiles.length - 25} more`);
    }
  }
}