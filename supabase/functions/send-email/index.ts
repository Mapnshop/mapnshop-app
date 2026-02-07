import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);

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
        console.log("Received webhook payload:", payload);

        // Only process updates to 'businesses' table
        if (payload.table !== "businesses") {
            return new Response("Ignored: Not businesses table", { status: 200 });
        }

        const { record, old_record } = payload;

        // Check if status changed
        const oldStatus = old_record?.verification_status;
        const newStatus = record?.verification_status;

        if (oldStatus === newStatus) {
            return new Response("Ignored: Status did not change", { status: 200 });
        }

        // 1. Get User Email
        const ownerId = record.owner_id;
        if (!ownerId) {
            throw new Error("No owner_id found in record");
        }

        const { data: userData, error: userError } = await supabase.auth.admin.getUserById(ownerId);

        if (userError || !userData.user) {
            console.error("Error fetching user:", userError);
            throw new Error("Could not find user email");
        }

        const userEmail = userData.user.email;
        const businessName = record.name;

        // 2. Prepare Email Content
        let subject = "";
        let html = "";

        if (newStatus === "approved") {
            subject = "Your Business is Approved! 🎉";
            html = `
        <h1>Congratulations!</h1>
        <p>Your business <strong>${businessName}</strong> has been verified and approved.</p>
        <p>You now have full access to the Mapnshop dashboard.</p>
        <p><a href="https://mapnshop.com">Open App</a></p>
      `;
        } else if (newStatus === "rejected") {
            subject = "Action Required: Business Verification Update";
            html = `
        <h1>Verification Update</h1>
        <p>Your business <strong>${businessName}</strong> requires some changes.</p>
        <p><strong>Reason:</strong> ${record.rejection_reason || "Not specified"}</p>
        <p>Please open the app to update your details and resubmit.</p>
      `;
        } else {
            return new Response("Ignored: Status change not relevant for email", { status: 200 });
        }

        // 3. Send Email via Resend
        console.log(`Sending email to ${userEmail} for status ${newStatus}`);

        const res = await fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${RESEND_API_KEY}`,
            },
            body: JSON.stringify({
                from: "Mapnshop <onboarding@resend.dev>", // TODO: User needs to verify domain or use 'onboarding@resend.dev' for testing
                to: [userEmail],
                subject: subject,
                html: html,
            }),
        });

        const data = await res.json();
        console.log("Resend API response:", data);

        return new Response(JSON.stringify(data), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 200,
        });

    } catch (error) {
        console.error("Error processing webhook:", error);
        return new Response(JSON.stringify({ error: error.message }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 500,
        });
    }
});
