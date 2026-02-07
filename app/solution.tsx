import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform, useWindowDimensions, Image } from 'react-native';
import { router } from 'expo-router';
import { Menu, X } from 'lucide-react-native';
import { Colors } from '@/constants/Colors';
import { Layout } from '@/constants/Layout';

export default function SolutionPage() {
    const { width } = useWindowDimensions();
    const isDesktop = width >= 1024;
    const isMobile = width < 768;
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const steps = [
        {
            number: '1',
            title: 'Orders Come From Everywhere',
            description: 'Uber Eats, DoorDash, Phone, Instagram, Walk-ins.'
        },
        {
            number: '2',
            title: 'They All Appear in One Inbox',
            description: 'Unified view. Clear sorting. Allergy alerts.'
        },
        {
            number: '3',
            title: 'Your Team Executes With Clarity',
            description: 'No tablet juggling. No missed special requests.'
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
                                <Text style={[styles.navLink, styles.activeNavLink]}>Solution</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => router.push('/features')}>
                                <Text style={styles.navLink}>Features</Text>
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
                            <Text style={[styles.mobileMenuLink, styles.activeNavLink]}>Solution</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.mobileMenuItem} onPress={() => router.push('/features')}>
                            <Text style={styles.mobileMenuLink}>Features</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.mobileMenuCTA} onPress={() => router.push('/auth')}>
                            <Text style={styles.mobileMenuCTAText}>Request Access</Text>
                        </TouchableOpacity>
                    </View>
                )}
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
                <View style={[styles.section, styles.solutionSection, { minHeight: '80%' }]}>
                    <Text style={styles.sectionTitle}>
                        Mapnshop Replaces Chaos With One Operational View
                    </Text>

                    <View style={styles.solutionPoints}>
                        <Text style={styles.solutionPoint}>One inbox for every order</Text>
                        <Text style={styles.solutionPoint}>Clear status for every task</Text>
                        <Text style={styles.solutionPoint}>No guessing for staff</Text>
                        <Text style={styles.solutionPoint}>Full visibility for owners</Text>
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
    solutionSection: { backgroundColor: Colors.surface },
    solutionPoints: { maxWidth: 500, alignSelf: 'center', marginBottom: Layout.spacing.xl * 1.5 },
    solutionPoint: { fontSize: 17, color: Colors.text.secondary, marginBottom: Layout.spacing.md, lineHeight: 26, textAlign: 'center' },
    principleBox: { maxWidth: 650, alignSelf: 'center', backgroundColor: Colors.background, padding: Layout.spacing.xl, borderRadius: Layout.borderRadius.lg, borderLeftWidth: 4, borderLeftColor: Colors.primary },
    principleText: { fontSize: 17, color: Colors.text.primary, lineHeight: 28, fontStyle: 'italic' },
    stepsContainer: { maxWidth: 1000, alignSelf: 'center', width: '100%', gap: Layout.spacing.xl },
    stepsContainerDesktop: { flexDirection: 'row' },
    stepCard: { flex: 1, alignItems: 'center', padding: Layout.spacing.xl },
    stepNumber: { width: 56, height: 56, borderRadius: 28, backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center', marginBottom: Layout.spacing.lg },
    stepNumberText: { fontSize: 24, fontWeight: '700', color: '#FFFFFF' },
    stepTitle: { fontSize: 19, fontWeight: '600', color: Colors.text.primary, marginBottom: Layout.spacing.sm, textAlign: 'center' },
    stepDescription: { fontSize: 15, color: Colors.text.secondary, textAlign: 'center', lineHeight: 22 },
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
