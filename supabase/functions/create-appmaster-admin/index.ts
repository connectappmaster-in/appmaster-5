import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.81.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    // Verify the requesting user is a super admin
    const authHeader = req.headers.get('Authorization')!;
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabaseAdmin.auth.getUser(token);

    if (userError || !user) {
      throw new Error('Unauthorized');
    }

    // Check if user is super admin
    const { data: adminCheck } = await supabaseAdmin
      .from('appmaster_admins')
      .select('admin_role, is_active')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .single();

    if (!adminCheck || adminCheck.admin_role !== 'super_admin') {
      throw new Error('Only super admins can create appmaster admins');
    }

    // Get request body
    const { email, name, password, admin_role } = await req.json();

    // Create the user account via Supabase Auth
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        name
      }
    });

    if (authError) throw authError;
    if (!authData.user) throw new Error("Failed to create user");

    // Create user record with appmaster_admin type
    const { error: userInsertError } = await supabaseAdmin
      .from("users")
      .insert({
        auth_user_id: authData.user.id,
        email,
        name,
        user_type: "appmaster_admin",
        status: "active",
        organisation_id: "00000000-0000-0000-0000-000000000000"
      });

    if (userInsertError) throw userInsertError;

    // Create appmaster_admins record
    const { error: adminError } = await supabaseAdmin
      .from("appmaster_admins")
      .insert({
        user_id: authData.user.id,
        admin_role,
        is_active: true,
        created_by: user.id
      });

    if (adminError) throw adminError;

    return new Response(
      JSON.stringify({
        success: true,
        message: 'AppMaster admin created successfully',
        user: {
          id: authData.user.id,
          email: authData.user.email,
          name
        }
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error: any) {
    console.error('Error creating appmaster admin:', error);
    return new Response(
      JSON.stringify({
        error: error.message
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});
