import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, TextInput, Alert } from 'react-native';
import { router } from 'expo-router';
import { ArrowLeft, Mail, MessageSquare, Send } from 'lucide-react-native';
import { Colors } from '@/constants/Colors';
import { Layout } from '@/constants/Layout';

export default function ContactPage() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');

    const handleSubmit = () => {
        if (!name || !email || !message) {
            Alert.alert('Missing Information', 'Please fill in all fields.');
            return;
        }

        // In a real app, this would send to your backend
        Alert.alert(
            'Message Sent',
            'Thank you for contacting us. We\'ll get back to you soon!',
            [{ text: 'OK', onPress: () => router.back() }]
        );
    };

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <View style={styles.headerContent}>
                    <TouchableOpacity
                        style={styles.backButton}
                        onPress={() => router.back()}
                    >
                        <ArrowLeft size={20} color={Colors.text.secondary} />
                        <Text style={styles.backText}>Back</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.logo}
                        onPress={() => router.push('/landing')}
                    >
                        <Image
                            source={require('@/assets/images/mapnshop_logo.png')}
                            style={styles.logoImage}
                            resizeMode="contain"
                        />
                        <Text style={styles.logoText}>Mapnshop</Text>
                    </TouchableOpacity>
                </View>
            </View>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                <View style={styles.contentInner}>
                    <Text style={styles.title}>Contact Us</Text>
                    <Text style={styles.subtitle}>
                        Have questions about Mapnshop? We'd love to hear from you.
                    </Text>

                    {/* Contact Methods */}
                    <View style={styles.contactMethods}>
                        <View style={styles.contactMethod}>
                            <View style={styles.iconContainer}>
                                <Mail size={20} color={Colors.primary} />
                            </View>
                            <View>
                                <Text style={styles.methodTitle}>Email</Text>
                                <Text style={styles.methodValue}>hello@mapnshop.com</Text>
                            </View>
                        </View>

                        <View style={styles.contactMethod}>
                            <View style={styles.iconContainer}>
                                <MessageSquare size={20} color={Colors.primary} />
                            </View>
                            <View>
                                <Text style={styles.methodTitle}>Support</Text>
                                <Text style={styles.methodValue}>support@mapnshop.com</Text>
                            </View>
                        </View>
                    </View>

                    {/* Contact Form */}
                    <View style={styles.form}>
                        <Text style={styles.formTitle}>Send us a message</Text>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Name</Text>
                            <TextInput
                                style={styles.input}
                                value={name}
                                onChangeText={setName}
                                placeholder="Your name"
                                placeholderTextColor={Colors.text.placeholder}
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Email</Text>
                            <TextInput
                                style={styles.input}
                                value={email}
                                onChangeText={setEmail}
                                placeholder="your@email.com"
                                placeholderTextColor={Colors.text.placeholder}
                                keyboardType="email-address"
                                autoCapitalize="none"
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Message</Text>
                            <TextInput
                                style={[styles.input, styles.textArea]}
                                value={message}
                                onChangeText={setMessage}
                                placeholder="Tell us how we can help..."
                                placeholderTextColor={Colors.text.placeholder}
                                multiline
                                numberOfLines={6}
                                textAlignVertical="top"
                            />
                        </View>

                        <TouchableOpacity
                            style={styles.submitButton}
                            onPress={handleSubmit}
                        >
                            <Send size={18} color="#FFFFFF" />
                            <Text style={styles.submitButtonText}>Send Message</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Additional Info */}
                    <View style={styles.additionalInfo}>
                        <Text style={styles.infoTitle}>Early Access Inquiries</Text>
                        <Text style={styles.infoText}>
                            Interested in joining our pilot program? Please mention "Early Access" in your message, and tell us a bit about your business.
                        </Text>
                    </View>
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
    },
    header: {
        backgroundColor: '#FFFFFF',
        borderBottomWidth: 1,
        borderBottomColor: Colors.border,
        paddingVertical: Layout.spacing.md,
        paddingHorizontal: Layout.spacing.lg,
    },
    headerContent: {
        maxWidth: 800,
        alignSelf: 'center',
        width: '100%',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    backButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    backText: {
        fontSize: 15,
        color: Colors.text.secondary,
    },
    logo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    logoImage: {
        width: 24,
        height: 24,
    },
    logoText: {
        fontSize: 16,
        fontWeight: '600',
        color: Colors.text.primary,
    },
    content: {
        flex: 1,
    },
    contentInner: {
        maxWidth: 600,
        alignSelf: 'center',
        width: '100%',
        paddingHorizontal: Layout.spacing.lg,
        paddingVertical: Layout.spacing.xl * 2,
    },
    title: {
        fontSize: 36,
        fontWeight: '700',
        color: Colors.text.primary,
        marginBottom: Layout.spacing.sm,
    },
    subtitle: {
        fontSize: 17,
        color: Colors.text.secondary,
        lineHeight: 26,
        marginBottom: Layout.spacing.xl * 2,
    },
    contactMethods: {
        gap: Layout.spacing.lg,
        marginBottom: Layout.spacing.xl * 2,
    },
    contactMethod: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Layout.spacing.md,
        padding: Layout.spacing.lg,
        backgroundColor: Colors.surface,
        borderRadius: Layout.borderRadius.lg,
        borderWidth: 1,
        borderColor: Colors.border,
    },
    iconContainer: {
        width: 40,
        height: 40,
        backgroundColor: Colors.primary + '15',
        borderRadius: Layout.borderRadius.md,
        alignItems: 'center',
        justifyContent: 'center',
    },
    methodTitle: {
        fontSize: 14,
        color: Colors.text.placeholder,
        marginBottom: 2,
    },
    methodValue: {
        fontSize: 16,
        fontWeight: '500',
        color: Colors.text.primary,
    },
    form: {
        backgroundColor: '#FFFFFF',
        padding: Layout.spacing.xl,
        borderRadius: Layout.borderRadius.xl,
        borderWidth: 1,
        borderColor: Colors.border,
        marginBottom: Layout.spacing.xl * 2,
    },
    formTitle: {
        fontSize: 20,
        fontWeight: '600',
        color: Colors.text.primary,
        marginBottom: Layout.spacing.lg,
    },
    inputGroup: {
        marginBottom: Layout.spacing.lg,
    },
    label: {
        fontSize: 14,
        fontWeight: '500',
        color: Colors.text.primary,
        marginBottom: Layout.spacing.xs,
    },
    input: {
        backgroundColor: Colors.background,
        borderWidth: 1,
        borderColor: Colors.border,
        borderRadius: Layout.borderRadius.md,
        paddingHorizontal: Layout.spacing.md,
        paddingVertical: Layout.spacing.sm,
        fontSize: 16,
        color: Colors.text.primary,
    },
    textArea: {
        minHeight: 120,
        paddingTop: Layout.spacing.sm,
    },
    submitButton: {
        backgroundColor: Colors.primary,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        paddingVertical: Layout.spacing.md,
        borderRadius: Layout.borderRadius.md,
        marginTop: Layout.spacing.sm,
    },
    submitButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#FFFFFF',
    },
    additionalInfo: {
        padding: Layout.spacing.lg,
        backgroundColor: Colors.surface,
        borderRadius: Layout.borderRadius.lg,
        borderLeftWidth: 3,
        borderLeftColor: Colors.primary,
    },
    infoTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: Colors.text.primary,
        marginBottom: Layout.spacing.xs,
    },
    infoText: {
        fontSize: 15,
        color: Colors.text.secondary,
        lineHeight: 24,
    },
});
