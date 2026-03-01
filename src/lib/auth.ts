import { supabase } from './supabase';
import { User } from '@supabase/supabase-js';

export interface AuthUser extends User {
  isAdmin?: boolean;
}

/**
 * Sign in with email and password
 */
export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

/**
 * Sign out current user
 */
export async function signOut() {
  const { error } = await supabase.auth.signOut();
  
  if (error) {
    throw new Error(error.message);
  }
}

/**
 * Get current user
 * Uses getSession() first (reads from local storage, no network call)
 * and only calls getUser() to validate when a session exists.
 */
export async function getCurrentUser(): Promise<AuthUser | null> {
  // Quick check: if no session exists locally, skip the network call
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session?.user) {
    return null;
  }

  // We have a session — use the user from it (avoids extra network roundtrip)
  const user = session.user;

  // Check if user is admin (you can customize this logic)
  const isAdmin = user.email?.endsWith('@justhigher.com') || 
                  user.user_metadata?.role === 'admin' ||
                  user.app_metadata?.role === 'admin';

  return {
    ...user,
    isAdmin,
  };
}

/**
 * Check if current user is admin
 */
export async function isUserAdmin(): Promise<boolean> {
  const user = await getCurrentUser();
  return user?.isAdmin || false;
}

/**
 * Get auth session
 */
export async function getSession() {
  const { data: { session }, error } = await supabase.auth.getSession();
  
  if (error) {
    console.error('Error getting session:', error);
    return null;
  }

  return session;
}

/**
 * Listen to auth state changes
 */
export function onAuthStateChange(callback: (user: AuthUser | null) => void) {
  return supabase.auth.onAuthStateChange(async (event, session) => {
    if (session?.user) {
      const user = await getCurrentUser();
      callback(user);
    } else {
      callback(null);
    }
  });
}

/**
 * Create admin user (for initial setup)
 */
export async function createAdminUser(email: string, password: string) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        role: 'admin'
      }
    }
  });

  if (error) {
    throw new Error(error.message);
  }

  return data;
}