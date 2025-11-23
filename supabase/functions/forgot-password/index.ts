import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.81.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email } = await req.json();

    if (!email) {
      return new Response(
        JSON.stringify({ error: "Email is required" }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create Supabase admin client with service role key
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

    // Check if user exists using admin client
    const { data: users, error: lookupError } = await supabaseAdmin.auth.admin.listUsers();
    
    if (lookupError) {
      console.error('Error looking up user:', lookupError);
      return new Response(
        JSON.stringify({ error: "System error occurred" }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const userExists = users.users.some(user => user.email === email.toLowerCase());

    // Only send reset email if user exists
    if (userExists) {
      const redirectUrl = req.headers.get('origin') ? 
        `${req.headers.get('origin')}/reset-password-confirm` : 
        'https://2eefe7ec-ff45-4cb2-bdad-0cba4d1d3425.lovableproject.com/reset-password-confirm';

      const { error: resetError } = await supabaseAdmin.auth.admin.generateLink({
        type: 'recovery',
        email: email,
        options: {
          redirectTo: redirectUrl,
        }
      });

      if (resetError) {
        console.error('Error generating reset link:', resetError);
        // Don't reveal this error to client
      } else {
        console.log(`Password reset link generated for: ${email}`);
      }
    } else {
      console.log(`Password reset requested for non-existent email: ${email}`);
    }

    // Always return the same generic success message
    return new Response(
      JSON.stringify({ 
        success: true,
        message: "If an account with this email exists, we've sent a password reset link."
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error: any) {
    console.error('System error in forgot-password:', error);
    return new Response(
      JSON.stringify({ error: "System error occurred. Please try again later." }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
