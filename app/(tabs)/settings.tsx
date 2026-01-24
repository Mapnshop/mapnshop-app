import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, Alert, Platform, Share } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { useAuth } from '@/contexts/AuthContext';
import { useBusiness } from '@/contexts/BusinessContext';
import { businessApi, membersApi } from '@/lib/api';
import { BusinessMember } from '@/types';
import { Button } from '@/components/Button';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { BusinessProfileSection } from '@/components/settings/BusinessProfileSection';
import { OrderDefaultsSection } from '@/components/settings/OrderDefaultsSection';
import { BusinessHoursSection } from '@/components/settings/BusinessHoursSection';
import { TeamManagementSection } from '@/components/settings/TeamManagementSection';
import { NotificationsSection } from '@/components/settings/NotificationsSection';
import { DataExportSection } from '@/components/settings/DataExportSection';
import { HelpSupportSection } from '@/components/settings/HelpSupportSection';
import { LogOut } from 'lucide-react-native';

export default function SettingsScreen() {
  const { user, signOut } = useAuth();
  const { business, setBusiness } = useBusiness();
  const [loading, setLoading] = useState(false);

  // Section Edit States
  const [editingProfile, setEditingProfile] = useState(false);
  const [editingDefaults, setEditingDefaults] = useState(false);

  const [formData, setFormData] = useState({
    name: business?.name || '',
    phone: business?.phone || '',
    address: business?.address || '',
    opening_hours: business?.opening_hours || '',
    category: business?.category || 'other',
    lat: business?.lat || 0,
    lng: business?.lng || 0,
    default_tax_rate: business?.default_tax_rate || '',
    default_delivery_fee: business?.default_delivery_fee || '',
    currency: business?.currency || 'CAD',
  });

  // Team Management State
  const [members, setMembers] = useState<BusinessMember[]>([]);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviting, setInviting] = useState(false);
  const [showTeam, setShowTeam] = useState(false);

  const handleSave = async () => {
    if (!business) return;

    setLoading(true);
    try {
      const updatedBusiness = await businessApi.update(business.id, {
        name: formData.name,
        phone: formData.phone,
        address: formData.address,
        opening_hours: formData.opening_hours,
        category: formData.category,
        lat: formData.lat,
        lng: formData.lng,
        default_tax_rate: Number(formData.default_tax_rate) || 0,
        default_delivery_fee: Number(formData.default_delivery_fee) || 0,
        currency: formData.currency,
      });

      setBusiness(updatedBusiness);
      setEditingProfile(false);
      setEditingDefaults(false);
      Alert.alert('Success', 'Business information updated successfully');
    } catch (error: any) {
      console.error('Update failed:', error);
      Alert.alert('Error', 'Failed to update: ' + (error.message || JSON.stringify(error)));
    } finally {
      setLoading(false);
    }
  };

  const handleSaveHours = async () => {
    // Separate save for hours if needed, or share handleSave. 
    // For simplicity, reusing handleSave since formData covers all.
    return handleSave();
  };


  React.useEffect(() => {
    if (business && showTeam) {
      loadMembers();
    }
  }, [business, showTeam]);

  React.useEffect(() => {
    if (business) {
      setFormData({
        name: business.name,
        phone: business.phone,
        address: business.address,
        opening_hours: business.opening_hours,
        category: business.category,
        lat: business.lat,
        lng: business.lng,
        default_tax_rate: business.default_tax_rate || 0,
        default_delivery_fee: business.default_delivery_fee || 0,
        currency: business.currency || 'CAD',
      });
    }
  }, [business]);

  const loadMembers = async () => {
    if (!business) return;
    try {
      const data = await membersApi.getByBusinessId(business.id);
      setMembers(data);
    } catch (error: any) {
      console.error('Failed to load members', error);
      if (error.message && error.message.includes('Could not find the table')) {
        Alert.alert(
          'Setup Required',
          'The Team Management feature requires a database update. Please run the provided SQL migration script.'
        );
      }
    }
  };

  const handleInvite = async () => {
    if (!inviteEmail.trim() || !business) return;
    const emailToAdd = inviteEmail.trim(); // Capture before clearing
    setInviting(true);
    try {
      await membersApi.invite(business.id, emailToAdd, 'staff');
      setInviteEmail('');
      Alert.alert(
        'Member Added',
        'Please ask them to sign up with this email address to access your business.',
        [
          { text: 'OK' },
          { text: 'Share Invite', onPress: () => handleShareInvite(emailToAdd) }
        ]
      );
      loadMembers();
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to invite');
    } finally {
      setInviting(false);
    }
  };

  const handleShareInvite = async (email: string) => {
    const message = `You've been invited to join ${business?.name} on Mapnshop. Please download the app and sign up with your email: ${email}`;

    if (Platform.OS === 'web') {
      try {
        // Try modern API first
        if (navigator.clipboard && navigator.clipboard.writeText) {
          await navigator.clipboard.writeText(message);
        } else {
          // Fallback for older browsers or insecure contexts
          const textArea = document.createElement("textarea");
          textArea.value = message;
          document.body.appendChild(textArea);
          textArea.focus();
          textArea.select();
          try {
            document.execCommand('copy');
          } catch (err) {
            console.error('Unable to copy', err);
            throw new Error('Clipboard not supported');
          }
          document.body.removeChild(textArea);
        }
        window.alert('Invite message copied to clipboard!'); // Use window.alert for direct blocking feedback on web
      } catch (err) {
        console.error('Failed to copy', err);
        Alert.alert('Error', 'Failed to copy to clipboard. Please manually select and copy.');
      }
    } else {
      try {
        await Share.share({
          message,
        });
      } catch (error) {
        console.error(error);
      }
    }
  };

  const handleRemoveMember = async (id: string) => {
    if (Platform.OS === 'web') {
      if (window.confirm('Are you sure you want to remove this member?')) {
        try {
          await membersApi.remove(id);
          loadMembers();
        } catch (error) {
          Alert.alert('Error', 'Failed to remove member');
        }
      }
    } else {
      Alert.alert('Confirm', 'Remove this member?', [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              await membersApi.remove(id);
              loadMembers();
            } catch (error) {
              Alert.alert('Error', 'Failed to remove member');
            }
          }
        }
      ]);
    }
  };

  const handleSignOut = async () => {
    if (Platform.OS === 'web') {
      if (confirm('Are you sure you want to sign out?')) {
        try {
          await signOut();
        } catch (error) {
          Alert.alert('Error', 'Failed to sign out');
        }
      }
    } else {
      Alert.alert(
        'Sign Out',
        'Are you sure you want to sign out?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Sign Out',
            style: 'destructive',
            onPress: async () => {
              try {
                await signOut();
              } catch (error) {
                Alert.alert('Error', 'Failed to sign out');
              }
            },
          },
        ]
      );
    }
  };

  if (!business) {
    return <LoadingSpinner />;
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.title}>Settings</Text>
          <Text style={styles.subtitle}>Manage your business information</Text>
        </View>
      </View>

      <FlatList
        style={styles.contentList}
        data={[]}
        renderItem={null}
        ListHeaderComponent={
          <View style={styles.sectionsContainer}>
            <BusinessProfileSection
              business={business}
              formData={formData}
              setFormData={setFormData}
              editing={editingProfile}
              setEditing={setEditingProfile}
              loading={loading}
              onSave={handleSave}
              onCancel={() => {
                setEditingProfile(false);
                // Reset form data logic here if strict reset needed
              }}
            />

            <BusinessHoursSection
              business={business}
              formData={formData}
              setFormData={setFormData}
              loading={loading}
              onSave={handleSaveHours}
            />

            <OrderDefaultsSection
              business={business}
              formData={formData}
              setFormData={setFormData}
              editing={editingDefaults}
              setEditing={setEditingDefaults}
              loading={loading}
              onSave={handleSave}
              onCancel={() => setEditingDefaults(false)}
            />

            <TeamManagementSection
              business={business}
              members={members}
              inviteEmail={inviteEmail}
              setInviteEmail={setInviteEmail}
              onInvite={handleInvite}
              inviting={inviting}
              onRemove={handleRemoveMember}
              onShare={handleShareInvite}
              showTeam={showTeam}
              setShowTeam={setShowTeam}
            />

            <NotificationsSection />

            <DataExportSection businessId={business.id} />

            <HelpSupportSection />

            {/* Account Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Account</Text>
              <View style={styles.accountInfo}>
                <Text style={styles.accountLabel}>Email:</Text>
                <Text style={styles.accountValue}>{user?.email}</Text>
              </View>
              <Button
                title="Sign Out"
                onPress={handleSignOut}
                variant="outline"
                style={{ borderColor: '#EF4444' }}
                textStyle={{ color: '#EF4444' }}
                icon={<LogOut size={16} color="#EF4444" />}
              />
            </View>

            <View style={{ height: 40 }} />
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    padding: 20,
    paddingTop: 60,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    zIndex: 10,
  },
  headerContent: {
    width: '100%',
    maxWidth: 800,
    alignSelf: 'center',
  },
  contentList: {
    flex: 1,
    width: '100%',
  },
  sectionsContainer: {
    paddingTop: 20,
    width: '100%',
    maxWidth: 800,
    alignSelf: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
  },
  section: {
    marginHorizontal: 20,
    marginBottom: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    color: '#111827'
  },
  accountInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    gap: 8,
  },
  accountLabel: {
    fontSize: 16,
    color: '#6B7280',
  },
  accountValue: {
    fontSize: 16,
    color: '#111827',
    fontWeight: '500',
  },
});