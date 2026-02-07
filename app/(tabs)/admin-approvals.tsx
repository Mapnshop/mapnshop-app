import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, ActivityIndicator, TextInput, Modal } from 'react-native';
import { ScreenContainer } from '@/components/ScreenContainer';
import { adminApi, profileApi } from '@/lib/api';
import { Business } from '@/types';
import { Colors } from '@/constants/Colors';
import { Layout } from '@/constants/Layout';
import { Check, X, RefreshCw } from 'lucide-react-native';
import { Button } from '@/components/Button';

export default function AdminApprovalsScreen() {
    const [pendingBusinesses, setPendingBusinesses] = useState<Business[]>([]);
    const [loading, setLoading] = useState(true);
    const [isAdmin, setIsAdmin] = useState(false);
    const [rejectModalVisible, setRejectModalVisible] = useState(false);
    const [selectedBusiness, setSelectedBusiness] = useState<Business | null>(null);
    const [rejectionReason, setRejectionReason] = useState('');
    const [actionLoading, setActionLoading] = useState(false);

    useEffect(() => {
        checkAdminAndLoadData();
    }, []);

    const checkAdminAndLoadData = async () => {
        setLoading(true);
        try {
            const adminStatus = await profileApi.isAdmin();
            setIsAdmin(adminStatus);

            if (adminStatus) {
                await loadPendingBusinesses();
            }
        } catch (error) {
            console.error('Error checking admin status:', error);
        } finally {
            setLoading(false);
        }
    };

    const loadPendingBusinesses = async () => {
        try {
            const businesses = await adminApi.listPendingBusinesses();
            setPendingBusinesses(businesses);
        } catch (error: any) {
            console.error('Error loading pending businesses:', error);
            Alert.alert('Error', error.message || 'Failed to load pending businesses');
        }
    };

    const handleApprove = async (business: Business) => {
        Alert.alert(
            'Approve Business',
            `Are you sure you want to approve "${business.name}"?`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Approve',
                    style: 'default',
                    onPress: async () => {
                        setActionLoading(true);
                        try {
                            await adminApi.approveBusiness(business.id);
                            Alert.alert('Success', `${business.name} has been approved!`);
                            await loadPendingBusinesses();
                        } catch (error: any) {
                            Alert.alert('Error', error.message || 'Failed to approve business');
                        } finally {
                            setActionLoading(false);
                        }
                    },
                },
            ]
        );
    };

    const handleRejectPress = (business: Business) => {
        setSelectedBusiness(business);
        setRejectionReason('');
        setRejectModalVisible(true);
    };

    const handleRejectSubmit = async () => {
        if (!rejectionReason.trim()) {
            Alert.alert('Required', 'Please enter a rejection reason');
            return;
        }

        if (!selectedBusiness) return;

        setActionLoading(true);
        try {
            await adminApi.rejectBusiness(selectedBusiness.id, rejectionReason.trim());
            Alert.alert('Success', `${selectedBusiness.name} has been rejected`);
            setRejectModalVisible(false);
            setSelectedBusiness(null);
            setRejectionReason('');
            await loadPendingBusinesses();
        } catch (error: any) {
            Alert.alert('Error', error.message || 'Failed to reject business');
        } finally {
            setActionLoading(false);
        }
    };

    const renderBusinessItem = ({ item }: { item: Business }) => (
        <View style={styles.businessCard}>
            <View style={styles.businessHeader}>
                <Text style={styles.businessName}>{item.name}</Text>
                <Text style={styles.businessCategory}>{item.category}</Text>
            </View>

            <View style={styles.businessDetails}>
                <Text style={styles.detailLabel}>Address</Text>
                <Text style={styles.detailValue}>{item.address}</Text>

                <Text style={styles.detailLabel}>Phone</Text>
                <Text style={styles.detailValue}>{item.phone}</Text>

                {item.submitted_at && (
                    <>
                        <Text style={styles.detailLabel}>Submitted</Text>
                        <Text style={styles.detailValue}>
                            {new Date(item.submitted_at).toLocaleString()}
                        </Text>
                    </>
                )}
            </View>

            <View style={styles.actions}>
                <TouchableOpacity
                    style={[styles.actionButton, styles.approveButton]}
                    onPress={() => handleApprove(item)}
                    disabled={actionLoading}
                >
                    <Check size={20} color="#fff" />
                    <Text style={styles.approveButtonText}>Approve</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.actionButton, styles.rejectButton]}
                    onPress={() => handleRejectPress(item)}
                    disabled={actionLoading}
                >
                    <X size={20} color="#fff" />
                    <Text style={styles.rejectButtonText}>Reject</Text>
                </TouchableOpacity>
            </View>
        </View>
    );

    if (loading) {
        return (
            <ScreenContainer>
                <View style={styles.centerContainer}>
                    <ActivityIndicator size="large" color={Colors.primary} />
                    <Text style={styles.loadingText}>Loading...</Text>
                </View>
            </ScreenContainer>
        );
    }

    if (!isAdmin) {
        return (
            <ScreenContainer>
                <View style={styles.centerContainer}>
                    <Text style={styles.errorTitle}>Access Denied</Text>
                    <Text style={styles.errorText}>You do not have admin permissions.</Text>
                </View>
            </ScreenContainer>
        );
    }

    return (
        <ScreenContainer>
            <View style={styles.header}>
                <View>
                    <Text style={styles.title}>Business Approvals</Text>
                    <Text style={styles.subtitle}>
                        {pendingBusinesses.length} pending verification{pendingBusinesses.length !== 1 ? 's' : ''}
                    </Text>
                </View>
                <TouchableOpacity onPress={loadPendingBusinesses} style={styles.refreshButton}>
                    <RefreshCw size={20} color={Colors.primary} />
                </TouchableOpacity>
            </View>

            {pendingBusinesses.length === 0 ? (
                <View style={styles.emptyContainer}>
                    <Text style={styles.emptyText}>✅ No pending approvals</Text>
                    <Text style={styles.emptySubtext}>All businesses have been reviewed</Text>
                </View>
            ) : (
                <FlatList
                    data={pendingBusinesses}
                    renderItem={renderBusinessItem}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={styles.listContainer}
                />
            )}

            {/* Reject Modal */}
            <Modal
                visible={rejectModalVisible}
                transparent
                animationType="fade"
                onRequestClose={() => setRejectModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Reject Business</Text>
                        <Text style={styles.modalSubtitle}>
                            Please provide a reason for rejecting "{selectedBusiness?.name}"
                        </Text>

                        <TextInput
                            style={styles.textInput}
                            placeholder="e.g., Please provide a valid business license"
                            value={rejectionReason}
                            onChangeText={setRejectionReason}
                            multiline
                            numberOfLines={4}
                            textAlignVertical="top"
                        />

                        <View style={styles.modalActions}>
                            <Button
                                title="Cancel"
                                onPress={() => setRejectModalVisible(false)}
                                variant="outline"
                                size="medium"
                            />
                            <Button
                                title={actionLoading ? 'Rejecting...' : 'Reject'}
                                onPress={handleRejectSubmit}
                                loading={actionLoading}
                                size="medium"
                            />
                        </View>
                    </View>
                </View>
            </Modal>
        </ScreenContainer>
    );
}

const styles = StyleSheet.create({
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: Layout.spacing.lg,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: Colors.text.primary,
    },
    subtitle: {
        fontSize: 14,
        color: Colors.text.secondary,
        marginTop: 4,
    },
    refreshButton: {
        padding: 8,
    },
    listContainer: {
        gap: Layout.spacing.md,
        paddingBottom: Layout.spacing.xl,
    },
    businessCard: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        borderWidth: 1,
        borderColor: Colors.border,
    },
    businessHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    businessName: {
        fontSize: 18,
        fontWeight: '700',
        color: Colors.text.primary,
        flex: 1,
    },
    businessCategory: {
        fontSize: 12,
        fontWeight: '600',
        color: Colors.primary,
        backgroundColor: Colors.primary + '15',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
        textTransform: 'capitalize',
    },
    businessDetails: {
        gap: 8,
        marginBottom: 16,
    },
    detailLabel: {
        fontSize: 12,
        fontWeight: '600',
        color: Colors.text.secondary,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    detailValue: {
        fontSize: 14,
        color: Colors.text.primary,
        marginBottom: 8,
    },
    actions: {
        flexDirection: 'row',
        gap: 12,
    },
    actionButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        paddingVertical: 12,
        borderRadius: 8,
    },
    approveButton: {
        backgroundColor: '#059669',
    },
    approveButtonText: {
        color: '#fff',
        fontWeight: '600',
        fontSize: 15,
    },
    rejectButton: {
        backgroundColor: '#DC2626',
    },
    rejectButtonText: {
        color: '#fff',
        fontWeight: '600',
        fontSize: 15,
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    loadingText: {
        marginTop: 12,
        fontSize: 16,
        color: Colors.text.secondary,
    },
    errorTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: Colors.text.primary,
        marginBottom: 8,
    },
    errorText: {
        fontSize: 16,
        color: Colors.text.secondary,
        textAlign: 'center',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 40,
    },
    emptyText: {
        fontSize: 20,
        fontWeight: '600',
        color: Colors.text.primary,
        marginBottom: 8,
    },
    emptySubtext: {
        fontSize: 14,
        color: Colors.text.secondary,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    modalContent: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 24,
        width: '100%',
        maxWidth: 500,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: Colors.text.primary,
        marginBottom: 8,
    },
    modalSubtitle: {
        fontSize: 14,
        color: Colors.text.secondary,
        marginBottom: 16,
    },
    textInput: {
        borderWidth: 1,
        borderColor: Colors.border,
        borderRadius: 8,
        padding: 12,
        fontSize: 14,
        minHeight: 100,
        marginBottom: 20,
    },
    modalActions: {
        flexDirection: 'row',
        gap: 12,
    },
});
