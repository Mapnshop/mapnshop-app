import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, Switch, Alert, TouchableOpacity, ScrollView, Modal, ActivityIndicator, Platform } from 'react-native';
import { useBusiness } from '@/contexts/BusinessContext';
import { ordersApi, customersApi } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { Input } from '@/components/Input';
import { Button } from '@/components/Button';
import { AddressAutocomplete } from '@/components/AddressAutocomplete';
import { ScreenContainer } from '@/components/ScreenContainer';
import { Colors } from '@/constants/Colors';
import { Layout } from '@/constants/Layout';
import { router } from 'expo-router';
import { Customer } from '@/types';
import { User, Phone, MapPin, X, ChevronRight } from 'lucide-react-native';

export default function CreateOrderScreen() {
  const { user } = useAuth();
  const { business } = useBusiness();
  const [loading, setLoading] = useState(false);

  // Customer Picker State
  const [showCustomerPicker, setShowCustomerPicker] = useState(false);
  const [recentCustomers, setRecentCustomers] = useState<Customer[]>([]);
  const [loadingCustomers, setLoadingCustomers] = useState(false);

  // Auto-suggestions State
  const [suggestedCustomers, setSuggestedCustomers] = useState<Customer[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

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
    source: 'manual' as 'manual' | 'phone' | 'whatsapp' | 'check-in' | 'instagram' | 'walk-in' | 'Uber Eats' | 'Deliveroo' | 'Just Eat' | 'Hungry Panda' | 'Talabat' | string,
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
        }).catch(err => {
          console.error('Background customer save failed:', err);
          // Note: This is a background operation, so we don't block order creation
          // The customer data will be saved on the next order
        });
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
      <ScreenContainer scrollable>
        {/* Header - now part of ScreenContainer content but we style it plainly */}
        <View style={styles.header}>
          <Text style={styles.title}>Create Order</Text>
          <Text style={styles.subtitle}>Enter order details below</Text>
        </View>

        <View style={styles.form}>
          {/* Customer Section */}
          <Text style={styles.sectionTitle}>Customer Details</Text>

          <View style={{ marginBottom: Layout.spacing.lg, zIndex: 200 }}>
            {/* Phone Input with Recent Button positioned nicely */}
            <View>
              <Input
                label="Customer Phone *"
                value={formData.customer_phone}
                onChangeText={async (text) => {
                  setFormData({ ...formData, customer_phone: text });
                  if (text.length >= 3 && business) {
                    try {
                      const customers = await customersApi.search(business.id, text);
                      setSuggestedCustomers(customers);
                      setShowSuggestions(customers.length > 0);
                    } catch (e) {
                      console.error('Customer search failed:', e);
                    }
                  } else {
                    setShowSuggestions(false);
                  }
                }}
                placeholder="Enter phone number"
                keyboardType="phone-pad"
              />

              {/* Suggestions List */}
              {showSuggestions && suggestedCustomers.length > 0 && (
                <View style={styles.suggestionsContainer}>
                  {suggestedCustomers.map((customer) => (
                    <TouchableOpacity
                      key={customer.id}
                      style={styles.suggestionItem}
                      onPress={() => {
                        setFormData(prev => ({
                          ...prev,
                          customer_name: customer.name,
                          customer_phone: customer.phone,
                          address: customer.address_text || '',
                        }));
                        setShowSuggestions(false);
                      }}
                    >
                      <View>
                        <Text style={styles.suggestionName}>{customer.name}</Text>
                        <Text style={styles.suggestionPhone}>{customer.phone}</Text>
                      </View>
                      <ChevronRight size={14} color={Colors.text.placeholder} />
                    </TouchableOpacity>
                  ))}
                </View>
              )}

              {/* Float 'Recent' button over the input or near label? 
                    Better to put it in a row with Label or below input. 
                    Let's put it as a helper action. 
                */}
              <TouchableOpacity
                style={styles.recentButton}
                onPress={() => setShowCustomerPicker(true)}
              >
                <User size={14} color={Colors.primary} style={{ marginRight: 4 }} />
                <Text style={styles.recentButtonText}>Select Recent</Text>
              </TouchableOpacity>
            </View>
          </View>

          <Input
            label="Customer Name *"
            value={formData.customer_name}
            onChangeText={(text) => setFormData({ ...formData, customer_name: text })}
            placeholder="Enter customer name"
          />

          {/* Delivery Toggle & Address */}
          <Text style={styles.sectionTitle}>Delivery Options</Text>

          <View style={styles.switchContainer}>
            <View style={styles.switchLabel}>
              <Text style={styles.switchText}>Delivery Required</Text>
              <Text style={styles.switchSubtext}>
                Is this order for delivery?
              </Text>
            </View>
            <Switch
              value={formData.delivery_required}
              onValueChange={(value) => setFormData({ ...formData, delivery_required: value })}
              trackColor={{ false: Colors.border, true: Colors.primary }}
              thumbColor={Platform.OS === 'ios' ? '#FFFFFF' : (formData.delivery_required ? '#FFFFFF' : '#F3F4F6')}
            />
          </View>

          {formData.delivery_required && (
            <View style={{ zIndex: 100, marginBottom: Layout.spacing.lg }}>
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

          {/* Order Details */}
          <Text style={styles.sectionTitle}>Order Items</Text>

          <Input
            label="Order Description *"
            value={formData.description}
            onChangeText={(text) => setFormData({ ...formData, description: text })}
            placeholder="List items, quantities, special requests..."
            multiline
            numberOfLines={4}
            style={{ minHeight: 100, textAlignVertical: 'top' }}
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

          {/* Total Summary Card */}
          <View style={styles.summaryCard}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Subtotal</Text>
              <Text style={styles.summaryValue}>${subtotal.toFixed(2)}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Tax ({taxRate}%)</Text>
              <Text style={styles.summaryValue}>${taxAmount.toFixed(2)}</Text>
            </View>
            {formData.delivery_required && (
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Delivery</Text>
                <Text style={styles.summaryValue}>${deliveryFee.toFixed(2)}</Text>
              </View>
            )}
            <View style={styles.divider} />
            <View style={styles.summaryRow}>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.totalValue}>${total.toFixed(2)}</Text>
            </View>
          </View>

          {/* Source Selection */}
          <Text style={styles.sectionTitle}>Order Source</Text>
          <View style={styles.sourceContainer}>
            {(['check-in', 'phone', 'whatsapp', 'instagram', 'delivery_app'] as const).map((sourceOption) => {
              const isDeliveryApp = sourceOption === 'delivery_app';
              // If current source is NOT one of the standard ones, and we are on 'delivery_app' tab, highlight it
              const isCustomSource = !['manual', 'check-in', 'phone', 'whatsapp', 'instagram'].includes(formData.source);
              const isActive = formData.source === sourceOption || (isDeliveryApp && isCustomSource);

              return (
                <TouchableOpacity
                  key={sourceOption}
                  style={[
                    styles.sourceChip,
                    isActive && styles.sourceChipActive,
                  ]}
                  onPress={() => {
                    if (isDeliveryApp) {
                      // If clicking "Delivery App", clear source so input shows empty or keep existing if already custom
                      if (!isCustomSource) setFormData({ ...formData, source: '' });
                    } else {
                      setFormData({ ...formData, source: sourceOption });
                    }
                  }}
                >
                  <Text
                    style={[
                      styles.sourceText,
                      isActive && styles.sourceTextActive,
                    ]}
                  >
                    {isDeliveryApp ? 'Delivery App' : sourceOption.replace('-', ' ').replace(/\b\w/g, c => c.toUpperCase())}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Custom Delivery App Input */}
          {(!['manual', 'check-in', 'phone', 'whatsapp', 'instagram'].includes(formData.source)) && (
            <Input
              label="Delivery App Name *"
              value={['manual', 'check-in', 'phone', 'whatsapp', 'instagram'].includes(formData.source) ? '' : formData.source}
              onChangeText={(text) => setFormData({ ...formData, source: text })}
              placeholder="e.g. Talabat, Just Eat, Deliveroo"
              containerStyle={{ marginBottom: Layout.spacing.lg }}
            />
          )}

          <Button
            title={loading ? 'Creating Order...' : 'Create Order'}
            onPress={handleSubmit}
            disabled={loading}
            style={styles.submitButton}
            variant="primary"
          />
          <View style={{ height: 40 }} />
        </View>
      </ScreenContainer>

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
            <TouchableOpacity onPress={() => setShowCustomerPicker(false)} style={styles.closeButton}>
              <X size={24} color={Colors.text.primary} />
            </TouchableOpacity>
          </View>

          {loadingCustomers ? (
            <ActivityIndicator size="large" color={Colors.primary} style={{ marginTop: 40 }} />
          ) : (
            <FlatList
              data={recentCustomers}
              keyExtractor={(item) => item.id}
              contentContainerStyle={{ padding: Layout.spacing.md }}
              ListEmptyComponent={
                <Text style={styles.emptyListText}>
                  No recent customers found.
                </Text>
              }
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.customerItem}
                  onPress={() => selectCustomer(item)}
                >
                  <View style={styles.customerAvatar}>
                    <User size={24} color={Colors.primary} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.customerName}>{item.name}</Text>
                    <View style={styles.customerDetailRow}>
                      <Phone size={12} color={Colors.text.secondary} />
                      <Text style={styles.customerDetailText}>{item.phone}</Text>
                    </View>
                    {item.address_text && (
                      <View style={styles.customerDetailRow}>
                        <MapPin size={12} color={Colors.text.secondary} />
                        <Text style={styles.customerDetailText} numberOfLines={1}>{item.address_text}</Text>
                      </View>
                    )}
                  </View>
                  <ChevronRight size={16} color={Colors.text.placeholder} />
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
  header: {
    marginBottom: Layout.spacing.lg,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: Colors.text.primary,
    marginBottom: 4,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.text.secondary,
  },
  form: {
    width: '100%',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text.primary,
    marginTop: Layout.spacing.md,
    marginBottom: Layout.spacing.md,
    letterSpacing: -0.3,
  },
  recentButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: Colors.surface,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 8,
    marginTop: -8,
  },
  recentButtonText: {
    color: Colors.primary,
    fontWeight: '600',
    fontSize: 13,
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    padding: Layout.spacing.md,
    borderRadius: Layout.borderRadius.md,
    marginBottom: Layout.spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  switchLabel: {
    flex: 1,
  },
  switchText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: 2,
  },
  switchSubtext: {
    fontSize: 14,
    color: Colors.text.secondary,
  },
  summaryCard: {
    backgroundColor: Colors.surface,
    padding: Layout.spacing.lg,
    borderRadius: Layout.borderRadius.lg,
    marginBottom: Layout.spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  summaryLabel: {
    color: Colors.text.secondary,
    fontSize: 15,
  },
  summaryValue: {
    fontWeight: '600',
    color: Colors.text.primary,
    fontSize: 15,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: 12,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text.primary,
  },
  totalValue: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.primary,
  },
  sourceContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: Layout.spacing.lg,
  },
  sourceChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  sourceChipActive: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primary,
  },
  sourceText: {
    fontSize: 14,
    color: Colors.text.secondary,
    fontWeight: '500',
  },
  sourceTextActive: {
    color: Colors.primaryForeground,
    fontWeight: '600',
  },
  submitButton: {
    marginTop: Layout.spacing.sm,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  modalHeader: {
    padding: Layout.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.text.primary,
  },
  closeButton: {
    padding: 4,
  },
  emptyListText: {
    textAlign: 'center',
    color: Colors.text.secondary,
    marginTop: 40,
    fontSize: 15,
  },
  customerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    padding: 16,
    borderRadius: Layout.borderRadius.lg,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  customerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  customerName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: 4,
  },
  customerDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 2,
  },
  customerDetailText: {
    fontSize: 13,
    color: Colors.text.secondary,
  },
  /* Suggestions */
  suggestionsContainer: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    zIndex: 1000,
    backgroundColor: Colors.surface,
    borderRadius: Layout.borderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingVertical: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
    marginTop: 4,
  },
  suggestionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  suggestionName: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text.primary,
  },
  suggestionPhone: {
    fontSize: 12,
    color: Colors.text.secondary,
  },
});