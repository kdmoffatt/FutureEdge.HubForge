export type TenantStrategy = 'shared' | 'isolated' | 'schema-per-tenant' | 'db-per-tenant';

export type TenantContext = {
  tenantId: string;
  environment: string;
  strategy: TenantStrategy;
  schema: string;
  databaseUrlOverride: string | null;
};

export function resolveTenantContext(input: {
  tenantId?: string;
  environment?: string;
}): TenantContext {
  const tenantId = input.tenantId ?? 'default-tenant';
  const environment = input.environment ?? 'local';
  const strategy = (process.env['TENANT_MODE'] ?? 'shared') as TenantStrategy;
  const schema = strategy === 'schema-per-tenant' || strategy === 'isolated' ? 'tenant_' + tenantId.replace(/-/g, '_') : 'public';
  const databaseUrlOverride = strategy === 'db-per-tenant'
    ? process.env['TENANT_DB_URL_PREFIX']
      ? process.env['TENANT_DB_URL_PREFIX'] + tenantId
      : null
    : null;

  return {
    tenantId,
    environment,
    strategy,
    schema,
    databaseUrlOverride,
  };
}
