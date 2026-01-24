import { useEffect } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { BusinessProvider, useBusiness } from '@/contexts/BusinessContext';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import { View, ActivityIndicator } from 'react-native';
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

    console.log('RootLayoutNav check:', {
      user: !!user,
      business: !!business,
      segments: segments,
      inAuthGroup,
      inOnboarding
    });

    if (!user && !inAuthGroup) {
      console.log('Redirecting to /auth');
      router.replace('/auth');
    } else if (user && !business && !inOnboarding) {
      console.log('Redirecting to /onboarding');
      router.replace('/onboarding');
    } else if (user && business && (inAuthGroup || inOnboarding || !segments[0])) {
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
