import { useState, useEffect, useRef } from 'react';
import { Platform } from 'react-native';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import { useRouter } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

// Only set up notification handler if NOT in Expo Go (StoreClient)
const isExpoGo = Constants.executionEnvironment === 'storeClient' || Constants.appOwnership === 'expo';

if (!isExpoGo) {
    Notifications.setNotificationHandler({
        handleNotification: async () => ({
            shouldShowAlert: true,
            shouldPlaySound: true,
            shouldSetBadge: false,
            shouldShowBanner: true,
            shouldShowList: true
        }),
    });
}

async function registerForPushNotificationsAsync() {
    // Skip if running in Expo Go (to avoid errors in SDK 53+)
    if (Constants.appOwnership === 'expo' || Constants.executionEnvironment === 'storeClient') {
        console.log('Skipping Push Notification setup in Expo Go');
        return;
    }

    let token;

    if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
            name: 'default',
            importance: Notifications.AndroidImportance.MAX,
            vibrationPattern: [0, 250, 250, 250],
            lightColor: '#FF231F7C',
        });
    }

    if (Device.isDevice) {
        const { status: existingStatus } = await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;
        if (existingStatus !== 'granted') {
            const { status } = await Notifications.requestPermissionsAsync();
            finalStatus = status;
        }
        if (finalStatus !== 'granted') {
            console.log('Failed to get push token for push notification!');
            return;
        }

        // Get the token
        try {
            const projectId = Constants?.expoConfig?.extra?.eas?.projectId ?? Constants?.easConfig?.projectId;
            if (!projectId) {
                // Fallback for bare workflow or missing config, though unlikely in managed expo
                token = (await Notifications.getExpoPushTokenAsync()).data;
            } else {
                token = (await Notifications.getExpoPushTokenAsync({ projectId })).data;
            }
        } catch (e) {
            console.error("Error getting push token", e);
            token = (await Notifications.getExpoPushTokenAsync()).data;
        }

    } else {
        console.log('Must use physical device for Push Notifications');
    }

    return token;
}

export function usePushNotifications() {
    const [expoPushToken, setExpoPushToken] = useState<string | undefined>();
    const [notification, setNotification] = useState<Notifications.Notification | undefined>();
    const notificationListener = useRef<Notifications.Subscription>(undefined);
    const responseListener = useRef<Notifications.Subscription>(undefined);
    const { user } = useAuth();
    const router = useRouter();

    useEffect(() => {
        // Skip entirely if in Expo Go to avoid SDK 53+ errors
        if (isExpoGo) {
            console.log('Skipping Push Notification setup in Expo Go');
            return;
        }

        registerForPushNotificationsAsync().then(token => setExpoPushToken(token));

        notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
            setNotification(notification);
        });

        responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
            console.log('Notification Response:', response);
            // Deep Linking Logic
            const data = response.notification.request.content.data;
            // Assuming we will send { orderId: '...' } in the future
            if (data?.orderId) {
                router.push(`/order/${data.orderId}`);
            } else if (data?.businessId) {
                // If just generic business notification, maybe go to inbox
                router.push('/');
            }
        });

        return () => {
            if (notificationListener.current) notificationListener.current.remove();
            if (responseListener.current) responseListener.current.remove();
        };
    }, []);

    // Sync Token to Supabase
    useEffect(() => {
        // Skip if in Expo Go
        if (isExpoGo) return;

        if (user && expoPushToken) {
            const saveToken = async () => {
                // 1. Save Token
                const { error } = await supabase
                    .from('user_push_tokens')
                    .upsert({ user_id: user.id, token: expoPushToken, updated_at: new Date() }, { onConflict: 'user_id,token' });

                if (error) console.error('Error saving push token:', error);

                // 2. Link User to Business Memberships (if invited by email)
                const { error: linkError } = await supabase
                    .from('business_members')
                    .update({ user_id: user.id })
                    .eq('email', user.email)
                    .is('user_id', null); // Only update if not already linked (or just update anyway to be safe)

                if (linkError) console.error('Error linking user to business:', linkError);
            };

            saveToken();
        }
    }, [user, expoPushToken]);

    return {
        expoPushToken,
        notification,
    };
}
