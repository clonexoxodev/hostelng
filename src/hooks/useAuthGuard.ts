import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { useState, useEffect } from 'react';

/**
 * Returns { user, requireAuth }
 * requireAuth(action) — if not logged in, redirects to /register?returnTo=currentPath
 * and returns false. If logged in, returns true so the caller can proceed.
 */
export function useAuthGuard() {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState<any>(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setAuthLoading(false);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  const requireAuth = (): boolean => {
    if (user) return true;
    const returnTo = encodeURIComponent(location.pathname + location.search);
    navigate(`/register?returnTo=${returnTo}`);
    return false;
  };

  return { user, authLoading, requireAuth };
}
