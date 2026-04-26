export function getExecutionCwd(): string {
  return process.env['INIT_CWD'] ?? process.cwd();
}