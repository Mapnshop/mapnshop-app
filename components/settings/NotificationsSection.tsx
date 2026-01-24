import React, { useState } from 'react';
import { View, Text, Switch, StyleSheet } from 'react-native';
import { Bell } from 'lucide-react-native';
import { SettingsSection } from './SettingsSection';

export const NotificationsSection = () => {
    const [notifications, setNotifications] = useState({
        newOrders: true,
        statusChanges: true,
        dailySummary: false,
    });

    const toggle = (key: keyof typeof notifications) => {
        setNotifications(prev => ({ ...prev, [key]: !prev[key] }));
        // Future: Persist to AsyncStorage or User Profile
    };

    return (
        <SettingsSection
            title="Notifications"
            icon={Bell}
        >
            <View style={styles.row}>
                <Text style={styles.label}>New Order Alerts</Text>
                <Switch
                    value={notifications.newOrders}
                    onValueChange={() => toggle('newOrders')}
                    trackColor={{ false: '#D1D5DB', true: '#BFDBFE' }}
                    thumbColor={notifications.newOrders ? '#3B82F6' : '#F3F4F6'}
                />
            </View>

            <View style={styles.divider} />

            <View style={styles.row}>
                <Text style={styles.label}>Order Status Updates</Text>
                <Switch
                    value={notifications.statusChanges}
                    onValueChange={() => toggle('statusChanges')}
                    trackColor={{ false: '#D1D5DB', true: '#BFDBFE' }}
                    thumbColor={notifications.statusChanges ? '#3B82F6' : '#F3F4F6'}
                />
            </View>

            <View style={styles.divider} />

            <View style={styles.row}>
                <Text style={styles.label}>Daily Summary Reminder</Text>
                <Switch
                    value={notifications.dailySummary}
                    onValueChange={() => toggle('dailySummary')}
                    trackColor={{ false: '#D1D5DB', true: '#BFDBFE' }}
                    thumbColor={notifications.dailySummary ? '#3B82F6' : '#F3F4F6'}
                />
            </View>
        </SettingsSection>
    );
};

const styles = StyleSheet.create({
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 8,
    },
    label: {
        fontSize: 16,
        color: '#111827',
    },
    divider: {
        height: 1,
        backgroundColor: '#E5E7EB',
        marginVertical: 4,
    },
});
