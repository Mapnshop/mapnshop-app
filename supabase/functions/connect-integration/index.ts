import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
    if (req.method === "OPTIONS") {
        return new Response("ok", { headers: corsHeaders });
    }

    try {
        // 1. Authenticate User (Get ID from JWT)
        const authHeader = req.headers.get('Authorization');
        if (!authHeader) throw new Error('Missing Authorization header');

        const { data: { user }, error: authError } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));
        if (authError || !user) throw new Error('Unauthorized');

        const { provider, business_id, external_store_id, api_key, api_secret } = await req.json();

        // 2. Validate Membership (RLS check via Service Role)
        // Ensure this user actually OWNS or ADMINS this business.
        const { data: membership, error: memError } = await supabase
            .from('business_members')
            .select('role')
            .eq('business_id', business_id)
            .eq('user_id', user.id)
            .in('role', ['owner', 'admin'])
            .single();

        // Also check if owner directly via businesses table
        const { data: businessOwner } = await supabase
            .from('businesses')
            .select('owner_id')
            .eq('id', business_id)
            .eq('owner_id', user.id)
            .single();

        if (!membership && !businessOwner) {
            return new Response(JSON.stringify({ error: "Unauthorized access to business" }), { status: 403, headers: corsHeaders });
        }

        // 3. Encrypt Credentials (Mock Encryption for MVP)
        // In production, use Web Crypto API or a dedicated secrets manager.
        // For MVP, we JSON stringify. The security comes from RLS (client can't read the column).
        const credentials = JSON.stringify({
            api_key,
            api_secret,
            created_at: new Date().toISOString()
        });

        // 4. Upsert Integration
        const { error: upsertError } = await supabase
            .from('integrations')
            .upsert({
                business_id,
                provider,
                external_store_id,
                credentials_encrypted: credentials,
                status: 'connected',
                updated_at: new Date().toISOString(),
                last_error: null
            }, { onConflict: 'business_id,provider' });

        if (upsertError) throw upsertError;

        return new Response(JSON.stringify({ success: true, status: 'connected' }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 200,
        });

    } catch (err) {
        return new Response(JSON.stringify({ error: err.message }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 400,
        });
    }
});
