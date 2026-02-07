import { Tabs } from 'expo-router';
import { Hop as Home, Inbox, Plus, ChartBar as BarChart3, Settings, ShieldCheck } from 'lucide-react-native';
import { View, useWindowDimensions, Platform } from 'react-native';
import { SideBar } from '@/components/SideBar';
import { Colors } from '@/constants/Colors';
import { Layout } from '@/constants/Layout';
import { useEffect, useState } from 'react';
import { profileApi, adminApi } from '@/lib/api';

export default function TabLayout() {
  const { width } = useWindowDimensions();
  const isDesktop = width >= 768;
  const [isAdmin, setIsAdmin] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    checkAdminStatus();
  }, []);

  const checkAdminStatus = async () => {
    try {
      const adminStatus = await profileApi.isAdmin();
      setIsAdmin(adminStatus);

      if (adminStatus) {
        // Load pending count
        const businesses = await adminApi.listPendingBusinesses();
        setPendingCount(businesses.length);
      }
    } catch (error) {
      console.error('Error checking admin status:', error);
    }
  };

  return (
    <View style={{ flex: 1, flexDirection: 'row', backgroundColor: Colors.background }}>
      {isDesktop && <SideBar />}
      <View style={{ flex: 1 }}>
        <Tabs
          screenOptions={{
            headerShown: false,
            // Hide bottom tab bar on desktop
            tabBarStyle: {
              display: isDesktop ? 'none' : 'flex',
              backgroundColor: Colors.background,
              borderTopWidth: 1,
              borderTopColor: Colors.border,
              paddingTop: Layout.spacing.sm,
              paddingBottom: Platform.OS === 'ios' ? Layout.spacing.lg : Layout.spacing.sm,
              height: Platform.OS === 'ios' ? 88 : 88,
              elevation: 0, // Flat style for Android
              shadowOpacity: 0, // Flat style for iOS
            },
            tabBarActiveTintColor: Colors.primary,
            tabBarInactiveTintColor: Colors.text.secondary,
            tabBarLabelStyle: {
              fontSize: 12,
              fontWeight: '500',
              marginTop: 4,
            },
          }}>
          <Tabs.Screen
            name="index"
            options={{
              title: 'Inbox',
              tabBarIcon: ({ size, color }) => (
                <Inbox size={size} color={color} />
              ),
            }}
          />
          <Tabs.Screen
            name="create-order"
            options={{
              title: 'New Order',
              tabBarIcon: ({ size, color }) => (
                <Plus size={size} color={color} />
              ),
            }}
          />
          <Tabs.Screen
            name="reports"
            options={{
              title: 'Reports',
              tabBarIcon: ({ size, color }) => (
                <BarChart3 size={size} color={color} />
              ),
            }}
          />
          <Tabs.Screen
            name="admin-approvals"
            options={{
              href: null, // Hide from tab bar
              title: 'Approvals',
            }}
          />
          <Tabs.Screen
            name="settings"
            options={{
              title: 'Settings',
              tabBarIcon: ({ size, color }) => (
                <Settings size={size} color={color} />
              ),
            }}
          />
        </Tabs>
      </View>
    </View>
  );
}