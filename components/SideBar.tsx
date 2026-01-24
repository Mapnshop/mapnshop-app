import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, useWindowDimensions, Platform, Pressable } from 'react-native';
import { useRouter, usePathname } from 'expo-router';
import { Hop as Home, Inbox, Plus, ChartBar as BarChart3, Settings, LogOut } from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';
import { useBusiness } from '@/contexts/BusinessContext';

export function SideBar() {
    const router = useRouter();
    const pathname = usePathname(); // e.g. "/(tabs)/" or "/"
    const { signOut } = useAuth();
    const { business } = useBusiness();
    const { width } = useWindowDimensions();
    const [hoveredItem, setHoveredItem] = useState<string | null>(null);

    // If mobile, don't render (should be handled by parent, but safety check)
    if (width < 768) return null;

    const menuItems = [
        { name: 'Inbox', icon: Inbox, path: '/(tabs)/', regex: /^\/(\(tabs\)\/?)?$/ },
        // { name: 'Home', icon: Home, path: '/(tabs)/home', regex: /home/ }, // Example if we split them
        { name: 'New Order', icon: Plus, path: '/(tabs)/create-order', regex: /create-order/ },
        { name: 'Reports', icon: BarChart3, path: '/(tabs)/reports', regex: /reports/ },
        { name: 'Settings', icon: Settings, path: '/(tabs)/settings', regex: /settings/ },
    ];

    const handlePress = (path: string) => {
        router.push(path as any);
    };

    return (
        <View style={styles.container}>
            {/* Brand / Logo Area */}
            <View style={styles.header}>
                <View style={styles.logoBadge}>
                    <Text style={styles.logoText}>{business?.name?.substring(0, 2).toUpperCase() || 'BZ'}</Text>
                </View>
                <Text style={styles.brandName} numberOfLines={1}>{business?.name || 'Business OS'}</Text>
            </View>

            {/* Navigation Items */}
            <View style={styles.nav}>
                {menuItems.map((item) => {
                    // Robust active check
                    const isActive = item.regex.test(pathname);
                    const Icon = item.icon;

                    return (
                        <Pressable
                            key={item.name}
                            style={[
                                styles.navItem,
                                isActive && styles.navItemActive,
                                hoveredItem === item.name && !isActive && styles.navItemHovered
                            ]}
                            onPress={() => handlePress(item.path)}
                            onHoverIn={() => setHoveredItem(item.name)}
                            onHoverOut={() => setHoveredItem(null)}
                        >
                            <Icon size={20} color={isActive ? '#3B82F6' : '#6B7280'} />
                            <Text style={[styles.navText, isActive && styles.navTextActive]}>
                                {item.name}
                            </Text>
                        </Pressable>
                    );
                })}
            </View>

            {/* Footer / User Profile */}
            <View style={styles.footer}>
                <TouchableOpacity style={styles.logoutButton} onPress={signOut}>
                    <LogOut size={20} color="#EF4444" />
                    <Text style={styles.logoutText}>Sign Out</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        width: 250,
        height: '100%',
        backgroundColor: '#FFFFFF',
        borderRightWidth: 1,
        borderRightColor: '#E5E7EB',
        paddingVertical: 24,
        paddingHorizontal: 16,
        flexDirection: 'column',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 40,
        paddingHorizontal: 8,
    },
    logoBadge: {
        width: 36,
        height: 36,
        borderRadius: 8,
        backgroundColor: '#3B82F6',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    logoText: {
        color: '#FFF',
        fontWeight: 'bold',
        fontSize: 16,
    },
    brandName: {
        fontSize: 18,
        fontWeight: '700',
        color: '#111827',
        flex: 1,
    },
    nav: {
        flex: 1,
        gap: 8,
    },
    navItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 12,
        borderRadius: 8,
        gap: 12,
    },
    navItemActive: {
        backgroundColor: '#EFF6FF',
    },
    navItemHovered: {
        backgroundColor: '#F9FAFB',
    },
    navText: {
        fontSize: 15,
        fontWeight: '500',
        color: '#6B7280',
    },
    navTextActive: {
        color: '#3B82F6',
        fontWeight: '600',
    },
    footer: {
        borderTopWidth: 1,
        borderTopColor: '#F3F4F6',
        paddingTop: 16,
    },
    logoutButton: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        gap: 12,
        borderRadius: 8,
    },
    logoutText: {
        color: '#EF4444',
        fontSize: 15,
        fontWeight: '500',
    },
});
