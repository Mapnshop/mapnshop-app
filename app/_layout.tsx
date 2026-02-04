import { useEffect } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { BusinessProvider, useBusiness } from '@/contexts/BusinessContext';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import { View, ActivityIndicator, Text } from 'react-native';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { usePushNotifications } from '@/hooks/usePushNotifications';

function RootLayoutNav() {
  const { user, loading: authLoading } = useAuth();
  const { business, loading: businessLoading } = useBusiness();
  const segments = useSegments();
  const router = useRouter();

  // Initialize Push Notifications
  usePushNotifications();

  useEffect(() => {
    if (authLoading || businessLoading) return;

    const inAuthGroup = segments[0] === 'auth';
    const inOnboarding = segments[0] === 'onboarding';
    const inLanding = segments[0] === 'landing';
    const inSupport = segments[0] === 'support';

    console.log('RootLayoutNav check:', {
      user: !!user,
      business: !!business,
      segments: segments,
      inAuthGroup,
      inOnboarding,
      inLanding,
      inSupport
    });

    // Show landing page for non-authenticated users (only on web)
    if (!user && !inAuthGroup && !inLanding && !inSupport) {
      console.log('Redirecting to /landing');
      router.replace('/landing');
    } else if (user && !business && !inOnboarding) {
      console.log('Redirecting to /onboarding');
      router.replace('/onboarding');
    } else if (user && business && (inAuthGroup || inOnboarding || inLanding || !segments[0])) {
      console.log('Redirecting to /(tabs)');
      router.replace('/(tabs)');
    }
  }, [user, business, segments, authLoading, businessLoading]);

  if (authLoading || businessLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="landing" />
        <Stack.Screen name="auth" />
        <Stack.Screen name="onboarding" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="order/[id]" />
        <Stack.Screen name="+not-found" />
      </Stack>
      <StatusBar style="auto" />
    </>
  );
}

export default function RootLayout() {
  useFrameworkReady();

  // Safety Check for Environment Variables
  const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey || supabaseUrl.includes('placeholder')) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
        <Text style={{ fontSize: 20, fontWeight: 'bold', color: 'red', marginBottom: 10 }}>Deployment Error</Text>
        <Text style={{ textAlign: 'center', fontSize: 16 }}>Missing Environment Variables</Text>
        <Text style={{ textAlign: 'center', marginTop: 10, color: '#666' }}>
          Please add EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY to your Netlify Site Settings and trigger a deploy.
        </Text>
      </View>
    );
  }

  return (
    <AuthProvider>
      <BusinessProvider>
        <ErrorBoundary>
          <RootLayoutNav />
        </ErrorBoundary>
      </BusinessProvider>
    </AuthProvider>
  );
}
