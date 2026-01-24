import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';

export default function TermsScreen() {
    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.content}>
            <Text style={styles.title}>Terms of Service</Text>
            <Text style={styles.date}>Last updated: January 2026</Text>

            <Text style={styles.sectionTitle}>1. Acceptance of Terms</Text>
            <Text style={styles.paragraph}>
                By accessing and using this application, you accept and agree to be bound by the terms and provision of this agreement.
            </Text>

            <Text style={styles.sectionTitle}>2. Use License</Text>
            <Text style={styles.paragraph}>
                Permission is granted to temporarily download one copy of the materials (information or software) on Mapnshop's website for personal, non-commercial transitory viewing only.
            </Text>

            <Text style={styles.sectionTitle}>3. Business Responsibilities</Text>
            <Text style={styles.paragraph}>
                As a business partner using our platform, you agree to fulfill orders accurately and promptly. Repeated cancellations or poor service may result in account suspension.
            </Text>

            {/* Add more filler or real content as needed */}
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
