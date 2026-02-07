import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
// Use Service Role to access all orders
const supabase = createClient(supabaseUrl, supabaseServiceKey);

serve(async (req) => {
    try {
        // 1. Fetch Failed Sync Orders
        const { data: failedOrders, error } = await supabase
            .from('orders')
            .select('*')
            .eq('sync_state', 'error')
            .in('source', ['Uber Eats', 'DoorDash', 'uber_eats', 'doordash'])
            .lt('retry_count', 3) // Max 3 retries
            .gt('updated_at', new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()); // Updated within last 2 hours

        if (error) throw error;
        if (!failedOrders || failedOrders.length === 0) {
            return new Response(JSON.stringify({ message: "No failed syncs to retry" }), { status: 200 });
        }

        const results = [];

        // 2. Retry Each
        for (const order of failedOrders) {
            console.log(`Retrying sync for order ${order.id} (${order.source})`);

            // Log attempt
            await supabase.from('order_events').insert({
                order_id: order.id,
                business_id: order.business_id,
                event_type: 'provider_status_sync_retry',
                payload: { attempt: order.retry_count + 1 }
            });

            // Call Sync (Mock)
            const success = await mockProviderSync(order.source, order.external_order_id, order.status);

            if (success) {
                await supabase.from('orders').update({
                    sync_state: 'ok',
                    last_synced_at: new Date().toISOString(),
                    retry_count: 0, // Reset on success? Or keep history? Usually reset.
                    last_sync_error: null
                }).eq('id', order.id);
                results.push({ id: order.id, status: 'synced' });
            } else {
                await supabase.from('orders').update({
                    retry_count: order.retry_count + 1,
                    last_sync_error: `Retry ${order.retry_count + 1} failed`
                }).eq('id', order.id);
                results.push({ id: order.id, status: 'failed' });
            }
        }

        return new Response(JSON.stringify({ processed: results.length, results }), {
            headers: { "Content-Type": "application/json" },
            status: 200,
        });

    } catch (err) {
        return new Response(JSON.stringify({ error: err.message }), {
            headers: { "Content-Type": "application/json" },
            status: 500,
        });
    }
});

async function mockProviderSync(provider: string, externalId: string, status: string): Promise<boolean> {
    console.log(`[MOCK RETRY] Syncing ${provider} order ${externalId} to ${status}`);
    // Simulate better success rate on retry
    return Math.random() > 0.1;
}
