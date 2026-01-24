import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { useAuth } from '@/contexts/AuthContext';
import { Input } from '@/components/Input';
import { Button } from '@/components/Button';
import { router } from 'expo-router';

export default function AuthScreen() {
  const { signIn, signUp } = useAuth();
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
  });

  const handleSubmit = async () => {
    if (!formData.email.trim() || !formData.password.trim()) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (isSignUp && formData.password !== formData.confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      if (isSignUp) {
        await signUp(formData.email.trim(), formData.password);
        Alert.alert('Success', 'Account created successfully! Please check your email to verify your account.');
      } else {
        await signIn(formData.email.trim(), formData.password);
        // Navigation is handled by RootLayout
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.content}>
        <View style={styles.logoContainer}>
          <Image
            source={require('@/assets/images/mapnshop\'s_logo.png')}
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={styles.subtitle}>Local Commerce Operating System</Text>
        </View>

        <View style={styles.form}>
          <Input
            label="Email"
            value={formData.email}
            onChangeText={(text) => setFormData({ ...formData, email: text })}
            placeholder="Enter your email"
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <Input
            label="Password"
            value={formData.password}
            onChangeText={(text) => setFormData({ ...formData, password: text })}
            placeholder="Enter your password"
            secureTextEntry
          />

          {isSignUp && (
            <Input
              label="Confirm Password"
              value={formData.confirmPassword}
              onChangeText={(text) => setFormData({ ...formData, confirmPassword: text })}
              placeholder="Confirm your password"
              secureTextEntry
            />
          )}

          <Button
            title={loading ? 'Please wait...' : (isSignUp ? 'Create Account' : 'Sign In')}
            onPress={handleSubmit}
            disabled={loading}
            style={styles.submitButton}
          />

          <Button
            title={isSignUp ? 'Already have an account? Sign In' : 'Need an account? Sign Up'}
            onPress={() => setIsSignUp(!isSignUp)}
            variant="outline"
            style={styles.toggleButton}
          />
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    justifyContent: 'center', // Center vertically
  },
  content: {
    flex: 1,
    justifyContent: 'center', // Center vertically
    padding: 20,
    width: '100%',
    maxWidth: 480,
    alignSelf: 'center', // Center horizontally
    ...Platform.select({
      web: {
        flex: 0, // Don't expand on web
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 40,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        // elevation is ignored on web usually for shadows if shadow* props set, but good for native
      },
    }),
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logo: {
    width: 120,
    height: 120,
    marginBottom: 10,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
  },
  form: {
    gap: 0,
  },
  submitButton: {
    marginTop: 8,
  },
  toggleButton: {
    marginTop: 16,
  },
});