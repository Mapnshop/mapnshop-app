import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert, KeyboardAvoidingView, Platform, TouchableOpacity, FlatList, SafeAreaView, Modal } from 'react-native';
import { useBusiness } from '@/contexts/BusinessContext';
import { useAuth } from '@/contexts/AuthContext';
import { businessApi } from '@/lib/api';
import { Input } from '@/components/Input';
import { Button } from '@/components/Button';
import { AddressAutocomplete } from '@/components/AddressAutocomplete';
import { router } from 'expo-router';
import * as Location from 'expo-location';
import { ArrowLeft, LogOut, ChevronDown } from 'lucide-react-native';

// Common country codes
const COUNTRY_CODES = [
  { code: 'US', dial_code: '+1', flag: '🇺🇸', name: 'United States' },
  { code: 'CA', dial_code: '+1', flag: '🇨🇦', name: 'Canada' },
  { code: 'GB', dial_code: '+44', flag: '🇬🇧', name: 'United Kingdom' },
  { code: 'FR', dial_code: '+33', flag: '🇫🇷', name: 'France' },
  { code: 'DE', dial_code: '+49', flag: '🇩🇪', name: 'Germany' },
  { code: 'IT', dial_code: '+39', flag: '🇮🇹', name: 'Italy' },
  { code: 'ES', dial_code: '+34', flag: '🇪🇸', name: 'Spain' },
  { code: 'AU', dial_code: '+61', flag: '🇦🇺', name: 'Australia' },
  { code: 'IN', dial_code: '+91', flag: '🇮🇳', name: 'India' },
  { code: 'JP', dial_code: '+81', flag: '🇯🇵', name: 'Japan' },
  { code: 'CN', dial_code: '+86', flag: '🇨🇳', name: 'China' },
  { code: 'BR', dial_code: '+55', flag: '🇧🇷', name: 'Brazil' },
  { code: 'MX', dial_code: '+52', flag: '🇲🇽', name: 'Mexico' },
  { code: 'ZA', dial_code: '+27', flag: '🇿🇦', name: 'South Africa' },
  { code: 'NG', dial_code: '+234', flag: '🇳🇬', name: 'Nigeria' },
  { code: 'DZ', dial_code: '+213', flag: '🇩🇿', name: 'Algeria' },
  { code: 'MA', dial_code: '+212', flag: '🇲🇦', name: 'Morocco' },
  { code: 'TN', dial_code: '+216', flag: '🇹🇳', name: 'Tunisia' },
] as const;

const CATEGORIES = [
  { id: 'retail', label: 'Retail' },
  { id: 'restaurant', label: 'Restaurant' },
  { id: 'service', label: 'Service' },
  { id: 'other', label: 'Other' },
] as const;

export default function OnboardingScreen() {
  const { setBusiness } = useBusiness();
  const { signOut } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    phone: '',
    opening_hours: '',
    category: '' as 'retail' | 'restaurant' | 'service' | 'other' | '',
    lat: 0,
    lng: 0,
  });
  const [countryCode, setCountryCode] = useState(COUNTRY_CODES[0] as typeof COUNTRY_CODES[number]); // Default to first (US)
  const [showCountryPicker, setShowCountryPicker] = useState(false);

  const handleSignOut = async () => {
    try {
      await signOut();
      // Router redirection is handled by _layout
    } catch (error) {
      Alert.alert('Error', 'Failed to sign out');
    }
  };

  const handleSubmit = async () => {
    if (!formData.name.trim() || !formData.address.trim() || !formData.phone.trim()) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    if (!formData.category) {
      Alert.alert('Error', 'Please select a business category');
      return;
    }

    setLoading(true);
    try {
      // Get location coordinates
      let lat = formData.lat;
      let lng = formData.lng;

      // If no google coords, try device location
      if (lat === 0 && lng === 0) {
        try {
          const { status } = await Location.requestForegroundPermissionsAsync();
          if (status === 'granted') {
            const location = await Location.getCurrentPositionAsync({});
            lat = location.coords.latitude;
            lng = location.coords.longitude;
          }
        } catch (error) {
          console.log('Location permission denied or error:', error);
        }
      }

      const fullPhone = `${countryCode.dial_code}${formData.phone.replace(/^0+/, '')}`;

      const business = await businessApi.create({
        name: formData.name.trim(),
        address: formData.address.trim(),
        phone: fullPhone,
        opening_hours: formData.opening_hours.trim() || 'Mon-Fri 9AM-6PM',
        category: formData.category,
        lat,
        lng,
      });

      setBusiness(business);
      // Navigation is handled by RootLayout
    } catch (error: any) {
      console.error('Onboarding error:', error);
      Alert.alert('Error', error.message || 'Failed to create business profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.topBar}>
        <TouchableOpacity onPress={handleSignOut} style={styles.backButton}>
          <ArrowLeft size={24} color="rgba(55, 65, 81, 1)" />
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <FlatList
          data={[]}
          renderItem={null}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          ListHeaderComponent={
            <>
              <View style={styles.header}>
                <Text style={styles.title}>Setup Your Business</Text>
                <Text style={styles.subtitle}>
                  Let's get your business profile ready to start managing orders
                </Text>
              </View>

              <View style={styles.form}>
                <Input
                  label="Business Name *"
                  value={formData.name}
                  onChangeText={(text) => setFormData({ ...formData, name: text })}
                  placeholder="Enter your business name"
                />

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Business Category *</Text>
                  <View style={styles.categoryContainer}>
                    {CATEGORIES.map((cat) => (
                      <TouchableOpacity
                        key={cat.id}
                        style={[
                          styles.categoryButton,
                          formData.category === cat.id && styles.categoryButtonActive,
                        ]}
                        onPress={() => setFormData({ ...formData, category: cat.id })}
                      >
                        <Text
                          style={[
                            styles.categoryText,
                            formData.category === cat.id && styles.categoryTextActive,
                          ]}
                        >
                          {cat.label}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                <View style={{ zIndex: 100 }}>
                  <AddressAutocomplete
                    label="Business Address *"
                    placeholder="Search your business address"
                    defaultValue={formData.address}
                    onSelect={(data) => {
                      setFormData({
                        ...formData,
                        address: data.address,
                        lat: data.lat,
                        lng: data.lng,
                      });
                    }}
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Phone Number *</Text>
                  <View style={{ flexDirection: 'row', gap: 12 }}>
                    <TouchableOpacity
                      style={styles.countryButton}
                      onPress={() => setShowCountryPicker(true)}
                    >
                      <Text style={{ fontSize: 24 }}>{countryCode.flag}</Text>
                      <Text style={styles.countryCodeText}>{countryCode.dial_code}</Text>
                      <ChevronDown size={16} color="#6B7280" />
                    </TouchableOpacity>

                    <Input
                      containerStyle={{ flex: 1, marginBottom: 0 }}
                      value={formData.phone}
                      onChangeText={(text) => setFormData({ ...formData, phone: text })}
                      placeholder="Phone number"
                      keyboardType="phone-pad"
                    />
                  </View>
                </View>

                <Input
                  label="Opening Hours"
                  value={formData.opening_hours}
                  onChangeText={(text) => setFormData({ ...formData, opening_hours: text })}
                  placeholder="e.g., Mon-Fri 9AM-6PM, Sat 10AM-4PM"
                />

                <Button
                  title={loading ? 'Setting up...' : 'Complete Setup'}
                  onPress={handleSubmit}
                  disabled={loading}
                  style={styles.submitButton}
                />
              </View>
            </>
          }
        />
      </KeyboardAvoidingView>

      <Modal
        visible={showCountryPicker}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowCountryPicker(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Country</Text>
              <TouchableOpacity onPress={() => setShowCountryPicker(false)}>
                <Text style={styles.closeButtonText}>Close</Text>
              </TouchableOpacity>
            </View>
            <FlatList
              data={COUNTRY_CODES}
              keyExtractor={(item) => item.code}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.countryItem}
                  onPress={() => {
                    setCountryCode(item);
                    setShowCountryPicker(false);
                  }}
                >
                  <Text style={{ fontSize: 24, marginRight: 12 }}>{item.flag}</Text>
                  <Text style={styles.countryName}>{item.name}</Text>
                  <Text style={styles.countryDialCode}>{item.dial_code}</Text>
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    paddingTop: Platform.OS === 'android' ? 30 : 0,
  },
  topBar: {
    paddingHorizontal: 20,
    paddingVertical: 30,
    zIndex: 10,
    width: '100%',
    maxWidth: 600,
    alignSelf: 'center',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backText: {
    fontSize: 16,
    color: '#374151',
    fontWeight: '500',
  },
  scrollContent: {
    padding: 20,
    paddingTop: 0,
    flexGrow: 1, // ensure it fills
    width: '100%',
    maxWidth: 600,
    alignSelf: 'center',
    ...Platform.select({
      web: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 40,
        marginBottom: 40, // space at bottom
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
      }
    }),
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
    marginTop: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
  },
  form: {
    gap: 0,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 6,
  },
  categoryContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    backgroundColor: '#FFFFFF',
  },
  categoryButtonActive: {
    borderColor: '#3B82F6',
    backgroundColor: '#EFF6FF',
  },
  categoryText: {
    fontSize: 14,
    color: '#4B5563',
  },
  categoryTextActive: {
    color: '#3B82F6',
    fontWeight: '600',
  },
  submitButton: {
    marginTop: 8,
  },
  countryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 12, // Match Input padding
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
  },
  countryCodeText: {
    fontSize: 16,
    color: '#111827',
    fontWeight: '500',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: Platform.OS === 'web' ? 'center' : 'flex-end',
    alignItems: Platform.OS === 'web' ? 'center' : undefined,
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    ...Platform.select({
      web: {
        width: '100%',
        maxWidth: 400,
        height: 'auto',
        maxHeight: 600,
        borderRadius: 16,
        paddingBottom: 0,
      },
      default: {
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        height: '70%',
      }
    }),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  closeButtonText: {
    fontSize: 16,
    color: '#3B82F6',
    fontWeight: '600',
  },
  countryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  countryName: {
    flex: 1,
    fontSize: 16,
    color: '#111827',
  },
  countryDialCode: {
    fontSize: 16,
    color: '#6B7280',
    fontWeight: '500',
  },
});