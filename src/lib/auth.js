// src/lib/auth.js  — server-side session helpers
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { NextResponse } from 'next/server';

export { authOptions };

export async function getSession() {
  return getServerSession(authOptions);
}

// Require any logged-in user
export async function requireAuth() {
  const s = await getSession();
  if (!s?.user) return { error: NextResponse.json({ error: 'Unauthorised' }, { status: 401 }) };
  return { session: s };
}

// Require reporter or above
export async function requireReporter() {
  const s = await getSession();
  const roles = ['reporter', 'senior_editor', 'super_admin'];
  if (!s?.user || !roles.includes(s.user.role))
    return { error: NextResponse.json({ error: 'Reporter access required' }, { status: 403 }) };
  return { session: s };
}

// Require senior_editor or super_admin
export async function requireEditor() {
  const s = await getSession();
  const roles = ['senior_editor', 'super_admin'];
  if (!s?.user || !roles.includes(s.user.role))
    return { error: NextResponse.json({ error: 'Editor access required' }, { status: 403 }) };
  return { session: s };
}

// Require super_admin only
export async function requireAdmin() {
  const s = await getSession();
  if (!s?.user || s.user.role !== 'super_admin')
    return { error: NextResponse.json({ error: 'Admin access required' }, { status: 403 }) };
  return { session: s };
}

// Require senior_editor+ AND adminVerified (passed 2FA)
export async function requireAdminPanel() {
  const s = await getSession();
  const roles = ['senior_editor', 'super_admin'];
  if (!s?.user || !roles.includes(s.user.role))
    return { error: NextResponse.json({ error: 'Access denied' }, { status: 403 }) };
  if (!s.user.adminVerified)
    return { error: NextResponse.json({ error: '2FA required' }, { status: 403 }) };
  return { session: s };
}

// Helpers
export function isSuperAdmin(session) { return session?.user?.role === 'super_admin'; }
export function isEditor(session)     { return ['senior_editor','super_admin'].includes(session?.user?.role); }
export function isReporter(session)   { return ['reporter','senior_editor','super_admin'].includes(session?.user?.role); }
export function canAccessAdminPanel(session) {
  return ['senior_editor','super_admin'].includes(session?.user?.role) && session?.user?.adminVerified;
}
