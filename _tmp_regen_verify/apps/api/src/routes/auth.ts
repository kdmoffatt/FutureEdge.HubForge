import type { Hono } from 'hono';
import { SignJWT, jwtVerify } from 'jose';
import { prisma } from '@hubforge/db';

const secret = new TextEncoder().encode(
  process.env['AUTH_LOCAL_JWT_SECRET'] ?? 'hubforge-local-dev-secret-change-me',
);
const issuer = 'http://localhost:4000/local-auth';
const audience = 'hubforge-local';

async function hashPassword(password: string): Promise<string> {
  const enc = new TextEncoder().encode(password);
  const buf = await crypto.subtle.digest('SHA-256', enc);
  return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, '0')).join('');
}

async function signToken(userId: string, email: string): Promise<string> {
  return new SignJWT({ sub: userId, email })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuer(issuer)
    .setAudience(audience)
    .setExpirationTime('8h')
    .sign(secret);
}

export function registerAuthRoutes(app: Hono): void {
  app.get('/v1/auth/provider', async (c) => {
    return c.json({
      mode: 'local',
      provider: 'database',
      issuer,
      source: 'database',
    });
  });

  const registerHandler = async (c: any) => {
    const body = (await c.req.json().catch(() => ({}))) as {
      email?: unknown; name?: unknown; password?: unknown; tenantSlug?: unknown;
    };
    if (typeof body.email !== 'string' || typeof body.password !== 'string') {
      return c.json({ error: 'email and password are required' }, 400);
    }
    const existing = await prisma.user.findUnique({ where: { email: body.email } });
    if (existing) return c.json({ error: 'Email already registered' }, 409);

    const passwordHash = await hashPassword(body.password);
    const user = await prisma.user.create({
      data: { email: body.email, name: typeof body.name === 'string' ? body.name : null, passwordHash },
    });

    const slug = typeof body.tenantSlug === 'string' && body.tenantSlug
      ? body.tenantSlug
      : body.email.split('@')[0]!.toLowerCase().replace(/[^a-z0-9]/g, '-');
    let tenant = await prisma.tenant.findUnique({ where: { slug } });
    if (!tenant) tenant = await prisma.tenant.create({ data: { slug, name: slug } });

    await prisma.membership.upsert({
      where: { tenantId_userId: { tenantId: tenant.id, userId: user.id } },
      update: {},
      create: { tenantId: tenant.id, userId: user.id, role: 'admin' },
    });
    const token = await signToken(user.id, user.email);
    return c.json({ token, user: { id: user.id, email: user.email, name: user.name }, tenantId: tenant.id }, 201);
  };

  app.post('/auth/register', registerHandler);
  app.post('/v1/auth/register', registerHandler);

  const loginHandler = async (c: any) => {
    const body = (await c.req.json().catch(() => ({}))) as { email?: unknown; password?: unknown };
    if (typeof body.email !== 'string' || typeof body.password !== 'string') {
      return c.json({ error: 'email and password are required' }, 400);
    }
    const user = await prisma.user.findUnique({ where: { email: body.email } });
    if (!user?.passwordHash) return c.json({ error: 'Invalid credentials' }, 401);
    const hash = await hashPassword(body.password);
    if (hash !== user.passwordHash) return c.json({ error: 'Invalid credentials' }, 401);
    const membership = await prisma.membership.findFirst({ where: { userId: user.id } });
    const token = await signToken(user.id, user.email);
    return c.json({ token, user: { id: user.id, email: user.email, name: user.name }, tenantId: membership?.tenantId ?? null });
  };

  app.post('/auth/login', loginHandler);
  app.post('/v1/auth/login', loginHandler);

  const meHandler = async (c: any) => {
    const authz = c.req.header('authorization');
    const token = authz?.startsWith('Bearer ') ? authz.slice(7) : null;
    if (!token) return c.json({ error: 'Unauthorized' }, 401);
    try {
      const { payload } = await jwtVerify(token, secret, { issuer, audience });
      const user = await prisma.user.findUnique({ where: { id: payload['sub'] as string } });
      if (!user) return c.json({ error: 'User not found' }, 404);
      const memberships = await prisma.membership.findMany({ where: { userId: user.id }, include: { tenant: true } });
      return c.json({ user: { id: user.id, email: user.email, name: user.name }, memberships });
    } catch {
      return c.json({ error: 'Invalid token' }, 401);
    }
  };

  app.get('/auth/me', meHandler);
  app.get('/v1/auth/me', meHandler);
}
