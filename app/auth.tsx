import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, Platform, TouchableOpacity, Modal, Alert } from 'react-native';
import { useAuth } from '@/contexts/AuthContext';
import { Input } from '@/components/Input';
import { Button } from '@/components/Button';
import { ScreenContainer } from '@/components/ScreenContainer';
import { Colors } from '@/constants/Colors';
import { Layout } from '@/constants/Layout';
import { X } from 'lucide-react-native';

export default function AuthScreen() {
  const { signIn, signUp, resetPassword, user } = useAuth();
  const [activeTab, setActiveTab] = useState<'signin' | 'signup'>('signin');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Password Reset State
  const [showResetModal, setShowResetModal] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetLoading, setResetLoading] = useState(false);

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
  });

  // Clear error and reset form when switching tabs
  useEffect(() => {
    setError(null);
    setFormData({
      email: '',
      password: '',
      confirmPassword: '',
    });
  }, [activeTab]);

  const handleSubmit = async () => {
    setError(null);

    // Basic Validation
    if (!formData.email.trim() || !formData.password.trim()) {
      setError('Please fill in all fields');
      return;
    }

    if (activeTab === 'signup' && formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      if (activeTab === 'signup') {
        await signUp(formData.email.trim(), formData.password);
        setError(null);
        alert('Account created! Please verify your email.');
        setActiveTab('signin');
      } else {
        await signIn(formData.email.trim(), formData.password);
      }
    } catch (err: any) {
      console.log('Auth error:', err);
      let msg = err.message || 'Authentication failed';

      // Improve error messages
      if (msg.includes('Invalid login credentials')) msg = 'Invalid email or password.';
      if (msg.includes('weak_password')) msg = 'Password is too weak. Use at least 6 characters.';
      if (msg.includes('User already registered')) msg = 'This email is already registered. Please sign in instead.';

      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!resetEmail.trim()) {
      Alert.alert('Required', 'Please enter your email address.');
      return;
    }

    setResetLoading(true);
    try {
      await resetPassword(resetEmail.trim());
      setShowResetModal(false);
      setResetEmail('');
      Alert.alert('Success', 'Password reset instructions have been sent to your email.');
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to send reset email.');
    } finally {
      setResetLoading(false);
    }
  };

  const handleResendVerification = async () => {
    if (!formData.email.trim()) {
      Alert.alert('Required', 'Please enter your email address to resend verification.');
      return;
    }

    setResending(true);
    try {
      // Using direct import to avoid modifying context for now, or assume it's in authApi which context uses?
      // Actually comp imported useAuth, let's see if we should add it there or just use api directly.
      // To keep it clean, let's use the api directly here or add to context.
      // Since context wraps api, let's just import api here for this specific action to avoid touching context if not needed,
      // OR better, since we can't easily change context in this flow without seeing it, let's use the api directly import.
      // Wait, I don't have authApi imported in this file.
      // Let's import authApi.
      const { authApi } = require('@/lib/api');
      await authApi.resendVerificationEmail(formData.email.trim());
      Alert.alert('Success', 'Verification email sent! Please check your inbox.');
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to resend verification email.');
    } finally {
      setResending(false);
    }
  };

  return (
    <ScreenContainer scrollable>
      <View style={styles.header}>
        <Image
          source={require('@/assets/images/mapnshop_logo.png')}
          style={styles.logo}
          resizeMode="contain"
        />
      </View>

      <View style={styles.card}>
        {/* Tabs */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'signin' && styles.activeTab]}
            onPress={() => setActiveTab('signin')}
          >
            <Text style={[styles.tabText, activeTab === 'signin' && styles.activeTabText]}>Sign In</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'signup' && styles.activeTab]}
            onPress={() => setActiveTab('signup')}
          >
            <Text style={[styles.tabText, activeTab === 'signup' && styles.activeTabText]}>Create Account</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          <View style={styles.welcomeHeader}>
            <Text style={styles.title}>
              {activeTab === 'signin' ? 'Welcome Back' : 'Get Started'}
            </Text>
            <Text style={styles.subtitle}>
              {activeTab === 'signin'
                ? 'Sign in to access your dashboard'
                : 'Create an account to manage your business'}
            </Text>
          </View>

          {error && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
              {error.includes('Email not confirmed') && (
                <TouchableOpacity
                  style={{ marginTop: 8 }}
                  onPress={handleResendVerification}
                  disabled={resending}
                >
                  <Text style={{ textAlign: 'center', color: Colors.primary, fontWeight: '600' }}>
                    {resending ? 'Sending...' : 'Resend Verification Email'}
                  </Text>
                </TouchableOpacity>
              )}
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

            {activeTab === 'signin' && (
              <TouchableOpacity
                onPress={() => setShowResetModal(true)}
                style={styles.forgotPasswordLink}
              >
                <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
              </TouchableOpacity>
            )}

            {activeTab === 'signup' && (
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

            <View style={styles.spacer} />

            <Button
              title={activeTab === 'signin' ? 'Sign In' : 'Create Account'}
              onPress={handleSubmit}
              loading={loading}
              size="large"
            />
          </View>
        </View>
      </View>

      {/* Forgot Password Modal */}
      <Modal
        visible={showResetModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowResetModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Reset Password</Text>
              <TouchableOpacity onPress={() => setShowResetModal(false)}>
                <X size={24} color={Colors.text.primary} />
              </TouchableOpacity>
            </View>

            <View style={styles.modalBody}>
              <Text style={styles.modalText}>
                Enter your email address and we'll send you instructions to reset your password.
              </Text>

              <Input
                label="Email Address"
                value={resetEmail}
                onChangeText={setResetEmail}
                placeholder="name@company.com"
                keyboardType="email-address"
                autoCapitalize="none"
              />

              <View style={{ height: 16 }} />

              <Button
                title="Send Reset Instructions"
                onPress={handleResetPassword}
                loading={resetLoading}
              />
            </View>
          </View>
        </View>
      </Modal>

    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: {
    alignItems: 'center',
    marginVertical: Layout.spacing.xl,
  },
  logo: {
    width: 150,
    height: 150,
    marginBottom: Layout.spacing.md,
  },
  appName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text.primary,
  },
  card: {
    backgroundColor: Colors.background,
    borderRadius: Layout.borderRadius.xl,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.border,
    ...Platform.select({
      web: {
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
      },
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 12,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  tabContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  tab: {
    flex: 1,
    paddingVertical: Layout.spacing.md,
    alignItems: 'center',
    backgroundColor: Colors.surface,
  },
  activeTab: {
    backgroundColor: Colors.background,
    borderBottomWidth: 2,
    borderBottomColor: Colors.primary,
    marginBottom: -1,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text.secondary,
  },
  activeTabText: {
    color: Colors.primary,
  },
  content: {
    padding: Layout.spacing.xl,
  },
  welcomeHeader: {
    marginBottom: Layout.spacing.lg,
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.text.primary,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.text.secondary,
    textAlign: 'center',
  },
  form: {
    gap: 0,
  },
  spacer: {
    height: Layout.spacing.md,
  },
  errorContainer: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FAC7C7',
    borderWidth: 1,
    borderRadius: Layout.borderRadius.md,
    padding: Layout.spacing.md,
    marginBottom: Layout.spacing.lg,
  },
  errorText: {
    color: Colors.status.error,
    fontSize: 14,
    textAlign: 'center',
  },
  forgotPasswordLink: {
    alignSelf: 'flex-end',
    marginBottom: Layout.spacing.md,
    marginTop: -4,
  },
  forgotPasswordText: {
    color: Colors.primary,
    fontSize: 14,
    fontWeight: '500',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Layout.spacing.lg,
  },
  modalContent: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: Colors.background,
    borderRadius: Layout.borderRadius.xl,
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Layout.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text.primary,
  },
  modalBody: {
    padding: Layout.spacing.lg,
  },
  modalText: {
    fontSize: 14,
    color: Colors.text.secondary,
    marginBottom: Layout.spacing.lg,
    lineHeight: 20,
  },
});