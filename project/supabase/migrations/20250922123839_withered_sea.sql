/*
  # Fellow Carer Multi-Tenant Compliance Schema

  1. Core Tables
    - agencies: tenant organizations with billing info
    - users: global user accounts
    - agency_members: user-tenant relationships with roles
    - carers: care workers managed by agencies
    - document_templates: global template library
    - agency_document_templates: agency-specific template settings
    - carer_documents: uploaded compliance documents
    - compliance_snapshots: historical compliance data
    - audit_logs: system activity tracking
    - stripe_events: webhook processing
    - settings: platform configuration

  2. Security
    - Row Level Security enabled on all tenant tables
    - Super admin bypass via service role
    - Signed URLs for file access

  3. Compliance Logic
    - Green: >30 days valid
    - Amber: expires within 30 days  
    - Red: missing or expired
*/

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create custom types
CREATE TYPE user_role AS ENUM ('owner', 'admin', 'manager', 'viewer');
CREATE TYPE agency_status AS ENUM ('active', 'suspended', 'cancelled');
CREATE TYPE stripe_plan AS ENUM ('starter', 'team', 'business', 'founder');
CREATE TYPE compliance_status AS ENUM ('green', 'amber', 'red');
CREATE TYPE document_status AS ENUM ('pending', 'approved', 'expired', 'rejected');

-- Agencies table (tenants)
CREATE TABLE IF NOT EXISTS agencies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  seat_limit integer NOT NULL DEFAULT 3,
  stripe_customer_id text UNIQUE,
  stripe_subscription_id text UNIQUE,
  plan stripe_plan DEFAULT 'starter',
  status agency_status DEFAULT 'active',
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Users table (global)
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  full_name text NOT NULL,
  avatar_url text,
  is_super_admin boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Agency members (user-tenant relationships)
CREATE TABLE IF NOT EXISTS agency_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  agency_id uuid NOT NULL REFERENCES agencies(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role user_role DEFAULT 'viewer',
  joined_at timestamptz DEFAULT now(),
  UNIQUE(agency_id, user_id)
);

-- Carers (care workers)
CREATE TABLE IF NOT EXISTS carers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  agency_id uuid NOT NULL REFERENCES agencies(id) ON DELETE CASCADE,
  first_name text NOT NULL,
  last_name text NOT NULL,
  email text,
  phone text,
  employee_id text,
  status compliance_status DEFAULT 'red',
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Document templates (global library)
CREATE TABLE IF NOT EXISTS document_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  category text NOT NULL,
  description text,
  is_required boolean DEFAULT true,
  validity_days integer DEFAULT 365,
  version integer DEFAULT 1,
  is_active boolean DEFAULT true,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Agency document templates (per-tenant settings)
CREATE TABLE IF NOT EXISTS agency_document_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  agency_id uuid NOT NULL REFERENCES agencies(id) ON DELETE CASCADE,
  template_id uuid NOT NULL REFERENCES document_templates(id) ON DELETE CASCADE,
  is_enabled boolean DEFAULT true,
  custom_validity_days integer,
  custom_name text,
  overrides jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  UNIQUE(agency_id, template_id)
);

-- Carer documents (uploaded files)
CREATE TABLE IF NOT EXISTS carer_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  carer_id uuid NOT NULL REFERENCES carers(id) ON DELETE CASCADE,
  template_id uuid NOT NULL REFERENCES document_templates(id),
  file_path text NOT NULL,
  file_name text NOT NULL,
  file_size integer,
  mime_type text,
  issued_on date NOT NULL,
  expires_on date NOT NULL,
  status document_status DEFAULT 'pending',
  verified_by uuid REFERENCES users(id),
  verified_at timestamptz,
  notes text,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Compliance snapshots (historical data)
CREATE TABLE IF NOT EXISTS compliance_snapshots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  agency_id uuid NOT NULL REFERENCES agencies(id) ON DELETE CASCADE,
  taken_at timestamptz DEFAULT now(),
  overall_score integer NOT NULL CHECK (overall_score >= 0 AND overall_score <= 100),
  green_count integer DEFAULT 0,
  amber_count integer DEFAULT 0,
  red_count integer DEFAULT 0,
  total_carers integer DEFAULT 0,
  summary jsonb DEFAULT '{}'
);

-- Audit logs (activity tracking)
CREATE TABLE IF NOT EXISTS audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_user_id uuid REFERENCES users(id),
  actor_agency_id uuid REFERENCES agencies(id),
  action text NOT NULL,
  target_type text NOT NULL,
  target_id text NOT NULL,
  ip_address inet,
  user_agent text,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

-- Stripe events (webhook processing)
CREATE TABLE IF NOT EXISTS stripe_events (
  id text PRIMARY KEY,
  type text NOT NULL,
  payload jsonb NOT NULL,
  processed_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Platform settings
CREATE TABLE IF NOT EXISTS settings (
  key text PRIMARY KEY,
  value jsonb NOT NULL,
  description text,
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS on all tenant tables
ALTER TABLE agencies ENABLE ROW LEVEL SECURITY;
ALTER TABLE agency_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE carers ENABLE ROW LEVEL SECURITY;
ALTER TABLE agency_document_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE carer_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE compliance_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for agencies
CREATE POLICY "Agencies can only see their own data"
  ON agencies
  FOR ALL
  TO authenticated
  USING (
    id IN (
      SELECT agency_id 
      FROM agency_members 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Super admins can see all agencies"
  ON agencies
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
      AND is_super_admin = true
    )
  );

-- RLS Policies for agency_members
CREATE POLICY "Members can see their own memberships"
  ON agency_members
  FOR ALL
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Agency members can see other members in their agency"
  ON agency_members
  FOR SELECT
  TO authenticated
  USING (
    agency_id IN (
      SELECT agency_id 
      FROM agency_members 
      WHERE user_id = auth.uid()
    )
  );

-- RLS Policies for carers
CREATE POLICY "Agency members can manage their agency's carers"
  ON carers
  FOR ALL
  TO authenticated
  USING (
    agency_id IN (
      SELECT agency_id 
      FROM agency_members 
      WHERE user_id = auth.uid()
    )
  );

-- RLS Policies for agency_document_templates
CREATE POLICY "Agency members can manage their templates"
  ON agency_document_templates
  FOR ALL
  TO authenticated
  USING (
    agency_id IN (
      SELECT agency_id 
      FROM agency_members 
      WHERE user_id = auth.uid()
    )
  );

-- RLS Policies for carer_documents
CREATE POLICY "Agency members can manage their carers' documents"
  ON carer_documents
  FOR ALL
  TO authenticated
  USING (
    carer_id IN (
      SELECT c.id 
      FROM carers c
      JOIN agency_members am ON c.agency_id = am.agency_id
      WHERE am.user_id = auth.uid()
    )
  );

-- RLS Policies for compliance_snapshots
CREATE POLICY "Agency members can view their compliance data"
  ON compliance_snapshots
  FOR SELECT
  TO authenticated
  USING (
    agency_id IN (
      SELECT agency_id 
      FROM agency_members 
      WHERE user_id = auth.uid()
    )
  );

-- RLS Policies for audit_logs
CREATE POLICY "Users can view logs related to their actions"
  ON audit_logs
  FOR SELECT
  TO authenticated
  USING (
    actor_user_id = auth.uid() 
    OR actor_agency_id IN (
      SELECT agency_id 
      FROM agency_members 
      WHERE user_id = auth.uid() 
      AND role IN ('owner', 'admin')
    )
  );

-- Create indexes for performance
CREATE INDEX idx_agencies_stripe_customer ON agencies(stripe_customer_id);
CREATE INDEX idx_agency_members_user ON agency_members(user_id);
CREATE INDEX idx_agency_members_agency ON agency_members(agency_id);
CREATE INDEX idx_carers_agency ON carers(agency_id);
CREATE INDEX idx_carers_status ON carers(status);
CREATE INDEX idx_carer_documents_carer ON carer_documents(carer_id);
CREATE INDEX idx_carer_documents_expires ON carer_documents(expires_on);
CREATE INDEX idx_compliance_snapshots_agency ON compliance_snapshots(agency_id);
CREATE INDEX idx_audit_logs_actor ON audit_logs(actor_user_id);
CREATE INDEX idx_audit_logs_created ON audit_logs(created_at);

-- Create functions for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Add updated_at triggers
CREATE TRIGGER update_agencies_updated_at 
  BEFORE UPDATE ON agencies 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_users_updated_at 
  BEFORE UPDATE ON users 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_carers_updated_at 
  BEFORE UPDATE ON carers 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_document_templates_updated_at 
  BEFORE UPDATE ON document_templates 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_carer_documents_updated_at 
  BEFORE UPDATE ON carer_documents 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert default document templates
INSERT INTO document_templates (name, category, description, validity_days, is_required) VALUES
  ('DBS Certificate', 'Background Checks', 'Enhanced DBS check for care workers', 1095, true),
  ('Care Certificate', 'Training', 'Basic care training certification', 1095, true),
  ('First Aid Certificate', 'Training', 'Emergency first aid training', 1095, true),
  ('Moving & Handling', 'Training', 'Safe moving and handling training', 365, true),
  ('Medication Training', 'Training', 'Medication administration training', 365, false),
  ('Safeguarding Adults', 'Training', 'Adult safeguarding awareness', 365, true),
  ('Food Hygiene Certificate', 'Training', 'Basic food hygiene certification', 1095, false),
  ('Right to Work', 'Legal', 'Proof of right to work in UK', 365, true),
  ('Public Liability Insurance', 'Insurance', 'Professional indemnity insurance', 365, false);

-- Insert default platform settings
INSERT INTO settings (key, value, description) VALUES
  ('compliance_thresholds', '{"green": 30, "amber": 7, "red": 0}', 'Days before expiry for compliance status'),
  ('notification_settings', '{"expiry_reminders": [14, 7, 1], "digest_day": "monday"}', 'Email notification configuration'),
  ('file_upload_settings', '{"max_size_mb": 10, "allowed_types": ["pdf", "jpg", "jpeg", "png"]}', 'File upload constraints');