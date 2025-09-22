import { useState, useEffect, createContext, useContext } from 'react';
import { supabase } from '@/lib/supabase';
import { AuthService } from '@/lib/auth';
import type { User, Agency, ImpersonationContext } from '@/types';

interface AuthContextType {
  user: User | null;
  agencies: Agency[];
  currentAgency: Agency | null;
  impersonation: ImpersonationContext;
  loading: boolean;
  signIn: (email: string, password?: string) => Promise<any>;
  signUp: (email: string, password: string, fullName: string) => Promise<any>;
  signOut: () => Promise<void>;
  switchAgency: (agency: Agency) => void;
  startImpersonation: (agencyId: string) => Promise<void>;
  stopImpersonation: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export function useAuthProvider() {
  const [user, setUser] = useState<User | null>(null);
  const [agencies, setAgencies] = useState<Agency[]>([]);
  const [currentAgency, setCurrentAgency] = useState<Agency | null>(null);
  const [impersonation, setImpersonation] = useState<ImpersonationContext>({
    is_impersonating: false
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('Initial session check:', session);
      if (session?.user) {
        console.log('Setting user from session:', session.user);
        setUser({
          id: session.user.id,
          email: session.user.email!,
          full_name: session.user.user_metadata?.full_name || session.user.email!.split('@')[0],
          is_super_admin: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });
      } else {
        console.log('No session found');
        setLoading(false);
      }
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state change:', event, session);
        if (event === 'SIGNED_IN' && session?.user) {
          console.log('User signed in, setting user data');
          setUser({
            id: session.user.id,
            email: session.user.email!,
            full_name: session.user.user_metadata?.full_name || session.user.email!.split('@')[0],
            is_super_admin: false,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });
        } else if (event === 'SIGNED_OUT') {
          console.log('User signed out');
          setUser(null);
          setAgencies([]);
          setCurrentAgency(null);
          setImpersonation({ is_impersonating: false });
        }
        setLoading(false);
      }
    );

    // Check for existing impersonation context
    const impersonationContext = AuthService.getImpersonationContext();
    if (impersonationContext) {
      setImpersonation({
        is_impersonating: true,
        ...impersonationContext
      });
    }

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password?: string) => {
    console.log('useAuth.signIn called');
    const result = await AuthService.signIn(email, password);
    console.log('AuthService.signIn result:', result);
    return result;
  };

  const signUp = async (email: string, password: string, fullName: string) => {
    const result = await AuthService.signUp(email, password, fullName);
    return result;
  };

  const signOut = async () => {
    await AuthService.stopImpersonation();
    await AuthService.signOut();
  };

  const switchAgency = (agency: Agency) => {
    setCurrentAgency(agency);
    localStorage.setItem('currentAgencyId', agency.id);
  };

  const startImpersonation = async (agencyId: string) => {
    if (!user?.is_super_admin) {
      throw new Error('Only super admins can impersonate');
    }

    await AuthService.impersonateAgency(agencyId, user.id);
    
    // Load agency data
    const { data: agency } = await supabase
      .from('agencies')
      .select('*')
      .eq('id', agencyId)
      .single();

    setImpersonation({
      is_impersonating: true,
      original_user: user,
      target_agency: agency
    });
  };

  const stopImpersonation = async () => {
    await AuthService.stopImpersonation();
    setImpersonation({ is_impersonating: false });
  };

  const refreshUser = async () => {
    if (user) {
      await loadUserData(user.id);
    }
  };

  return {
    user,
    agencies,
    currentAgency,
    impersonation,
    loading,
    signIn,
    signUp,
    signOut,
    switchAgency,
    startImpersonation,
    stopImpersonation,
    refreshUser
  };
}

export { AuthContext };