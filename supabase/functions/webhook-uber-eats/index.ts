import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function normalizeUberOrder(raw: any) {
    const items = raw.cart?.items.map((i: any) => ({
        name: i.title,
        qty: i.quantity,
        price: i.price / 100,
        notes: i.special_instructions
    })) || [];

    const subtotal = (raw.payment?.charges.subtotal.amount || 0) / 100;
    const tax = (raw.payment?.charges.tax.amount || 0) / 100;
    const total = (raw.payment?.charges.total.amount || 0) / 100;

    return {
        source: 'uber_eats',
        external_order_id: raw.order_id,
        external_store_id: raw.store_id,
        customer_name: raw.eater?.first_name || 'Uber Guest',
        customer_phone: raw.eater?.phone || '',
        notes: raw.display_id ? `Uber #${raw.display_id}` : '',
        items_json: items,
        totals_json: { subtotal, tax, total, currency: 'CAD' }, // Assuming CAD or dynamic
        placed_at: raw.created_at
    };
}

serve(async (req) => {
    if (req.method === "OPTIONS") {
        return new Response("ok", { headers: corsHeaders });
    }

    try {
        const raw = await req.json();
        console.log("Uber payload:", raw);

        // 1. Verify Signature (Mock)
        // const sig = req.headers.get('X-Uber-Signature');

        // 2. Lookup Integration
        const storeId = raw.store_id;
        if (!storeId) throw new Error("Missing store_id");

        const { data: integration, error: intError } = await supabase
            .from('integrations')
            .select('*')
            .eq('provider', 'uber_eats')
            .eq('external_store_id', storeId)
            .eq('status', 'connected') // Must be connected
            .single();

        if (intError || !integration) {
            console.error("Integration not found/connected:", storeId);
            return new Response(JSON.stringify({ error: "Store not integrated" }), { status: 404 });
        }

        // 3. Log Webhook Receipt
        await supabase.from('order_events').insert({
            business_id: integration.business_id,
            event_type: 'provider_webhook_received',
            provider: 'uber_eats',
            payload: { external_order_id: raw.order_id, event: raw.event_type }
        });

        // 4. Normalize
        const normalized = normalizeUberOrder(raw);

        // 5. Upsert Order (Idempotent)
        // We check if order exists to Preserve Status if it's already progressed beyond NEW
        const { data: existingOrder } = await supabase
            .from('orders')
            .select('id, status')
            .eq('business_id', integration.business_id)
            .eq('source', 'Uber Eats') // Note: Database has 'Uber Eats', our ENUM might be different. 
            // Migration added 'uber_eats' to source check??
            // Wait, schema check said "source text not null check (source in ('manual','uber_eats','doordash'))"
            // But consolidated schema had "Uber Eats"!
            // I need to be careful. The PREVIOUS schema used 'Uber Eats'. The NEW requirement says 'uber_eats'.
            // I should stick to 'Uber Eats' to match existing Enum if I didn't change it, OR change it.
            // My refined migration didn't change the enum orders_source!
            // So I must use 'Uber Eats' as the source string to match the DB Enum.
            .eq('external_order_id', normalized.external_order_id)
            .single();

        const statusToSet = existingOrder ? existingOrder.status : 'created'; // Keep existing status or set to created

        const orderData = {
            business_id: integration.business_id,
            source: 'Uber Eats', // Matching DB Enum
            external_order_id: normalized.external_order_id,
            status: statusToSet,
            customer_name: normalized.customer_name,
            customer_phone: normalized.customer_phone,
            notes: normalized.notes,
            // Map normalized items to description/price for backward compat + new json fields if added
            description: normalized.items_json.map((i: any) => `${i.qty}x ${i.name}`).join(', '),
            total: normalized.totals_json.total,
            // We actally want to store the JSON too if we added columns, but requirement said "items_json".
            // Did I add items_json column? The migration 20260207_marketplace_integrations.sql had source_details JSONB.
            // It did NOT add items_json or totals_json columns explicitly.
            // I should store them in `source_details` or rely on `description`/`price`.
            // User Requirement: "items_json, totals_json... Output fields (minimum)".
            // But DB I built has `source_details`. I will put them there.
            source_details: {
                ...raw,
                items_json: normalized.items_json,
                totals_json: normalized.totals_json
            },
            sync_state: 'ok',
            last_synced_at: new Date().toISOString() // It's in sync with provider since it just came from them
        };

        const { data: upsertData, error: upsertError } = await supabase
            .from('orders')
            .upsert(orderData, {
                onConflict: 'business_id,source,external_order_id',
                ignoreDuplicates: false
            })
            .select()
            .single();

        if (upsertError) throw upsertError;

        // 6. Log Upsert
        await supabase.from('order_events').insert({
            order_id: upsertData.id,
            business_id: integration.business_id,
            event_type: 'order_upserted',
            provider: 'uber_eats'
        });

        // 7. Update Integration Status
        await supabase.from('integrations')
            .update({ last_webhook_at: new Date().toISOString() })
            .eq('id', integration.id);

        return new Response(JSON.stringify({ success: true, order_id: upsertData.id }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 200,
        });

    } catch (err) {
        console.error("Webhook Error", err);
        return new Response(JSON.stringify({ error: err.message }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 500,
        });
    }
});
