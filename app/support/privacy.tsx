import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { router } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import { Colors } from '@/constants/Colors';
import { Layout } from '@/constants/Layout';

export default function PrivacyPage() {
    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <View style={styles.headerContent}>
                    <TouchableOpacity
                        style={styles.backButton}
                        onPress={() => router.back()}
                    >
                        <ArrowLeft size={20} color={Colors.text.secondary} />
                        <Text style={styles.backText}>Back</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.logo}
                        onPress={() => router.push('/landing')}
                    >
                        <Image
                            source={require('@/assets/images/mapnshop_logo.png')}
                            style={styles.logoImage}
                            resizeMode="contain"
                        />
                        <Text style={styles.logoText}>Mapnshop</Text>
                    </TouchableOpacity>
                </View>
            </View>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                <View style={styles.contentInner}>
                    <Text style={styles.title}>Privacy Policy</Text>
                    <Text style={styles.lastUpdated}>Last updated: February 4, 2026</Text>

                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Overview</Text>
                        <Text style={styles.paragraph}>
                            Mapnshop ("we", "our", or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, and safeguard your information when you use our service.
                        </Text>
                    </View>

                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Information We Collect</Text>
                        <Text style={styles.paragraph}>
                            We collect information that you provide directly to us, including:
                        </Text>
                        <Text style={styles.bulletPoint}>• Business name and contact information</Text>
                        <Text style={styles.bulletPoint}>• Account credentials (email and password)</Text>
                        <Text style={styles.bulletPoint}>• Order data that you input into the system</Text>
                        <Text style={styles.bulletPoint}>• Customer information you manage through Mapnshop</Text>
                    </View>

                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>How We Use Your Information</Text>
                        <Text style={styles.paragraph}>
                            We use the information we collect to:
                        </Text>
                        <Text style={styles.bulletPoint}>• Provide and maintain our service</Text>
                        <Text style={styles.bulletPoint}>• Process and manage your orders</Text>
                        <Text style={styles.bulletPoint}>• Send you technical notices and support messages</Text>
                        <Text style={styles.bulletPoint}>• Improve and develop our service</Text>
                    </View>

                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Data Security</Text>
                        <Text style={styles.paragraph}>
                            We implement appropriate technical and organizational measures to protect your data. All data is encrypted in transit and at rest. We use industry-standard security practices to safeguard your information.
                        </Text>
                    </View>

                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Data Retention</Text>
                        <Text style={styles.paragraph}>
                            We retain your information for as long as your account is active or as needed to provide you services. You may request deletion of your data at any time by contacting us.
                        </Text>
                    </View>

                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Your Rights</Text>
                        <Text style={styles.paragraph}>
                            You have the right to:
                        </Text>
                        <Text style={styles.bulletPoint}>• Access your personal data</Text>
                        <Text style={styles.bulletPoint}>• Correct inaccurate data</Text>
                        <Text style={styles.bulletPoint}>• Request deletion of your data</Text>
                        <Text style={styles.bulletPoint}>• Export your data</Text>
                    </View>

                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Contact Us</Text>
                        <Text style={styles.paragraph}>
                            If you have questions about this Privacy Policy, please contact us at privacy@mapnshop.com
                        </Text>
                    </View>
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
    },
    header: {
        backgroundColor: '#FFFFFF',
        borderBottomWidth: 1,
        borderBottomColor: Colors.border,
        paddingVertical: Layout.spacing.md,
        paddingHorizontal: Layout.spacing.lg,
    },
    headerContent: {
        maxWidth: 800,
        alignSelf: 'center',
        width: '100%',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    backButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    backText: {
        fontSize: 15,
        color: Colors.text.secondary,
    },
    logo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    logoImage: {
        width: 24,
        height: 24,
    },
    logoText: {
        fontSize: 16,
        fontWeight: '600',
        color: Colors.text.primary,
    },
    content: {
        flex: 1,
    },
    contentInner: {
        maxWidth: 800,
        alignSelf: 'center',
        width: '100%',
        paddingHorizontal: Layout.spacing.lg,
        paddingVertical: Layout.spacing.xl * 2,
    },
    title: {
        fontSize: 36,
        fontWeight: '700',
        color: Colors.text.primary,
        marginBottom: Layout.spacing.sm,
    },
    lastUpdated: {
        fontSize: 14,
        color: Colors.text.placeholder,
        marginBottom: Layout.spacing.xl * 2,
    },
    section: {
        marginBottom: Layout.spacing.xl * 1.5,
    },
    sectionTitle: {
        fontSize: 22,
        fontWeight: '600',
        color: Colors.text.primary,
        marginBottom: Layout.spacing.md,
    },
    paragraph: {
        fontSize: 16,
        color: Colors.text.secondary,
        lineHeight: 26,
        marginBottom: Layout.spacing.sm,
    },
    bulletPoint: {
        fontSize: 16,
        color: Colors.text.secondary,
        lineHeight: 26,
        marginLeft: Layout.spacing.md,
    },
});
