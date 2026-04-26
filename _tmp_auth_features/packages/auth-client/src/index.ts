export type AuthRuntimeConfig = {
  mode: 'external' | 'local';
  provider: 'zitadel' | 'auth0' | 'keycloak' | 'custom';
  issuerUrl: string;
  clientId: string;
};

export function resolveAuthRuntimeConfig(env: Record<string, string | undefined>): AuthRuntimeConfig {
  return {
    mode: (env['AUTH_MODE'] as AuthRuntimeConfig['mode'] | undefined) ?? 'external',
    provider: (env['AUTH_PROVIDER'] as AuthRuntimeConfig['provider'] | undefined) ?? 'zitadel',
    issuerUrl: env['AUTH_ISSUER_URL'] ?? 'http://localhost:8080',
    clientId: env['AUTH_CLIENT_ID'] ?? 'hubforge-web',
  };
}
