export type DbProvider = 'sqlite' | 'postgres' | 'mysql' | 'sqlserver';
export type TenantMode = 'shared' | 'isolated' | 'schema-per-tenant' | 'db-per-tenant';
export type AiMode = 'fastapi' | 'none';
export type AuthMode = 'external' | 'local';
export type AuthProvider = 'zitadel' | 'auth0' | 'keycloak' | 'custom';
export type TemplatePack = 'full' | 'full-postgres-rls' | 'full-cloud' | 'full-local';

export type InitScaffoldOptions = {
  projectName: string;
  dbProvider: DbProvider;
  tenantMode: TenantMode;
  aiMode: AiMode;
  authMode: AuthMode;
  authProvider: AuthProvider;
  authServer: boolean;
  templatePack: TemplatePack;
  force: boolean;
};
