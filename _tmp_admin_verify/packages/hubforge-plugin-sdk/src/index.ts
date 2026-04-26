export type HookContext = {
  cwd: string;
  command: 'init' | 'feature' | 'infra' | 'upgrade';
  args: string[];
};

export type HubForgeHooks = {
  beforeInit?: (input: HookContext & { projectName: string; options: Record<string, string | boolean> }) => Promise<void> | void;
  afterInit?: (input: HookContext & { projectName: string; targetDir: string }) => Promise<void> | void;
  beforeFeature?: (input: HookContext & { featureName: string; type: string; targetDir: string }) => Promise<void> | void;
  afterFeature?: (input: HookContext & { featureName: string; type: string; targetDir: string }) => Promise<void> | void;
  beforeUpgrade?: (input: HookContext & { targetDir: string; force: boolean }) => Promise<void> | void;
  afterUpgrade?: (input: HookContext & { targetDir: string; upgradedFiles: string[] }) => Promise<void> | void;
};
