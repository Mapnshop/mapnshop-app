import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { crypto } from "https://deno.land/std@0.177.0/crypto/mod.ts";
import { encodeHex } from "https://deno.land/std@0.177.0/encoding/hex.ts";

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

const UBER_CLIENT_SECRET = Deno.env.get("UBER_EATS_CLIENT_SECRET");

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-uber-signature",
};

// HMAC Verification Helper
async function verifySignature(req: Request, bodyText: string): Promise<boolean> {
    if (!UBER_CLIENT_SECRET) {
        console.warn("Skipping signature verification: UBER_EATS_CLIENT_SECRET not set.");
        return true; // Allow dev/testing if secret is missing (WARN: NOT FOR PRODUCTION)
    }

    const signature = req.headers.get("X-Uber-Signature");
    if (!signature) return false;

    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
        "raw",
        encoder.encode(UBER_CLIENT_SECRET),
        { name: "HMAC", hash: "SHA-256" },
        false,
        ["verify"]
    );

    const verified = await crypto.subtle.verify(
        "HMAC",
        key,
        // The signature in header is hex encoded
        new Uint8Array(signature.match(/.{1,2}/g)!.map((byte) => parseInt(byte, 16))),
        encoder.encode(bodyText)
    );

    return verified;
}

function normalizeUberOrder(raw: any) {
    const items = raw.cart?.items.map((i: any) => ({
        name: i.title,
        qty: i.quantity,
        price: (i.price?.amount || i.price || 0) / 100, // Uber sends cents
        notes: i.special_instructions
    })) || [];

    // Uber Structure: payment.charges.total.amount (cents)
    const subtotal = (raw.payment?.charges?.subtotal?.amount || 0) / 100;
    const tax = (raw.payment?.charges?.tax?.amount || 0) / 100;
    const total = (raw.payment?.charges?.total?.amount || 0) / 100;

    return {
        source: 'Uber Eats', // Matches 'Uber Eats' in DB Enum or text
        external_order_id: raw.order_id || raw.id, // Uber payload varies by version
        external_store_id: raw.store_id,
        customer_name: raw.eater?.first_name || 'Uber Guest',
        customer_phone: raw.eater?.phone || '',
        notes: raw.display_id ? `Uber #${raw.display_id}` : '',
        items_json: items,
        totals_json: { subtotal, tax, total, currency: raw.payment?.charges?.total?.currency_code || 'CAD' },
        placed_at: raw.created_at || new Date().toISOString()
    };
}

serve(async (req) => {
    // Handle CORS preflight
    if (req.method === "OPTIONS") {
        return new Response("ok", { headers: corsHeaders });
    }

    try {
        // 1. Read Raw Body for Signature Verification
        const rawBody = await req.text();

        // 2. Verify Signature
        const isValid = await verifySignature(req, rawBody);
        if (!isValid) {
            console.error("Invalid Uber Signature");
            return new Response(JSON.stringify({ error: "Unauthorized: Invalid Signature" }), {
                status: 401,
                headers: { ...corsHeaders, "Content-Type": "application/json" }
            });
        }

        const raw = JSON.parse(rawBody);
        console.log("Uber payload received:", raw.event_type || "No event type", raw.order_id);

        // We only care about specific events, typically: 'orders.notification' (created)
        // If event_type is present, filter. If it's a raw order snapshot, process it.
        // Assuming 'orders.notification' or direct order object.
        // For MVP, if it has 'store_id' and 'order_id', we assume it's created/updated.

        const storeId = raw.store_id;
        if (!storeId) {
            // Might be a test event or ping
            return new Response(JSON.stringify({ message: "Ignored: No store_id" }), {
                status: 200,
                headers: { ...corsHeaders, "Content-Type": "application/json" }
            });
        }

        // 3. Lookup Integration
        const { data: integration, error: intError } = await supabase
            .from('integrations')
            .select('*')
            .eq('provider', 'uber_eats')
            .eq('external_store_id', storeId)
            .eq('status', 'connected')
            .single();

        if (intError || !integration) {
            console.error("Integration not found/connected for store:", storeId);
            return new Response(JSON.stringify({ error: "Store not linked to Mapnshop" }), {
                status: 404, // Uber might retry, which is good if it's a temp glitch
                headers: { ...corsHeaders, "Content-Type": "application/json" }
            });
        }

        // 4. Log Webhook Receipt
        await supabase.from('order_events').insert({
            business_id: integration.business_id,
            event_type: 'provider_webhook_received',
            provider: 'uber_eats',
            payload: { external_order_id: raw.order_id, event: raw.event_type }
        });

        // 5. Normalize
        const normalized = normalizeUberOrder(raw);

        // 6. Upsert Order
        // Check existence to preserve internal status
        const { data: existingOrder } = await supabase
            .from('orders')
            .select('id, status')
            .eq('business_id', integration.business_id)
            .eq('source', 'Uber Eats')
            .eq('external_order_id', normalized.external_order_id)
            .maybeSingle();

        // Logic: If new, 'created'. If exists, keep current status UNLESS Uber sends 'status' update.
        // Uber 'status' field: 'CREATED', 'ACCEPTED', 'DENIED', 'FINISHED', 'CANCELED'
        let statusToSet = existingOrder?.status || 'created';

        if (raw.current_state === 'CANCELED') statusToSet = 'cancelled';
        if (raw.current_state === 'FINISHED') statusToSet = 'completed';

        const orderData = {
            business_id: integration.business_id,
            source: 'Uber Eats',
            external_order_id: normalized.external_order_id,
            status: statusToSet,
            customer_name: normalized.customer_name,
            customer_phone: normalized.customer_phone,
            notes: normalized.notes,
            // Display friendly description
            description: normalized.items_json.map((i: any) => `${i.qty}x ${i.name}`).join(', '),
            total: normalized.totals_json.total,
            // Store full details for UI
            source_details: {
                ...raw, // Keep original payload
                items_json: normalized.items_json,
                totals_json: normalized.totals_json
            },
            sync_state: 'ok',
            last_synced_at: new Date().toISOString()
        };

        const { data: upsertData, error: upsertError } = await supabase
            .from('orders')
            .upsert(orderData, {
                onConflict: 'business_id,source,external_order_id'
            })
            .select()
            .single();

        if (upsertError) {
            console.error("Upsert Failed:", upsertError);
            throw upsertError;
        }

        // 7. Log Upsert
        if (!existingOrder) {
            await supabase.from('order_events').insert({
                order_id: upsertData.id,
                business_id: integration.business_id,
                event_type: 'order_upserted',
                provider: 'uber_eats'
            });
        }

        return new Response(JSON.stringify({ success: true, order_id: upsertData.id }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 200,
        });

    } catch (err: any) {
        console.error("Webhook Error", err);
        return new Response(JSON.stringify({ error: err.message }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 500,
        });
    }
});
