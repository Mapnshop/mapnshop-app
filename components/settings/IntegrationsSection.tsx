import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, Alert, ActivityIndicator, Image, Platform, ScrollView } from 'react-native';
import { Share2, CheckCircle, AlertCircle, X, ExternalLink, RefreshCw } from 'lucide-react-native';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { SettingsSection } from './SettingsSection';
import { Colors } from '@/constants/Colors';
import { Layout } from '@/constants/Layout';

// Asset Imports
const UberLogo = require('../../assets/images/uber-eats-logo.png');
const DoorDashLogo = require('../../assets/images/doordash-logo.png');

interface Integration {
    id: string;
    provider: 'uber_eats' | 'doordash';
    status: 'connected' | 'disconnected' | 'error';
    external_store_id: string;
    last_sync_error?: string;
}

export const IntegrationsSection = () => {
    const [integrations, setIntegrations] = useState<Integration[]>([]);
    const [loading, setLoading] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedProvider, setSelectedProvider] = useState<'uber_eats' | 'doordash' | null>(null);

    // Logs State
    const [logsModalVisible, setLogsModalVisible] = useState(false);
    const [logs, setLogs] = useState<any[]>([]);
    const [loadingLogs, setLoadingLogs] = useState(false);

    // Form State
    const [storeId, setStoreId] = useState('');
    const [apiKey, setApiKey] = useState('');
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetchIntegrations();
    }, []);

    const fetchIntegrations = async () => {
        setLoading(true);
        const { data: businessData } = await supabase.from('businesses').select('id').single();
        if (!businessData) {
            setLoading(false);
            return;
        }

        // Use the secure PUBLIC VIEW, not the table
        const { data, error } = await supabase
            .from('integrations_public')
            .select('id, provider, status, external_store_id, last_error, last_sync_at, last_webhook_at')
            .eq('business_id', businessData.id);

        if (error) {
            console.error('Error fetching integrations:', error);
        } else {
            // Map to internal state (last_error -> last_sync_error for compat)
            setIntegrations(data?.map(d => ({ ...d, last_sync_error: d.last_error })) || []);
        }
        setLoading(false);
    };

    const fetchLogs = async () => {
        setLoadingLogs(true);
        const { data, error } = await supabase
            .from('order_events')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(20);

        if (data) setLogs(data);
        setLoadingLogs(false);
    };

    const handleOpenLogs = () => {
        setLogsModalVisible(true);
        fetchLogs();
    };

    const handleConnect = (provider: 'uber_eats' | 'doordash') => {
        const existing = integrations.find(i => i.provider === provider);
        setStoreId(existing?.external_store_id || '');
        setApiKey(''); // Never load existing secrets
        setSelectedProvider(provider);
        setModalVisible(true);
    };

    const handleSave = async () => {
        if (!selectedProvider || !storeId) {
            Alert.alert('Error', 'Store ID is required');
            return;
        }

        setSaving(true);
        try {
            const { data: businessData } = await supabase.from('businesses').select('id').single();
            if (!businessData) throw new Error("No business found");

            const { data, error } = await supabase.functions.invoke('connect-integration', {
                body: {
                    business_id: businessData.id,
                    provider: selectedProvider,
                    external_store_id: storeId,
                    api_key: apiKey
                }
            });

            if (error) throw error;
            if (data?.error) throw new Error(data.error);

            Alert.alert('Success', `${selectedProvider === 'uber_eats' ? 'Uber Eats' : 'DoorDash'} connected!`);
            setModalVisible(false);
            fetchIntegrations();
        } catch (err: any) {
            Alert.alert('Error', err.message);
        } finally {
            setSaving(false);
        }
    };

    const handleDisconnect = async (provider: 'uber_eats' | 'doordash') => {
        Alert.alert(
            'Disconnect',
            `Are you sure you want to disconnect ${provider === 'uber_eats' ? 'Uber Eats' : 'DoorDash'}? Orders will no longer sync.`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Disconnect',
                    style: 'destructive',
                    onPress: async () => {
                        const { data: businessData } = await supabase.from('businesses').select('id').single();
                        if (!businessData) return;

                        const { error } = await supabase.functions.invoke('disconnect-integration', {
                            body: {
                                business_id: businessData.id,
                                provider: provider
                            }
                        });

                        if (error) Alert.alert('Error', error.message);
                        else fetchIntegrations();
                    }
                }
            ]
        );
    };
    const renderIntegrationItem = (provider: 'uber_eats' | 'doordash', name: string, logo: any) => {
        const integration = integrations.find(i => i.provider === provider);
        const isConnected = integration?.status === 'connected';
        const isError = integration?.status === 'error';

        // DoorDash Coming Soon Logic
        if (provider === 'doordash') {
            return (
                <View style={[styles.item, { opacity: 0.6 }]}>
                    <View style={styles.itemContent}>
                        <View style={styles.logoWrapper}>
                            <Image source={logo} style={styles.logo} resizeMode="contain" />
                        </View>

                        <View style={styles.infoColumn}>
                            <Text style={styles.providerName}>{name}</Text>
                            <View style={styles.statusRow}>
                                <View style={[styles.statusBadge, { backgroundColor: '#F3F4F6' }]}>
                                    <Text style={[styles.statusTextDisconnected, { fontSize: 11, fontWeight: '600' }]}>Coming Soon</Text>
                                </View>
                            </View>
                        </View>

                        <View style={styles.actions}>
                            <View style={{ backgroundColor: '#F3F4F6', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 20 }}>
                                <Text style={{ fontSize: 12, color: '#6B7280', fontWeight: '600' }}>Soon</Text>
                            </View>
                        </View>
                    </View>
                </View>
            );
        }

        return (
            <View style={styles.item}>
                <View style={styles.itemContent}>
                    <View style={styles.logoWrapper}>
                        <Image source={logo} style={styles.logo} resizeMode="contain" />
                    </View>

                    <View style={styles.infoColumn}>
                        <Text style={styles.providerName}>{name}</Text>
                        <View style={styles.statusRow}>
                            {isConnected ? (
                                <View style={[styles.statusBadge, styles.statusConnected]}>
                                    <CheckCircle size={10} color="#059669" />
                                    <Text style={styles.statusTextConnected}>Connected</Text>
                                </View>
                            ) : isError ? (
                                <View style={[styles.statusBadge, styles.statusError]}>
                                    <AlertCircle size={10} color="#DC2626" />
                                    <Text style={styles.statusTextError}>Error</Text>
                                </View>
                            ) : (
                                <Text style={styles.statusTextDisconnected}>Not Connected</Text>
                            )}
                        </View>
                    </View>

                    <View style={styles.actions}>
                        {isConnected || isError ? (
                            <Button
                                title="Manage"
                                variant="outline"
                                size="small"
                                onPress={() => handleConnect(provider)}
                                style={styles.actionBtn}
                            />
                        ) : (
                            <Button
                                title="Connect"
                                variant="primary"
                                size="small"
                                onPress={() => handleConnect(provider)}
                                style={styles.actionBtn}
                            />
                        )}
                    </View>
                </View>

                {isError && integration.last_sync_error && (
                    <View style={styles.errorBox}>
                        <AlertCircle size={14} color={Colors.status.error} style={{ marginTop: 2 }} />
                        <Text style={styles.errorText}>{integration.last_sync_error}</Text>
                    </View>
                )}
            </View>
        );
    };

    return (
        <SettingsSection title="Integrations" icon={Share2}>
            <View style={styles.container}>
                {loading && integrations.length === 0 ? (
                    <View style={{ padding: 20 }}>
                        <ActivityIndicator />
                    </View>
                ) : (
                    <View style={styles.card}>
                        {renderIntegrationItem('uber_eats', 'Uber Eats', UberLogo)}
                        <View style={styles.divider} />
                        {/* Direct render for debugging if loop issue, but here we call function */}
                        {renderIntegrationItem('doordash', 'DoorDash', DoorDashLogo)}
                    </View>
                )}

                <TouchableOpacity onPress={handleOpenLogs} style={styles.viewLogsButton}>
                    <Text style={styles.viewLogsText}>View Integration Logs</Text>
                    <ExternalLink size={14} color={Colors.primary} />
                </TouchableOpacity>
            </View>

            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <View style={styles.modalTitleRow}>
                                <Image
                                    source={selectedProvider === 'uber_eats' ? UberLogo : DoorDashLogo}
                                    style={styles.modalLogo}
                                    resizeMode="contain"
                                />
                                <Text style={styles.modalTitle}>
                                    {selectedProvider === 'uber_eats' ? 'Connect Uber Eats' : 'Connect DoorDash'}
                                </Text>
                            </View>
                            <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.closeBtn}>
                                <X size={20} color={Colors.text.primary} />
                            </TouchableOpacity>
                        </View>

                        <Text style={styles.modalDescription}>
                            Enter your {selectedProvider === 'uber_eats' ? 'Uber Eats' : 'DoorDash'} merchant credentials to enable automatic order syncing.
                        </Text>

                        <View style={styles.form}>
                            <Input
                                label="Store ID"
                                placeholder="e.g. 1a2b3c4d"
                                value={storeId}
                                onChangeText={setStoreId}
                            />
                            <Input
                                label="API Key (Secret)"
                                placeholder="••••••••••••••••"
                                value={apiKey}
                                onChangeText={setApiKey}
                                secureTextEntry
                            />
                        </View>

                        <View style={styles.modalFooter}>
                            {integrations.find(i => i.provider === selectedProvider) ? (
                                <TouchableOpacity
                                    style={styles.disconnectButton}
                                    onPress={() => {
                                        setModalVisible(false);
                                        handleDisconnect(selectedProvider!);
                                    }}
                                >
                                    <Text style={styles.disconnectText}>Disconnect Integration</Text>
                                </TouchableOpacity>
                            ) : <View style={{ flex: 1 }} />}

                            <View style={styles.footerButtons}>
                                <Button
                                    title="Cancel"
                                    variant="ghost"
                                    onPress={() => setModalVisible(false)}
                                />
                                <Button
                                    title={saving ? "Saving..." : "Save"}
                                    onPress={handleSave}
                                    disabled={saving}
                                    style={{ minWidth: 100 }}
                                />
                            </View>
                        </View>
                    </View>
                </View>
            </Modal>
        </SettingsSection>
    );
};

const styles = StyleSheet.create({
    container: {
        gap: 16,
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        overflow: 'hidden',
    },
    item: {
    },
    itemContent: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        gap: 12,
    },
    divider: {
        height: 1,
        backgroundColor: '#E5E7EB',
        marginLeft: 60,
    },
    logoWrapper: {
        width: 44,
        height: 44,
        borderRadius: 8,
        backgroundColor: '#F9FAFB',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: '#F3F4F6',
        padding: 2,
    },
    logo: {
        width: '100%',
        height: '100%',
    },
    infoColumn: {
        flex: 1,
        gap: 2,
    },
    providerName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#111827',
    },
    statusRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 99,
    },
    statusConnected: {
        backgroundColor: '#ECFDF5',
    },
    statusError: {
        backgroundColor: '#FEF2F2',
    },
    statusTextConnected: {
        fontSize: 12,
        fontWeight: '500',
        color: '#059669',
    },
    statusTextError: {
        fontSize: 12,
        fontWeight: '500',
        color: '#DC2626',
    },
    statusTextDisconnected: {
        fontSize: 13,
        color: '#6B7280',
    },
    actions: {
        flexDirection: 'row',
    },
    actionBtn: {
        minHeight: 32,
        paddingVertical: 4,
    },
    errorBox: {
        flexDirection: 'row',
        gap: 8,
        backgroundColor: '#FEF2F2',
        padding: 12,
        marginHorizontal: 12,
        marginBottom: 12,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#FECACA',
    },
    errorText: {
        fontSize: 13,
        color: '#B91C1C',
        flex: 1,
        lineHeight: 18,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.6)',
        justifyContent: 'center',
        padding: 24,
    },
    modalContent: {
        backgroundColor: '#FFF',
        borderRadius: 20,
        padding: 24,
        gap: 24,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 20,
        elevation: 20,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    modalTitleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    modalLogo: {
        width: 32,
        height: 32,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#111827',
    },
    closeBtn: {
        padding: 4,
    },
    modalDescription: {
        fontSize: 15,
        color: '#4B5563',
        lineHeight: 22,
    },
    form: {
        gap: 16,
    },
    modalFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 8,
    },
    disconnectButton: {
        paddingVertical: 10,
        paddingRight: 12,
    },
    disconnectText: {
        color: '#DC2626',
        fontWeight: '600',
        fontSize: 14,
    },
    footerButtons: {
        flexDirection: 'row',
        gap: 12,
        marginLeft: 'auto',
    },
    viewLogsButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        padding: 12,
        marginTop: 8,
    },
    viewLogsText: {
        color: Colors.primary,
        fontWeight: '600',
        fontSize: 14,
    },
    logItem: {
        padding: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
    },
    logEvent: {
        fontWeight: '700',
        fontSize: 12,
    },
    logTime: {
        fontSize: 12,
        color: '#9CA3AF',
    },
    logOrderId: {
        fontSize: 12,
        color: '#4B5563',
        marginTop: 2,
    },
    logMessage: {
        fontSize: 11,
        color: '#6B7280',
        fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
        marginTop: 4,
    },
});
