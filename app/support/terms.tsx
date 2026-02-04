import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { router } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import { Colors } from '@/constants/Colors';
import { Layout } from '@/constants/Layout';

export default function TermsPage() {
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
                    <Text style={styles.title}>Terms of Service</Text>
                    <Text style={styles.lastUpdated}>Last updated: February 4, 2026</Text>

                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Agreement to Terms</Text>
                        <Text style={styles.paragraph}>
                            By accessing or using Mapnshop, you agree to be bound by these Terms of Service. If you disagree with any part of these terms, you may not access the service.
                        </Text>
                    </View>

                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Service Description</Text>
                        <Text style={styles.paragraph}>
                            Mapnshop provides an order management system for local businesses. The service allows you to consolidate orders from multiple sources into a single operational inbox.
                        </Text>
                    </View>

                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Early Access Program</Text>
                        <Text style={styles.paragraph}>
                            Mapnshop is currently in pilot phase. By participating in early access, you acknowledge that:
                        </Text>
                        <Text style={styles.bulletPoint}>• The service may contain bugs or incomplete features</Text>
                        <Text style={styles.bulletPoint}>• Features may change based on feedback</Text>
                        <Text style={styles.bulletPoint}>• We may contact you for feedback and testing</Text>
                        <Text style={styles.bulletPoint}>• Service availability is not guaranteed during pilot phase</Text>
                    </View>

                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Your Responsibilities</Text>
                        <Text style={styles.paragraph}>
                            You are responsible for:
                        </Text>
                        <Text style={styles.bulletPoint}>• Maintaining the security of your account credentials</Text>
                        <Text style={styles.bulletPoint}>• All activity that occurs under your account</Text>
                        <Text style={styles.bulletPoint}>• Ensuring accuracy of data you input</Text>
                        <Text style={styles.bulletPoint}>• Complying with applicable laws and regulations</Text>
                    </View>

                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Data Ownership</Text>
                        <Text style={styles.paragraph}>
                            You retain all rights to the data you input into Mapnshop. We do not claim ownership of your business data, customer information, or order details.
                        </Text>
                    </View>

                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Service Modifications</Text>
                        <Text style={styles.paragraph}>
                            We reserve the right to modify or discontinue the service at any time. During the pilot phase, we may make changes without prior notice to improve the product.
                        </Text>
                    </View>

                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Limitation of Liability</Text>
                        <Text style={styles.paragraph}>
                            Mapnshop is provided "as is" during the pilot phase. We are not liable for any damages arising from your use of the service, including but not limited to lost orders, data loss, or business interruption.
                        </Text>
                    </View>

                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Termination</Text>
                        <Text style={styles.paragraph}>
                            Either party may terminate this agreement at any time. Upon termination, you may export your data, and we will delete your account and associated data upon request.
                        </Text>
                    </View>

                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Contact</Text>
                        <Text style={styles.paragraph}>
                            Questions about these Terms? Contact us at legal@mapnshop.com
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
