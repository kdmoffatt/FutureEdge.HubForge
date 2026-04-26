import { runFeatureCommand } from './commands/feature.js';
import { runInitCommand } from './commands/init.js';

const HELP_TEXT = `HubForge CLI

Usage:
  hubforge init <project-name> [options]
  hubforge feature add <feature-name> [options]

Commands:
  init              Scaffold a new HubForge-ready project baseline.
  feature add       Add a feature skeleton to an existing project.

Init options:
  --template <pack>        full | full-postgres-rls | full-cloud | full-local (default: full)
  --db <provider>         sqlite | postgres | mysql | sqlserver (default: sqlite)
  --tenant <mode>         shared | isolated (default: shared)
  --ai <mode>             fastapi | none (default: fastapi)
  --auth <mode>           external | local (default: external)
  --auth-provider <kind>  zitadel | auth0 | keycloak | custom (default: zitadel)
  --force                 Overwrite target directory if it already exists

Feature options:
  --type <kind>           api | api-resource | ui | public-page | tenant-module | worker | auth-flow | billing-module | notifications-module | ai-agent (default: api)
  --target <path>         Path to target project (default: current directory)

Examples:
  hubforge init my-app --template full --db sqlite --tenant shared
  hubforge init acme-saas --template full-postgres-rls --db postgres --tenant isolated
  hubforge init enterprise --template full-cloud --db postgres --tenant isolated --auth external --auth-provider zitadel
  hubforge feature add landing --type public-page
  hubforge feature add settings --type ui
  hubforge feature add catalog --type api-resource
  hubforge feature add crm --type tenant-module
  hubforge feature add auth --type auth-flow
  hubforge feature add notifications --type notifications-module
  hubforge feature add billing --type api
`;

export async function runCli(argv: string[]): Promise<void> {
  const normalizedArgv = [...argv];
  while (normalizedArgv[0] === '--') {
    normalizedArgv.shift();
  }

  if (normalizedArgv.length === 0 || normalizedArgv.includes('--help') || normalizedArgv.includes('-h')) {
    process.stdout.write(`${HELP_TEXT}\n`);
    return;
  }

  const [command, ...rest] = normalizedArgv;

  if (command === 'init') {
    await runInitCommand(rest);
    return;
  }

  if (command === 'feature') {
    await runFeatureCommand(rest);
    return;
  }

  throw new Error(`Unknown command: ${command}`);
}
