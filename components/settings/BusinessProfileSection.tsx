import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Building, Phone, MapPin, Clock } from 'lucide-react-native';
import { Input } from '@/components/Input';
import { Button } from '@/components/Button';
import { AddressAutocomplete } from '@/components/AddressAutocomplete';
import { SettingsSection } from './SettingsSection';
import { Business } from '@/types';

interface BusinessProfileSectionProps {
    business: Business;
    formData: any;
    setFormData: (data: any) => void;
    editing: boolean;
    setEditing: (editing: boolean) => void;
    loading: boolean;
    onSave: () => void;
    onCancel: () => void;
}

export const BusinessProfileSection = ({
    business,
    formData,
    setFormData,
    editing,
    setEditing,
    loading,
    onSave,
    onCancel,
}: BusinessProfileSectionProps) => {
    return (
        <SettingsSection
            title="Business Information"
            icon={Building}
            isEditing={editing}
            onEdit={() => setEditing(true)}
        >
            {editing ? (
                <View style={styles.form}>
                    <Input
                        label="Business Name"
                        value={formData.name}
                        onChangeText={(text) => setFormData({ ...formData, name: text })}
                        placeholder="Enter business name"
                    />

                    <Input
                        label="Phone Number"
                        value={formData.phone}
                        onChangeText={(text) => setFormData({ ...formData, phone: text })}
                        placeholder="Enter phone number"
                        keyboardType="phone-pad"
                    />

                    <View style={{ zIndex: 100 }}>
                        <AddressAutocomplete
                            label="Address"
                            placeholder="Search business address"
                            defaultValue={formData.address}
                            onSelect={(data) => {
                                setFormData({
                                    ...formData,
                                    address: data.address,
                                    lat: data.lat,
                                    lng: data.lng,
                                });
                            }}
                        />
                    </View>

                    <View style={{ gap: 8, marginBottom: 16 }}>
                        <Text style={{ fontSize: 14, fontWeight: '500', color: '#374151' }}>Category</Text>
                        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                            {(['retail', 'restaurant', 'service', 'other'] as const).map((cat) => (
                                <TouchableOpacity
                                    key={cat}
                                    style={{
                                        paddingHorizontal: 12,
                                        paddingVertical: 6,
                                        borderRadius: 16,
                                        borderWidth: 1,
                                        borderColor: formData.category === cat ? '#3B82F6' : '#D1D5DB',
                                        backgroundColor: formData.category === cat ? '#EFF6FF' : '#FFFFFF',
                                    }}
                                    onPress={() => setFormData({ ...formData, category: cat })}
                                >
                                    <Text style={{
                                        fontSize: 12,
                                        color: formData.category === cat ? '#3B82F6' : '#4B5563',
                                        fontWeight: formData.category === cat ? '600' : '400'
                                    }}>
                                        {cat.charAt(0).toUpperCase() + cat.slice(1)}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>

                    <Input
                        label="Currency"
                        value={formData.currency || 'CAD'}
                        onChangeText={(text) => setFormData({ ...formData, currency: text })}
                        placeholder="e.g. CAD, USD"
                        autoCapitalize="characters"
                        maxLength={3}
                    />

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
                        <Building size={16} color="#6B7280" />
                        <Text style={styles.infoLabel}>Name:</Text>
                        <Text style={styles.infoValue}>{business.name}</Text>
                    </View>

                    <View style={styles.infoRow}>
                        <Phone size={16} color="#6B7280" />
                        <Text style={styles.infoLabel}>Phone:</Text>
                        <Text style={styles.infoValue}>{business.phone}</Text>
                    </View>

                    <View style={styles.infoRow}>
                        <MapPin size={16} color="#6B7280" />
                        <Text style={styles.infoLabel}>Address:</Text>
                        <Text style={styles.infoValue}>{business.address}</Text>
                    </View>

                    <View style={styles.infoRow}>
                        <Text style={[styles.infoLabel, { marginLeft: 24 }]}>Category:</Text>
                        <Text style={styles.infoValue}>{business.category || 'Other'}</Text>
                    </View>

                    <View style={styles.infoRow}>
                        <Text style={[styles.infoLabel, { marginLeft: 24 }]}>Currency:</Text>
                        <Text style={styles.infoValue}>{business.currency || 'CAD'}</Text>
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
