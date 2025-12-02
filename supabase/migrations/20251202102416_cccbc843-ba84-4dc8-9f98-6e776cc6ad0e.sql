-- Enable RLS on system_devices
ALTER TABLE public.system_devices ENABLE ROW LEVEL SECURITY;

-- Allow users to view devices from their tenant or organisation
CREATE POLICY "Users can view their tenant's devices"
ON public.system_devices
FOR SELECT
USING (
  tenant_id IN (
    SELECT tenant_id FROM public.profiles WHERE id = auth.uid()
  )
  OR
  organisation_id IN (
    SELECT organisation_id FROM public.users WHERE auth_user_id = auth.uid()
  )
);

-- Allow device agents to insert devices (using API key authentication)
CREATE POLICY "Device agents can insert devices"
ON public.system_devices
FOR INSERT
WITH CHECK (true);

-- Allow users to update devices from their tenant or organisation
CREATE POLICY "Users can update their tenant's devices"
ON public.system_devices
FOR UPDATE
USING (
  tenant_id IN (
    SELECT tenant_id FROM public.profiles WHERE id = auth.uid()
  )
  OR
  organisation_id IN (
    SELECT organisation_id FROM public.users WHERE auth_user_id = auth.uid()
  )
);

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_system_devices_tenant_org 
ON public.system_devices(tenant_id, organisation_id, is_deleted);