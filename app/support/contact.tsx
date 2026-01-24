import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { Mail, Phone, MapPin, Send } from 'lucide-react-native';
import { router } from 'expo-router';

export default function ContactSupportScreen() {
    const [subject, setSubject] = useState('');
    const [message, setMessage] = useState('');
    const [sending, setSending] = useState(false);

    const handleSend = async () => {
        if (!subject.trim() || !message.trim()) {
            Alert.alert('Error', 'Please fill in all fields');
            return;
        }

        setSending(true);
        // Simulate API call
        setTimeout(() => {
            setSending(false);
            Alert.alert('Success', 'Message sent! We will get back to you shortly.', [
                { text: 'OK', onPress: () => router.back() }
            ]);
        }, 1500);
    };

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.content}>
            <View style={styles.infoCard}>
                <Text style={styles.cardTitle}>Get in Touch</Text>
                <View style={styles.infoRow}>
                    <Mail size={20} color="#3B82F6" />
                    <Text style={styles.infoText}>support@mapnshop.co</Text>
                </View>
                <View style={styles.infoRow}>
                    <Phone size={20} color="#3B82F6" />
                    <Text style={styles.infoText}>+1 (917) 737-6596</Text>
                </View>
                <View style={styles.infoRow}>
                    <MapPin size={20} color="#3B82F6" />
                    <Text style={styles.infoText}>3-7919 rue de Bordeaux. Montreal, QC H2E2N4</Text>
                </View>
            </View>

            <View style={styles.formCard}>
                <Text style={styles.formTitle}>Send us a message</Text>

                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Subject</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="How can we help?"
                        value={subject}
                        onChangeText={setSubject}
                    />
                </View>

                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Message</Text>
                    <TextInput
                        style={[styles.input, styles.textArea]}
                        placeholder="Describe your issue..."
                        multiline
                        numberOfLines={5}
                        value={message}
                        onChangeText={setMessage}
                        textAlignVertical="top"
                    />
                </View>

                <TouchableOpacity
                    style={[styles.sendButton, sending && styles.disabledButton]}
                    onPress={handleSend}
                    disabled={sending}
                >
                    {sending ? <ActivityIndicator color="#FFF" /> : (
                        <>
                            <Send size={20} color="#FFF" />
                            <Text style={styles.sendButtonText}>Send Message</Text>
                        </>
                    )}
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
        padding: 24,
        maxWidth: 600,
        alignSelf: 'center',
        width: '100%',
    },
    infoCard: {
        backgroundColor: '#EFF6FF',
        padding: 20,
        borderRadius: 12,
        marginBottom: 24,
        borderWidth: 1,
        borderColor: '#DBEAFE',
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#1E40AF',
        marginBottom: 16,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        marginBottom: 12,
    },
    infoText: {
        fontSize: 16,
        color: '#1E3A8A',
    },
    formCard: {
        backgroundColor: '#FFFFFF',
        padding: 24,
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    formTitle: {
        fontSize: 20,
        fontWeight: '700',
        marginBottom: 24,
        color: '#111827',
    },
    inputGroup: {
        marginBottom: 20,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: '#374151',
        marginBottom: 8,
    },
    input: {
        borderWidth: 1,
        borderColor: '#D1D5DB',
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
        color: '#111827',
        backgroundColor: '#F9FAFB',
    },
    textArea: {
        minHeight: 120,
    },
    sendButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#3B82F6',
        padding: 16,
        borderRadius: 8,
        gap: 8,
    },
    disabledButton: {
        backgroundColor: '#93C5FD',
    },
    sendButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
    },
});
