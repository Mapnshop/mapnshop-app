import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, Animated } from 'react-native';
import { ScreenContainer } from '@/components/ScreenContainer';
import { Colors } from '@/constants/Colors';
import { Layout } from '@/constants/Layout';
import { ArrowLeft } from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';

interface WizardLayoutProps {
    children: React.ReactNode;
    step: number;
    totalSteps: number;
    title: string;
    subtitle?: string;
    onBack?: () => void;
    showLogout?: boolean;
}

export function WizardLayout({
    children,
    step,
    totalSteps,
    title,
    subtitle,
    onBack,
    showLogout
}: WizardLayoutProps) {
    const { signOut } = useAuth();
    const progress = ((step + 1) / totalSteps) * 100;

    // Animation opacity
    const fadeAnim = useRef(new Animated.Value(1)).current;

    useEffect(() => {
        // Fade out
        fadeAnim.setValue(0);
        // Fade in
        Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
        }).start();
    }, [step]); // Run whenever step changes

    return (
        <ScreenContainer scrollable>
            {/* Top Bar */}
            <View style={styles.topBar}>
                {onBack ? (
                    <TouchableOpacity onPress={onBack} style={styles.navButton}>
                        <ArrowLeft size={24} color={Colors.text.primary} />
                    </TouchableOpacity>
                ) : showLogout ? (
                    <TouchableOpacity onPress={() => signOut()} style={styles.navButton}>
                        <ArrowLeft size={24} color={Colors.text.primary} />
                        <Text style={styles.navText}>Sign Out</Text>
                    </TouchableOpacity>
                ) : <View style={{ width: 40 }} />}

                <View style={styles.progressContainer}>
                    <Text style={styles.stepText}>Step {step + 1} of {totalSteps}</Text>
                </View>

                <View style={{ width: 40 }} />
            </View>

            {/* Progress Bar */}
            <View style={styles.progressBarBg}>
                <View style={[styles.progressBarFill, { width: `${progress}%` }]} />
            </View>

            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.title}>{title}</Text>
                {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
            </View>

            {/* Content (Animated) */}
            <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
                {children}
            </Animated.View>
        </ScreenContainer>
    );
}

const styles = StyleSheet.create({
    topBar: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: Layout.spacing.sm,
    },
    navButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        padding: Layout.spacing.xs,
        marginLeft: -Layout.spacing.xs,
    },
    navText: {
        color: Colors.text.secondary,
        fontWeight: '500',
    },
    progressContainer: {
        // centered if needed
    },
    stepText: {
        fontSize: 14,
        fontWeight: '600',
        color: Colors.text.secondary,
    },
    progressBarBg: {
        height: 6, // Slightly thicker
        backgroundColor: '#E2E8F0',
        borderRadius: 3,
        marginBottom: Layout.spacing.xl,
        overflow: 'hidden',
    },
    progressBarFill: {
        height: '100%',
        backgroundColor: Colors.primary,
        borderRadius: 3,
    },
    header: {
        marginBottom: Layout.spacing.lg,
    },
    title: {
        fontSize: 28,
        fontWeight: '800', // Bolder title
        color: Colors.text.primary,
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        color: Colors.text.secondary,
        lineHeight: 24,
    },
    content: {
        gap: Layout.spacing.lg,
        paddingBottom: Layout.spacing.xxl,
    },
});
