import { readFileSync, existsSync } from 'node:fs';
import { Client } from 'pg';

function loadDotEnv(filePath) {
  if (!existsSync(filePath)) {
    return;
  }

  const content = readFileSync(filePath, 'utf8');
  for (const rawLine of content.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) {
      continue;
    }
    const idx = line.indexOf('=');
    if (idx <= 0) {
      continue;
    }
    const key = line.slice(0, idx).trim();
    const value = line.slice(idx + 1).trim();
    if (!(key in process.env)) {
      process.env[key] = value;
    }
  }
}

function quoteIdentifier(identifier) {
  return '"' + identifier.replaceAll('"', '""') + '"';
}

function quoteLiteral(value) {
  return "'" + value.replaceAll("'", "''") + "'";
}

function buildAdminCandidates(databaseUrlRaw) {
  const candidates = [];
  const explicit = process.env.DATABASE_ADMIN_URL ?? process.env.POSTGRES_ADMIN_URL;
  if (explicit) {
    candidates.push(explicit);
  }

  const defaultAdmin = new URL(databaseUrlRaw);
  defaultAdmin.username = process.env.POSTGRES_ADMIN_USER ?? 'postgres';
  defaultAdmin.password = process.env.POSTGRES_ADMIN_PASSWORD ?? 'postgres';
  defaultAdmin.pathname = '/postgres';
  candidates.push(defaultAdmin.toString());

  const sameCreds = new URL(databaseUrlRaw);
  sameCreds.pathname = '/postgres';
  candidates.push(sameCreds.toString());

  return [...new Set(candidates)];
}

async function ensureDefaultsWithAdmin(adminUrl, appRole, appPassword, appDb, shadowDb) {
  const admin = new Client({ connectionString: adminUrl });
  await admin.connect();

  const roleExists = await admin.query('SELECT 1 FROM pg_roles WHERE rolname = $1', [appRole]);
  if (roleExists.rowCount === 0) {
    await admin.query('CREATE ROLE ' + quoteIdentifier(appRole) + ' WITH LOGIN PASSWORD ' + quoteLiteral(appPassword));
  } else {
    await admin.query('ALTER ROLE ' + quoteIdentifier(appRole) + ' WITH LOGIN PASSWORD ' + quoteLiteral(appPassword));
  }

  const dbExists = await admin.query('SELECT 1 FROM pg_database WHERE datname = $1', [appDb]);
  if (dbExists.rowCount === 0) {
    await admin.query('CREATE DATABASE ' + quoteIdentifier(appDb) + ' OWNER ' + quoteIdentifier(appRole));
  }

  const shadowExists = await admin.query('SELECT 1 FROM pg_database WHERE datname = $1', [shadowDb]);
  if (shadowExists.rowCount === 0) {
    await admin.query('CREATE DATABASE ' + quoteIdentifier(shadowDb) + ' OWNER ' + quoteIdentifier(appRole));
  }

  await admin.query('GRANT ALL PRIVILEGES ON DATABASE ' + quoteIdentifier(appDb) + ' TO ' + quoteIdentifier(appRole));
  await admin.query('GRANT ALL PRIVILEGES ON DATABASE ' + quoteIdentifier(shadowDb) + ' TO ' + quoteIdentifier(appRole));
  await admin.end();
}

async function bootstrapPostgres() {
  loadDotEnv('.env');

  const databaseUrlRaw = process.env.DATABASE_URL;
  if (!databaseUrlRaw) {
    throw new Error('DATABASE_URL is required for db bootstrap.');
  }

  const databaseUrl = new URL(databaseUrlRaw);
  const protocol = databaseUrl.protocol.replace(':', '');
  if (protocol !== 'postgresql' && protocol !== 'postgres') {
    console.log('[hubforge][db] Non-Postgres provider detected; bootstrap skipped.');
    return;
  }

  const appDb = databaseUrl.pathname.replace(/^\//, '');
  const appRole = decodeURIComponent(databaseUrl.username || 'hubforge');
  const appPassword = decodeURIComponent(databaseUrl.password || 'hubforge');
  const shadowDatabaseUrlRaw = process.env.SHADOW_DATABASE_URL;
  const shadowDb = shadowDatabaseUrlRaw ? new URL(shadowDatabaseUrlRaw).pathname.replace(/^//, '') : appDb + '_shadow';
  if (!appDb) {
    throw new Error('DATABASE_URL must include a database name for Postgres bootstrap.');
  }

  const adminCandidates = buildAdminCandidates(databaseUrlRaw);
  let lastAdminError;
  let defaultsEnsured = false;

  for (const adminCandidate of adminCandidates) {
    try {
      await ensureDefaultsWithAdmin(adminCandidate, appRole, appPassword, appDb, shadowDb);
      defaultsEnsured = true;
      break;
    } catch (error) {
      lastAdminError = error;
    }
  }

  if (!defaultsEnsured) {
    const reason = lastAdminError instanceof Error ? lastAdminError.message : String(lastAdminError);
    throw new Error(
      'Unable to create role/database defaults with available admin credentials. Set DATABASE_ADMIN_URL (or POSTGRES_ADMIN_URL). Last error: '
      + reason,
    );
  }

  const appClient = new Client({ connectionString: databaseUrlRaw });
  await appClient.connect();
  try {
    await appClient.query('ALTER SCHEMA public OWNER TO ' + quoteIdentifier(appRole));
    await appClient.query('GRANT ALL ON SCHEMA public TO ' + quoteIdentifier(appRole));
    await appClient.query('GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO ' + quoteIdentifier(appRole));
    await appClient.query('GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO ' + quoteIdentifier(appRole));
    await appClient.query('ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO ' + quoteIdentifier(appRole));
    await appClient.query('ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO ' + quoteIdentifier(appRole));
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.warn('[hubforge][db] Schema ownership/grant hardening skipped:', message);
  }
  await appClient.end();

  console.log('[hubforge][db] Postgres defaults ensured: role, database, owner, grants.');
}

bootstrapPostgres().catch((error) => {
  console.error('[hubforge][db] Bootstrap failed:', error?.message ?? error);
  process.exit(1);
});
