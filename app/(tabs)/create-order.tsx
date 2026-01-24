import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, Switch, Alert, TouchableOpacity, ScrollView, Modal, ActivityIndicator, Platform } from 'react-native';
import { useBusiness } from '@/contexts/BusinessContext';
import { ordersApi, customersApi } from '@/lib/api';
import { sendPushToBusiness } from '@/lib/notifications';
import { useAuth } from '@/contexts/AuthContext';
import { Input } from '@/components/Input';
import { Button } from '@/components/Button';
import { AddressAutocomplete } from '@/components/AddressAutocomplete';
import { router } from 'expo-router';
import { Customer } from '@/types';
import { User, Phone, MapPin, X } from 'lucide-react-native';

export default function CreateOrderScreen() {
  const { user } = useAuth();
  const { business } = useBusiness();
  const [loading, setLoading] = useState(false);

  // Customer Picker State
  const [showCustomerPicker, setShowCustomerPicker] = useState(false);
  const [recentCustomers, setRecentCustomers] = useState<Customer[]>([]);
  const [loadingCustomers, setLoadingCustomers] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    customer_name: '',
    customer_phone: '',
    address: '',
    description: '',
    subtotal: '',
    tax: '', // calculated or default
    delivery_fee: '', // default
    delivery_required: false,
    source: 'manual' as 'manual' | 'phone' | 'whatsapp' | 'walk-in' | 'Uber Eats' | 'Deliveroo' | 'Just Eat' | 'Hungry Panda' | 'Talabat',
  });

  // Load defaults when business loads
  useEffect(() => {
    if (business) {
      setFormData(prev => ({
        ...prev,
        tax: business.default_tax_rate ? String(business.default_tax_rate) : '0',
        delivery_fee: business.default_delivery_fee ? String(business.default_delivery_fee) : '0',
      }));
    }
  }, [business]);

  // Load recent customers when picker opens
  useEffect(() => {
    if (showCustomerPicker && business) {
      loadRecentCustomers();
    }
  }, [showCustomerPicker, business]);

  const loadRecentCustomers = async () => {
    if (!business) return;
    setLoadingCustomers(true);
    try {
      const data = await customersApi.listRecent(business.id);
      setRecentCustomers(data);
    } catch (error) {
      console.error('Failed to load customers:', error);
    } finally {
      setLoadingCustomers(false);
    }
  };

  const selectCustomer = (customer: Customer) => {
    setFormData(prev => ({
      ...prev,
      customer_name: customer.name,
      customer_phone: customer.phone,
      address: customer.address_text || '',
    }));
    setShowCustomerPicker(false);
  };

  // Calculate Total
  const subtotal = Number(formData.subtotal) || 0;
  const taxRate = Number(formData.tax) || 0;
  const deliveryFee = formData.delivery_required ? (Number(formData.delivery_fee) || 0) : 0;
  const taxAmount = subtotal * (taxRate / 100);
  const total = subtotal + taxAmount + deliveryFee;

  const handleSubmit = async () => {
    if (!business) return;

    // Validation
    if (!formData.customer_name.trim()) {
      Alert.alert('Error', 'Customer name is required');
      return;
    }
    if (!formData.customer_phone.trim()) {
      Alert.alert('Error', 'Customer phone is required');
      return;
    }
    if (!formData.description.trim()) {
      Alert.alert('Error', 'Order description is required');
      return;
    }
    if (!formData.subtotal.trim() || isNaN(Number(formData.subtotal))) {
      Alert.alert('Error', 'Valid price is required');
      return;
    }

    setLoading(true);
    try {
      const order = await ordersApi.create({
        business_id: business.id,
        customer_name: formData.customer_name.trim(),
        customer_phone: formData.customer_phone.trim(),
        address: formData.address.trim(),
        description: formData.description.trim(),
        subtotal: subtotal,
        tax: taxAmount,
        delivery_fee: deliveryFee,
        total: total,
        price: total, // Backward compatibility
        delivery_required: formData.delivery_required,
        source: formData.source,
        status: 'created',
      });

      // Save/Update Customer in background for future lookup
      if (business) {
        customersApi.upsert({
          business_id: business.id,
          name: formData.customer_name.trim(),
          phone: formData.customer_phone.trim(),
          address_text: formData.address.trim(),
          last_order_at: new Date().toISOString()
        }).catch(err => console.log('Background customer save failed', err));
      }

      setLoading(false);

      // Send Push Notification
      try {
        if (order && order.id) {
          const { sendPushToBusiness } = require('@/lib/notifications');
          sendPushToBusiness(
            business.id,
            `New Order #${order.id.slice(0, 5)}`,
            `New order from ${formData.customer_name} ($${total})`,
            user?.id
          );
        }
      } catch (e) {
        console.error("Push notification failed", e);
      }

      if (Platform.OS === 'web') {
        // Web Helper: confirm() returns true for OK (View Order), false for Cancel (Stay/Unknown)
        // We'll phrase it: "Order Created. View Order now?" 
        // OK = View, Cancel = Stay to create New
        if (confirm('Order created successfully! View Order now?')) {
          router.replace(`/order/${order.id}`);
        } else {
          setFormData({
            customer_name: '',
            customer_phone: '',
            address: '',
            description: '',
            subtotal: '',
            tax: business.default_tax_rate ? String(business.default_tax_rate) : '0',
            delivery_fee: business.default_delivery_fee ? String(business.default_delivery_fee) : '0',
            delivery_required: false,
            source: 'manual',
          });
        }
      } else {
        Alert.alert('Success', 'Order created successfully', [
          {
            text: 'View Order',
            onPress: () => router.replace(`/order/${order.id}`),
          },
          {
            text: 'Create Another',
            onPress: () => {
              // Reset Form
              setFormData({
                customer_name: '',
                customer_phone: '',
                address: '',
                description: '',
                subtotal: '',
                tax: business.default_tax_rate ? String(business.default_tax_rate) : '0',
                delivery_fee: business.default_delivery_fee ? String(business.default_delivery_fee) : '0',
                delivery_required: false,
                source: 'manual',
              });
            },
          },
        ]);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to create order. Please try again.');
      console.error('Failed to create order:', error);
    } finally {
      if (Platform.OS !== 'web') {
        setLoading(false);
      }
    }
  };

  return (
    <>
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <Text style={styles.title}>Create New Order</Text>
            <Text style={styles.subtitle}>Manually add an order to the system</Text>
          </View>
        </View>

        <ScrollView style={styles.form} keyboardShouldPersistTaps="handled">
          {/* Customer Inputs */}
          <View style={{ marginBottom: 16, zIndex: 200 }}>
            <Input
              label="Customer Phone *"
              value={formData.customer_phone}
              onChangeText={async (text) => {
                setFormData({ ...formData, customer_phone: text });
                // Simple debounce or check length before searching
                if (text.length >= 3 && business) {
                  try {
                    const customers = await customersApi.search(business.id, text);
                    // Could show autocomplete results here in future
                  } catch (e) {
                    // Ignore
                  }
                }
              }}
              placeholder="Enter phone number"
              keyboardType="phone-pad"
            />

            <TouchableOpacity
              style={styles.recentButton}
              onPress={() => setShowCustomerPicker(true)}
            >
              <User size={14} color="#3B82F6" style={{ marginRight: 4 }} />
              <Text style={styles.recentButtonText}>Recent</Text>
            </TouchableOpacity>
          </View>

          <Input
            label="Customer Name *"
            value={formData.customer_name}
            onChangeText={(text) => setFormData({ ...formData, customer_name: text })}
            placeholder="Enter customer name"
          />

          {/* Address - Only if Delivery Required */}
          {formData.delivery_required && (
            <View style={{ zIndex: 100, marginBottom: 16 }}>
              <AddressAutocomplete
                label="Delivery Address *"
                placeholder="Search delivery address"
                defaultValue={formData.address}
                onSelect={(data) => {
                  setFormData({
                    ...formData,
                    address: data.address,
                  });
                }}
              />
            </View>
          )}

          <Input
            label="Order Description *"
            value={formData.description}
            onChangeText={(text) => setFormData({ ...formData, description: text })}
            placeholder="Describe the order items"
            multiline
            numberOfLines={3}
          />

          <Input
            label="Item Subtotal ($) *"
            value={formData.subtotal}
            onChangeText={(text) => setFormData({ ...formData, subtotal: text })}
            placeholder="0.00"
            keyboardType="decimal-pad"
          />

          <View style={{ flexDirection: 'row', gap: 12 }}>
            <Input
              label="Tax Rate (%)"
              value={formData.tax}
              onChangeText={(text) => setFormData({ ...formData, tax: text })}
              placeholder="0"
              keyboardType="decimal-pad"
              containerStyle={{ flex: 1 }}
            />

            {formData.delivery_required && (
              <Input
                label="Delivery Fee ($)"
                value={formData.delivery_fee}
                onChangeText={(text) => setFormData({ ...formData, delivery_fee: text })}
                placeholder="0.00"
                keyboardType="decimal-pad"
                containerStyle={{ flex: 1 }}
              />
            )}
          </View>

          {/* Total Summary */}
          <View style={{ backgroundColor: '#F3F4F6', padding: 16, borderRadius: 8, marginBottom: 16 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
              <Text style={{ color: '#6B7280' }}>Subtotal</Text>
              <Text style={{ fontWeight: '600' }}>${subtotal.toFixed(2)}</Text>
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
              <Text style={{ color: '#6B7280' }}>Tax ({taxRate}%)</Text>
              <Text style={{ fontWeight: '600' }}>${taxAmount.toFixed(2)}</Text>
            </View>
            {formData.delivery_required && (
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
                <Text style={{ color: '#6B7280' }}>Delivery</Text>
                <Text style={{ fontWeight: '600' }}>${deliveryFee.toFixed(2)}</Text>
              </View>
            )}
            <View style={{ height: 1, backgroundColor: '#D1D5DB', marginVertical: 8 }} />
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={{ fontSize: 18, fontWeight: '700', color: '#111827' }}>Total</Text>
              <Text style={{ fontSize: 18, fontWeight: '700', color: '#3B82F6' }}>${total.toFixed(2)}</Text>
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Order Source *</Text>
            <View style={styles.sourceContainer}>
              {(['manual', 'phone', 'whatsapp', 'walk-in', 'Uber Eats', 'Deliveroo', 'Just Eat', 'Hungry Panda', 'Talabat'] as const).map((source) => (
                <TouchableOpacity
                  key={source}
                  style={[
                    styles.sourceButton,
                    formData.source === source && styles.sourceButtonActive,
                  ]}
                  onPress={() => setFormData({ ...formData, source })}
                >
                  <Text
                    style={[
                      styles.sourceText,
                      formData.source === source && styles.sourceTextActive,
                    ]}
                  >
                    {source.charAt(0).toUpperCase() + source.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.switchContainer}>
            <View style={styles.switchLabel}>
              <Text style={styles.switchText}>Delivery Required</Text>
              <Text style={styles.switchSubtext}>
                Toggle if this order needs delivery
              </Text>
            </View>
            <Switch
              value={formData.delivery_required}
              onValueChange={(value) => setFormData({ ...formData, delivery_required: value })}
              trackColor={{ false: '#D1D5DB', true: '#3B82F6' }}
              thumbColor={formData.delivery_required ? '#FFFFFF' : '#F3F4F6'}
            />
          </View>

          <Button
            title={loading ? 'Creating Order...' : 'Create Order'}
            onPress={handleSubmit}
            disabled={loading}
            style={styles.submitButton}
          />
          <View style={{ height: 40 }} />
        </ScrollView>
      </View>

      {/* Customer Picker Modal */}
      <Modal
        visible={showCustomerPicker}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowCustomerPicker(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Select Customer</Text>
            <TouchableOpacity onPress={() => setShowCustomerPicker(false)}>
              <X size={24} color="#111827" />
            </TouchableOpacity>
          </View>

          {loadingCustomers ? (
            <ActivityIndicator size="large" color="#3B82F6" style={{ marginTop: 40 }} />
          ) : (
            <FlatList
              data={recentCustomers}
              keyExtractor={(item) => item.id}
              contentContainerStyle={{ padding: 20 }}
              ListEmptyComponent={
                <Text style={{ textAlign: 'center', color: '#6B7280', marginTop: 40 }}>
                  No recent customers found.
                </Text>
              }
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.customerItem}
                  onPress={() => selectCustomer(item)}
                >
                  <View style={styles.customerAvatar}>
                    <User size={24} color="#3B82F6" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.customerName}>{item.name}</Text>
                    <View style={styles.customerDetailRow}>
                      <Phone size={12} color="#6B7280" />
                      <Text style={styles.customerDetailText}>{item.phone}</Text>
                    </View>
                    {item.address_text && (
                      <View style={styles.customerDetailRow}>
                        <MapPin size={12} color="#6B7280" />
                        <Text style={styles.customerDetailText} numberOfLines={1}>{item.address_text}</Text>
                      </View>
                    )}
                  </View>
                  {item.last_order_at && (
                    <View style={{ alignItems: 'flex-end' }}>
                      <Text style={{ fontSize: 11, color: '#9CA3AF' }}>Last Order</Text>
                      <Text style={{ fontSize: 12, color: '#6B7280' }}>
                        {new Date(item.last_order_at).toLocaleDateString()}
                      </Text>
                    </View>
                  )}
                </TouchableOpacity>
              )}
            />
          )}
        </View>
      </Modal>
    </>
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
  },
  headerContent: {
    width: '100%',
    maxWidth: 600,
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
  form: {
    padding: 20,
    width: '100%',
    maxWidth: 600,
    alignSelf: 'center', // Center the scrollview itself
    flex: 1, // ensure it takes space
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  switchLabel: {
    flex: 1,
  },
  switchText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 2,
  },
  switchSubtext: {
    fontSize: 14,
    color: '#6B7280',
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
  sourceContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  sourceButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    backgroundColor: '#FFFFFF',
  },
  sourceButtonActive: {
    borderColor: '#3B82F6',
    backgroundColor: '#EFF6FF',
  },
  sourceText: {
    fontSize: 14,
    color: '#4B5563',
  },
  sourceTextActive: {
    color: '#3B82F6',
    fontWeight: '600',
  },
  submitButton: {
    marginTop: 20,
  },
  recentButton: {
    position: 'absolute',
    right: 0,
    top: -4,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16
  },
  recentButtonText: {
    color: '#3B82F6',
    fontWeight: '600',
    fontSize: 13
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  modalHeader: {
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
    zIndex: 10,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  customerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'transparent',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  customerAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  customerName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  customerDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  customerDetailText: {
    fontSize: 14,
    color: '#6B7280',
  },
});