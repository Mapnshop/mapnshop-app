import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Animated } from 'react-native';
import { useRouter } from 'expo-router';
import { useBusiness } from '@/contexts/BusinessContext';
import { authApi } from '@/lib/api';
import { Button } from '@/components/Button';
import { Colors } from '@/constants/Colors';
import { Layout } from '@/constants/Layout';
import { Clock, Building2, Calendar, MapPin, CheckCircle2, LogOut, RefreshCw } from 'lucide-react-native';

export default function PendingVerificationScreen() {
    const router = useRouter();
    const { business, refreshBusiness } = useBusiness();
    const [refreshing, setRefreshing] = React.useState(false);

    // Pulse Animation
    const pulseAnim = React.useRef(new Animated.Value(1)).current;

    useEffect(() => {
        Animated.loop(
            Animated.sequence([
                Animated.timing(pulseAnim, {
                    toValue: 1.1,
                    duration: 1500,
                    useNativeDriver: true,
                }),
                Animated.timing(pulseAnim, {
                    toValue: 1,
                    duration: 1500,
                    useNativeDriver: true,
                }),
            ])
        ).start();
    }, []);

    const handleRefresh = async () => {
        setRefreshing(true);
        try {
            await refreshBusiness();
        } finally {
            setRefreshing(false);
        }
    };

    const handleLogout = async () => {
        try {
            await authApi.signOut();
        } catch (error) {
            console.error('Logout error:', error);
        }
    };

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <View style={styles.content}>

                {/* Status Hero */}
                <View style={styles.heroSection}>
                    <Animated.View style={[styles.iconContainer, { transform: [{ scale: pulseAnim }] }]}>
                        <Clock size={48} color={Colors.primary} />
                    </Animated.View>
                    <Text style={styles.title}>Under Review</Text>
                    <Text style={styles.subtitle}>
                        We received your submission and our team is verifying your business details.
                    </Text>
                </View>

                {/* Progress Steps */}
                <View style={styles.stepsContainer}>
                    <View style={styles.stepItem}>
                        <CheckCircle2 size={20} color="#059669" />
                        <Text style={[styles.stepText, styles.stepCompleted]}>Request Submitted</Text>
                    </View>
                    <View style={styles.stepLine} />
                    <View style={styles.stepItem}>
                        <View style={styles.activeDot} />
                        <Text style={[styles.stepText, styles.stepActive]}>Verification in Progress</Text>
                    </View>
                    <View style={styles.stepLine} />
                    <View style={styles.stepItem}>
                        <View style={styles.inactiveDot} />
                        <Text style={styles.stepText}>Approval & Access</Text>
                    </View>
                </View>

                {/* Business Card */}
                {business && (
                    <View style={styles.card}>
                        <Text style={styles.cardHeader}>BUSINESS DETAILS</Text>

                        <View style={styles.cardRow}>
                            <Building2 size={20} color={Colors.text.secondary} />
                            <View>
                                <Text style={styles.cardLabel}>Business Name</Text>
                                <Text style={styles.cardValue}>{business.name}</Text>
                            </View>
                        </View>

                        <View style={styles.divider} />

                        <View style={styles.cardRow}>
                            <MapPin size={20} color={Colors.text.secondary} />
                            <View>
                                <Text style={styles.cardLabel}>Address</Text>
                                <Text style={styles.cardValue}>{business.address}</Text>
                            </View>
                        </View>

                        <View style={styles.divider} />

                        {business.submitted_at && (
                            <View style={styles.cardRow}>
                                <Calendar size={20} color={Colors.text.secondary} />
                                <View>
                                    <Text style={styles.cardLabel}>Submitted On</Text>
                                    <Text style={styles.cardValue}>
                                        {new Date(business.submitted_at).toLocaleDateString(undefined, {
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric'
                                        })}
                                    </Text>
                                </View>
                            </View>
                        )}
                    </View>
                )}

                {/* Actions */}
                <View style={styles.actions}>
                    <Button
                        title={refreshing ? 'Checking...' : 'Refresh Status'}
                        onPress={handleRefresh}
                        disabled={refreshing}
                        size="large"
                        icon={<RefreshCw size={20} color="#FFF" />}
                    />

                    <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
                        <LogOut size={20} color={Colors.text.secondary} />
                        <Text style={styles.logoutText}>Sign Out</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
        backgroundColor: '#F3F4F6',
        padding: 24,
    },
    content: {
        maxWidth: 500,
        width: '100%',
        alignSelf: 'center',
        paddingTop: 60,
        paddingBottom: 40,
    },
    heroSection: {
        alignItems: 'center',
        marginBottom: 40,
    },
    iconContainer: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: Colors.primary + '15', // 15% opacity primary
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 24,
    },
    title: {
        fontSize: 28,
        fontWeight: '800',
        color: Colors.text.primary,
        marginBottom: 12,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 16,
        color: Colors.text.secondary,
        textAlign: 'center',
        lineHeight: 24,
        paddingHorizontal: 20,
    },
    stepsContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 40,
        gap: 8,
    },
    stepItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    stepLine: {
        width: 20,
        height: 2,
        backgroundColor: '#E5E7EB',
    },
    stepText: {
        fontSize: 12,
        fontWeight: '600',
        color: Colors.text.secondary,
    },
    stepCompleted: {
        color: '#059669',
    },
    stepActive: {
        color: Colors.primary,
    },
    activeDot: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: Colors.primary,
    },
    inactiveDot: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: '#D1D5DB',
    },
    card: {
        backgroundColor: '#FFF',
        borderRadius: 16,
        padding: 24,
        marginBottom: 32,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 12,
        elevation: 3,
    },
    cardHeader: {
        fontSize: 12,
        fontWeight: '700',
        color: Colors.text.secondary,
        marginBottom: 20,
        letterSpacing: 1,
    },
    cardRow: {
        flexDirection: 'row',
        gap: 16,
        alignItems: 'center',
    },
    cardLabel: {
        fontSize: 12,
        color: Colors.text.secondary,
        marginBottom: 2,
    },
    cardValue: {
        fontSize: 16,
        fontWeight: '600',
        color: Colors.text.primary,
    },
    divider: {
        height: 1,
        backgroundColor: '#F3F4F6',
        marginVertical: 16,
        marginLeft: 36, // Align with text
    },
    actions: {
        gap: 16,
    },
    logoutButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        padding: 16,
    },
    logoutText: {
        fontSize: 16,
        fontWeight: '600',
        color: Colors.text.secondary,
    },
});
