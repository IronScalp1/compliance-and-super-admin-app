export interface User {
  id: string;
  email: string;
  full_name: string;
  avatar_url?: string;
  is_super_admin: boolean;
  created_at: string;
  updated_at: string;
}

export interface Agency {
  id: string;
  name: string;
  slug: string;
  seat_limit: number;
  stripe_customer_id?: string;
  stripe_subscription_id?: string;
  plan: 'starter' | 'team' | 'business' | 'founder';
  status: 'active' | 'suspended' | 'cancelled';
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface AgencyMember {
  id: string;
  agency_id: string;
  user_id: string;
  role: 'owner' | 'admin' | 'manager' | 'viewer';
  joined_at: string;
  user?: User;
  agency?: Agency;
}

export interface Carer {
  id: string;
  agency_id: string;
  first_name: string;
  last_name: string;
  email?: string;
  phone?: string;
  employee_id?: string;
  status: 'green' | 'amber' | 'red';
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
  documents?: CarerDocument[];
}

export interface DocumentTemplate {
  id: string;
  name: string;
  category: string;
  description?: string;
  is_required: boolean;
  validity_days: number;
  version: number;
  is_active: boolean;
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface AgencyDocumentTemplate {
  id: string;
  agency_id: string;
  template_id: string;
  is_enabled: boolean;
  custom_validity_days?: number;
  custom_name?: string;
  overrides: Record<string, any>;
  created_at: string;
  template?: DocumentTemplate;
}

export interface CarerDocument {
  id: string;
  carer_id: string;
  template_id: string;
  file_path: string;
  file_name: string;
  file_size?: number;
  mime_type?: string;
  issued_on: string;
  expires_on: string;
  status: 'pending' | 'approved' | 'expired' | 'rejected';
  verified_by?: string;
  verified_at?: string;
  notes?: string;
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
  template?: DocumentTemplate;
  verifier?: User;
}

export interface ComplianceSnapshot {
  id: string;
  agency_id: string;
  taken_at: string;
  overall_score: number;
  green_count: number;
  amber_count: number;
  red_count: number;
  total_carers: number;
  summary: Record<string, any>;
}

export interface AuditLog {
  id: string;
  actor_user_id?: string;
  actor_agency_id?: string;
  action: string;
  target_type: string;
  target_id: string;
  ip_address?: string;
  user_agent?: string;
  metadata: Record<string, any>;
  created_at: string;
  actor?: User;
}

export interface StripeEvent {
  id: string;
  type: string;
  payload: Record<string, any>;
  processed_at?: string;
  created_at: string;
}

export interface Settings {
  key: string;
  value: Record<string, any>;
  description?: string;
  updated_at: string;
}

export interface ComplianceStats {
  overall_score: number;
  green_count: number;
  amber_count: number;
  red_count: number;
  total_carers: number;
  expiring_soon: number;
  overdue: number;
}

export interface FileUpload {
  file: File;
  progress: number;
  error?: string;
  url?: string;
}

export interface ImpersonationContext {
  is_impersonating: boolean;
  original_user?: User;
  target_agency?: Agency;
}