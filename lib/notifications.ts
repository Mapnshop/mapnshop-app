import { supabase } from '@/lib/supabase';

// Send a push notification to all staff of a business (except the sender/current user)
export async function sendPushToBusiness(businessId: string, title: string, body: string, currentUserId?: string) {
    try {
        // 1. Get all staff user_ids for this business
        let query = supabase
            .from('business_members')
            .select('user_id')
            .eq('business_id', businessId)
            .not('user_id', 'is', null);

        const { data: members, error: memberError } = await query;
        if (memberError || !members) {
            console.error("Error fetching business members for push:", memberError);
            return;
        }

        // Filter out current user if provided
        const userIds = members
            .map(m => m.user_id)
            .filter(id => id !== currentUserId && id !== null);

        if (userIds.length === 0) return;

        // 2. Get tokens for these users
        const { data: tokensData, error: tokenError } = await supabase
            .from('user_push_tokens')
            .select('token')
            .in('user_id', userIds);

        if (tokenError || !tokensData) {
            console.error("Error fetching tokens:", tokenError);
            return;
        }

        const pushTokens = tokensData.map(t => t.token).filter(t => t);

        if (pushTokens.length === 0) return;

        // 3. Send Notifications via Expo API
        // Batch requests if needed, but for now simple loop is fine for small scale
        const messages = pushTokens.map(token => ({
            to: token,
            sound: 'default',
            title,
            body,
            data: { businessId },
        }));

        await fetch('https://exp.host/--/api/v2/push/send', {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                'Accept-encoding': 'gzip, deflate',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(messages),
        });

        console.log(`Sent push notification to ${pushTokens.length} devices.`);

    } catch (error) {
        console.error("Failed to send push notification:", error);
    }
}
