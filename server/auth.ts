import crypto from 'crypto';
import type { Request, Response, NextFunction } from 'express';
import type { User } from '../src/types/index.js';

/**
 * ============================================================================
 * AUTH HELPERS
 * ----------------------------------------------------------------------------
 * - scrypt password hashing (Node built-in, no native deps, works on Vercel)
 * - stateless HMAC-signed tokens (work across serverless instances)
 * - route guards + a best-effort in-memory rate limiter
 *
 * Signing secret, first one found wins:
 *   SESSION_SECRET -> SUPABASE_JWT_SECRET -> SUPABASE_SERVICE_ROLE_KEY
 * ============================================================================
 */

export type Role = 'super_admin' | 'school_admin' | 'teacher' | 'student';

export interface Session {
  sub: string;
  role: Role;
  schoolId: string | null;
  email: string;
}

const isProd = () => process.env.NODE_ENV === 'production' || Boolean(process.env.VERCEL);

function secret(): string {
  const s = process.env.SESSION_SECRET || process.env.SUPABASE_JWT_SECRET || process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (s) return s;
  if (isProd()) {
    throw new Error('No signing secret configured. Set SESSION_SECRET in your Vercel environment variables.');
  }
  return 'dev-only-insecure-secret';
}

const b64u = (b: Buffer | string) => Buffer.from(b).toString('base64url');

// ---------- passwords ----------

export const isHashed = (s?: string | null) => Boolean(s && s.startsWith('scrypt$'));

export async function hashPassword(pw: string): Promise<string> {
  const salt = crypto.randomBytes(16);
  const hash = await new Promise<Buffer>((resolve, reject) =>
    crypto.scrypt(pw, salt, 64, (e, k) => (e ? reject(e) : resolve(k)))
  );
  return `scrypt$${salt.toString('hex')}$${hash.toString('hex')}`;
}

export const safeEquals = (a: string, b: string) => {
  const ha = crypto.createHash('sha256').update(a).digest();
  const hb = crypto.createHash('sha256').update(b).digest();
  return crypto.timingSafeEqual(ha, hb);
};

/** Verifies against a scrypt hash. Legacy plaintext values still verify so existing accounts can migrate on next login. */
export async function verifyPassword(pw: string, stored?: string | null): Promise<boolean> {
  if (!stored) return false;
  if (!isHashed(stored)) return safeEquals(pw, stored);
  const [, saltHex, hashHex] = stored.split('$');
  const expected = Buffer.from(hashHex, 'hex');
  const actual = await new Promise<Buffer>((resolve, reject) =>
    crypto.scrypt(pw, Buffer.from(saltHex, 'hex'), expected.length, (e, k) => (e ? reject(e) : resolve(k)))
  );
  return crypto.timingSafeEqual(actual, expected);
}

export const validNewPassword = (pw: unknown): pw is string => typeof pw === 'string' && pw.length >= 8 && pw.length <= 128;

// ---------- tokens ----------

type Purpose = 'session' | 'otp' | 'reset';

export function signToken(payload: Record<string, any>, purpose: Purpose, ttlSeconds: number): string {
  const body = b64u(JSON.stringify({ ...payload, p: purpose, exp: Math.floor(Date.now() / 1000) + ttlSeconds }));
  const sig = crypto.createHmac('sha256', secret()).update(body).digest('base64url');
  return `${body}.${sig}`;
}

export function readToken<T = any>(token: string | undefined, purpose: Purpose): (T & { exp: number }) | null {
  if (!token) return null;
  const [body, sig] = token.split('.');
  if (!body || !sig) return null;
  const expected = crypto.createHmac('sha256', secret()).update(body).digest('base64url');
  if (sig.length !== expected.length || !crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) return null;
  try {
    const data = JSON.parse(Buffer.from(body, 'base64url').toString('utf8'));
    if (data.p !== purpose || data.exp < Math.floor(Date.now() / 1000)) return null;
    return data;
  } catch {
    return null;
  }
}

export const issueSession = (u: Pick<User, 'id' | 'role' | 'schoolId' | 'email'>) =>
  signToken({ sub: u.id, role: u.role, schoolId: u.schoolId ?? null, email: u.email }, 'session', 60 * 60 * 12);

/** OTP is never stored; the challenge carries an HMAC of it and is useless without the code emailed to the user. */
export const otpDigest = (email: string, otp: string) =>
  crypto.createHmac('sha256', secret()).update(`otp:${email}:${otp}`).digest('hex');

export const randomOtp = () => String(crypto.randomInt(100000, 1000000));

// ---------- response hygiene ----------

export function sanitizeUser<T extends Partial<User>>(u: T): Omit<T, 'password' | 'tempPassword'> {
  const { password, tempPassword, ...rest } = u as any;
  return rest;
}

// ---------- express guards ----------

export interface AuthedRequest extends Request {
  auth?: Session;
}

export function attachSession(req: AuthedRequest) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : undefined;
  const data = readToken<Session>(token, 'session');
  if (data) req.auth = { sub: data.sub, role: data.role, schoolId: data.schoolId, email: data.email };
  return req.auth;
}

export function requireAuth(req: AuthedRequest, res: Response, next: NextFunction) {
  if (!attachSession(req)) return res.status(401).json({ error: 'Please sign in to continue.' });
  next();
}

export const requireRole = (...roles: Role[]) => (req: AuthedRequest, res: Response, next: NextFunction) => {
  const s = attachSession(req);
  if (!s) return res.status(401).json({ error: 'Please sign in to continue.' });
  if (!roles.includes(s.role)) return res.status(403).json({ error: 'You do not have permission to do that.' });
  next();
};

type Rule = [method: string, path: RegExp, access: 'public' | 'auth' | Role[]];

/** First matching rule wins. Anything unmatched requires a signed-in user. */
export const routeGuard = (rules: Rule[]) => (req: AuthedRequest, res: Response, next: NextFunction) => {
  const rule = rules.find(([m, p]) => (m === '*' || m === req.method) && p.test(req.path));
  attachSession(req);
  const access = rule ? rule[2] : 'auth';
  if (access === 'public') return next();
  if (!req.auth) return res.status(401).json({ error: 'Please sign in to continue.' });
  if (Array.isArray(access) && !access.includes(req.auth.role)) {
    return res.status(403).json({ error: 'You do not have permission to do that.' });
  }
  next();
};

// ---------- best-effort rate limit (per serverless instance) ----------

const hits = new Map<string, { n: number; reset: number }>();

export function rateLimited(key: string, max: number, windowMs: number): boolean {
  const now = Date.now();
  const h = hits.get(key);
  if (!h || h.reset < now) {
    hits.set(key, { n: 1, reset: now + windowMs });
    return false;
  }
  h.n += 1;
  if (hits.size > 5000) for (const [k, v] of hits) if (v.reset < now) hits.delete(k);
  return h.n > max;
}

export const clientIp = (req: Request) =>
  String(req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown').split(',')[0].trim();
