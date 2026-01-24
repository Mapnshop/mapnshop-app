import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { HelpCircle, ChevronRight, Mail } from 'lucide-react-native';
import { SettingsSection } from './SettingsSection';
import { useRouter } from 'expo-router';

export const HelpSupportSection = () => {
    const router = useRouter();

    const handleContact = () => {
        router.push('/support/contact');
    };

    const handleDocs = () => {
        router.push('/support' as any); // Index page serves as docs/faq hub
    };

    return (
        <SettingsSection
            title="Help & Support"
            icon={HelpCircle}
        >
            <TouchableOpacity style={styles.row} onPress={handleContact}>
                <View style={styles.rowContent}>
                    <Mail size={18} color="#4B5563" />
                    <Text style={styles.linkText}>Contact Support</Text>
                </View>
                <ChevronRight size={16} color="#9CA3AF" />
            </TouchableOpacity>

            <View style={styles.divider} />

            <TouchableOpacity style={styles.row} onPress={handleDocs}>
                <View style={styles.rowContent}>
                    <HelpCircle size={18} color="#4B5563" />
                    <Text style={styles.linkText}>Documentation & FAQ</Text>
                </View>
                <ChevronRight size={16} color="#9CA3AF" />
            </TouchableOpacity>

            <View style={styles.footer}>
                <Text style={styles.versionText}>Version 1.0.0 (Build 2026.01.21)</Text>
            </View>
        </SettingsSection>
    );
};

const styles = StyleSheet.create({
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12,
    },
    rowContent: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    linkText: {
        fontSize: 16,
        color: '#111827',
    },
    divider: {
        height: 1,
        backgroundColor: '#E5E7EB',
    },
    footer: {
        marginTop: 16,
        alignItems: 'center',
    },
    versionText: {
        fontSize: 12,
        color: '#9CA3AF',
    },
});
