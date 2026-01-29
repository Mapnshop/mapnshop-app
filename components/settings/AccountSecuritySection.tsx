import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import { Input } from '@/components/Input';
import { Button } from '@/components/Button';
import { Colors } from '@/constants/Colors';
import { Layout } from '@/constants/Layout';
import { Lock, Mail, Trash2, ChevronDown, ChevronUp } from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';

export function AccountSecuritySection() {
    const { user, updateEmail, updatePassword, deleteAccount } = useAuth();
    const [expanded, setExpanded] = useState(false);
    const [loading, setLoading] = useState(false);

    // Forms
    const [newEmail, setNewEmail] = useState('');
    const [newPassword, setNewPassword] = useState('');

    // Toggles for sub-sections
    const [showEmailForm, setShowEmailForm] = useState(false);
    const [showPasswordForm, setShowPasswordForm] = useState(false);

    const handleUpdateEmail = async () => {
        if (!newEmail.trim()) return;
        setLoading(true);
        try {
            await updateEmail(newEmail.trim());
            Alert.alert('Check your email', 'We sent a confirmation link to your new email address.');
            setNewEmail('');
            setShowEmailForm(false);
        } catch (error: any) {
            Alert.alert('Error', error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdatePassword = async () => {
        if (newPassword.length < 6) {
            Alert.alert('Error', 'Password must be at least 6 characters');
            return;
        }
        setLoading(true);
        try {
            await updatePassword(newPassword);
            Alert.alert('Success', 'Your password has been updated.');
            setNewPassword('');
            setShowPasswordForm(false);
        } catch (error: any) {
            Alert.alert('Error', error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteAccount = () => {
        Alert.alert(
            'Delete Account',
            'Are you sure? This action cannot be undone and will delete your business data locally.',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await deleteAccount();
                        } catch (e: any) {
                            Alert.alert('Error', e.message);
                        }
                    }
                }
            ]
        );
    };

    return (
        <View style={styles.section}>
            <TouchableOpacity
                style={styles.header}
                onPress={() => setExpanded(!expanded)}
                activeOpacity={0.7}
            >
                <View style={styles.headerTitle}>
                    <Lock size={20} color={Colors.primary} />
                    <Text style={styles.title}>Account Security</Text>
                </View>
                {expanded ? <ChevronUp size={20} color={Colors.text.secondary} /> : <ChevronDown size={20} color={Colors.text.secondary} />}
            </TouchableOpacity>

            {expanded && (
                <View style={styles.content}>
                    {/* Update Email */}
                    <View style={styles.row}>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.label}>Email Address</Text>
                            <Text style={styles.value}>{user?.email}</Text>
                        </View>
                        <Button
                            title="Change"
                            variant="ghost"
                            size="small"
                            onPress={() => {
                                setShowEmailForm(!showEmailForm);
                                setShowPasswordForm(false);
                            }}
                        />
                    </View>

                    {showEmailForm && (
                        <View style={styles.formContainer}>
                            <Input
                                label="New Email"
                                value={newEmail}
                                onChangeText={setNewEmail}
                                placeholder="new@example.com"
                                keyboardType="email-address"
                                autoCapitalize="none"
                            />
                            <Button
                                title="Update Email"
                                onPress={handleUpdateEmail}
                                loading={loading}
                                disabled={loading || !newEmail}
                            />
                        </View>
                    )}

                    <View style={styles.divider} />

                    {/* Update Password */}
                    <View style={styles.row}>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.label}>Password</Text>
                            <Text style={styles.value}>••••••••</Text>
                        </View>
                        <Button
                            title="Change"
                            variant="ghost"
                            size="small"
                            onPress={() => {
                                setShowPasswordForm(!showPasswordForm);
                                setShowEmailForm(false);
                            }}
                        />
                    </View>

                    {showPasswordForm && (
                        <View style={styles.formContainer}>
                            <Input
                                label="New Password"
                                value={newPassword}
                                onChangeText={setNewPassword}
                                placeholder="Enter new password"
                                secureTextEntry
                            />
                            <Button
                                title="Update Password"
                                onPress={handleUpdatePassword}
                                loading={loading}
                                disabled={loading || !newPassword}
                            />
                        </View>
                    )}

                    <View style={styles.divider} />

                    {/* Delete Account */}
                    <TouchableOpacity style={styles.deleteButton} onPress={handleDeleteAccount}>
                        <Trash2 size={20} color={Colors.status.error} />
                        <Text style={styles.deleteText}>Delete Account</Text>
                    </TouchableOpacity>
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    section: {
        marginHorizontal: 20,
        marginBottom: 20,
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
        overflow: 'hidden',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 20,
        backgroundColor: '#FFFFFF',
    },
    headerTitle: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    title: {
        fontSize: 18,
        fontWeight: '600',
        color: '#111827',
    },
    content: {
        padding: 20,
        paddingTop: 0,
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 12,
    },
    label: {
        fontSize: 14,
        color: '#6B7280',
        marginBottom: 4,
    },
    value: {
        fontSize: 16,
        color: '#111827',
        fontWeight: '500',
    },
    formContainer: {
        backgroundColor: '#F9FAFB',
        padding: 16,
        borderRadius: 8,
        marginBottom: 16,
    },
    divider: {
        height: 1,
        backgroundColor: '#E5E7EB',
        marginVertical: 8,
    },
    deleteButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        paddingVertical: 16,
        marginTop: 8,
    },
    deleteText: {
        color: Colors.status.error,
        fontSize: 16,
        fontWeight: '600',
    },
});
