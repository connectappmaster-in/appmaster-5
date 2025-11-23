import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

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

    // Verify the request is from a super admin
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabaseAdmin.auth.getUser(token);
    
    if (userError || !user) {
      throw new Error('Unauthorized');
    }

    // Check if user is super admin
    const { data: adminData, error: checkError } = await supabaseAdmin
      .from('appmaster_admins')
      .select('admin_role, is_active')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .single();

    if (checkError || !adminData || !['super_admin', 'admin'].includes(adminData.admin_role)) {
      throw new Error('Unauthorized: Not a super admin');
    }

    const { name, email, password } = await req.json();

    if (!name || !email || !password) {
      throw new Error('Missing required fields: name, email, password');
    }

    // Check if user already exists in database
    const { data: existingUser, error: existingUserError } = await supabaseAdmin
      .from('users')
      .select('email')
      .eq('email', email)
      .maybeSingle();

    if (existingUserError && existingUserError.code !== 'PGRST116') {
      throw new Error(`Error checking existing user: ${existingUserError.message}`);
    }

    if (existingUser) {
      throw new Error('A user with this email already exists');
    }

    // Create auth user
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        name
      }
    });

    if (authError) {
      console.error('Auth error:', authError);
      throw new Error(`Failed to create auth user: ${authError.message}`);
    }

    if (!authData.user) {
      throw new Error('No user returned from auth creation');
    }

    // Create organization for individual user
    const { data: orgData, error: orgError } = await supabaseAdmin
      .from('organisations')
      .insert({
        name: name,
        account_type: 'personal',
        plan: 'free',
        active_tools: ['crm'],
      })
      .select()
      .single();

    if (orgError) {
      console.error('Org error:', orgError);
      // Rollback: delete the auth user
      await supabaseAdmin.auth.admin.deleteUser(authData.user.id);
      throw new Error(`Failed to create organization: ${orgError.message}`);
    }

    // Create user record
    const { error: userInsertError } = await supabaseAdmin
      .from('users')
      .insert({
        auth_user_id: authData.user.id,
        name: name,
        email: email,
        organisation_id: orgData.id,
        user_type: 'individual',
        role: 'admin',
        status: 'active',
      });

    if (userInsertError) {
      console.error('User insert error:', userInsertError);
      // Rollback: delete the auth user and organization
      await supabaseAdmin.auth.admin.deleteUser(authData.user.id);
      await supabaseAdmin.from('organisations').delete().eq('id', orgData.id);
      throw new Error(`Failed to create user record: ${userInsertError.message}`);
    }

    return new Response(
      JSON.stringify({
        success: true,
        user: {
          id: authData.user.id,
          email: authData.user.email,
          name: name,
          organisation_id: orgData.id
        }
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return new Response(
      JSON.stringify({
        error: errorMessage
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});
