import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, KeyboardAvoidingView, Platform, Animated } from 'react-native';
import { useAuth } from '@/contexts/AuthContext';
import { Input } from '@/components/Input';
import { Button } from '@/components/Button';
import { router } from 'expo-router';

export default function AuthScreen() {
  const { signIn, signUp } = useAuth();
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
  });

  // Clear error when switching modes
  useEffect(() => {
    setError(null);
  }, [isSignUp]);

  const handleSubmit = async () => {
    setError(null);

    // Basic Validation
    if (!formData.email.trim() || !formData.password.trim()) {
      setError('Please fill in all fields');
      return;
    }

    if (isSignUp && formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      if (isSignUp) {
        await signUp(formData.email.trim(), formData.password);
        // On web/mobile, show success message or redirect logic
        // For polished UX, we might want to auto-login or show a distinct success view
        // But for now, let's just clear form or show success message inline
        setError(null);
        alert('Account created! Please verify your email.'); // Keep native alert for success only
      } else {
        await signIn(formData.email.trim(), formData.password);
      }
    } catch (err: any) {
      // Improve error messages
      console.log('Auth error:', err);
      let msg = err.message || 'Authentication failed';

      if (msg.includes('Invalid login credentials')) msg = 'Invalid email or password';
      if (msg.includes('weak_password')) msg = 'Password is too weak. Use at least 6 characters.';
      if (msg.includes('User already registered')) msg = 'This email is already registered. Try signing in.';

      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.centerContent}>
        <View style={styles.card}>
          <View style={styles.header}>
            <Image
              source={require('@/assets/images/mapnshop\'s_logo.png')}
              style={styles.logo}
              resizeMode="contain"
            />
            <Text style={styles.title}>{isSignUp ? 'Create Account' : 'Welcome Back'}</Text>
            <Text style={styles.subtitle}>
              {isSignUp
                ? 'Join to start managing your local business'
                : 'Sign in to your dashboard'}
            </Text>
          </View>

          {error && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          <View style={styles.form}>
            <Input
              label="Email Address"
              value={formData.email}
              onChangeText={(text) => {
                setFormData({ ...formData, email: text });
                if (error) setError(null);
              }}
              placeholder="name@company.com"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />

            <Input
              label="Password"
              value={formData.password}
              onChangeText={(text) => {
                setFormData({ ...formData, password: text });
                if (error) setError(null);
              }}
              placeholder="••••••••"
              secureTextEntry
            />

            {isSignUp && (
              <Input
                label="Confirm Password"
                value={formData.confirmPassword}
                onChangeText={(text) => {
                  setFormData({ ...formData, confirmPassword: text });
                  if (error) setError(null);
                }}
                placeholder="••••••••"
                secureTextEntry
              />
            )}

            <Button
              title={isSignUp ? 'Create Account' : 'Sign In'}
              onPress={handleSubmit}
              loading={loading}
              style={styles.submitButton}
              size="large"
            />

            <View style={styles.footer}>
              <Text style={styles.footerText}>
                {isSignUp ? 'Already have an account?' : 'Don\'t have an account?'}
              </Text>
              <Button
                title={isSignUp ? 'Sign In' : 'Sign Up'}
                onPress={() => setIsSignUp(!isSignUp)}
                variant="outline"
                size="small"
                style={styles.toggleButton}
              />
            </View>
          </View>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6', // Lighter background for better contrast
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  card: {
    width: '100%',
    maxWidth: 440,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 32,
    // Polished shadow for web/iOS
    ...Platform.select({
      web: {
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
      },
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  logo: {
    width: 80,
    height: 80,
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
  },
  form: {
    gap: 16,
  },
  errorContainer: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FAC7C7',
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
  },
  errorText: {
    color: '#B91C1C',
    fontSize: 14,
    textAlign: 'center',
  },
  submitButton: {
    marginTop: 8,
  },
  footer: {
    marginTop: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  footerText: {
    color: '#6B7280',
    fontSize: 14,
  },
  toggleButton: {
    borderColor: 'transparent',
  }
});