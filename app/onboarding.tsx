import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert, TouchableOpacity, FlatList, Modal, Platform } from 'react-native';
import { useBusiness } from '@/contexts/BusinessContext';
import { useAuth } from '@/contexts/AuthContext';
import { businessApi } from '@/lib/api';
import { Input } from '@/components/Input';
import { Button } from '@/components/Button';
import { AddressAutocomplete } from '@/components/AddressAutocomplete';
import { ScreenContainer } from '@/components/ScreenContainer';
import * as Location from 'expo-location';
import { ArrowLeft, ChevronDown } from 'lucide-react-native';
import { Colors } from '@/constants/Colors';
import { Layout } from '@/constants/Layout';

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
  const [countryCode, setCountryCode] = useState(COUNTRY_CODES[0] as typeof COUNTRY_CODES[number]);
  const [showCountryPicker, setShowCountryPicker] = useState(false);

  const handleSignOut = async () => {
    try {
      await signOut();
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
    } catch (error: any) {
      console.error('Onboarding error:', error);
      Alert.alert('Error', error.message || 'Failed to create business profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenContainer scrollable>
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={handleSignOut} style={styles.backButton}>
          <ArrowLeft size={24} color={Colors.text.primary} />
        </TouchableOpacity>
      </View>

      <View style={styles.header}>
        <Text style={styles.title}>Setup Business</Text>
        <Text style={styles.subtitle}>
          Basic details to get you started.
        </Text>
      </View>

      <View style={styles.form}>
        <Input
          label="Business Name *"
          value={formData.name}
          onChangeText={(text) => setFormData({ ...formData, name: text })}
          placeholder="e.g. Joe's Market"
          autoCapitalize="words"
        />

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Category *</Text>
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

        <View style={{ zIndex: 100, marginBottom: Layout.spacing.md }}>
          <AddressAutocomplete
            label="Address *"
            placeholder="Search address"
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
          <Text style={styles.label}>Phone *</Text>
          <View style={{ flexDirection: 'row', gap: Layout.spacing.sm }}>
            <TouchableOpacity
              style={styles.countryButton}
              onPress={() => setShowCountryPicker(true)}
            >
              <Text style={{ fontSize: 20 }}>{countryCode.flag}</Text>
              <Text style={styles.countryCodeText}>{countryCode.dial_code}</Text>
              <ChevronDown size={14} color={Colors.text.secondary} />
            </TouchableOpacity>

            <View style={{ flex: 1 }}>
              <Input
                containerStyle={{ marginBottom: 0 }}
                value={formData.phone}
                onChangeText={(text) => setFormData({ ...formData, phone: text })}
                placeholder="Mobile number"
                keyboardType="phone-pad"
              />
            </View>
          </View>
        </View>

        <Input
          label="Opening Hours"
          value={formData.opening_hours}
          onChangeText={(text) => setFormData({ ...formData, opening_hours: text })}
          placeholder="e.g. 9AM - 6PM"
        />

        <View style={styles.spacer} />

        <Button
          title={loading ? 'Creating...' : 'Create Business'}
          onPress={handleSubmit}
          disabled={loading}
          size="large"
        />
      </View>

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
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  headerRow: {
    marginBottom: Layout.spacing.md,
  },
  backButton: {
    padding: Layout.spacing.xs,
    marginLeft: -Layout.spacing.xs,
  },
  header: {
    marginBottom: Layout.spacing.xl,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.text.primary,
    marginBottom: Layout.spacing.xs,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.text.secondary,
  },
  form: {
    gap: 0,
  },
  inputGroup: {
    marginBottom: Layout.spacing.md,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.text.primary,
    marginBottom: Layout.spacing.xs,
  },
  categoryContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Layout.spacing.sm,
  },
  categoryButton: {
    paddingHorizontal: Layout.spacing.md,
    paddingVertical: Layout.spacing.sm,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.background,
  },
  categoryButtonActive: {
    borderColor: Colors.primary,
    backgroundColor: Colors.secondary,
  },
  categoryText: {
    fontSize: 14,
    color: Colors.text.secondary,
  },
  categoryTextActive: {
    color: Colors.primary,
    fontWeight: '600',
  },
  countryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: Layout.spacing.md,
    height: 48, // Match input height roughly
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Layout.borderRadius.md,
    backgroundColor: Colors.background,
  },
  countryCodeText: {
    fontSize: 16,
    color: Colors.text.primary,
    fontWeight: '500',
  },
  spacer: {
    height: Layout.spacing.lg,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: Platform.OS === 'web' ? 'center' : 'flex-end',
    alignItems: Platform.OS === 'web' ? 'center' : undefined,
  },
  modalContent: {
    backgroundColor: Colors.background,
    ...Platform.select({
      web: {
        width: '100%',
        maxWidth: 400,
        height: '80%',
        maxHeight: 600,
        borderRadius: Layout.borderRadius.lg,
      },
      default: {
        borderTopLeftRadius: Layout.borderRadius.xl,
        borderTopRightRadius: Layout.borderRadius.xl,
        maxHeight: '80%',
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
    padding: Layout.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text.primary,
  },
  closeButtonText: {
    fontSize: 16,
    color: Colors.status.info,
    fontWeight: '600',
  },
  countryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Layout.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.surface,
  },
  countryName: {
    flex: 1,
    fontSize: 16,
    color: Colors.text.primary,
  },
  countryDialCode: {
    fontSize: 16,
    color: Colors.text.secondary,
    fontWeight: '500',
  },
});