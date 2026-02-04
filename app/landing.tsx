import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform, useWindowDimensions } from 'react-native';
import { router } from 'expo-router';
import { Package, TrendingUp, Users, BarChart3, CheckCircle, ArrowRight } from 'lucide-react-native';
import { Colors } from '@/constants/Colors';
import { Layout } from '@/constants/Layout';

export default function LandingPage() {
    const { width } = useWindowDimensions();
    const isDesktop = width >= 1024;
    const isTablet = width >= 768 && width < 1024;

    const features = [
        {
            icon: Package,
            title: 'Order Management',
            description: 'Track and manage all your orders in one place with real-time updates.'
        },
        {
            icon: TrendingUp,
            title: 'Real-Time Tracking',
            description: 'Monitor order status and delivery progress instantly across all devices.'
        },
        {
            icon: Users,
            title: 'Customer Management',
            description: 'Build lasting relationships with customer profiles and order history.'
        },
        {
            icon: BarChart3,
            title: 'Analytics & Reports',
            description: 'Make data-driven decisions with comprehensive business insights.'
        }
    ];

    const steps = [
        { number: '1', title: 'Sign Up', description: 'Create your free account in seconds' },
        { number: '2', title: 'Add Orders', description: 'Start managing your deliveries' },
        { number: '3', title: 'Grow Business', description: 'Scale with powerful tools' }
    ];

    return (
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
            {/* Hero Section */}
            <View style={[styles.hero, isDesktop && styles.heroDesktop]}>
                <View style={[styles.heroContent, isDesktop && styles.heroContentDesktop]}>
                    <Text style={[styles.heroTitle, isDesktop && styles.heroTitleDesktop]}>
                        Streamline Your{'\n'}Delivery Business
                    </Text>
                    <Text style={[styles.heroSubtitle, isDesktop && styles.heroSubtitleDesktop]}>
                        Manage orders, track deliveries, and grow your business with Mapnshop's all-in-one platform.
                    </Text>
                    <View style={styles.heroCTARow}>
                        <TouchableOpacity
                            style={styles.primaryButton}
                            onPress={() => router.push('/auth')}
                        >
                            <Text style={styles.primaryButtonText}>Get Started Free</Text>
                            <ArrowRight size={20} color={Colors.primaryForeground} />
                        </TouchableOpacity>
                    </View>
                </View>
            </View>

            {/* Features Section */}
            <View style={[styles.section, styles.featuresSection]}>
                <Text style={styles.sectionTitle}>Everything You Need to Succeed</Text>
                <Text style={styles.sectionSubtitle}>
                    Powerful features designed for modern delivery businesses
                </Text>

                <View style={[styles.featuresGrid, isDesktop && styles.featuresGridDesktop]}>
                    {features.map((feature, index) => (
                        <View key={index} style={[styles.featureCard, isDesktop && styles.featureCardDesktop]}>
                            <View style={styles.featureIconContainer}>
                                <feature.icon size={32} color={Colors.primary} />
                            </View>
                            <Text style={styles.featureTitle}>{feature.title}</Text>
                            <Text style={styles.featureDescription}>{feature.description}</Text>
                        </View>
                    ))}
                </View>
            </View>

            {/* How It Works Section */}
            <View style={[styles.section, styles.howItWorksSection]}>
                <Text style={styles.sectionTitle}>How It Works</Text>
                <Text style={styles.sectionSubtitle}>Get started in three simple steps</Text>

                <View style={[styles.stepsContainer, isDesktop && styles.stepsContainerDesktop]}>
                    {steps.map((step, index) => (
                        <View key={index} style={styles.stepCard}>
                            <View style={styles.stepNumber}>
                                <Text style={styles.stepNumberText}>{step.number}</Text>
                            </View>
                            <Text style={styles.stepTitle}>{step.title}</Text>
                            <Text style={styles.stepDescription}>{step.description}</Text>
                        </View>
                    ))}
                </View>
            </View>

            {/* CTA Section */}
            <View style={styles.ctaSection}>
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
                        <ArrowRight size={20} color={Colors.primaryForeground} />
                    </TouchableOpacity>
                </View>
            </View>

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
        backgroundColor: Colors.primary,
        paddingTop: Platform.OS === 'web' ? 80 : 60,
        paddingBottom: 80,
        paddingHorizontal: Layout.spacing.lg,
    },
    heroDesktop: {
        paddingTop: 120,
        paddingBottom: 120,
    },
    heroContent: {
        maxWidth: 800,
        alignSelf: 'center',
        width: '100%',
    },
    heroContentDesktop: {
        maxWidth: 1200,
    },
    heroTitle: {
        fontSize: 40,
        fontWeight: '900',
        color: Colors.primaryForeground,
        marginBottom: Layout.spacing.md,
        letterSpacing: -1,
        lineHeight: 48,
    },
    heroTitleDesktop: {
        fontSize: 64,
        lineHeight: 72,
    },
    heroSubtitle: {
        fontSize: 18,
        color: Colors.primaryForeground,
        opacity: 0.9,
        marginBottom: Layout.spacing.xl,
        lineHeight: 28,
    },
    heroSubtitleDesktop: {
        fontSize: 22,
        lineHeight: 34,
    },
    heroCTARow: {
        flexDirection: 'row',
        gap: Layout.spacing.md,
    },
    primaryButton: {
        backgroundColor: Colors.background,
        paddingVertical: 16,
        paddingHorizontal: 32,
        borderRadius: Layout.borderRadius.lg,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4,
    },
    primaryButtonText: {
        fontSize: 18,
        fontWeight: '700',
        color: Colors.primary,
    },
    section: {
        paddingVertical: 80,
        paddingHorizontal: Layout.spacing.lg,
    },
    featuresSection: {
        backgroundColor: Colors.surface,
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
        backgroundColor: Colors.background,
        padding: Layout.spacing.xl,
        borderRadius: Layout.borderRadius.xl,
        borderWidth: 1,
        borderColor: Colors.border,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    featureCardDesktop: {
        width: 'calc(50% - 12px)',
    },
    featureIconContainer: {
        width: 64,
        height: 64,
        backgroundColor: Colors.primary + '15',
        borderRadius: Layout.borderRadius.lg,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: Layout.spacing.md,
    },
    featureTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: Colors.text.primary,
        marginBottom: Layout.spacing.sm,
    },
    featureDescription: {
        fontSize: 16,
        color: Colors.text.secondary,
        lineHeight: 24,
    },
    howItWorksSection: {
        backgroundColor: Colors.background,
    },
    stepsContainer: {
        maxWidth: 1200,
        alignSelf: 'center',
        width: '100%',
        gap: Layout.spacing.lg,
    },
    stepsContainerDesktop: {
        flexDirection: 'row',
    },
    stepCard: {
        flex: 1,
        alignItems: 'center',
        padding: Layout.spacing.xl,
    },
    stepNumber: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: Colors.primary,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: Layout.spacing.md,
    },
    stepNumberText: {
        fontSize: 28,
        fontWeight: '800',
        color: Colors.primaryForeground,
    },
    stepTitle: {
        fontSize: 22,
        fontWeight: '700',
        color: Colors.text.primary,
        marginBottom: Layout.spacing.sm,
    },
    stepDescription: {
        fontSize: 16,
        color: Colors.text.secondary,
        textAlign: 'center',
    },
    ctaSection: {
        backgroundColor: Colors.primary,
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
        color: Colors.primaryForeground,
        textAlign: 'center',
        marginBottom: Layout.spacing.sm,
        letterSpacing: -0.5,
    },
    ctaSubtitle: {
        fontSize: 18,
        color: Colors.primaryForeground,
        opacity: 0.9,
        textAlign: 'center',
        marginBottom: Layout.spacing.xl,
    },
    ctaButton: {
        backgroundColor: Colors.background,
        paddingVertical: 16,
        paddingHorizontal: 32,
        borderRadius: Layout.borderRadius.lg,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4,
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
