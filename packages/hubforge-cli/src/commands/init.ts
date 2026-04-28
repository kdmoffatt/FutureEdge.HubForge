import { access, mkdir } from 'node:fs/promises';
import path from 'node:path';
import { createInterface } from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';
import { z } from 'zod';
import { getFlagValue, hasFlag, getPositionalArgs } from '../lib/args.js';
import { isDirectoryEmpty, writeTextFile } from '../lib/fs.js';
import { getExecutionCwd } from '../lib/runtime.js';
import { runSeedWorkflow } from './db.js';
import { scaffoldFullTemplatePack } from '../template-packs/full-pack.js';
import { scaffoldFullPostgresRlsTemplatePack } from '../template-packs/full-postgres-rls-pack.js';
import type { InitScaffoldOptions } from '../template-packs/types.js';
import { loadHooks } from '../lib/plugins.js';

const dbProviderSchema = z.enum(['sqlite', 'postgres', 'mysql', 'sqlserver']);
const tenantModeSchema = z.enum(['shared', 'isolated', 'schema-per-tenant', 'db-per-tenant']);
const aiModeSchema = z.enum(['fastapi', 'none']);
const aiProviderSchema = z.enum(['mock', 'openai', 'azure']);
const authModeSchema = z.enum(['external', 'local']);
const authProviderSchema = z.enum(['zitadel', 'auth0', 'keycloak', 'custom']);
const templatePackSchema = z.enum(['full', 'full-postgres-rls', 'full-cloud', 'full-local']);

export async function runInitCommand(args: string[]): Promise<void> {
  const positional = getPositionalArgs(args);
  let projectName = positional[0];

  const interactive = args.length === 0 || (!projectName && !hasAnyKnownFlag(args));
  if (interactive) {
    const prompted = await promptForInitOptions();
    projectName = prompted.projectName;
    args = prompted.args;
  }

  if (!projectName) {
    throw new Error('Missing required project name. Usage: hubforge init <project-name> [options]');
  }

  const dbProvider = dbProviderSchema.parse(getFlagValue(args, '--db') ?? 'sqlite');
  const tenantMode = tenantModeSchema.parse(getFlagValue(args, '--tenant') ?? 'shared');
  const aiMode = aiModeSchema.parse(getFlagValue(args, '--ai') ?? 'fastapi');
  const aiProvider = aiProviderSchema.parse(getFlagValue(args, '--ai-provider') ?? 'mock');
  const aiKey = (getFlagValue(args, '--ai-key') ?? 'change-me').trim() || 'change-me';
  const authMode = authModeSchema.parse(getFlagValue(args, '--auth') ?? 'local');
  const authProvider = authProviderSchema.parse(getFlagValue(args, '--auth-provider') ?? 'zitadel');
  const authServer = hasFlag(args, '--authserver');
  const templatePackInput = templatePackSchema.parse(getFlagValue(args, '--template') ?? 'full');
  const templatePack = templatePackInput === 'full-cloud'
    ? 'full-postgres-rls'
    : templatePackInput === 'full-local'
      ? 'full'
      : templatePackInput;
  const seed = hasFlag(args, '--seed');
  const force = hasFlag(args, '--force');

  if (templatePack === 'full-postgres-rls' && dbProvider !== 'postgres') {
    throw new Error('The full-postgres-rls template pack requires --db postgres.');
  }

  const options: InitScaffoldOptions = {
    projectName,
    dbProvider,
    tenantMode,
    aiMode,
    aiProvider,
    aiKey,
    authMode,
    authProvider,
    authServer,
    seed,
    templatePack,
    force,
  };

  const cwd = getExecutionCwd();
  const hooks = await loadHooks(cwd);
  await hooks.beforeInit?.({
    cwd,
    command: 'init',
    args,
    projectName,
    options: {
      dbProvider,
      tenantMode,
      aiMode,
      aiProvider,
      authMode,
      authProvider,
      authServer,
      seed,
      templatePack,
      force,
    },
  });

  await scaffoldProject(options);

  if (seed) {
    console.log('[hubforge] --seed enabled. Running install + migrate + seed workflow...');
    await runSeedWorkflow(path.resolve(cwd, projectName));
  }

  await hooks.afterInit?.({
    cwd,
    command: 'init',
    args,
    projectName,
    targetDir: path.resolve(cwd, projectName),
  });

  console.log(`[hubforge] Project scaffold created at ./${projectName}`);
  console.log(`[hubforge] Template pack: ${templatePack}`);
  console.log(`[hubforge] Database provider: ${dbProvider}`);
  console.log(`[hubforge] Tenant mode: ${tenantMode}`);
  console.log(`[hubforge] AI provider: ${aiProvider}`);
  console.log(`[hubforge] Auth mode: ${authMode}`);
  console.log(`[hubforge] Auth provider: ${authProvider}`);
  console.log(`[hubforge] Auth server settings scaffold: ${authServer ? 'enabled' : 'disabled'}`);
  console.log(`[hubforge] Seed workflow: ${seed ? 'completed' : 'skipped'}`);
  console.log('[hubforge] Next steps:');
  console.log(`  cd ${projectName}`);
  if (!seed) {
    console.log('  pnpm install');
    console.log('  pnpm infra:up');
    console.log('  pnpm db:migrate');
    console.log('  pnpm db:seed');
  }
  console.log('  pnpm dev:api');
  console.log('  pnpm dev:ui');
  console.log('  pnpm dev:portal');
}

function hasAnyKnownFlag(args: string[]): boolean {
  const known = ['--template', '--db', '--tenant', '--ai', '--ai-provider', '--ai-key', '--auth', '--auth-provider', '--authserver', '--seed', '--force'];
  return known.some((flag) => args.includes(flag));
}

async function promptForInitOptions(): Promise<{ projectName: string; args: string[] }> {
  const rl = createInterface({ input, output });
  try {
    const projectName = (await rl.question('Project name: ')).trim();
    if (!projectName) {
      throw new Error('Project name is required.');
    }

    const template = normalizePromptChoice(await rl.question('Template [full/full-postgres-rls/full-cloud/full-local] (full): '), 'full');
    const db = normalizePromptChoice(await rl.question('Database [sqlite/postgres/mysql/sqlserver] (sqlite): '), 'sqlite');
    const tenant = normalizePromptChoice(await rl.question('Tenant mode [shared/isolated/schema-per-tenant/db-per-tenant] (shared): '), 'shared');
    const ai = normalizePromptChoice(await rl.question('AI mode [fastapi/none] (fastapi): '), 'fastapi');
    const aiProvider = normalizePromptChoice(await rl.question('AI provider [mock/openai/azure] (mock): '), 'mock');
    const aiKeyInput = (await rl.question('AI key (change-me): ')).trim();
    const aiKey = aiKeyInput.length > 0 ? aiKeyInput : 'change-me';
    const auth = normalizePromptChoice(await rl.question('Auth mode [local/external] (local): '), 'local');
    const authProvider = normalizePromptChoice(await rl.question('Auth provider [zitadel/auth0/keycloak/custom] (zitadel): '), 'zitadel');
    const authServerAnswer = normalizePromptChoice(await rl.question('Enable auth-server settings scaffold? [y/N]: '), 'n');
    const seedAnswer = normalizePromptChoice(await rl.question('Run install + db migrate + db seed now? [y/N]: '), 'n');

    const args: string[] = [
      projectName,
      '--template', template,
      '--db', db,
      '--tenant', tenant,
      '--ai', ai,
      '--ai-provider', aiProvider,
      '--ai-key', aiKey,
      '--auth', auth,
      '--auth-provider', authProvider,
    ];
    if (authServerAnswer === 'y' || authServerAnswer === 'yes') {
      args.push('--authserver');
    }
    if (seedAnswer === 'y' || seedAnswer === 'yes') {
      args.push('--seed');
    }
    return { projectName, args };
  } finally {
    rl.close();
  }
}

function normalizePromptChoice(inputValue: string, fallback: string): string {
  const value = inputValue.trim().toLowerCase();
  return value.length > 0 ? value : fallback;
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
      aiProvider: options.aiProvider,
      authMode: options.authMode,
      authProvider: options.authProvider,
      authServer: options.authServer,
      generatedAt: new Date().toISOString(),
    },
    null,
    2,
  )}\n`;
}
