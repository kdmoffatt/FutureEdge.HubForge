import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { access } from 'node:fs/promises';

export type HookContext = {
  cwd: string;
  command: 'init' | 'feature' | 'infra' | 'upgrade';
  args: string[];
};

export type HubForgeHooks = {
  beforeInit?: (input: { projectName: string; options: Record<string, string | boolean> } & HookContext) => Promise<void> | void;
  afterInit?: (input: { projectName: string; targetDir: string } & HookContext) => Promise<void> | void;
  beforeFeature?: (input: { featureName: string; type: string; targetDir: string } & HookContext) => Promise<void> | void;
  afterFeature?: (input: { featureName: string; type: string; targetDir: string } & HookContext) => Promise<void> | void;
  beforeUpgrade?: (input: { targetDir: string; force: boolean } & HookContext) => Promise<void> | void;
  afterUpgrade?: (input: { targetDir: string; upgradedFiles: string[] } & HookContext) => Promise<void> | void;
};

async function exists(filePath: string): Promise<boolean> {
  try {
    await access(filePath);
    return true;
  } catch {
    return false;
  }
}

export async function loadHooks(cwd: string): Promise<HubForgeHooks> {
  const pluginFile = path.join(cwd, 'hubforge.plugins.mjs');
  if (!(await exists(pluginFile))) {
    return {};
  }

  const mod = (await import(pathToFileURL(pluginFile).href)) as { default?: HubForgeHooks; hooks?: HubForgeHooks };
  return mod.default ?? mod.hooks ?? {};
}