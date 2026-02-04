import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform, useWindowDimensions, Image } from 'react-native';
import { router } from 'expo-router';
import { Inbox, CheckCircle, Eye, Calendar, Menu, X } from 'lucide-react-native';
import { Colors } from '@/constants/Colors';
import { Layout } from '@/constants/Layout';
import { LinearGradient } from 'expo-linear-gradient';

export default function LandingPage() {
    const { width } = useWindowDimensions();
    const isDesktop = width >= 1024;
    const isMobile = width < 768;
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    // Refs for scrolling
    const scrollViewRef = useRef<any>(null);
    const problemRef = useRef<any>(null);
    const solutionRef = useRef<any>(null);
    const featuresRef = useRef<any>(null);

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

    const scrollToSection = (sectionId: string) => {
        setMobileMenuOpen(false);

        let ref: React.RefObject<View> | null = null;
        if (sectionId === 'problem') ref = problemRef;
        else if (sectionId === 'solution') ref = solutionRef;
        else if (sectionId === 'features') ref = featuresRef;

        if (ref?.current) {
            ref.current.measureLayout(
                scrollViewRef.current as any,
                (x, y) => {
                    scrollViewRef.current?.scrollTo({ y: y - 80, animated: true });
                },
                () => { }
            );
        }
    };

    return (
        <View style={styles.container}>
            {/* Navigation Header */}
            <View style={styles.nav}>
                <View style={[styles.navContent, isDesktop && styles.navContentDesktop]}>
                    {/* Logo */}
                    <TouchableOpacity style={styles.navLogo} onPress={() => { }}>
                        <Image
                            source={require('@/assets/images/mapnshop_logo.png')}
                            style={styles.navLogoImage}
                            resizeMode="contain"
                        />
                        <Text style={styles.navLogoText}>Mapnshop</Text>
                    </TouchableOpacity>

                    {/* Desktop Navigation */}
                    {!isMobile && (
                        <View style={styles.navLinks}>
                            <TouchableOpacity onPress={() => scrollToSection('problem')}>
                                <Text style={styles.navLink}>Problem</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => scrollToSection('solution')}>
                                <Text style={styles.navLink}>Solution</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => scrollToSection('features')}>
                                <Text style={styles.navLink}>Features</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.navCTA}
                                onPress={() => router.push('/auth')}
                            >
                                <Text style={styles.navCTAText}>Request Access</Text>
                            </TouchableOpacity>
                        </View>
                    )}

                    {/* Mobile Menu Button */}
                    {isMobile && (
                        <TouchableOpacity onPress={() => setMobileMenuOpen(!mobileMenuOpen)}>
                            {mobileMenuOpen ? (
                                <X size={24} color={Colors.text.primary} />
                            ) : (
                                <Menu size={24} color={Colors.text.primary} />
                            )}
                        </TouchableOpacity>
                    )}
                </View>

                {/* Mobile Menu */}
                {isMobile && mobileMenuOpen && (
                    <View style={styles.mobileMenu}>
                        <TouchableOpacity
                            style={styles.mobileMenuItem}
                            onPress={() => scrollToSection('problem')}
                        >
                            <Text style={styles.mobileMenuLink}>Problem</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.mobileMenuItem}
                            onPress={() => scrollToSection('solution')}
                        >
                            <Text style={styles.mobileMenuLink}>Solution</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.mobileMenuItem}
                            onPress={() => scrollToSection('features')}
                        >
                            <Text style={styles.mobileMenuLink}>Features</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.mobileMenuCTA}
                            onPress={() => router.push('/auth')}
                        >
                            <Text style={styles.mobileMenuCTAText}>Request Access</Text>
                        </TouchableOpacity>
                    </View>
                )}
            </View>

            <ScrollView ref={scrollViewRef} showsVerticalScrollIndicator={false}>
                {/* Hero Section */}
                <View style={[styles.hero, isDesktop && styles.heroDesktop]}>
                    <View style={[styles.heroContent, isDesktop && styles.heroContentDesktop]}>
                        <View style={styles.heroIconContainer}>
                            <Image
                                source={require('@/assets/images/mapnshop_logo.png')}
                                style={styles.heroLogo}
                                resizeMode="contain"
                            />
                        </View>

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
                <View ref={problemRef} style={styles.section}>
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
                <View ref={solutionRef} style={[styles.section, styles.solutionSection]}>
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
                <View ref={featuresRef} style={[styles.section, styles.featuresSection]}>
                    <View style={[styles.featuresGrid, isDesktop && styles.featuresGridDesktop]}>
                        {features.map((feature, index) => (
                            <View key={index} style={[styles.featureCard, isDesktop && styles.featureCardDesktop]}>
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
                    <View style={[styles.footerContent, isDesktop && styles.footerContentDesktop]}>
                        <View style={styles.footerBrand}>
                            <Image
                                source={require('@/assets/images/mapnshop_logo.png')}
                                style={styles.footerLogo}
                                resizeMode="contain"
                            />
                            <Text style={styles.footerBrandText}>Mapnshop</Text>
                        </View>
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
                        <Text style={styles.footerCopyright}>© 2026 Mapnshop. All rights reserved.</Text>
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
    // Navigation
    nav: {
        backgroundColor: '#FFFFFF',
        borderBottomWidth: 1,
        borderBottomColor: Colors.border,
        ...Platform.select({
            web: {
                position: 'sticky' as any,
                top: 0,
                zIndex: 100,
            },
        }),
    },
    navContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: Layout.spacing.lg,
        paddingVertical: Layout.spacing.md,
        maxWidth: 1200,
        alignSelf: 'center',
        width: '100%',
    },
    navContentDesktop: {
        paddingHorizontal: Layout.spacing.xl,
    },
    navLogo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    navLogoImage: {
        width: 32,
        height: 32,
    },
    navLogoText: {
        fontSize: 18,
        fontWeight: '700',
        color: Colors.text.primary,
    },
    navLinks: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Layout.spacing.lg,
    },
    navLink: {
        fontSize: 15,
        color: Colors.text.secondary,
        fontWeight: '500',
    },
    navCTA: {
        backgroundColor: Colors.primary,
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: Layout.borderRadius.md,
    },
    navCTAText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#FFFFFF',
    },
    mobileMenu: {
        backgroundColor: '#FFFFFF',
        borderTopWidth: 1,
        borderTopColor: Colors.border,
        paddingVertical: Layout.spacing.md,
    },
    mobileMenuItem: {
        paddingVertical: Layout.spacing.sm,
        paddingHorizontal: Layout.spacing.lg,
    },
    mobileMenuLink: {
        fontSize: 16,
        color: Colors.text.secondary,
        fontWeight: '500',
    },
    mobileMenuCTA: {
        marginHorizontal: Layout.spacing.lg,
        marginTop: Layout.spacing.sm,
        backgroundColor: Colors.primary,
        paddingVertical: 12,
        borderRadius: Layout.borderRadius.md,
        alignItems: 'center',
    },
    mobileMenuCTAText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#FFFFFF',
    },
    // Hero
    hero: {
        backgroundColor: '#FFFFFF',
        paddingTop: 60,
        paddingBottom: 80,
        paddingHorizontal: Layout.spacing.lg,
    },
    heroDesktop: {
        paddingTop: 100,
        paddingBottom: 120,
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
    heroIconContainer: {
        marginBottom: Layout.spacing.xl,
    },
    heroLogo: {
        width: 80,
        height: 80,
    },
    heroTitle: {
        fontSize: 40,
        fontWeight: '800',
        color: Colors.text.primary,
        marginBottom: Layout.spacing.lg,
        letterSpacing: -0.5,
        lineHeight: 48,
        textAlign: 'center',
    },
    heroTitleDesktop: {
        fontSize: 56,
        lineHeight: 64,
    },
    heroSubtitle: {
        fontSize: 19,
        color: Colors.text.secondary,
        marginBottom: Layout.spacing.md,
        lineHeight: 30,
        textAlign: 'center',
    },
    heroSubtitleDesktop: {
        fontSize: 21,
        lineHeight: 34,
    },
    heroSupporting: {
        fontSize: 16,
        color: Colors.text.secondary,
        marginBottom: Layout.spacing.xl * 1.5,
        lineHeight: 26,
        textAlign: 'center',
        maxWidth: 600,
    },
    primaryButton: {
        backgroundColor: Colors.primary,
        paddingVertical: 18,
        paddingHorizontal: 40,
        borderRadius: Layout.borderRadius.lg,
        marginBottom: Layout.spacing.md,
        shadowColor: Colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
        elevation: 4,
    },
    primaryButtonText: {
        fontSize: 17,
        fontWeight: '600',
        color: '#FFFFFF',
    },
    heroFootnote: {
        fontSize: 14,
        color: Colors.text.placeholder,
        textAlign: 'center',
    },
    // Sections
    section: {
        paddingVertical: 80,
        paddingHorizontal: Layout.spacing.lg,
    },
    sectionTitle: {
        fontSize: 32,
        fontWeight: '700',
        color: Colors.text.primary,
        textAlign: 'center',
        marginBottom: Layout.spacing.xl * 1.5,
        letterSpacing: -0.3,
        lineHeight: 40,
        maxWidth: 800,
        alignSelf: 'center',
    },
    problemList: {
        maxWidth: 600,
        alignSelf: 'center',
        marginBottom: Layout.spacing.xl * 1.5,
    },
    problemItem: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: Layout.spacing.lg,
    },
    problemBullet: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: Colors.primary,
        marginTop: 9,
        marginRight: 14,
    },
    problemText: {
        flex: 1,
        fontSize: 17,
        color: Colors.text.secondary,
        lineHeight: 26,
    },
    problemClose: {
        fontSize: 20,
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
        marginBottom: Layout.spacing.xl * 1.5,
    },
    solutionPoint: {
        fontSize: 17,
        color: Colors.text.secondary,
        marginBottom: Layout.spacing.md,
        lineHeight: 26,
        textAlign: 'center',
    },
    principleBox: {
        maxWidth: 650,
        alignSelf: 'center',
        backgroundColor: Colors.background,
        padding: Layout.spacing.xl,
        borderRadius: Layout.borderRadius.lg,
        borderLeftWidth: 4,
        borderLeftColor: Colors.primary,
    },
    principleText: {
        fontSize: 17,
        color: Colors.text.primary,
        lineHeight: 28,
        fontStyle: 'italic',
    },
    stepsContainer: {
        maxWidth: 1000,
        alignSelf: 'center',
        width: '100%',
        gap: Layout.spacing.xl,
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
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: Colors.primary,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: Layout.spacing.lg,
    },
    stepNumberText: {
        fontSize: 24,
        fontWeight: '700',
        color: '#FFFFFF',
    },
    stepTitle: {
        fontSize: 19,
        fontWeight: '600',
        color: Colors.text.primary,
        marginBottom: Layout.spacing.sm,
        textAlign: 'center',
    },
    stepDescription: {
        fontSize: 15,
        color: Colors.text.secondary,
        textAlign: 'center',
        lineHeight: 22,
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
        padding: Layout.spacing.xl,
        backgroundColor: Colors.background,
        borderRadius: Layout.borderRadius.xl,
        borderWidth: 1,
        borderColor: Colors.border,
    },
    featureCardDesktop: {
        width: 'calc(50% - 12px)' as any,
    },
    featureIconContainer: {
        width: 52,
        height: 52,
        backgroundColor: Colors.primary + '15',
        borderRadius: Layout.borderRadius.lg,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: Layout.spacing.md,
    },
    featureTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: Colors.text.primary,
        marginBottom: Layout.spacing.xs,
    },
    featureDescription: {
        fontSize: 15,
        color: Colors.text.secondary,
        lineHeight: 22,
    },
    businessList: {
        maxWidth: 400,
        alignSelf: 'center',
        marginBottom: Layout.spacing.xl,
    },
    businessItem: {
        fontSize: 17,
        color: Colors.text.secondary,
        marginBottom: Layout.spacing.sm,
        textAlign: 'center',
    },
    businessFootnote: {
        fontSize: 17,
        color: Colors.text.primary,
        textAlign: 'center',
        fontStyle: 'italic',
    },
    earlyAccessSection: {
        backgroundColor: Colors.surface,
    },
    earlyAccessText: {
        fontSize: 17,
        color: Colors.text.secondary,
        lineHeight: 28,
        textAlign: 'center',
        maxWidth: 700,
        alignSelf: 'center',
    },
    ctaSection: {
        paddingVertical: 80,
        paddingHorizontal: Layout.spacing.lg,
    },
    ctaContent: {
        maxWidth: 600,
        alignSelf: 'center',
        alignItems: 'center',
    },
    ctaTitle: {
        fontSize: 32,
        fontWeight: '700',
        color: '#FFFFFF',
        textAlign: 'center',
        marginBottom: Layout.spacing.xl,
        letterSpacing: -0.3,
    },
    ctaButton: {
        backgroundColor: '#FFFFFF',
        paddingVertical: 18,
        paddingHorizontal: 40,
        borderRadius: Layout.borderRadius.lg,
        marginBottom: Layout.spacing.md,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 12,
        elevation: 4,
    },
    ctaButtonText: {
        fontSize: 17,
        fontWeight: '600',
        color: Colors.primary,
    },
    ctaSubtext: {
        fontSize: 15,
        color: 'rgba(255,255,255,0.9)',
        textAlign: 'center',
    },
    footer: {
        backgroundColor: Colors.surface,
        paddingVertical: Layout.spacing.xl * 1.5,
        paddingHorizontal: Layout.spacing.lg,
        borderTopWidth: 1,
        borderTopColor: Colors.border,
    },
    footerContent: {
        maxWidth: 1200,
        alignSelf: 'center',
        width: '100%',
        alignItems: 'center',
        gap: Layout.spacing.lg,
    },
    footerContentDesktop: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    footerBrand: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    footerLogo: {
        width: 28,
        height: 28,
    },
    footerBrandText: {
        fontSize: 16,
        fontWeight: '600',
        color: Colors.text.primary,
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
    footerCopyright: {
        fontSize: 13,
        color: Colors.text.placeholder,
    },
});
