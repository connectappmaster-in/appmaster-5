-- Create device_actions table for queued actions
CREATE TABLE IF NOT EXISTS public.device_actions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id INTEGER NOT NULL REFERENCES public.tenants(id),
  organisation_id UUID REFERENCES public.organisations(id),
  device_id UUID NOT NULL REFERENCES public.system_devices(id),
  action_type TEXT NOT NULL CHECK (action_type IN ('run_script', 'install_updates', 'reboot', 'set_wallpaper', 'file_push', 'file_pull', 'service_control', 'mark_update_completed')),
  action_payload JSONB NOT NULL DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'failed', 'cancelled')),
  priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  requires_approval BOOLEAN DEFAULT false,
  approved_by UUID REFERENCES auth.users(id),
  approved_at TIMESTAMPTZ,
  initiated_by UUID NOT NULL REFERENCES auth.users(id),
  scheduled_for TIMESTAMPTZ,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  result JSONB,
  stdout TEXT,
  stderr TEXT,
  exit_code INTEGER,
  artifacts_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  is_deleted BOOLEAN DEFAULT false
);

-- Create device_heartbeats table
CREATE TABLE IF NOT EXISTS public.device_heartbeats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id INTEGER NOT NULL REFERENCES public.tenants(id),
  organisation_id UUID REFERENCES public.organisations(id),
  device_id UUID NOT NULL REFERENCES public.system_devices(id),
  agent_version TEXT,
  current_task_id UUID REFERENCES public.device_actions(id),
  current_task_status TEXT,
  system_health JSONB DEFAULT '{}',
  heartbeat_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create device_audit_log table
CREATE TABLE IF NOT EXISTS public.device_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id INTEGER NOT NULL REFERENCES public.tenants(id),
  organisation_id UUID REFERENCES public.organisations(id),
  device_id UUID NOT NULL REFERENCES public.system_devices(id),
  action_id UUID REFERENCES public.device_actions(id),
  event_type TEXT NOT NULL,
  event_data JSONB DEFAULT '{}',
  initiated_by UUID REFERENCES auth.users(id),
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create device_tokens table for secure auth
CREATE TABLE IF NOT EXISTS public.device_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id INTEGER NOT NULL REFERENCES public.tenants(id),
  organisation_id UUID REFERENCES public.organisations(id),
  device_id UUID NOT NULL REFERENCES public.system_devices(id),
  token_hash TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMPTZ NOT NULL,
  last_used_at TIMESTAMPTZ,
  revoked BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.device_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.device_heartbeats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.device_audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.device_tokens ENABLE ROW LEVEL SECURITY;

-- RLS Policies for device_actions
CREATE POLICY "Users can view actions for their tenant"
ON public.device_actions FOR SELECT
USING (
  tenant_id IN (SELECT tenant_id FROM public.profiles WHERE id = auth.uid())
  OR organisation_id IN (SELECT organisation_id FROM public.users WHERE auth_user_id = auth.uid())
);

CREATE POLICY "Users can create actions for their tenant"
ON public.device_actions FOR INSERT
WITH CHECK (
  tenant_id IN (SELECT tenant_id FROM public.profiles WHERE id = auth.uid())
  OR organisation_id IN (SELECT organisation_id FROM public.users WHERE auth_user_id = auth.uid())
);

CREATE POLICY "Users can update actions for their tenant"
ON public.device_actions FOR UPDATE
USING (
  tenant_id IN (SELECT tenant_id FROM public.profiles WHERE id = auth.uid())
  OR organisation_id IN (SELECT organisation_id FROM public.users WHERE auth_user_id = auth.uid())
);

-- RLS Policies for device_heartbeats
CREATE POLICY "Users can view heartbeats for their tenant"
ON public.device_heartbeats FOR SELECT
USING (
  tenant_id IN (SELECT tenant_id FROM public.profiles WHERE id = auth.uid())
  OR organisation_id IN (SELECT organisation_id FROM public.users WHERE auth_user_id = auth.uid())
);

CREATE POLICY "Device agents can insert heartbeats"
ON public.device_heartbeats FOR INSERT
WITH CHECK (true);

-- RLS Policies for device_audit_log
CREATE POLICY "Users can view audit log for their tenant"
ON public.device_audit_log FOR SELECT
USING (
  tenant_id IN (SELECT tenant_id FROM public.profiles WHERE id = auth.uid())
  OR organisation_id IN (SELECT organisation_id FROM public.users WHERE auth_user_id = auth.uid())
);

CREATE POLICY "Device agents can insert audit log"
ON public.device_audit_log FOR INSERT
WITH CHECK (true);

-- RLS Policies for device_tokens
CREATE POLICY "Users can view tokens for their tenant"
ON public.device_tokens FOR SELECT
USING (
  tenant_id IN (SELECT tenant_id FROM public.profiles WHERE id = auth.uid())
  OR organisation_id IN (SELECT organisation_id FROM public.users WHERE auth_user_id = auth.uid())
);

CREATE POLICY "Users can create tokens for their tenant"
ON public.device_tokens FOR INSERT
WITH CHECK (
  tenant_id IN (SELECT tenant_id FROM public.profiles WHERE id = auth.uid())
  OR organisation_id IN (SELECT organisation_id FROM public.users WHERE auth_user_id = auth.uid())
);

-- Create indexes
CREATE INDEX idx_device_actions_device_status ON public.device_actions(device_id, status, is_deleted);
CREATE INDEX idx_device_actions_status_scheduled ON public.device_actions(status, scheduled_for) WHERE is_deleted = false;
CREATE INDEX idx_device_heartbeats_device ON public.device_heartbeats(device_id, heartbeat_at DESC);
CREATE INDEX idx_device_audit_log_device ON public.device_audit_log(device_id, created_at DESC);
CREATE INDEX idx_device_tokens_device ON public.device_tokens(device_id, revoked, expires_at);