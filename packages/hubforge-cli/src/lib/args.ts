export function getFlagValue(args: string[], flag: string): string | undefined {
  const index = args.indexOf(flag);
  if (index === -1) {
    return undefined;
  }

  return args[index + 1];
}

export function hasFlag(args: string[], flag: string): boolean {
  return args.includes(flag);
}

export function getPositionalArgs(args: string[]): string[] {
  const values: string[] = [];

  for (let i = 0; i < args.length; i += 1) {
    const value = args[i];
    if (!value || value.startsWith('-')) {
      if (value?.startsWith('--') && args[i + 1] && !args[i + 1]?.startsWith('-')) {
        i += 1;
      }
      continue;
    }

    values.push(value);
  }

  return values;
}
