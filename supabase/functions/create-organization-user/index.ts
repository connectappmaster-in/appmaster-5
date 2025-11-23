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

    // Get the current user making the request
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user: requestingUser }, error: userAuthError } = await supabaseAdmin.auth.getUser(token);
    
    if (userAuthError || !requestingUser) {
      throw new Error('Unauthorized');
    }

    // Get the requesting user's organization and verify they're an admin
    const { data: adminUser, error: adminCheckError } = await supabaseAdmin
      .from('users')
      .select('organisation_id, role')
      .eq('auth_user_id', requestingUser.id)
      .single();

    if (adminCheckError || !adminUser || adminUser.role !== 'admin') {
      throw new Error('Unauthorized: Admin privileges required');
    }

    const { name, email, password, role } = await req.json();

    if (!name || !email || !password || !role) {
      throw new Error('Missing required fields: name, email, password, role');
    }

    // Validate password length
    if (password.length < 8) {
      throw new Error('Password must be at least 8 characters long');
    }

    console.log(`Checking for existing user: ${email} in org: ${adminUser.organisation_id}`);

    // Direct query to check for existing user, using service role to bypass RLS
    const { data: existingUsers, error: existingUserError } = await supabaseAdmin
      .from('users')
      .select('id, email, organisation_id, auth_user_id')
      .ilike('email', email)
      .eq('organisation_id', adminUser.organisation_id);

    console.log('Existing user check result:', { count: existingUsers?.length, existingUserError });

    if (existingUserError) {
      console.error('Error checking existing user:', existingUserError);
      throw new Error(`Error checking existing user: ${existingUserError.message}`);
    }

    // If we found existing user records
    if (existingUsers && existingUsers.length > 0) {
      const existingUser = existingUsers[0];
      console.log('User record exists:', existingUser);
      
      // Check if the associated auth user still exists
      try {
        const { data: authUser } = await supabaseAdmin.auth.admin.getUserById(existingUser.auth_user_id);
        
        if (authUser && authUser.user) {
          // Both records exist - this is a true duplicate
          throw new Error('A user with this email already exists in this organization');
        }
      } catch (authError) {
        // Auth user doesn't exist - clean up orphaned record
        console.log('Cleaning up orphaned user record (auth user not found):', existingUser.id);
        await supabaseAdmin
          .from('users')
          .delete()
          .eq('id', existingUser.id);
      }
    }

    // Check if auth user exists with this email (and clean up if orphaned)
    const { data: authUserList } = await supabaseAdmin.auth.admin.listUsers();
    
    if (authUserList?.users) {
      const existingAuthUser = authUserList.users.find(u => u.email?.toLowerCase() === email.toLowerCase());
      if (existingAuthUser) {
        // Check if this auth user has a corresponding users record in this org
        const { data: linkedUsers } = await supabaseAdmin
          .from('users')
          .select('id')
          .eq('auth_user_id', existingAuthUser.id)
          .eq('organisation_id', adminUser.organisation_id);
        
        if (linkedUsers && linkedUsers.length > 0) {
          // Auth user has a linked record in this org - true duplicate
          throw new Error('A user with this email already exists in this organization');
        } else {
          // Orphaned auth user - delete it
          console.log('Cleaning up orphaned auth user:', existingAuthUser.id);
          await supabaseAdmin.auth.admin.deleteUser(existingAuthUser.id);
        }
      }
    }

    console.log(`Creating auth user for: ${email}`);

    // Create auth user
    const { data: authData, error: createAuthError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        name,
        organisation_id: adminUser.organisation_id,
        account_type: 'organization',
      }
    });

    if (createAuthError) {
      console.error('Auth error:', createAuthError);
      throw new Error(`Failed to create auth user: ${createAuthError.message}`);
    }

    if (!authData.user) {
      throw new Error('No user returned from auth creation');
    }

    console.log(`Auth user created: ${authData.user.id}`);
    
    // Wait a moment for the trigger to complete
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Verify the user was created by the trigger and update the role if needed
    const { data: createdUser, error: verifyError } = await supabaseAdmin
      .from('users')
      .select('id, role')
      .eq('auth_user_id', authData.user.id)
      .eq('organisation_id', adminUser.organisation_id)
      .maybeSingle();
    
    if (verifyError || !createdUser) {
      console.error('User was not created by trigger:', verifyError);
      // Rollback: delete the auth user
      await supabaseAdmin.auth.admin.deleteUser(authData.user.id);
      throw new Error('Failed to create user record via trigger');
    }
    
    // Update the role to match what was requested (trigger sets it to 'employee' by default)
    if (createdUser.role !== role) {
      console.log(`Updating user role from ${createdUser.role} to ${role}`);
      const { error: updateError } = await supabaseAdmin
        .from('users')
        .update({ role: role })
        .eq('id', createdUser.id);
      
      if (updateError) {
        console.error('Failed to update user role:', updateError);
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        user: {
          id: authData.user.id,
          email: authData.user.email,
          name: name,
          organisation_id: adminUser.organisation_id,
          role: role
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
