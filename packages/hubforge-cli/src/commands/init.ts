import { access, mkdir } from 'node:fs/promises';
import path from 'node:path';
import { z } from 'zod';
import { getFlagValue, hasFlag, getPositionalArgs } from '../lib/args.js';
import { isDirectoryEmpty, writeTextFile } from '../lib/fs.js';
import { getExecutionCwd } from '../lib/runtime.js';
import { scaffoldFullTemplatePack } from '../template-packs/full-pack.js';
import { scaffoldFullPostgresRlsTemplatePack } from '../template-packs/full-postgres-rls-pack.js';
import type { InitScaffoldOptions } from '../template-packs/types.js';

const dbProviderSchema = z.enum(['sqlite', 'postgres', 'mysql', 'sqlserver']);
const tenantModeSchema = z.enum(['shared', 'isolated']);
const aiModeSchema = z.enum(['fastapi', 'none']);
const authModeSchema = z.enum(['external', 'local']);
const authProviderSchema = z.enum(['zitadel', 'auth0', 'keycloak', 'custom']);
const templatePackSchema = z.enum(['full', 'full-postgres-rls', 'full-cloud', 'full-local']);

export async function runInitCommand(args: string[]): Promise<void> {
  const positional = getPositionalArgs(args);
  const projectName = positional[0];

  if (!projectName) {
    throw new Error('Missing required project name. Usage: hubforge init <project-name> [options]');
  }

  const dbProvider = dbProviderSchema.parse(getFlagValue(args, '--db') ?? 'sqlite');
  const tenantMode = tenantModeSchema.parse(getFlagValue(args, '--tenant') ?? 'shared');
  const aiMode = aiModeSchema.parse(getFlagValue(args, '--ai') ?? 'fastapi');
  const authMode = authModeSchema.parse(getFlagValue(args, '--auth') ?? 'local');
  const authProvider = authProviderSchema.parse(getFlagValue(args, '--auth-provider') ?? 'zitadel');
  const authServer = hasFlag(args, '--authserver');
  const templatePackInput = templatePackSchema.parse(getFlagValue(args, '--template') ?? 'full');
  const templatePack = templatePackInput === 'full-cloud'
    ? 'full-postgres-rls'
    : templatePackInput === 'full-local'
      ? 'full'
      : templatePackInput;
  const force = hasFlag(args, '--force');

  if (templatePack === 'full-postgres-rls' && dbProvider !== 'postgres') {
    throw new Error('The full-postgres-rls template pack requires --db postgres.');
  }

  const options: InitScaffoldOptions = {
    projectName,
    dbProvider,
    tenantMode,
    aiMode,
    authMode,
    authProvider,
    authServer,
    templatePack,
    force,
  };

  await scaffoldProject(options);

  console.log(`[hubforge] Project scaffold created at ./${projectName}`);
  console.log(`[hubforge] Template pack: ${templatePack}`);
  console.log(`[hubforge] Database provider: ${dbProvider}`);
  console.log(`[hubforge] Tenant mode: ${tenantMode}`);
  console.log(`[hubforge] Auth mode: ${authMode}`);
  console.log(`[hubforge] Auth provider: ${authProvider}`);
  console.log(`[hubforge] Auth server settings scaffold: ${authServer ? 'enabled' : 'disabled'}`);
  console.log('[hubforge] Next steps:');
  console.log(`  cd ${projectName}`);
  console.log('  pnpm install');
  console.log('  pnpm infra:up');
  console.log('  pnpm db:migrate');
  console.log('  pnpm dev:api');
  console.log('  pnpm dev:ui');
  console.log('  pnpm dev:portal');
}

async function scaffoldProject(options: InitScaffoldOptions): Promise<void> {
  const targetDir = path.resolve(getExecutionCwd(), options.projectName);

  const exists = await pathExists(targetDir);
  if (exists) {
    const empty = await isDirectoryEmpty(targetDir);
    if (!empty && !options.force) {
      throw new Error(`Target directory already exists and is not empty: ${targetDir}. Use --force to continue.`);
    }
  } else {
    await mkdir(targetDir, { recursive: true });
  }

  await writeTextFile(path.join(targetDir, 'hubforge.json'), buildHubForgeMetadata(options));
  if (options.templatePack === 'full-postgres-rls') {
    await scaffoldFullPostgresRlsTemplatePack(targetDir, options);
    return;
  }

  await scaffoldFullTemplatePack(targetDir, options);
}

async function pathExists(filePath: string): Promise<boolean> {
  try {
    await access(filePath);
    return true;
  } catch {
    return false;
  }
}

function buildHubForgeMetadata(options: InitScaffoldOptions): string {
  return `${JSON.stringify(
    {
      name: options.projectName,
      framework: 'HubForge',
      version: '0.2.0',
      templatePack: options.templatePack,
      dbProvider: options.dbProvider,
      tenantMode: options.tenantMode,
      aiMode: options.aiMode,
      authMode: options.authMode,
      authProvider: options.authProvider,
      authServer: options.authServer,
      generatedAt: new Date().toISOString(),
    },
    null,
    2,
  )}\n`;
}
