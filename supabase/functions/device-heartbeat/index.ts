import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.81.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface HeartbeatPayload {
  agent_version: string;
  current_task_id?: string;
  current_task_status?: string;
  system_health?: {
    cpu_usage?: number;
    memory_usage?: number;
    disk_usage?: number;
    uptime?: number;
  };
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('=== Device Heartbeat Request ===');

    // Validate device token
    const authHeader = req.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized: Missing device token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    const payload: HeartbeatPayload = await req.json();

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
    console.log('Heartbeat from device:', deviceId);

    // Insert heartbeat
    const { error: heartbeatError } = await supabase
      .from('device_heartbeats')
      .insert({
        tenant_id: tokenData.tenant_id,
        organisation_id: tokenData.organisation_id,
        device_id: deviceId,
        agent_version: payload.agent_version,
        current_task_id: payload.current_task_id || null,
        current_task_status: payload.current_task_status || null,
        system_health: payload.system_health || {},
        heartbeat_at: new Date().toISOString()
      });

    if (heartbeatError) throw heartbeatError;

    // Update device last_seen
    await supabase
      .from('system_devices')
      .update({ 
        last_seen: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', deviceId);

    // Check for any configuration updates or commands
    const { data: config } = await supabase
      .from('system_devices')
      .select('notes')
      .eq('id', deviceId)
      .single();

    return new Response(
      JSON.stringify({
        success: true,
        device_id: deviceId,
        server_time: new Date().toISOString(),
        config: config?.notes ? JSON.parse(config.notes) : {}
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in device-heartbeat:', error);
    return new Response(
      JSON.stringify({
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
