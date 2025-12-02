import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.81.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ActionResultPayload {
  action_id: string;
  status: 'completed' | 'failed';
  result?: any;
  stdout?: string;
  stderr?: string;
  exit_code?: number;
  artifacts_url?: string;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('=== Device Action Result Request ===');

    // Validate device token
    const authHeader = req.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized: Missing device token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    const payload: ActionResultPayload = await req.json();

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Validate token and get device
    const tokenHash = await crypto.subtle.digest(
      'SHA-256',
      new TextEncoder().encode(token)
    );
    const tokenHashHex = Array.from(new Uint8Array(tokenHash))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');

    const { data: tokenData, error: tokenError } = await supabase
      .from('device_tokens')
      .select('device_id, tenant_id, organisation_id, expires_at, revoked')
      .eq('token_hash', tokenHashHex)
      .single();

    if (tokenError || !tokenData || tokenData.revoked || new Date(tokenData.expires_at) < new Date()) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized: Invalid or expired token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const deviceId = tokenData.device_id;
    console.log('Action result from device:', deviceId, 'action:', payload.action_id);

    // Update action with result
    const { data: action, error: updateError } = await supabase
      .from('device_actions')
      .update({
        status: payload.status,
        result: payload.result || {},
        stdout: payload.stdout || null,
        stderr: payload.stderr || null,
        exit_code: payload.exit_code || null,
        artifacts_url: payload.artifacts_url || null,
        completed_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', payload.action_id)
      .eq('device_id', deviceId)
      .select()
      .single();

    if (updateError) throw updateError;

    // Log audit entry
    await supabase.from('device_audit_log').insert({
      tenant_id: tokenData.tenant_id,
      organisation_id: tokenData.organisation_id,
      device_id: deviceId,
      action_id: payload.action_id,
      event_type: payload.status === 'completed' ? 'action_completed' : 'action_failed',
      event_data: {
        exit_code: payload.exit_code,
        has_stderr: !!payload.stderr
      }
    });

    return new Response(
      JSON.stringify({
        success: true,
        action_id: payload.action_id,
        device_id: deviceId,
        acknowledged_at: new Date().toISOString()
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in device-action-result:', error);
    return new Response(
      JSON.stringify({
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
