'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { nanoid } from 'nanoid';
import { findUserByEmail, verifyPassword, createUser, saveSession, getSessionByToken, deleteSession } from './db';
import type { Role } from '../types/user';
import { SESSION_COOKIE_NAME } from '../src/lib/auth';
import type { Session } from '../types/user';
import type { Route } from 'next';

interface SignInPayload {
  email: string;
  password: string;
}

interface SignUpPayload {
  name: string;
  email: string;
  password: string;
}

async function setSessionCookie(token: string) {
  const store = await cookies();
  store.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 60 * 24 * 7,
  });
}

async function clearSessionCookie() {
  const store = await cookies();
  store.delete(SESSION_COOKIE_NAME);
}

export async function signIn(payload: SignInPayload) {
  const user = await findUserByEmail(payload.email);
  if (!user) {
    throw new Error('Invalid credentials');
  }

  const isValid = await verifyPassword(payload.password, user.password);
  if (!isValid) {
    throw new Error('Invalid credentials');
  }

  const token = nanoid();
  const session: Session = {
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
    },
    expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7).toISOString(),
  };

  await saveSession(token, session);
  await setSessionCookie(token);

  return session.user;
}

export async function signUp(payload: SignUpPayload) {
  const existing = await findUserByEmail(payload.email);
  if (existing) {
    throw new Error('Email already registered');
  }

  const newUser = await createUser({
    name: payload.name,
    email: payload.email,
    role: 'CUSTOMER',
    password: payload.password,
  });

  const token = nanoid();
  const session: Session = {
    user: {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      avatar: newUser.avatar,
    },
    expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7).toISOString(),
  };

  await saveSession(token, session);
  await setSessionCookie(token);

  return session.user;
}

export async function signInWithOAuth(profile: { id: string; email: string; name: string; avatar?: string | null }) {
  let user = await findUserByEmail(profile.email);
  if (!user) {
    user = await createUser({
      name: profile.name,
      email: profile.email,
      role: 'CUSTOMER',
      password: nanoid(), // Auto-generate random password for OAuth users
      avatar: profile.avatar,
    });
  } else if (!user.avatar && profile.avatar) {
    // Optionally update avatar if they didn't have one
    user.avatar = profile.avatar;
  }

  const token = nanoid();
  const session: Session = {
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
    },
    expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7).toISOString(),
  };

  await saveSession(token, session);
  await setSessionCookie(token);

  return session.user;
}

export async function signOut() {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE_NAME)?.value;
  if (token) {
    await deleteSession(token);
    await clearSessionCookie();
  }
  redirect('/' as Route<'/'>);
}

export async function getSession() {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE_NAME)?.value;
  if (!token) return null;
  const session = await getSessionByToken(token);
  // Do not mutate cookies here (render path). Just return null if invalid.
  if (!session) return null;
  return session;
}

export async function requireRole(roles: Role[]) {
  const session = await getSession();
  if (!session?.user || !roles.includes(session.user.role)) {
  redirect('/auth/sign-in' as Route<'/auth/sign-in'>);
  }
  return session.user;
}

export async function requireAuth() {
  const session = await getSession();
  if (!session?.user) {
  redirect('/auth/sign-in' as Route<'/auth/sign-in'>);
  }
  return session.user;
}
