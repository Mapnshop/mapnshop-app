import { Stack } from 'expo-router';
import { useBusiness } from '@/contexts/BusinessContext';

export default function SupportLayout() {
    const { business } = useBusiness();

    // Redirect if not logged in? handled by root layout mostly.

    return (
        <Stack
            screenOptions={{
                headerShown: true,
                headerTintColor: '#111827',
                headerBackTitle: 'Back',
                headerStyle: {
                    backgroundColor: '#FFFFFF',
                },
                headerShadowVisible: false,
            }}
        >
            <Stack.Screen name="index" options={{ title: 'Help & Support' }} />
            <Stack.Screen name="contact" options={{ title: 'Contact Support' }} />
            <Stack.Screen name="privacy" options={{ title: 'Privacy Policy' }} />
            <Stack.Screen name="terms" options={{ title: 'Terms of Service' }} />
        </Stack>
    );
}
