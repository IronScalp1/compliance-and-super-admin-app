import { supabase } from './supabase';
import type { User } from '@/types';

export class AuthService {
  static async signIn(email: string, password?: string) {
    console.log('AuthService.signIn called', { email, hasPassword: !!password });
    
    try {
      if (password) {
        console.log('Attempting password sign in...');
        const result = await supabase.auth.signInWithPassword({ email, password });
        console.log('Password sign in result:', result);
        return result;
      }
      
      // Magic link fallback
      console.log('Attempting magic link sign in...');
      const result = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`
        }
      });
      console.log('Magic link sign in result:', result);
      return result;
    } catch (error) {
      console.error('AuthService.signIn error:', error);
      throw error;
    }
  }

  static async signUp(email: string, password: string, full_name: string) {
    console.log('AuthService.signUp called');
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name
        },
        emailRedirectTo: `${window.location.origin}/auth/callback`
      }
    });

    console.log('Supabase signUp result:', { data, error });
    if (error) throw error;

    // Create user profile
    if (data.user) {
      const { error: profileError } = await supabase
        .from('users')
        .upsert({
          id: data.user.id,
          email: data.user.email!,
          full_name,
          is_super_admin: false
        });
      
      if (profileError) {
        console.error('Error creating user profile:', profileError);
      }
    }
    return data;
  }

  static async signOut() {
    return await supabase.auth.signOut();
  }

  static async getCurrentUser(): Promise<User | null> {
    console.log('Getting current user...');
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    console.log('Supabase auth user:', user);
    
    if (authError) {
      console.error('Auth error:', authError);
      return null;
    }
    
    if (!user) return null;

    // For now, bypass database queries and return a basic user object
    console.log('Bypassing database queries, returning basic user object');
    return {
      id: user.id,
      email: user.email!,
      full_name: user.user_metadata?.full_name || user.email!.split('@')[0],
      is_super_admin: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
  }

  static async getUserAgencies(userId: string) {
    console.log('Getting user agencies for:', userId);
    // For now, return empty agencies to bypass database issues
    console.log('Bypassing agency queries, returning empty array');
    return { data: [], error: null };
  }

  static async impersonateAgency(agencyId: string, originalUserId: string) {
    // Log impersonation action
    await supabase
      .from('audit_logs')
      .insert({
        actor_user_id: originalUserId,
        action: 'impersonate_start',
        target_type: 'agency',
        target_id: agencyId,
        metadata: { type: 'super_admin_impersonation' }
      });

    // Set impersonation session data
    localStorage.setItem('impersonation_context', JSON.stringify({
      is_impersonating: true,
      original_user_id: originalUserId,
      target_agency_id: agencyId
    }));
  }

  static async stopImpersonation() {
    const context = localStorage.getItem('impersonation_context');
    
    if (context) {
      const { original_user_id, target_agency_id } = JSON.parse(context);
      
      // Log impersonation end
      await supabase
        .from('audit_logs')
        .insert({
          actor_user_id: original_user_id,
          action: 'impersonate_end',
          target_type: 'agency',
          target_id: target_agency_id,
          metadata: { type: 'super_admin_impersonation' }
        });
    }

    localStorage.removeItem('impersonation_context');
  }

  static getImpersonationContext() {
    const context = localStorage.getItem('impersonation_context');
    return context ? JSON.parse(context) : null;
  }
}