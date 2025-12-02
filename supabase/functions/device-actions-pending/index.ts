import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.81.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('=== Device Actions Pending Request ===');

    // Validate device token
    const authHeader = req.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized: Missing device token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const token = authHeader.replace('Bearer ', '');
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

    // Update last_used_at
    await supabase
      .from('device_tokens')
      .update({ last_used_at: new Date().toISOString() })
      .eq('token_hash', tokenHashHex);

    const deviceId = tokenData.device_id;
    console.log('Device authenticated:', deviceId);

    // Get pending actions for this device
    const { data: actions, error: actionsError } = await supabase
      .from('device_actions')
      .select('*')
      .eq('device_id', deviceId)
      .eq('status', 'pending')
      .eq('is_deleted', false)
      .or('scheduled_for.is.null,scheduled_for.lte.' + new Date().toISOString())
      .order('priority', { ascending: false })
      .order('created_at', { ascending: true })
      .limit(10);

    if (actionsError) throw actionsError;

    console.log(`Found ${actions?.length || 0} pending actions`);

    // Mark actions as in_progress
    if (actions && actions.length > 0) {
      const actionIds = actions.map(a => a.id);
      await supabase
        .from('device_actions')
        .update({ 
          status: 'in_progress',
          started_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .in('id', actionIds);

      // Log audit entries
      const auditEntries = actions.map(action => ({
        tenant_id: tokenData.tenant_id,
        organisation_id: tokenData.organisation_id,
        device_id: deviceId,
        action_id: action.id,
        event_type: 'action_started',
        event_data: { action_type: action.action_type }
      }));

      await supabase.from('device_audit_log').insert(auditEntries);
    }

    return new Response(
      JSON.stringify({
        success: true,
        actions: actions || [],
        device_id: deviceId
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in device-actions-pending:', error);
    return new Response(
      JSON.stringify({
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
