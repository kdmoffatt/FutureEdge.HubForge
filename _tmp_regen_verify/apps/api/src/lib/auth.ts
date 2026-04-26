import { createRemoteJWKSet, jwtVerify } from 'jose';
import type { Context, Next } from 'hono';

const localIssuer = 'http://localhost:4000/local-auth';
const localAudience = 'hubforge-local';

function authProfileFromEnv() {
  const mode = process.env['AUTH_MODE'] ?? 'local';
  const provider = process.env['AUTH_PROVIDER'] ?? 'zitadel';
  const issuer = process.env['AUTH_ISSUER_URL']
    ?? (provider === 'auth0'
      ? 'https://example.us.auth0.com/'
      : provider === 'keycloak'
        ? 'http://localhost:8080/realms/master'
        : 'http://localhost:8080');
  const audience = process.env['AUTH_AUDIENCE'] ?? process.env['AUTH_CLIENT_ID'] ?? 'hubforge-web';

  return { mode, provider, issuer, audience };
}

function normalizeBearerToken(header: string | undefined): string | undefined {
  if (!header) {
    return undefined;
  }
  const [scheme, token] = header.split(' ');
  if (scheme?.toLowerCase() !== 'bearer' || !token) {
    return undefined;
  }
  return token;
}

async function verifyExternalToken(token: string, issuer: string, audience: string) {
  const jwks = createRemoteJWKSet(new URL(issuer.replace(/\/$/, '') + '/.well-known/jwks.json'));
  const { payload } = await jwtVerify(token, jwks, {
    issuer,
    audience,
  });
  return payload;
}

async function verifyLocalToken(token: string) {
  const secret = new TextEncoder().encode(process.env['AUTH_LOCAL_JWT_SECRET'] ?? 'hubforge-local-dev-secret');
  const { payload } = await jwtVerify(token, secret, {
    issuer: localIssuer,
    audience: localAudience,
  });
  return payload;
}

export async function requireAuth(c: Context, next: Next): Promise<Response | void> {
  const { mode, issuer, audience } = authProfileFromEnv();
  const token = normalizeBearerToken(c.req.header('authorization'));
  if (!token) {
    return c.json({ error: 'Missing Bearer token' }, 401);
  }

  try {
    const payload = mode === 'local'
      ? await verifyLocalToken(token)
      : await verifyExternalToken(token, issuer, audience);

    (c as unknown as { set: (key: string, value: unknown) => void }).set('auth', payload);
    await next();
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Invalid token';
    return c.json({ error: 'Unauthorized', details: message }, 401);
  }
}
