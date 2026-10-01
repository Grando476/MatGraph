import { createClient as createSupabaseClient } from '@/utils/supabase/client';

export const isLocalAuth = () => {
  const provider = process.env.NEXT_PUBLIC_AUTH_PROVIDER;
  if (provider === 'local') return true;
  if (provider === 'supabase') return false;
  
  // Default to local if no Supabase URL is configured or it's a placeholder
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  return !supabaseUrl || supabaseUrl.includes('placeholder.supabase.co');
};

export const getApiUrl = () => {
  return process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';
};

export async function authLogin(
  email: string,
  password: string
): Promise<{ success: boolean; error?: string }> {
  if (isLocalAuth()) {
    try {
      const res = await fetch(`${getApiUrl()}/api/v1/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.detail || 'Błąd logowania.' };
      }
      
      // Set auth_token cookie for Next.js middleware and client
      document.cookie = `auth_token=${data.access_token}; path=/; max-age=604800; SameSite=Lax`;
      if (typeof window !== 'undefined') {
        localStorage.setItem('auth_token', data.access_token);
        localStorage.setItem('user_profile', JSON.stringify(data.user));
      }
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Brak połączenia z lokalnym serwerem API.' };
    }
  } else {
    try {
      const supabase = createSupabaseClient();
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) {
        return { success: false, error: error.message };
      }
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Błąd logowania przez Supabase.' };
    }
  }
}

export async function authRegister(params: {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}): Promise<{ success: boolean; error?: string }> {
  const { email, password, firstName, lastName } = params;

  if (isLocalAuth()) {
    try {
      const res = await fetch(`${getApiUrl()}/api/v1/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          password,
          first_name: firstName,
          last_name: lastName,
          role: 'student',
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.detail || 'Błąd rejestracji.' };
      }
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Brak połączenia z lokalnym serwerem API.' };
    }
  } else {
    try {
      const supabase = createSupabaseClient();
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name: firstName,
            last_name: lastName,
            role: 'student',
          },
        },
      });
      if (error) {
        return { success: false, error: error.message };
      }
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Błąd rejestracji przez Supabase.' };
    }
  }
}

export interface UserProfile {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  role: string;
}

export async function getCurrentUser(): Promise<UserProfile | null> {
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem('user_profile');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (parsed && (parsed.id || parsed.user_id || parsed.email)) {
          return {
            id: parsed.id || parsed.user_id || '',
            email: parsed.email || '',
            firstName: parsed.first_name || parsed.firstName || '',
            lastName: parsed.last_name || parsed.lastName || '',
            role: parsed.role || 'student',
          };
        }
      } catch {
        // continue
      }
    }
  }

  try {
    const supabase = createSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      let role = user.user_metadata?.role || (user.app_metadata as any)?.role || 'student';
      let firstName = user.user_metadata?.first_name || '';
      let lastName = user.user_metadata?.last_name || '';

      try {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role, first_name, last_name')
          .eq('id', user.id)
          .maybeSingle();
        if (profile) {
          if (profile.role) role = profile.role;
          if (profile.first_name) firstName = profile.first_name;
          if (profile.last_name) lastName = profile.last_name;
        }
      } catch {
        // fallback to metadata
      }

      return {
        id: user.id,
        email: user.email || '',
        firstName,
        lastName,
        role,
      };
    }
  } catch {
    // ignore
  }

  return null;
}

export async function authLogout(): Promise<void> {
  document.cookie = 'auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
  if (typeof window !== 'undefined') {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_profile');
  }
  try {
    const supabase = createSupabaseClient();
    await supabase.auth.signOut();
  } catch {
    // ignore
  }
}

export async function getAuthToken(): Promise<string | null> {
  if (isLocalAuth()) {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('auth_token');
      if (token) return token;
      const match = document.cookie.match(new RegExp('(^| )auth_token=([^;]+)'));
      if (match) return match[2];
    }
    return null;
  } else {
    const supabase = createSupabaseClient();
    const { data: { session } } = await supabase.auth.getSession();
    return session?.access_token || null;
  }
}
