import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform, useWindowDimensions, Image } from 'react-native';
import { router } from 'expo-router';
import { Package, TrendingUp, Users, BarChart3, CheckCircle, ArrowRight, Zap, Shield, Clock } from 'lucide-react-native';
import { Colors } from '@/constants/Colors';
import { Layout } from '@/constants/Layout';
import { LinearGradient } from 'expo-linear-gradient';

export default function LandingPage() {
    const { width } = useWindowDimensions();
    const isDesktop = width >= 1024;
    const isTablet = width >= 768 && width < 1024;

    const features = [
        {
            icon: Package,
            title: 'Order Management',
            description: 'Track and manage all your orders in one place with real-time updates.',
            gradient: ['#3B82F6', '#2563EB']
        },
        {
            icon: Zap,
            title: 'Real-Time Sync',
            description: 'Instant synchronization across web and mobile. Changes reflect everywhere immediately.',
            gradient: ['#8B5CF6', '#7C3AED']
        },
        {
            icon: Users,
            title: 'Customer Management',
            description: 'Build lasting relationships with customer profiles and complete order history.',
            gradient: ['#EC4899', '#DB2777']
        },
        {
            icon: BarChart3,
            title: 'Analytics & Insights',
            description: 'Make data-driven decisions with comprehensive business analytics.',
            gradient: ['#10B981', '#059669']
        }
    ];

    const benefits = [
        { icon: Clock, text: 'Save 10+ hours per week' },
        { icon: Shield, text: '99.9% uptime guarantee' },
        { icon: Zap, text: 'Lightning-fast performance' },
    ];

    return (
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
            {/* Hero Section with Gradient */}
            <LinearGradient
                colors={['#3B82F6', '#2563EB', '#1D4ED8'] as const}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={[styles.hero, isDesktop && styles.heroDesktop]}
            >
                <View style={[styles.heroContent, isDesktop && styles.heroContentDesktop]}>
                    {/* Logo */}
                    <Image
                        source={require('@/assets/images/mapnshops_logo.png')}
                        style={styles.logo}
                        resizeMode="contain"
                    />

                    <Text style={[styles.heroTitle, isDesktop && styles.heroTitleDesktop]}>
                        Streamline Your{'\n'}Delivery Business
                    </Text>
                    <Text style={[styles.heroSubtitle, isDesktop && styles.heroSubtitleDesktop]}>
                        Manage orders, track deliveries, and grow your business with Mapnshop's all-in-one platform. Real-time sync across all devices.
                    </Text>

                    {/* Benefits Row */}
                    <View style={styles.benefitsRow}>
                        {benefits.map((benefit, index) => (
                            <View key={index} style={styles.benefitItem}>
                                <benefit.icon size={16} color="rgba(255,255,255,0.9)" />
                                <Text style={styles.benefitText}>{benefit.text}</Text>
                            </View>
                        ))}
                    </View>

                    <TouchableOpacity
                        style={styles.primaryButton}
                        onPress={() => router.push('/auth')}
                    >
                        <Text style={styles.primaryButtonText}>Get Started Free</Text>
                        <ArrowRight size={20} color={Colors.primary} />
                    </TouchableOpacity>

                    <Text style={styles.heroFootnote}>No credit card required • Free forever</Text>
                </View>
            </LinearGradient>

            {/* Features Section */}
            <View style={styles.featuresSection}>
                <Text style={styles.sectionTitle}>Everything You Need to Succeed</Text>
                <Text style={styles.sectionSubtitle}>
                    Powerful features designed for modern delivery businesses
                </Text>

                <View style={[styles.featuresGrid, isDesktop && styles.featuresGridDesktop]}>
                    {features.map((feature, index) => (
                        <View key={index} style={[styles.featureCard, isDesktop && styles.featureCardDesktop]}>
                            <LinearGradient
                                colors={feature.gradient as any}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 1 }}
                                style={styles.featureIconContainer}
                            >
                                <feature.icon size={28} color="#FFFFFF" />
                            </LinearGradient>
                            <Text style={styles.featureTitle}>{feature.title}</Text>
                            <Text style={styles.featureDescription}>{feature.description}</Text>
                        </View>
                    ))}
                </View>
            </View>

            {/* Stats Section */}
            <LinearGradient
                colors={['#F9FAFB', '#F3F4F6'] as const}
                style={styles.statsSection}
            >
                <View style={[styles.statsGrid, isDesktop && styles.statsGridDesktop]}>
                    <View style={styles.statCard}>
                        <Text style={styles.statNumber}>500+</Text>
                        <Text style={styles.statLabel}>Active Businesses</Text>
                    </View>
                    <View style={styles.statCard}>
                        <Text style={styles.statNumber}>50K+</Text>
                        <Text style={styles.statLabel}>Orders Processed</Text>
                    </View>
                    <View style={styles.statCard}>
                        <Text style={styles.statNumber}>99.9%</Text>
                        <Text style={styles.statLabel}>Uptime</Text>
                    </View>
                </View>
            </LinearGradient>

            {/* CTA Section */}
            <LinearGradient
                colors={['#3B82F6', '#2563EB'] as const}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.ctaSection}
            >
                <View style={styles.ctaContent}>
                    <Text style={styles.ctaTitle}>Ready to Transform Your Business?</Text>
                    <Text style={styles.ctaSubtitle}>
                        Join hundreds of businesses already using Mapnshop
                    </Text>
                    <TouchableOpacity
                        style={styles.ctaButton}
                        onPress={() => router.push('/auth')}
                    >
                        <Text style={styles.ctaButtonText}>Start Free Today</Text>
                        <ArrowRight size={20} color={Colors.primary} />
                    </TouchableOpacity>
                </View>
            </LinearGradient>

            {/* Footer */}
            <View style={styles.footer}>
                <Text style={styles.footerText}>© 2026 Mapnshop. All rights reserved.</Text>
                <View style={styles.footerLinks}>
                    <TouchableOpacity onPress={() => router.push('/support/privacy')}>
                        <Text style={styles.footerLink}>Privacy</Text>
                    </TouchableOpacity>
                    <Text style={styles.footerDivider}>•</Text>
                    <TouchableOpacity onPress={() => router.push('/support/terms')}>
                        <Text style={styles.footerLink}>Terms</Text>
                    </TouchableOpacity>
                    <Text style={styles.footerDivider}>•</Text>
                    <TouchableOpacity onPress={() => router.push('/support/contact')}>
                        <Text style={styles.footerLink}>Contact</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
    },
    hero: {
        paddingTop: Platform.OS === 'web' ? 80 : 60,
        paddingBottom: 80,
        paddingHorizontal: Layout.spacing.lg,
    },
    heroDesktop: {
        paddingTop: 100,
        paddingBottom: 100,
    },
    heroContent: {
        maxWidth: 800,
        alignSelf: 'center',
        width: '100%',
        alignItems: 'center',
    },
    heroContentDesktop: {
        maxWidth: 900,
    },
    logo: {
        width: 120,
        height: 120,
        marginBottom: Layout.spacing.lg,
    },
    heroTitle: {
        fontSize: 42,
        fontWeight: '900',
        color: '#FFFFFF',
        marginBottom: Layout.spacing.md,
        letterSpacing: -1,
        lineHeight: 50,
        textAlign: 'center',
    },
    heroTitleDesktop: {
        fontSize: 64,
        lineHeight: 72,
    },
    heroSubtitle: {
        fontSize: 18,
        color: 'rgba(255,255,255,0.95)',
        marginBottom: Layout.spacing.xl,
        lineHeight: 28,
        textAlign: 'center',
    },
    heroSubtitleDesktop: {
        fontSize: 20,
        lineHeight: 32,
    },
    benefitsRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        gap: Layout.spacing.md,
        marginBottom: Layout.spacing.xl,
    },
    benefitItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        backgroundColor: 'rgba(255,255,255,0.15)',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: Layout.borderRadius.md,
    },
    benefitText: {
        fontSize: 13,
        color: 'rgba(255,255,255,0.95)',
        fontWeight: '600',
    },
    primaryButton: {
        backgroundColor: '#FFFFFF',
        paddingVertical: 18,
        paddingHorizontal: 36,
        borderRadius: Layout.borderRadius.xl,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 16,
        elevation: 8,
    },
    primaryButtonText: {
        fontSize: 18,
        fontWeight: '700',
        color: Colors.primary,
    },
    heroFootnote: {
        fontSize: 14,
        color: 'rgba(255,255,255,0.8)',
        marginTop: Layout.spacing.md,
        textAlign: 'center',
    },
    featuresSection: {
        paddingVertical: 80,
        paddingHorizontal: Layout.spacing.lg,
        backgroundColor: Colors.background,
    },
    sectionTitle: {
        fontSize: 36,
        fontWeight: '800',
        color: Colors.text.primary,
        textAlign: 'center',
        marginBottom: Layout.spacing.sm,
        letterSpacing: -0.5,
    },
    sectionSubtitle: {
        fontSize: 18,
        color: Colors.text.secondary,
        textAlign: 'center',
        marginBottom: Layout.spacing.xl * 2,
    },
    featuresGrid: {
        maxWidth: 1200,
        alignSelf: 'center',
        width: '100%',
        gap: Layout.spacing.lg,
    },
    featuresGridDesktop: {
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    featureCard: {
        backgroundColor: Colors.surface,
        padding: Layout.spacing.xl,
        borderRadius: Layout.borderRadius.xl,
        borderWidth: 1,
        borderColor: Colors.border,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
        elevation: 3,
    },
    featureCardDesktop: {
        width: 'calc(50% - 12px)' as any,
    },
    featureIconContainer: {
        width: 64,
        height: 64,
        borderRadius: Layout.borderRadius.lg,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: Layout.spacing.md,
    },
    featureTitle: {
        fontSize: 22,
        fontWeight: '700',
        color: Colors.text.primary,
        marginBottom: Layout.spacing.sm,
    },
    featureDescription: {
        fontSize: 16,
        color: Colors.text.secondary,
        lineHeight: 24,
    },
    statsSection: {
        paddingVertical: 60,
        paddingHorizontal: Layout.spacing.lg,
    },
    statsGrid: {
        maxWidth: 1000,
        alignSelf: 'center',
        width: '100%',
        gap: Layout.spacing.lg,
    },
    statsGridDesktop: {
        flexDirection: 'row',
        justifyContent: 'space-around',
    },
    statCard: {
        alignItems: 'center',
        padding: Layout.spacing.lg,
    },
    statNumber: {
        fontSize: 48,
        fontWeight: '900',
        color: Colors.primary,
        marginBottom: Layout.spacing.xs,
    },
    statLabel: {
        fontSize: 16,
        color: Colors.text.secondary,
        fontWeight: '600',
    },
    ctaSection: {
        paddingVertical: 80,
        paddingHorizontal: Layout.spacing.lg,
    },
    ctaContent: {
        maxWidth: 800,
        alignSelf: 'center',
        alignItems: 'center',
    },
    ctaTitle: {
        fontSize: 36,
        fontWeight: '800',
        color: '#FFFFFF',
        textAlign: 'center',
        marginBottom: Layout.spacing.sm,
        letterSpacing: -0.5,
    },
    ctaSubtitle: {
        fontSize: 18,
        color: 'rgba(255,255,255,0.95)',
        textAlign: 'center',
        marginBottom: Layout.spacing.xl,
    },
    ctaButton: {
        backgroundColor: '#FFFFFF',
        paddingVertical: 18,
        paddingHorizontal: 36,
        borderRadius: Layout.borderRadius.xl,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 16,
        elevation: 8,
    },
    ctaButtonText: {
        fontSize: 18,
        fontWeight: '700',
        color: Colors.primary,
    },
    footer: {
        backgroundColor: Colors.surface,
        paddingVertical: Layout.spacing.xl,
        paddingHorizontal: Layout.spacing.lg,
        alignItems: 'center',
        borderTopWidth: 1,
        borderTopColor: Colors.border,
    },
    footerText: {
        fontSize: 14,
        color: Colors.text.secondary,
        marginBottom: Layout.spacing.sm,
    },
    footerLinks: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Layout.spacing.sm,
    },
    footerLink: {
        fontSize: 14,
        color: Colors.text.secondary,
        textDecorationLine: 'underline',
    },
    footerDivider: {
        fontSize: 14,
        color: Colors.text.placeholder,
    },
});
