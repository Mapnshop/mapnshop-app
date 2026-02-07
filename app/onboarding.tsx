import React, { useState } from 'react';
import { View, Alert } from 'react-native';
import { useBusiness } from '@/contexts/BusinessContext';
import { businessApi } from '@/lib/api';
import { Button } from '@/components/Button';
import * as Location from 'expo-location';
import { WizardLayout } from '@/components/onboarding/WizardLayout';
import { StepBasicInfo } from '@/components/onboarding/StepBasicInfo';
import { StepLocation } from '@/components/onboarding/StepLocation';
import { StepContact } from '@/components/onboarding/StepContact';
import { COUNTRY_CODES, CountryCodeItem } from '@/constants/CountryCodes';

export default function OnboardingScreen() {
  const { business, setBusiness } = useBusiness();
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    category: '' as 'retail' | 'restaurant' | 'service' | 'other' | '',
    address: '',
    lat: 0,
    lng: 0,
    phone: '',
    opening_hours: '',
  });

  const [countryCode, setCountryCode] = useState<CountryCodeItem>(COUNTRY_CODES[0]);

  const totalSteps = 3;

  // Pre-fill form if business exists (e.g. for rejection resubmission)
  React.useEffect(() => {
    console.log('Onboarding Effect Triggered. Business:', business);
    if (business) {
      // alert(`DEBUG: Business found! Status: ${business.verification_status}`);
      if (business.verification_status === 'rejected') {
        console.log('Pre-filling form for rejected business:', business);
        // alert('DEBUG: Pre-filling form data!');
        // Parse phone back to parts if possible, or just put it all in (simplified)
        // Assuming phone includes country code, we might need to be smart, 
        // but for now let's just pre-fill the raw values.

        // Attempt to extract country code from phone or default
        // This is a rough heuristic
        const foundCode = COUNTRY_CODES.find(c => business.phone.startsWith(c.dial_code));
        if (foundCode) {
          setCountryCode(foundCode);
        }

        setFormData({
          name: business.name || '',
          category: (business.category as any) || '',
          address: business.address || '',
          lat: business.lat || 0,
          lng: business.lng || 0,
          phone: business.phone.replace(foundCode?.dial_code || '', '') || '',
          opening_hours: business.opening_hours || '',
        });
      }
    }
  }, [business]);

  const handleNext = async () => {
    // Validation per step
    if (currentStep === 0) {
      if (!formData.name.trim()) {
        Alert.alert('Required', 'Please enter your business name.');
        return;
      }
      if (!formData.category) {
        Alert.alert('Required', 'Please select a business category.');
        return;
      }
    } else if (currentStep === 1) {
      if (!formData.address.trim()) {
        Alert.alert('Required', 'Please select a valid address.');
        return;
      }
    } else if (currentStep === 2) {
      if (!formData.phone.trim()) {
        Alert.alert('Required', 'Please enter a phone number.');
        return;
      }
      // Final Submit
      await handleSubmit();
      return;
    }

    // Go to next step
    setCurrentStep((prev) => prev + 1);
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      // Get location coordinates if missing (fallback)
      let lat = formData.lat;
      let lng = formData.lng;

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

      // Check if this is a resubmit (business already exists with rejected status)
      const isResubmit = business && business.verification_status === 'rejected';

      let updatedBusiness;
      if (isResubmit) {
        // Update existing business and resubmit
        updatedBusiness = await businessApi.update(business.id, {
          name: formData.name.trim(),
          address: formData.address.trim(),
          phone: fullPhone,
          opening_hours: formData.opening_hours.trim() || 'Mon-Fri 9AM-6PM',
          category: formData.category || 'other',
          lat,
          lng,
        });
        // Resubmit for verification
        updatedBusiness = await businessApi.resubmit(business.id);
      } else {
        // Create new business (automatically sets status to 'pending')
        updatedBusiness = await businessApi.create({
          name: formData.name.trim(),
          address: formData.address.trim(),
          phone: fullPhone,
          opening_hours: formData.opening_hours.trim() || 'Mon-Fri 9AM-6PM',
          category: formData.category || 'other',
          lat,
          lng,
        });
      }

      setBusiness(updatedBusiness);

      // Show success message
      Alert.alert(
        'Request Sent',
        'We will verify your business and get back to you soon.',
        [{ text: 'OK' }]
      );
    } catch (error: any) {
      console.error('Onboarding error:', error);
      Alert.alert('Error', error.message || 'Failed to create business profile');
    } finally {
      setLoading(false);
    }
  };

  const getStepTitle = () => {
    switch (currentStep) {
      case 0: return 'The Basics';
      case 1: return 'Location';
      case 2: return 'Contact Details';
      default: return '';
    }
  };

  const getStepSubtitle = () => {
    switch (currentStep) {
      case 0: return 'Tell us what kind of business you run.';
      case 1: return 'Where can customers find you?';
      case 2: return 'How can customers reach you?';
      default: return '';
    }
  };

  return (
    <WizardLayout
      step={currentStep}
      totalSteps={totalSteps}
      title={getStepTitle()}
      subtitle={getStepSubtitle()}
      onBack={currentStep > 0 ? handleBack : undefined}
      showLogout={currentStep === 0}
      rejectionReason={business?.verification_status === 'rejected' ? business.rejection_reason : undefined}
    >
      {currentStep === 0 && (
        <StepBasicInfo
          name={formData.name}
          category={formData.category}
          onChangeName={(text) => setFormData({ ...formData, name: text })}
          onChangeCategory={(cat) => setFormData({ ...formData, category: cat as any })}
        />
      )}

      {currentStep === 1 && (
        <StepLocation
          address={formData.address}
          onSelectAddress={(data) =>
            setFormData({
              ...formData,
              address: data.address,
              lat: data.lat,
              lng: data.lng,
            })
          }
        />
      )}

      {currentStep === 2 && (
        <StepContact
          phone={formData.phone}
          openingHours={formData.opening_hours}
          countryCode={countryCode}
          onChangePhone={(text) => setFormData({ ...formData, phone: text })}
          onChangeHours={(text) => setFormData({ ...formData, opening_hours: text })}
          onChangeCountryCode={setCountryCode}
        />
      )}

      <Button
        title={currentStep === totalSteps - 1 ? (loading ? 'Creating...' : 'Complete Setup') : 'Next Step'}
        onPress={handleNext}
        loading={loading && currentStep === totalSteps - 1}
        size="large"
      />
    </WizardLayout>
  );
}