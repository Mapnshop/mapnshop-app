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
        const authHeader = req.headers.get('Authorization');
        if (!authHeader) throw new Error('Missing Authorization header');

        const { data: { user }, error: authError } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));
        if (authError || !user) throw new Error('Unauthorized');

        const { provider, business_id } = await req.json();

        // Verify ownership/admin rights
        const { data: membership } = await supabase
            .from('business_members')
            .select('role')
            .eq('business_id', business_id)
            .eq('user_id', user.id)
            .in('role', ['owner', 'admin'])
            .single();

        const { data: businessOwner } = await supabase
            .from('businesses')
            .select('owner_id')
            .eq('id', business_id)
            .eq('owner_id', user.id)
            .single();

        if (!membership && !businessOwner) {
            return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 403, headers: corsHeaders });
        }

        // Set status to disconnected and clear credentials
        const { error } = await supabase
            .from('integrations')
            .update({
                status: 'disconnected',
                credentials_encrypted: null, // Clear secrets
                updated_at: new Date().toISOString()
            })
            .eq('business_id', business_id)
            .eq('provider', provider);

        if (error) throw error;

        return new Response(JSON.stringify({ success: true }), {
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
