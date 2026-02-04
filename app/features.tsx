import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform, useWindowDimensions, Image } from 'react-native';
import { router } from 'expo-router';
import { Inbox, CheckCircle, Eye, Calendar, Menu, X } from 'lucide-react-native';
import { Colors } from '@/constants/Colors';
import { Layout } from '@/constants/Layout';

export default function FeaturesPage() {
    const { width } = useWindowDimensions();
    const isDesktop = width >= 1024;
    const isMobile = width < 768;
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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

    return (
        <View style={styles.container}>
            {/* Navigation Header */}
            <View style={styles.nav}>
                <View style={[styles.navContent, isDesktop && styles.navContentDesktop]}>
                    <TouchableOpacity style={styles.navLogo} onPress={() => router.push('/landing')}>
                        <Image
                            source={require('@/assets/images/mapnshop_logo.png')}
                            style={styles.navLogoImage}
                            resizeMode="contain"
                        />
                        <Text style={styles.navLogoText}>Mapnshop</Text>
                    </TouchableOpacity>

                    {!isMobile && (
                        <View style={styles.navLinks}>
                            <TouchableOpacity onPress={() => router.push('/problem')}>
                                <Text style={styles.navLink}>Problem</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => router.push('/solution')}>
                                <Text style={styles.navLink}>Solution</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => router.push('/features')}>
                                <Text style={[styles.navLink, styles.activeNavLink]}>Features</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.navCTA} onPress={() => router.push('/auth')}>
                                <Text style={styles.navCTAText}>Request Access</Text>
                            </TouchableOpacity>
                        </View>
                    )}

                    {isMobile && (
                        <TouchableOpacity onPress={() => setMobileMenuOpen(!mobileMenuOpen)}>
                            {mobileMenuOpen ? <X size={24} color={Colors.text.primary} /> : <Menu size={24} color={Colors.text.primary} />}
                        </TouchableOpacity>
                    )}
                </View>

                {isMobile && mobileMenuOpen && (
                    <View style={styles.mobileMenu}>
                        <TouchableOpacity style={styles.mobileMenuItem} onPress={() => router.push('/problem')}>
                            <Text style={styles.mobileMenuLink}>Problem</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.mobileMenuItem} onPress={() => router.push('/solution')}>
                            <Text style={styles.mobileMenuLink}>Solution</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.mobileMenuItem} onPress={() => router.push('/features')}>
                            <Text style={[styles.mobileMenuLink, styles.activeNavLink]}>Features</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.mobileMenuCTA} onPress={() => router.push('/auth')}>
                            <Text style={styles.mobileMenuCTAText}>Request Access</Text>
                        </TouchableOpacity>
                    </View>
                )}
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
                {/* Features */}
                <View style={[styles.section, styles.featuresSection, { minHeight: '80%' }]}>
                    <Text style={styles.sectionTitle}>Features</Text>

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
    container: { flex: 1, backgroundColor: Colors.background },
    nav: { backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: Colors.border, ...Platform.select({ web: { position: 'sticky' as any, top: 0, zIndex: 100 } }) },
    navContent: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: Layout.spacing.lg, paddingVertical: Layout.spacing.md, maxWidth: 1200, alignSelf: 'center', width: '100%' },
    navContentDesktop: { paddingHorizontal: Layout.spacing.xl },
    navLogo: { flexDirection: 'row', alignItems: 'center', gap: 10 },
    navLogoImage: { width: 32, height: 32 },
    navLogoText: { fontSize: 18, fontWeight: '700', color: Colors.text.primary },
    navLinks: { flexDirection: 'row', alignItems: 'center', gap: Layout.spacing.lg },
    navLink: { fontSize: 15, color: Colors.text.secondary, fontWeight: '500' },
    activeNavLink: { color: Colors.primary, fontWeight: '700' },
    navCTA: { backgroundColor: Colors.primary, paddingVertical: 10, paddingHorizontal: 20, borderRadius: Layout.borderRadius.md },
    navCTAText: { fontSize: 14, fontWeight: '600', color: '#FFFFFF' },
    mobileMenu: { backgroundColor: '#FFFFFF', borderTopWidth: 1, borderTopColor: Colors.border, paddingVertical: Layout.spacing.md },
    mobileMenuItem: { paddingVertical: Layout.spacing.sm, paddingHorizontal: Layout.spacing.lg },
    mobileMenuLink: { fontSize: 16, color: Colors.text.secondary, fontWeight: '500' },
    mobileMenuCTA: { marginHorizontal: Layout.spacing.lg, marginTop: Layout.spacing.sm, backgroundColor: Colors.primary, paddingVertical: 12, borderRadius: Layout.borderRadius.md, alignItems: 'center' },
    mobileMenuCTAText: { fontSize: 16, fontWeight: '600', color: '#FFFFFF' },
    section: { paddingVertical: 80, paddingHorizontal: Layout.spacing.lg },
    sectionTitle: { fontSize: 32, fontWeight: '700', color: Colors.text.primary, textAlign: 'center', marginBottom: Layout.spacing.xl * 1.5, letterSpacing: -0.3, lineHeight: 40, maxWidth: 800, alignSelf: 'center' },
    featuresSection: { backgroundColor: Colors.surface },
    featuresGrid: { maxWidth: 1000, alignSelf: 'center', width: '100%', gap: Layout.spacing.lg },
    featuresGridDesktop: { flexDirection: 'row', flexWrap: 'wrap' },
    featureCard: { padding: Layout.spacing.xl, backgroundColor: Colors.background, borderRadius: Layout.borderRadius.xl, borderWidth: 1, borderColor: Colors.border },
    featureCardDesktop: { width: 'calc(50% - 12px)' as any },
    featureIconContainer: { width: 52, height: 52, backgroundColor: Colors.primary + '15', borderRadius: Layout.borderRadius.lg, alignItems: 'center', justifyContent: 'center', marginBottom: Layout.spacing.md },
    featureTitle: { fontSize: 18, fontWeight: '600', color: Colors.text.primary, marginBottom: Layout.spacing.xs },
    featureDescription: { fontSize: 15, color: Colors.text.secondary, lineHeight: 22 },
    footer: { backgroundColor: Colors.surface, paddingVertical: Layout.spacing.xl * 1.5, paddingHorizontal: Layout.spacing.lg, borderTopWidth: 1, borderTopColor: Colors.border },
    footerContent: { maxWidth: 1200, alignSelf: 'center', width: '100%', alignItems: 'center', gap: Layout.spacing.lg },
    footerContentDesktop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    footerBrand: { flexDirection: 'row', alignItems: 'center', gap: 10 },
    footerLogo: { width: 28, height: 28 },
    footerBrandText: { fontSize: 16, fontWeight: '600', color: Colors.text.primary },
    footerLinks: { flexDirection: 'row', alignItems: 'center', gap: Layout.spacing.sm },
    footerLink: { fontSize: 14, color: Colors.text.secondary },
    footerDivider: { fontSize: 14, color: Colors.text.placeholder },
    footerCopyright: { fontSize: 13, color: Colors.text.placeholder },
});
