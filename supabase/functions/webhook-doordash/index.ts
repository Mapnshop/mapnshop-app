import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { crypto } from "https://deno.land/std@0.177.0/crypto/mod.ts";

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// DoorDash uses a "Signing Secret" to generate an HMAC-SHA256 signature
const DOORDASH_SIGNING_SECRET = Deno.env.get("DOORDASH_SIGNING_SECRET") || Deno.env.get("DOORDASH_CLIENT_SECRET");

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-doordash-signature",
};

// HMAC Verification Helper
async function verifySignature(req: Request, bodyText: string): Promise<boolean> {
    if (!DOORDASH_SIGNING_SECRET) {
        console.warn("Skipping signature verification: DOORDASH_SIGNING_SECRET not set.");
        return true;
    }

    const signature = req.headers.get("x-doordash-signature");
    if (!signature) return false;

    // DoorDash format: signature is hex string
    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
        "raw",
        encoder.encode(DOORDASH_SIGNING_SECRET),
        { name: "HMAC", hash: "SHA-256" },
        false,
        ["verify"]
    );

    const verified = await crypto.subtle.verify(
        "HMAC",
        key,
        // The signature in header is hex encoded (sometimes base64url in other provider, checking docs... DoorDash is likely Hex or JWT?)
        // Ref: DoorDash docs say "HMAC-SHA256" and examples often show hex.
        // Wait, standard DoorDash Drive API uses JWT. Marketplace API might use HMAC.
        // Let's assume Hex for now, and if it fails, we debug.
        // Common pattern: hex decode the signature string.
        new Uint8Array(signature.match(/.{1,2}/g)!.map((byte) => parseInt(byte, 16))),
        encoder.encode(bodyText)
    );

    return verified;
}

function normalizeDoordashOrder(raw: any) {
    const items = raw.items.map((i: any) => ({
        name: i.name,
        qty: i.quantity,
        price: i.price / 100,
        notes: i.options?.map((o: any) => o.name).join(', ')
    })) || [];

    const subtotal = raw.items.reduce((acc: number, i: any) => acc + (i.price * i.quantity), 0) / 100;
    const tax = (raw.tax_amount || 0) / 100;
    const total = (raw.order_total || 0) / 100;

    return {
        source: 'DoorDash',
        external_order_id: raw.id || raw.order_id, // Normalize ID field
        external_store_id: raw.merchant_id || raw.store_id, // Normalize Store ID
        customer_name: `${raw.consumer?.first_name || 'DoorDash'} ${raw.consumer?.last_name || 'Guest'}`,
        customer_phone: raw.consumer?.phone_number || '',
        notes: raw.consumer?.should_leave_at_door ? 'Leave at door' : '',
        items_json: items,
        totals_json: { subtotal, tax, total, currency: 'CAD' },
        placed_at: raw.created_at || new Date().toISOString()
    };
}

serve(async (req) => {
    // Handle CORS preflight
    if (req.method === "OPTIONS") {
        return new Response("ok", { headers: corsHeaders });
    }

    try {
        const rawBody = await req.text();

        // 1. Verify Signature
        const isValid = await verifySignature(req, rawBody);
        if (!isValid) {
            console.error("Invalid DoorDash Signature");
            return new Response(JSON.stringify({ error: "Unauthorized: Invalid Signature" }), {
                status: 401,
                headers: { ...corsHeaders, "Content-Type": "application/json" }
            });
        }

        const raw = JSON.parse(rawBody);
        console.log("DoorDash payload:", raw);

        // 2. Lookup Integration
        const storeId = raw.merchant_id || raw.store_id; // Check both potential fields
        if (!storeId) {
            return new Response(JSON.stringify({ message: "Ignored: No merchant_id/store_id" }), {
                status: 200,
                headers: { ...corsHeaders, "Content-Type": "application/json" }
            });
        }

        const { data: integration, error: intError } = await supabase
            .from('integrations')
            .select('*')
            .eq('provider', 'doordash')
            .eq('external_store_id', storeId)
            .eq('status', 'connected')
            .single();

        if (intError || !integration) {
            console.error("Integration not found/connected for store:", storeId);
            return new Response(JSON.stringify({ error: "Store not linked to Mapnshop" }), {
                status: 404,
                headers: { ...corsHeaders, "Content-Type": "application/json" }
            });
        }

        // 3. Log Webhook Receipt
        await supabase.from('order_events').insert({
            business_id: integration.business_id,
            event_type: 'provider_webhook_received',
            provider: 'doordash',
            payload: { external_order_id: raw.id || raw.order_id, status: raw.status }
        });

        // 4. Normalize
        const normalized = normalizeDoordashOrder(raw);

        // 5. Upsert Order
        const { data: existingOrder } = await supabase
            .from('orders')
            .select('id, status')
            .eq('business_id', integration.business_id)
            .eq('source', 'DoorDash')
            .eq('external_order_id', normalized.external_order_id)
            .maybeSingle();

        let statusToSet = existingOrder ? existingOrder.status : 'created';
        // Map DoorDash statuses (e.g., 'CONFIRMED', 'CANCELLED')
        if (raw.status === 'CANCELLED') statusToSet = 'cancelled';
        if (raw.status === 'DELIVERED') statusToSet = 'completed';

        const orderData = {
            business_id: integration.business_id,
            source: 'DoorDash',
            external_order_id: normalized.external_order_id,
            status: statusToSet,
            customer_name: normalized.customer_name,
            customer_phone: normalized.customer_phone,
            notes: normalized.notes,
            description: normalized.items_json.map((i: any) => `${i.qty}x ${i.name}`).join(', '),
            total: normalized.totals_json.total,
            source_details: {
                ...raw,
                items_json: normalized.items_json,
                totals_json: normalized.totals_json
            },
            sync_state: 'ok',
            last_synced_at: new Date().toISOString()
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
        if (!existingOrder) {
            await supabase.from('order_events').insert({
                order_id: upsertData.id,
                business_id: integration.business_id,
                event_type: 'order_upserted',
                provider: 'doordash'
            });
        }

        // 7. Update Integration Status
        await supabase.from('integrations')
            .update({ last_webhook_at: new Date().toISOString() })
            .eq('id', integration.id);

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
