import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform, useWindowDimensions, Image } from 'react-native';
import { router } from 'expo-router';
import { Inbox, CheckCircle, Eye, Calendar } from 'lucide-react-native';
import { Colors } from '@/constants/Colors';
import { Layout } from '@/constants/Layout';
import { LinearGradient } from 'expo-linear-gradient';

export default function LandingPage() {
    const { width } = useWindowDimensions();
    const isDesktop = width >= 1024;

    const problems = [
        'Orders arrive from too many places',
        'Staff track orders in WhatsApp and memory',
        'Pickup and delivery get mixed up',
        'Orders are missed or duplicated',
        'Owners constantly ask: "Did we handle this?"'
    ];

    const steps = [
        {
            number: '1',
            title: 'Orders Come From Everywhere',
            description: 'Walk-ins, phone, WhatsApp, Instagram, delivery apps.'
        },
        {
            number: '2',
            title: 'They All Appear in One Inbox',
            description: 'Every order, same format, same workflow.'
        },
        {
            number: '3',
            title: 'Your Team Executes With Clarity',
            description: 'No guessing. No missed orders.'
        }
    ];

    const features = [
        {
            icon: Inbox,
            title: 'Unified Order Inbox',
            description: 'See every order in one place.'
        },
        {
            icon: CheckCircle,
            title: 'Clear Order States',
            description: 'Know what\'s new, in progress, ready, or done.'
        },
        {
            icon: Eye,
            title: 'Source Visibility',
            description: 'Always know where an order came from.'
        },
        {
            icon: Calendar,
            title: 'Daily Summary',
            description: 'Understand how the day actually went.'
        }
    ];

    const businesses = [
        'Restaurants & takeaways',
        'Cloud kitchens',
        'Bakeries',
        'Small food shops'
    ];

    return (
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
            {/* Hero Section */}
            <View style={[styles.hero, isDesktop && styles.heroDesktop]}>
                <View style={[styles.heroContent, isDesktop && styles.heroContentDesktop]}>
                    <Image
                        source={require('@/assets/images/mapnshop_logo.png')}
                        style={styles.logo}
                        resizeMode="contain"
                    />

                    <Text style={[styles.heroTitle, isDesktop && styles.heroTitleDesktop]}>
                        One Inbox for All Your Orders
                    </Text>

                    <Text style={[styles.heroSubtitle, isDesktop && styles.heroSubtitleDesktop]}>
                        Orders from walk-ins, phone calls, WhatsApp, Instagram, and delivery apps — all in one place.
                    </Text>

                    <Text style={styles.heroSupporting}>
                        Mapnshop is the internal system your team uses to see what needs to be done right now.
                    </Text>

                    <TouchableOpacity
                        style={styles.primaryButton}
                        onPress={() => router.push('/auth')}
                    >
                        <Text style={styles.primaryButtonText}>Request Early Access</Text>
                    </TouchableOpacity>

                    <Text style={styles.heroFootnote}>
                        Currently onboarding a small number of local businesses.
                    </Text>
                </View>
            </View>

            {/* Problem Section */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>
                    Local Businesses Don't Have a Sales Problem.{'\n'}They Have a Coordination Problem.
                </Text>

                <View style={styles.problemList}>
                    {problems.map((problem, index) => (
                        <View key={index} style={styles.problemItem}>
                            <View style={styles.problemBullet} />
                            <Text style={styles.problemText}>{problem}</Text>
                        </View>
                    ))}
                </View>

                <Text style={styles.problemClose}>
                    More orders don't fix chaos. Clarity does.
                </Text>
            </View>

            {/* Solution Section */}
            <View style={[styles.section, styles.solutionSection]}>
                <Text style={styles.sectionTitle}>
                    Mapnshop Replaces Chaos With One Operational View
                </Text>

                <View style={styles.solutionPoints}>
                    <Text style={styles.solutionPoint}>All orders live in one inbox</Text>
                    <Text style={styles.solutionPoint}>Every order has a clear status</Text>
                    <Text style={styles.solutionPoint}>Staff always know what's next</Text>
                    <Text style={styles.solutionPoint}>Owners see the day clearly</Text>
                </View>

                <View style={styles.principleBox}>
                    <Text style={styles.principleText}>
                        Customers keep ordering the way they already do. Mapnshop works underneath as the system of record.
                    </Text>
                </View>
            </View>

            {/* How It Works */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>How It Works</Text>

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

            {/* Features */}
            <View style={[styles.section, styles.featuresSection]}>
                <View style={[styles.featuresGrid, isDesktop && styles.featuresGridDesktop]}>
                    {features.map((feature, index) => (
                        <View key={index} style={styles.featureCard}>
                            <View style={styles.featureIconContainer}>
                                <feature.icon size={24} color={Colors.primary} />
                            </View>
                            <Text style={styles.featureTitle}>{feature.title}</Text>
                            <Text style={styles.featureDescription}>{feature.description}</Text>
                        </View>
                    ))}
                </View>
            </View>

            {/* Who It's For */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>
                    Built for Local Businesses That Take Orders Every Day
                </Text>

                <View style={styles.businessList}>
                    {businesses.map((business, index) => (
                        <Text key={index} style={styles.businessItem}>• {business}</Text>
                    ))}
                </View>

                <Text style={styles.businessFootnote}>
                    If orders matter to your day, Mapnshop is for you.
                </Text>
            </View>

            {/* Early Access */}
            <View style={[styles.section, styles.earlyAccessSection]}>
                <Text style={styles.sectionTitle}>Early Access</Text>

                <Text style={styles.earlyAccessText}>
                    Mapnshop is currently in pilot. We're working closely with a small number of local businesses to build the right operational system before expanding.
                </Text>
            </View>

            {/* Final CTA */}
            <LinearGradient
                colors={['#3B82F6', '#2563EB'] as const}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.ctaSection}
            >
                <View style={styles.ctaContent}>
                    <Text style={styles.ctaTitle}>Replace Order Chaos With Clarity</Text>
                    <TouchableOpacity
                        style={styles.ctaButton}
                        onPress={() => router.push('/auth')}
                    >
                        <Text style={styles.ctaButtonText}>Request Early Access</Text>
                    </TouchableOpacity>
                    <Text style={styles.ctaSubtext}>
                        We'll contact you personally to see if Mapnshop is a good fit.
                    </Text>
                </View>
            </LinearGradient>

            {/* Footer */}
            <View style={styles.footer}>
                <Text style={styles.footerText}>© 2026 Mapnshop</Text>
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
        backgroundColor: '#FFFFFF',
        paddingTop: Platform.OS === 'web' ? 80 : 60,
        paddingBottom: 60,
        paddingHorizontal: Layout.spacing.lg,
        borderBottomWidth: 1,
        borderBottomColor: Colors.border,
    },
    heroDesktop: {
        paddingTop: 100,
        paddingBottom: 80,
    },
    heroContent: {
        maxWidth: 700,
        alignSelf: 'center',
        width: '100%',
        alignItems: 'center',
    },
    heroContentDesktop: {
        maxWidth: 800,
    },
    logo: {
        width: 100,
        height: 100,
        marginBottom: Layout.spacing.lg,
    },
    heroTitle: {
        fontSize: 36,
        fontWeight: '800',
        color: Colors.text.primary,
        marginBottom: Layout.spacing.md,
        letterSpacing: -0.5,
        lineHeight: 44,
        textAlign: 'center',
    },
    heroTitleDesktop: {
        fontSize: 48,
        lineHeight: 56,
    },
    heroSubtitle: {
        fontSize: 18,
        color: Colors.text.secondary,
        marginBottom: Layout.spacing.md,
        lineHeight: 28,
        textAlign: 'center',
    },
    heroSubtitleDesktop: {
        fontSize: 20,
        lineHeight: 32,
    },
    heroSupporting: {
        fontSize: 16,
        color: Colors.text.secondary,
        marginBottom: Layout.spacing.xl,
        lineHeight: 24,
        textAlign: 'center',
    },
    primaryButton: {
        backgroundColor: Colors.primary,
        paddingVertical: 16,
        paddingHorizontal: 32,
        borderRadius: Layout.borderRadius.lg,
        marginBottom: Layout.spacing.md,
    },
    primaryButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#FFFFFF',
    },
    heroFootnote: {
        fontSize: 14,
        color: Colors.text.placeholder,
        textAlign: 'center',
    },
    section: {
        paddingVertical: 60,
        paddingHorizontal: Layout.spacing.lg,
    },
    sectionTitle: {
        fontSize: 28,
        fontWeight: '700',
        color: Colors.text.primary,
        textAlign: 'center',
        marginBottom: Layout.spacing.xl,
        letterSpacing: -0.3,
        lineHeight: 36,
    },
    problemList: {
        maxWidth: 600,
        alignSelf: 'center',
        marginBottom: Layout.spacing.xl,
    },
    problemItem: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: Layout.spacing.md,
    },
    problemBullet: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: Colors.text.secondary,
        marginTop: 8,
        marginRight: 12,
    },
    problemText: {
        flex: 1,
        fontSize: 16,
        color: Colors.text.secondary,
        lineHeight: 24,
    },
    problemClose: {
        fontSize: 18,
        fontWeight: '600',
        color: Colors.text.primary,
        textAlign: 'center',
        fontStyle: 'italic',
    },
    solutionSection: {
        backgroundColor: Colors.surface,
    },
    solutionPoints: {
        maxWidth: 500,
        alignSelf: 'center',
        marginBottom: Layout.spacing.xl,
    },
    solutionPoint: {
        fontSize: 16,
        color: Colors.text.secondary,
        marginBottom: Layout.spacing.sm,
        lineHeight: 24,
        textAlign: 'center',
    },
    principleBox: {
        maxWidth: 600,
        alignSelf: 'center',
        backgroundColor: Colors.background,
        padding: Layout.spacing.lg,
        borderRadius: Layout.borderRadius.lg,
        borderLeftWidth: 3,
        borderLeftColor: Colors.primary,
    },
    principleText: {
        fontSize: 16,
        color: Colors.text.primary,
        lineHeight: 24,
        fontStyle: 'italic',
    },
    stepsContainer: {
        maxWidth: 1000,
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
        padding: Layout.spacing.lg,
    },
    stepNumber: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: Colors.primary,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: Layout.spacing.md,
    },
    stepNumberText: {
        fontSize: 20,
        fontWeight: '700',
        color: '#FFFFFF',
    },
    stepTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: Colors.text.primary,
        marginBottom: Layout.spacing.sm,
        textAlign: 'center',
    },
    stepDescription: {
        fontSize: 14,
        color: Colors.text.secondary,
        textAlign: 'center',
        lineHeight: 20,
    },
    featuresSection: {
        backgroundColor: Colors.surface,
    },
    featuresGrid: {
        maxWidth: 1000,
        alignSelf: 'center',
        width: '100%',
        gap: Layout.spacing.lg,
    },
    featuresGridDesktop: {
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    featureCard: {
        flex: 1,
        minWidth: 200,
        padding: Layout.spacing.lg,
        backgroundColor: Colors.background,
        borderRadius: Layout.borderRadius.lg,
        borderWidth: 1,
        borderColor: Colors.border,
    },
    featureIconContainer: {
        width: 48,
        height: 48,
        backgroundColor: Colors.primary + '15',
        borderRadius: Layout.borderRadius.md,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: Layout.spacing.md,
    },
    featureTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: Colors.text.primary,
        marginBottom: Layout.spacing.xs,
    },
    featureDescription: {
        fontSize: 14,
        color: Colors.text.secondary,
        lineHeight: 20,
    },
    businessList: {
        maxWidth: 400,
        alignSelf: 'center',
        marginBottom: Layout.spacing.lg,
    },
    businessItem: {
        fontSize: 16,
        color: Colors.text.secondary,
        marginBottom: Layout.spacing.sm,
        textAlign: 'center',
    },
    businessFootnote: {
        fontSize: 16,
        color: Colors.text.primary,
        textAlign: 'center',
        fontStyle: 'italic',
    },
    earlyAccessSection: {
        backgroundColor: Colors.surface,
    },
    earlyAccessText: {
        fontSize: 16,
        color: Colors.text.secondary,
        lineHeight: 26,
        textAlign: 'center',
        maxWidth: 700,
        alignSelf: 'center',
    },
    ctaSection: {
        paddingVertical: 60,
        paddingHorizontal: Layout.spacing.lg,
    },
    ctaContent: {
        maxWidth: 600,
        alignSelf: 'center',
        alignItems: 'center',
    },
    ctaTitle: {
        fontSize: 28,
        fontWeight: '700',
        color: '#FFFFFF',
        textAlign: 'center',
        marginBottom: Layout.spacing.lg,
        letterSpacing: -0.3,
    },
    ctaButton: {
        backgroundColor: '#FFFFFF',
        paddingVertical: 16,
        paddingHorizontal: 32,
        borderRadius: Layout.borderRadius.lg,
        marginBottom: Layout.spacing.md,
    },
    ctaButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: Colors.primary,
    },
    ctaSubtext: {
        fontSize: 14,
        color: 'rgba(255,255,255,0.9)',
        textAlign: 'center',
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
    },
    footerDivider: {
        fontSize: 14,
        color: Colors.text.placeholder,
    },
});
