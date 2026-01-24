import { Tabs } from 'expo-router';
import { Hop as Home, Inbox, Plus, ChartBar as BarChart3, Settings } from 'lucide-react-native';
import { View, useWindowDimensions, Platform } from 'react-native';
import { SideBar } from '@/components/SideBar';

export default function TabLayout() {
  const { width } = useWindowDimensions();
  const isDesktop = width >= 768;

  return (
    <View style={{ flex: 1, flexDirection: 'row' }}>
      {isDesktop && <SideBar />}
      <View style={{ flex: 1 }}>
        <Tabs
          screenOptions={{
            headerShown: false,
            // Hide bottom tab bar on desktop
            tabBarStyle: {
              display: isDesktop ? 'none' : 'flex',
              backgroundColor: '#FFFFFF',
              borderTopWidth: 1,
              borderTopColor: '#E5E7EB',
              paddingTop: 8,
              paddingBottom: 8,
              height: 80,
            },
            tabBarActiveTintColor: '#3B82F6',
            tabBarInactiveTintColor: '#6B7280',
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