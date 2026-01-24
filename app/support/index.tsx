import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { Search, ChevronDown, ChevronRight, FileText, Lock, Shield } from 'lucide-react-native';
import { useRouter } from 'expo-router';

// Mock FAQ Data
const FAQS = [
    {
        category: 'Orders',
        items: [
            { q: 'How do I cancel an order?', a: 'Go to the order details page and click the "Cancel Order" button at the bottom. You will be asked to provide a reason.' },
            { q: 'Can I edit an order after creating it?', a: 'Yes, tap the "Edit" (pencil) icon in the top right of the order details screen.' },
        ]
    },
    {
        category: 'Account & Billing',
        items: [
            { q: 'How do I change my business hours?', a: 'Go to Settings > Business Hours to update your weekly schedule.' },
            { q: 'Where can I see my invoices?', a: 'Invoices are emailed to your registered email address monthly. You can also contact support for history.' },
        ]
    }
];

export default function SupportScreen() {
    const router = useRouter();
    const [searchQuery, setSearchQuery] = useState('');
    const [expandedIndex, setExpandedIndex] = useState<string | null>(null);

    const toggleExpand = (id: string) => {
        setExpandedIndex(expandedIndex === id ? null : id);
    };

    const filteredFaqs = FAQS.map(cat => ({
        ...cat,
        items: cat.items.filter(item =>
            item.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.a.toLowerCase().includes(searchQuery.toLowerCase())
        )
    })).filter(cat => cat.items.length > 0);

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.content}>
            <View style={styles.searchContainer}>
                <Search size={20} color="#9CA3AF" style={styles.searchIcon} />
                <TextInput
                    style={styles.searchInput}
                    placeholder="Search help articles..."
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                />
            </View>

            <Text style={styles.sectionTitle}>Frequently Asked Questions</Text>

            {filteredFaqs.map((cat, catIdx) => (
                <View key={catIdx} style={styles.categoryContainer}>
                    <Text style={styles.categoryTitle}>{cat.category}</Text>
                    {cat.items.map((item, itemIdx) => {
                        const id = `${catIdx}-${itemIdx}`;
                        const isExpanded = expandedIndex === id;

                        return (
                            <TouchableOpacity
                                key={itemIdx}
                                style={styles.faqItem}
                                onPress={() => toggleExpand(id)}
                                activeOpacity={0.7}
                            >
                                <View style={styles.faqHeader}>
                                    <Text style={[styles.question, isExpanded && { color: '#3B82F6' }]}>{item.q}</Text>
                                    {isExpanded ? <ChevronDown size={20} color="#3B82F6" /> : <ChevronRight size={20} color="#9CA3AF" />}
                                </View>
                                {isExpanded && (
                                    <Text style={styles.answer}>{item.a}</Text>
                                )}
                            </TouchableOpacity>
                        );
                    })}
                </View>
            ))}

            <View style={styles.legalSection}>
                <Text style={styles.sectionTitle}>Legal</Text>
                <TouchableOpacity style={styles.legalItem} onPress={() => router.push('/support/privacy')}>
                    <Lock size={20} color="#6B7280" />
                    <Text style={styles.legalText}>Privacy Policy</Text>
                    <ChevronRight size={16} color="#D1D5DB" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.legalItem} onPress={() => router.push('/support/terms')}>
                    <FileText size={20} color="#6B7280" />
                    <Text style={styles.legalText}>Terms of Service</Text>
                    <ChevronRight size={16} color="#D1D5DB" />
                </TouchableOpacity>
            </View>

            <View style={styles.footer}>
                <Text style={styles.footerText}>Still need help?</Text>
                <TouchableOpacity style={styles.contactButton} onPress={() => router.push('/support/contact')}>
                    <Text style={styles.contactButtonText}>Contact Support</Text>
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F9FAFB',
    },
    content: {
        padding: 20,
        paddingBottom: 40,
        maxWidth: 800,
        alignSelf: 'center',
        width: '100%',
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        paddingHorizontal: 12,
        marginBottom: 24,
        height: 48,
    },
    searchIcon: {
        marginRight: 8,
    },
    searchInput: {
        flex: 1,
        fontSize: 16,
        color: '#111827',
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#111827',
        marginBottom: 16,
        marginTop: 8,
    },
    categoryContainer: {
        marginBottom: 24,
    },
    categoryTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: '#6B7280',
        marginBottom: 8,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    faqItem: {
        backgroundColor: '#FFFFFF',
        borderRadius: 8,
        marginBottom: 8,
        padding: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
    },
    faqHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    question: {
        fontSize: 16,
        fontWeight: '500',
        color: '#111827',
        flex: 1,
        marginRight: 16,
    },
    answer: {
        marginTop: 12,
        fontSize: 15,
        color: '#4B5563',
        lineHeight: 22,
    },
    legalSection: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 20,
        marginBottom: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
    },
    legalItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
        gap: 12,
    },
    legalText: {
        flex: 1,
        fontSize: 16,
        color: '#374151',
    },
    footer: {
        marginTop: 16,
        alignItems: 'center',
    },
    footerText: {
        fontSize: 16,
        color: '#6B7280',
        marginBottom: 12,
    },
    contactButton: {
        backgroundColor: '#3B82F6',
        paddingVertical: 12,
        paddingHorizontal: 32,
        borderRadius: 8,
    },
    contactButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
    },
});
