import { runAuthServerCommand } from './commands/authserver.js';
import { runDbCommand } from './commands/db.js';
import { runFeatureCommand } from './commands/feature.js';
import { runInfraCommand } from './commands/infra.js';
import { runInitCommand } from './commands/init.js';
import { runUpgradeCommand } from './commands/upgrade.js';

const HELP_TEXT = `HubForge CLI

Usage:
  hubforge init <project-name> [options]
  hubforge authserver enable [--target <path>] [--force]
  hubforge db seed [--target <path>]
  hubforge feature add <feature-name> [options]
  hubforge infra --target k8s
  hubforge upgrade [--target <path>] [--force]

Commands:
  init              Scaffold a new HubForge-ready project baseline.
  authserver enable Enable auth-server support in an existing HubForge project.
  db seed           Run DB seed workflow in an existing HubForge project.
  feature add       Add a feature skeleton to an existing project.
  infra             Generate infrastructure manifests.
  upgrade           Apply new HubForge template updates to an existing project.

Init options:
  --template <pack>        full | full-postgres-rls | full-cloud | full-local (default: full)
  --db <provider>         sqlite | postgres | mysql | sqlserver (default: sqlite)
  --tenant <mode>         shared | isolated | schema-per-tenant | db-per-tenant (default: shared)
  --ai <mode>             fastapi | none (default: fastapi)
  --ai-provider <kind>    mock | openai | azure (default: mock)
  --ai-key <value>        AI provider API key (default: change-me)
  --auth <mode>           external | local (default: local)
  --auth-provider <kind>  zitadel | auth0 | keycloak | custom (default: zitadel)
  --seed                  Run install + db:migrate + db:seed after scaffold
  --force                 Overwrite target directory if it already exists

DB options:
  --target <path>         Path to generated HubForge project (default: current directory)

Authserver options:
  --target <path>         Path to generated HubForge project (default: current directory)
  --force                 Overwrite existing files with latest template output

Feature options:
  --type <kind>           api | api-resource | admin-resource | ui | public-page | tenant-module | worker | background-job | auth-flow | billing-module | notifications-module | ai-agent (default: api)
  --target <path>         Path to target project (default: current directory)

Infra options:
  --target <kind>         k8s (required)

Upgrade options:
  --target <path>         Path to an existing HubForge project (default: current directory)
  --force                 Overwrite existing files with latest template output

Examples:
  hubforge init my-app --template full --db sqlite --tenant shared
  hubforge init my-app --ai-provider openai --ai-key sk_test_123 --seed
  hubforge authserver enable --target ./my-app --force
  hubforge db seed --target ./my-app
  hubforge init acme-saas --template full-postgres-rls --db postgres --tenant isolated
  hubforge init enterprise --template full-cloud --db postgres --tenant isolated --auth external --auth-provider zitadel
  hubforge feature add landing --type public-page
  hubforge feature add settings --type ui
  hubforge feature add catalog --type api-resource
  hubforge feature add crm --type tenant-module
  hubforge feature add sync-orders --type background-job
  hubforge feature add auth --type auth-flow
  hubforge feature add notifications --type notifications-module
  hubforge feature add billing --type api
  hubforge infra --target k8s
  hubforge upgrade --target ../fieldops-workhub-local
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

  if (command === 'authserver') {
    await runAuthServerCommand(rest);
    return;
  }

  if (command === 'db') {
    await runDbCommand(rest);
    return;
  }

  if (command === 'infra') {
    await runInfraCommand(rest);
    return;
  }

  if (command === 'upgrade') {
    await runUpgradeCommand(rest);
    return;
  }

  throw new Error(`Unknown command: ${command}`);
}
