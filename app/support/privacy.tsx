import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';

export default function PrivacyScreen() {
    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.content}>
            <Text style={styles.title}>Privacy Policy</Text>
            <Text style={styles.date}>Last updated: January 2026</Text>

            <Text style={styles.sectionTitle}>1. Information We Collect</Text>
            <Text style={styles.paragraph}>
                We collect information you provide directly to us, such as when you create an account, create a business profile, or communicate with us.
            </Text>

            <Text style={styles.sectionTitle}>2. How We Use Your Information</Text>
            <Text style={styles.paragraph}>
                We use the information we collect to provide, maintain, and improve our services, including to process transactions, send you related information, and respond to your comments.
            </Text>

            <Text style={styles.sectionTitle}>3. Data Security</Text>
            <Text style={styles.paragraph}>
                We implement appropriate technical and organizational measures to protect your personal data against unauthorized or unlawful processing.
            </Text>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    content: {
        padding: 24,
        maxWidth: 800,
        alignSelf: 'center',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#111827',
        marginBottom: 8,
    },
    date: {
        fontSize: 14,
        color: '#6B7280',
        marginBottom: 32,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#111827',
        marginTop: 24,
        marginBottom: 12,
    },
    paragraph: {
        fontSize: 16,
        color: '#374151',
        lineHeight: 24,
        marginBottom: 16,
    },
});
