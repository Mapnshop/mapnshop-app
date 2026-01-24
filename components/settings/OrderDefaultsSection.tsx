import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { ShoppingBag } from 'lucide-react-native';
import { Input } from '@/components/Input';
import { Button } from '@/components/Button';
import { SettingsSection } from './SettingsSection';
import { Business } from '@/types';

interface OrderDefaultsSectionProps {
    business: Business;
    formData: any;
    setFormData: (data: any) => void;
    editing: boolean;
    setEditing: (editing: boolean) => void;
    loading: boolean;
    onSave: () => void;
    onCancel: () => void;
}

export const OrderDefaultsSection = ({
    business,
    formData,
    setFormData,
    editing,
    setEditing,
    loading,
    onSave,
    onCancel,
}: OrderDefaultsSectionProps) => {
    return (
        <SettingsSection
            title="Order Defaults"
            icon={ShoppingBag}
            isEditing={editing}
            onEdit={() => setEditing(true)}
        >
            {editing ? (
                <View style={styles.form}>
                    <Text style={styles.helperText}>These values will be pre-filled when you create a new order.</Text>

                    <View style={styles.row}>
                        <Input
                            label="Delivery Fee ($)"
                            value={String(formData.default_delivery_fee)}
                            onChangeText={(text) => setFormData({ ...formData, default_delivery_fee: text })}
                            placeholder="0.00"
                            keyboardType="decimal-pad"
                            containerStyle={{ flex: 1 }}
                        />
                        <Input
                            label="Tax Rate (%)"
                            value={String(formData.default_tax_rate)}
                            onChangeText={(text) => setFormData({ ...formData, default_tax_rate: text })}
                            placeholder="0 (e.g. 10 for 10%)"
                            keyboardType="decimal-pad"
                            containerStyle={{ flex: 1 }}
                        />
                    </View>

                    {/* Future: Default Fulfillment & Source toggles */}

                    <View style={styles.buttonRow}>
                        <Button
                            title="Cancel"
                            onPress={onCancel}
                            variant="outline"
                            style={styles.halfButton}
                        />
                        <Button
                            title={loading ? 'Saving...' : 'Save'}
                            onPress={onSave}
                            disabled={loading}
                            style={styles.halfButton}
                        />
                    </View>
                </View>
            ) : (
                <View style={styles.infoContainer}>
                    <View style={styles.infoRow}>
                        <Text style={[styles.infoLabel, { minWidth: 100 }]}>Delivery Fee:</Text>
                        <Text style={styles.infoValue}>${Number(business.default_delivery_fee || 0).toFixed(2)}</Text>
                    </View>

                    <View style={styles.infoRow}>
                        <Text style={[styles.infoLabel, { minWidth: 100 }]}>Tax Rate:</Text>
                        <Text style={styles.infoValue}>{business.default_tax_rate || 0}%</Text>
                    </View>
                </View>
            )}
        </SettingsSection>
    );
};

const styles = StyleSheet.create({
    form: {
        gap: 0,
    },
    helperText: {
        fontSize: 14,
        color: '#6B7280',
        marginBottom: 16,
    },
    row: {
        flexDirection: 'row',
        gap: 12,
    },
    buttonRow: {
        flexDirection: 'row',
        gap: 12,
        marginTop: 8,
    },
    halfButton: {
        flex: 1,
    },
    infoContainer: {
        gap: 12,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    infoLabel: {
        fontSize: 14,
        color: '#6B7280',
        minWidth: 60,
    },
    infoValue: {
        flex: 1,
        fontSize: 14,
        color: '#111827',
    },
});
