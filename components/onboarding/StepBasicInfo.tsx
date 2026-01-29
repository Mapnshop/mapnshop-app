import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, useWindowDimensions } from 'react-native';
import { Input } from '@/components/Input';
import { Colors } from '@/constants/Colors';
import { Layout } from '@/constants/Layout';
import { ShoppingBag, Utensils, Briefcase, MoreHorizontal } from 'lucide-react-native';

interface StepBasicInfoProps {
    name: string;
    category: string;
    onChangeName: (text: string) => void;
    onChangeCategory: (cat: string) => void;
}

const CATEGORIES = [
    { id: 'retail', label: 'Retail', icon: ShoppingBag },
    { id: 'restaurant', label: 'Restaurant', icon: Utensils },
    { id: 'service', label: 'Service', icon: Briefcase },
    { id: 'other', label: 'Other', icon: MoreHorizontal },
] as const;

export function StepBasicInfo({ name, category, onChangeName, onChangeCategory }: StepBasicInfoProps) {
    const { width } = useWindowDimensions();
    const isSmallScreen = width < 380;

    return (
        <View>
            <Input
                label="Business Name *"
                value={name}
                onChangeText={onChangeName}
                placeholder="e.g. Joe's Market"
                autoCapitalize="words"
                containerStyle={{ marginBottom: Layout.spacing.lg }}
            />

            <View style={styles.inputGroup}>
                <Text style={styles.label}>Category *</Text>
                <Text style={styles.helperText}>Select the type that best describes your business.</Text>

                <View style={styles.categoryContainer}>
                    {CATEGORIES.map((cat) => {
                        const Icon = cat.icon;
                        const isActive = category === cat.id;
                        return (
                            <TouchableOpacity
                                key={cat.id}
                                style={[
                                    styles.categoryCard,
                                    isActive && styles.categoryCardActive,
                                    { width: isSmallScreen ? '100%' : '48%' } // 2 col grid
                                ]}
                                onPress={() => onChangeCategory(cat.id)}
                            >
                                <View style={[styles.iconContainer, isActive && styles.iconContainerActive]}>
                                    <Icon size={24} color={isActive ? '#FFFFFF' : Colors.primary} />
                                </View>
                                <Text
                                    style={[
                                        styles.categoryText,
                                        isActive && styles.categoryTextActive,
                                    ]}
                                >
                                    {cat.label}
                                </Text>
                            </TouchableOpacity>
                        );
                    })}
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    inputGroup: {
        marginBottom: Layout.spacing.md,
    },
    label: {
        fontSize: 16,
        fontWeight: '600',
        color: Colors.text.primary,
        marginBottom: 4,
    },
    helperText: {
        fontSize: 14,
        color: Colors.text.secondary,
        marginBottom: Layout.spacing.md,
    },
    categoryContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: Layout.spacing.md,
    },
    categoryCard: {
        padding: Layout.spacing.md,
        borderRadius: Layout.borderRadius.lg,
        borderWidth: 1,
        borderColor: Colors.border,
        backgroundColor: Colors.background,
        flexDirection: 'row',
        alignItems: 'center',
        gap: Layout.spacing.md,
        // Card shadow
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    categoryCardActive: {
        borderColor: Colors.primary,
        backgroundColor: '#EFF6FF', // Light blue tint
    },
    iconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#F3F4F6',
        justifyContent: 'center',
        alignItems: 'center',
    },
    iconContainerActive: {
        backgroundColor: Colors.primary,
    },
    categoryText: {
        fontSize: 16,
        fontWeight: '500',
        color: Colors.text.secondary,
    },
    categoryTextActive: {
        color: Colors.primary,
        fontWeight: '700',
    },
});
