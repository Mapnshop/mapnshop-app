import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { Colors } from '@/constants/Colors';
import { Layout } from '@/constants/Layout';
import { ScreenContainer } from '@/components/ScreenContainer';

export default function ResetPasswordScreen() {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const { updatePassword } = useAuth();
    const router = useRouter();

    const handleUpdatePassword = async () => {
        if (!password || password.length < 6) {
            Alert.alert('Error', 'Password must be at least 6 characters');
            return;
        }
        if (password !== confirmPassword) {
            Alert.alert('Error', 'Passwords do not match');
            return;
        }

        setLoading(true);
        try {
            await updatePassword(password);
            Alert.alert('Success', 'Your password has been updated.', [
                { text: 'OK', onPress: () => router.replace('/(tabs)') }
            ]);
        } catch (error: any) {
            Alert.alert('Error', error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <ScreenContainer>
            <View style={styles.container}>
                <Text style={styles.title}>Set New Password</Text>
                <Text style={styles.subtitle}>Please enter your new password below.</Text>

                <View style={styles.form}>
                    <Input
                        label="New Password"
                        placeholder="••••••"
                        secureTextEntry
                        value={password}
                        onChangeText={setPassword}
                    />
                    <Input
                        label="Confirm Password"
                        placeholder="••••••"
                        secureTextEntry
                        value={confirmPassword}
                        onChangeText={setConfirmPassword}
                    />

                    <Button
                        title={loading ? "Updating..." : "Update Password"}
                        onPress={handleUpdatePassword}
                        disabled={loading}
                    />
                </View>
            </View>
        </ScreenContainer>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: Layout.spacing.lg,
        justifyContent: 'center',
        maxWidth: 400,
        alignSelf: 'center',
        width: '100%',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: Colors.text.primary,
        marginBottom: 8,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 16,
        color: Colors.text.secondary,
        marginBottom: 32,
        textAlign: 'center',
    },
    form: {
        gap: 16,
    },
});
