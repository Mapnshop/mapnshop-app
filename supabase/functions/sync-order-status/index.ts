import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface WebhookPayload {
    type: "INSERT" | "UPDATE" | "DELETE";
    table: string;
    record: any;
    old_record: any;
    schema: string;
}

serve(async (req) => {
    if (req.method === "OPTIONS") {
        return new Response("ok", { headers: corsHeaders });
    }

    try {
        const payload: WebhookPayload = await req.json();
        console.log("Received Order Status Sync payload:", payload);

        if (payload.table !== "orders") {
            return new Response("Ignored: Not orders table", { status: 200 });
        }

        const { record, old_record } = payload;
        const newStatus = record.status;
        const oldStatus = old_record?.status;

        // 1. Filter irrelevant updates
        // Ignore if status didn't change (e.g. sync_state update)
        if (newStatus === oldStatus) {
            return new Response("Ignored: Status did not change", { status: 200 });
        }

        // Ignore if source is manual
        const source = record.source;
        if (source === 'manual' || source === 'phone' || source === 'walk-in' || source === 'whatsapp') {
            return new Response("Ignored: Manual source", { status: 200 });
        }

        // 2. Fetch Integration for Credentials
        const businessId = record.business_id;
        // We assume 'source' matches 'provider' enum or we map it.
        // Provider enum: 'uber_eats'|'doordash'
        // Source enum includes: 'Uber Eats', 'DoorDash' (mixed case).
        let provider = '';
        if (source === 'Uber Eats') provider = 'uber_eats';
        else if (source === 'DoorDash') provider = 'doordash';
        else {
            return new Response(`Ignored: Unsupported source ${source}`, { status: 200 });
        }

        const { data: integration, error: intError } = await supabase
            .from('integrations')
            .select('*')
            .eq('business_id', businessId)
            .eq('provider', provider)
            .single();

        if (intError || !integration) {
            console.error("Integration missing for sync:", businessId, provider);
            // We log error to order but don't crash
            await updateSyncError(record.id, "Integration missing");
            return new Response("Error: Integration missing", { status: 200 });
        }

        // 3. Call External API
        console.log(`Syncing order ${record.external_order_id} to ${provider}: ${newStatus}`);

        // MOCK API CALL
        const success = await mockProviderSync(provider, record.external_order_id, newStatus);

        if (!success) {
            await updateSyncError(record.id, "Provider API Error");
            return new Response("Sync Failed", { status: 200 });
        }

        // 4. Update Sync State Success
        await supabase.from('orders').update({
            sync_state: 'synced',
            last_sync_error: null
        }).eq('id', record.id);

        return new Response(JSON.stringify({ success: true }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 200,
        });

    } catch (err) {
        console.error("Sync Error:", err);
        return new Response(JSON.stringify({ error: err.message }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 500,
        });
    }
});

async function updateSyncError(orderId: string, errorMsg: string) {
    await supabase.from('orders').update({
        sync_state: 'error',
        last_sync_error: errorMsg
    }).eq('id', orderId);
}

async function mockProviderSync(provider: string, externalId: string, status: string): Promise<boolean> {
    // Simulate API call
    // Map internal status to external
    // internal: created, preparing, ready, completed, cancelled
    // Uber: ACCEPTED, PREPARING, READY, PICKED_UP (?)

    console.log(`[MOCK] POST /${provider}/orders/${externalId}/status`, { status });

    // Simulate sporadic failure
    if (Math.random() < 0.1) return false;

    return true;
}
