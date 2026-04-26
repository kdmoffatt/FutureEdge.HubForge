export type TenantContext = {
  tenantId: string;
  environment: string;
};

export function resolveTenantContext(input: {
  tenantId?: string;
  environment?: string;
}): TenantContext {
  const tenantId = input.tenantId ?? 'default-tenant';
  const environment = input.environment ?? 'local';

  return {
    tenantId,
    environment,
  };
}
