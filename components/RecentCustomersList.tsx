import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image } from 'react-native';
import { Clock, User } from 'lucide-react-native';
import { customersApi } from '@/lib/api';
import { Customer } from '@/types';

interface RecentCustomersListProps {
    businessId: string;
    onSelect: (customer: Customer) => void;
}

export const RecentCustomersList = ({ businessId, onSelect }: RecentCustomersListProps) => {
    const [recent, setRecent] = useState<Customer[]>([]);

    useEffect(() => {
        loadRecent();
    }, [businessId]);

    const loadRecent = async () => {
        try {
            const data = await customersApi.listRecent(businessId, 8);
            setRecent(data);
        } catch (error) {
            console.log('Failed to load recent customers', error);
        }
    };

    if (recent.length === 0) return null;

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Clock size={14} color="#6B7280" />
                <Text style={styles.headerText}>Recent Customers</Text>
            </View>
            <FlatList
                data={recent}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.listContent}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                    <TouchableOpacity
                        style={styles.card}
                        onPress={() => onSelect(item)}
                    >
                        <View style={styles.avatar}>
                            <User size={16} color="#FFFFFF" />
                        </View>
                        <Text style={styles.name} numberOfLines={1}>{item.name}</Text>
                        <Text style={styles.phone} numberOfLines={1}>{item.phone}</Text>
                    </TouchableOpacity>
                )}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginBottom: 16,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
        gap: 6,
    },
    headerText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#6B7280',
        textTransform: 'uppercase',
    },
    listContent: {
        paddingRight: 16,
        gap: 12,
    },
    card: {
        width: 100,
        backgroundColor: '#FFFFFF',
        padding: 12,
        borderRadius: 12,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#E5E7EB',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
    },
    avatar: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#3B82F6',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8,
    },
    name: {
        fontSize: 13,
        fontWeight: '600',
        color: '#111827',
        marginBottom: 2,
        textAlign: 'center',
    },
    phone: {
        fontSize: 11,
        color: '#6B7280',
        textAlign: 'center',
    },
});
