import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, FlatList, Platform } from 'react-native';
import { Input } from '@/components/Input';
import { Colors } from '@/constants/Colors';
import { Layout } from '@/constants/Layout';
import { ChevronDown } from 'lucide-react-native';
import { COUNTRY_CODES, CountryCodeItem } from '@/constants/CountryCodes';

interface StepContactProps {
    phone: string;
    openingHours: string;
    countryCode: CountryCodeItem;
    onChangePhone: (text: string) => void;
    onChangeHours: (text: string) => void;
    onChangeCountryCode: (code: CountryCodeItem) => void;
}

export function StepContact({
    phone,
    openingHours,
    countryCode,
    onChangePhone,
    onChangeHours,
    onChangeCountryCode
}: StepContactProps) {
    const [showPicker, setShowPicker] = useState(false);

    return (
        <View>
            <View style={styles.inputGroup}>
                <Text style={styles.label}>Phone Number *</Text>
                <View style={{ flexDirection: 'row', gap: Layout.spacing.sm }}>
                    <TouchableOpacity
                        style={styles.countryButton}
                        onPress={() => setShowPicker(true)}
                    >
                        <Text style={{ fontSize: 20 }}>{countryCode.flag}</Text>
                        <Text style={styles.countryCodeText}>{countryCode.dial_code}</Text>
                        <ChevronDown size={14} color={Colors.text.secondary} />
                    </TouchableOpacity>

                    <View style={{ flex: 1 }}>
                        <Input
                            containerStyle={{ marginBottom: 0 }}
                            value={phone}
                            onChangeText={onChangePhone}
                            placeholder="Mobile number"
                            keyboardType="phone-pad"
                        />
                    </View>
                </View>
            </View>

            <Input
                label="Opening Hours"
                value={openingHours}
                onChangeText={onChangeHours}
                placeholder="e.g. Mon-Fri 9AM - 6PM"
            />

            <Modal
                visible={showPicker}
                transparent={true}
                animationType="slide"
                onRequestClose={() => setShowPicker(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Select Country</Text>
                            <TouchableOpacity onPress={() => setShowPicker(false)}>
                                <Text style={styles.closeButtonText}>Close</Text>
                            </TouchableOpacity>
                        </View>
                        <FlatList
                            data={COUNTRY_CODES}
                            keyExtractor={(item) => item.code}
                            renderItem={({ item }) => (
                                <TouchableOpacity
                                    style={styles.countryItem}
                                    onPress={() => {
                                        onChangeCountryCode(item);
                                        setShowPicker(false);
                                    }}
                                >
                                    <Text style={{ fontSize: 24, marginRight: 12 }}>{item.flag}</Text>
                                    <Text style={styles.countryName}>{item.name}</Text>
                                    <Text style={styles.countryDialCode}>{item.dial_code}</Text>
                                </TouchableOpacity>
                            )}
                        />
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    inputGroup: {
        marginBottom: Layout.spacing.md,
    },
    label: {
        fontSize: 14,
        fontWeight: '500',
        color: Colors.text.primary,
        marginBottom: Layout.spacing.xs,
    },
    countryButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingHorizontal: Layout.spacing.md,
        height: 48, // Match input height
        borderWidth: 1,
        borderColor: Colors.border,
        borderRadius: Layout.borderRadius.md,
        backgroundColor: Colors.background,
    },
    countryCodeText: {
        fontSize: 16,
        color: Colors.text.primary,
        fontWeight: '500',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.4)',
        justifyContent: Platform.OS === 'web' ? 'center' : 'flex-end',
        alignItems: Platform.OS === 'web' ? 'center' : undefined,
    },
    modalContent: {
        backgroundColor: Colors.background,
        ...Platform.select({
            web: {
                width: '100%',
                maxWidth: 400,
                height: '80%',
                maxHeight: 600,
                borderRadius: Layout.borderRadius.lg,
            },
            default: {
                borderTopLeftRadius: Layout.borderRadius.xl,
                borderTopRightRadius: Layout.borderRadius.xl,
                maxHeight: '80%',
            }
        }),
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 5,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: Layout.spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: Colors.border,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: Colors.text.primary,
    },
    closeButtonText: {
        fontSize: 16,
        color: Colors.status.info,
        fontWeight: '600',
    },
    countryItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: Layout.spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: Colors.surface,
    },
    countryName: {
        flex: 1,
        fontSize: 16,
        color: Colors.text.primary,
    },
    countryDialCode: {
        fontSize: 16,
        color: Colors.text.secondary,
        fontWeight: '500',
    },
});
