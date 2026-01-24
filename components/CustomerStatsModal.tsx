import React, { useEffect, useState } from 'react';
import { View, Text, Modal, StyleSheet, TouchableOpacity, ActivityIndicator, ScrollView } from 'react-native';
import { X, ShoppingBag, DollarSign, Calendar } from 'lucide-react-native';
import { customersApi } from '@/lib/api';
import { Order } from '@/types';

interface CustomerStatsModalProps {
    visible: boolean;
    businessId: string;
    customerPhone: string;
    customerName: string;
    onClose: () => void;
}

export const CustomerStatsModal = ({ visible, businessId, customerPhone, customerName, onClose }: CustomerStatsModalProps) => {
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState<{
        totalSpend: number;
        orderCount: number;
        lastOrders: Partial<Order>[];
    } | null>(null);

    useEffect(() => {
        if (visible && customerPhone) {
            loadStats();
        }
    }, [visible, customerPhone]);

    const loadStats = async () => {
        setLoading(true);
        try {
            const data = await customersApi.getStatsByPhone(businessId, customerPhone);
            setStats(data);
        } catch (error) {
            console.error('Failed to load customer stats', error);
        } finally {
            setLoading(false);
        }
    };

    if (!visible) return null;

    return (
        <Modal
            visible={visible}
            transparent={true}
            animationType="slide"
            onRequestClose={onClose}
        >
            <View style={styles.overlay}>
                <View style={styles.container}>
                    {/* Header */}
                    <View style={styles.header}>
                        <View>
                            <Text style={styles.title}>{customerName}</Text>
                            <Text style={styles.subtitle}>{customerPhone}</Text>
                        </View>
                        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                            <X size={24} color="#6B7280" />
                        </TouchableOpacity>
                    </View>

                    {loading ? (
                        <View style={styles.loadingContainer}>
                            <ActivityIndicator size="large" color="#3B82F6" />
                        </View>
                    ) : stats ? (
                        <ScrollView contentContainerStyle={styles.content}>
                            {/* Key Metrics */}
                            <View style={styles.metricsRow}>
                                <View style={styles.metricCard}>
                                    <View style={[styles.iconCircle, { backgroundColor: '#DBEAFE' }]}>
                                        <DollarSign size={20} color="#3B82F6" />
                                    </View>
                                    <Text style={styles.metricLabel}>Total Spend</Text>
                                    <Text style={styles.metricValue}>${stats.totalSpend.toFixed(2)}</Text>
                                </View>

                                <View style={styles.metricCard}>
                                    <View style={[styles.iconCircle, { backgroundColor: '#F3F4F6' }]}>
                                        <ShoppingBag size={20} color="#4B5563" />
                                    </View>
                                    <Text style={styles.metricLabel}>Orders</Text>
                                    <Text style={styles.metricValue}>{stats.orderCount}</Text>
                                </View>
                            </View>

                            {/* Recent History */}
                            <Text style={styles.sectionTitle}>Last 5 Orders</Text>
                            {stats.lastOrders.map((order, index) => (
                                <View key={index} style={styles.historyItem}>
                                    <View style={styles.historyLeft}>
                                        <Calendar size={14} color="#9CA3AF" style={{ marginRight: 6 }} />
                                        <Text style={styles.historyDate}>
                                            {new Date(order.created_at!).toLocaleDateString()}
                                        </Text>
                                    </View>
                                    <View style={styles.historyRight}>
                                        <Text style={styles.historyPrice}>${(order.total || order.price || 0).toFixed(2)}</Text>
                                        <View style={[
                                            styles.statusBadge,
                                            { backgroundColor: order.status === 'completed' ? '#D1FAE5' : '#F3F4F6' }
                                        ]}>
                                            <Text style={[
                                                styles.statusText,
                                                { color: order.status === 'completed' ? '#059669' : '#4B5563' }
                                            ]}>
                                                {order.status?.toUpperCase()}
                                            </Text>
                                        </View>
                                    </View>
                                </View>
                            ))}

                            {stats.lastOrders.length === 0 && (
                                <Text style={styles.emptyText}>No previous orders found.</Text>
                            )}

                        </ScrollView>
                    ) : (
                        <Text style={styles.errorText}>Could not load statistics.</Text>
                    )}
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    container: {
        backgroundColor: '#FFFFFF',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        height: '60%',
        padding: 20,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 20,
    },
    title: {
        fontSize: 22,
        fontWeight: '700',
        color: '#111827',
    },
    subtitle: {
        fontSize: 16,
        color: '#6B7280',
        marginTop: 2,
    },
    closeButton: {
        padding: 4,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    content: {
        paddingBottom: 40,
    },
    metricsRow: {
        flexDirection: 'row',
        gap: 16,
        marginBottom: 24,
    },
    metricCard: {
        flex: 1,
        backgroundColor: '#F9FAFB',
        borderRadius: 12,
        padding: 16,
        alignItems: 'center',
    },
    iconCircle: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8,
    },
    metricLabel: {
        fontSize: 14,
        color: '#6B7280',
        marginBottom: 4,
    },
    metricValue: {
        fontSize: 20,
        fontWeight: '700',
        color: '#111827',
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#111827',
        marginBottom: 12,
    },
    historyItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
    },
    historyLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    historyDate: {
        fontSize: 14,
        color: '#4B5563',
    },
    historyRight: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    historyPrice: {
        fontSize: 14,
        fontWeight: '600',
        color: '#111827',
    },
    statusBadge: {
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 4,
    },
    statusText: {
        fontSize: 11,
        fontWeight: '600',
    },
    emptyText: {
        color: '#9CA3AF',
        fontStyle: 'italic',
        textAlign: 'center',
        marginTop: 20,
    },
    errorText: {
        color: '#EF4444',
        textAlign: 'center',
        marginTop: 20,
    }
});
