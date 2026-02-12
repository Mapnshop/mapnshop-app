import { useEffect } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { BusinessProvider, useBusiness } from '@/contexts/BusinessContext';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import { View, ActivityIndicator, Text, Platform } from 'react-native';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { usePushNotifications } from '@/hooks/usePushNotifications';

function RootLayoutNav() {
  const { user, loading: authLoading, isPasswordRecovery } = useAuth();
  const { business, loading: businessLoading } = useBusiness();
  const segments = useSegments();
  const router = useRouter();

  // Initialize Push Notifications
  usePushNotifications();

  useEffect(() => {
    if (authLoading || businessLoading) return;

    // Password Recovery Priority
    if (isPasswordRecovery) {
      if (segments[0] !== 'reset-password') {
        console.log('Redirecting to /reset-password');
        router.replace('/reset-password');
      }
      return;
    }

    const inAuthGroup = segments[0] === 'auth';
    const inOnboarding = segments[0] === 'onboarding';
    const inLanding = segments[0] === 'landing';
    const inSupport = segments[0] === 'support';
    const inPendingVerification = segments[0] === 'pending-verification';
    const inPublicPages = ['problem', 'solution', 'features'].includes(segments[0] as string);

    console.log('RootLayoutNav check:', {
      user: !!user,
      business: !!business,
      verificationStatus: business?.verification_status,
      segments: segments,
      inAuthGroup,
      inOnboarding,
      inLanding,
      inSupport,
      inPendingVerification,
      inPublicPages
    });

    // Show auth page for non-authenticated users
    // (landing page is web-only, mobile goes to auth)
    if (!user && !inAuthGroup && !inLanding && !inSupport && !inPublicPages) {
      // If we are on web and at the root path (empty segments or 'index'), redirect to landing
      if (Platform.OS === 'web' && (!segments[0] || (segments[0] as string) === 'index')) {
        console.log('Redirecting to /landing');
        router.replace('/landing');
      } else {
        console.log('Redirecting to /auth');
        router.replace('/auth');
      }
    } else if (user && !business && !inOnboarding) {
      // No business profile -> go to onboarding
      console.log('Redirecting to /onboarding');
      router.replace('/onboarding');
    } else if (user && business) {
      // Handle verification states
      const status = business.verification_status;

      if (status === 'draft' || status === 'rejected') {
        // Allow editing onboarding
        if (!inOnboarding) {
          console.log('Redirecting to /onboarding (draft/rejected)');
          router.replace('/onboarding');
        }
      } else if (status === 'pending') {
        // Lock in pending verification screen
        if (!inPendingVerification) {
          console.log('Redirecting to /pending-verification');
          router.replace('/pending-verification');
        }
      } else if (status === 'approved') {
        // Allow access to main app
        if (inAuthGroup || inOnboarding || inPendingVerification || inLanding || !segments[0]) {
          console.log('Redirecting to /(tabs)');
          router.replace('/(tabs)');
        }
      }
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
        <Stack.Screen name="reset-password" />
        <Stack.Screen name="onboarding" />
        <Stack.Screen name="pending-verification" />
        <Stack.Screen name="support" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="order/[id]" />
        <Stack.Screen name="+not-found" />
      </Stack>
      <StatusBar style="auto" />
    </>
  );
}

export default function RootLayout() {
  console.log('[RootLayout] Mounting...');
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
    <ErrorBoundary>
      <AuthProvider>
        <BusinessProvider>
          <RootLayoutNav />
        </BusinessProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}
