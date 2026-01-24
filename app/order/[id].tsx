import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, TouchableOpacity, Modal, Image, Platform, useWindowDimensions } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { ordersApi, deliveryApi, activityApi, storageApi } from '@/lib/api';
import { Order, Delivery, OrderActivity } from '@/types';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { ArrowLeft, Phone, MapPin, Clock, Package, Truck, AlertTriangle, Edit2, Camera, Image as ImageIcon, X, Trash2 } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import { CustomerStatsModal } from '@/components/CustomerStatsModal';
import { useBusiness } from '@/contexts/BusinessContext';



export default function OrderDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { business } = useBusiness();
  const [order, setOrder] = useState<Order | null>(null);
  const [delivery, setDelivery] = useState<Delivery | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [previousStatus, setPreviousStatus] = useState<Order['status'] | null>(null);
  const [showUndo, setShowUndo] = useState(false);
  const [noteText, setNoteText] = useState('');
  const [editingNote, setEditingNote] = useState(false);
  const [showStats, setShowStats] = useState(false);

  const { width } = useWindowDimensions();
  const isDesktop = width >= 1024; // Use 1024 for split view constraint

  // OS Features
  const [activityLog, setActivityLog] = useState<OrderActivity[]>([]);
  const [editingOrder, setEditingOrder] = useState(false);
  const [editForm, setEditForm] = useState({ description: '', price: '', address: '' });

  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const handleDeletePhoto = async (url: string) => {
    const deleteLogic = async () => {
      if (!order) return;
      setUpdating(true);
      try {
        await storageApi.deleteImage(url);
        const newAttachments = order.attachments?.filter(a => a !== url) || [];
        const updatedOrder = await ordersApi.update(order.id, { attachments: newAttachments });
        setOrder(updatedOrder);
        setSelectedImage(null);
        await activityApi.logAction(order.id, 'edit', { note: 'Deleted attachment' });
      } catch (error: any) {
        Alert.alert('Error', 'Failed to delete photo: ' + error.message);
      } finally {
        setUpdating(false);
      }
    };

    if (Platform.OS === 'web') {
      if (confirm('Are you sure you want to remove this photo?')) {
        await deleteLogic();
      }
    } else {
      Alert.alert(
        'Delete Photo',
        'Are you sure you want to remove this photo?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Delete',
            style: 'destructive',
            onPress: deleteLogic
          }
        ]
      );
    }
  };

  const loadOrderDetails = async () => {
    if (!id) return;

    try {
      const orderData = await ordersApi.getById(id);
      setOrder(orderData);

      if (orderData.delivery_required) {
        const deliveryData = await deliveryApi.getByOrderId(id);
        setDelivery(deliveryData);
      }

      // Load activity log
      try {
        const activities = await activityApi.getByOrderId(id);
        setActivityLog(activities);
      } catch (err) {
        console.warn('Failed to load activity log (Table might be missing):', err);
        // Fail silently so the main order details still load
      }

      // Init edit form
      setEditForm({
        description: orderData.description,
        price: String(orderData.price),
        address: orderData.address || ''
      });
    } catch (error) {
      console.error('Failed to load order details:', error);
      Alert.alert('Error', 'Failed to load order details');
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (newStatus: Order['status']) => {
    if (!order) return;

    // Save previous status for Undo
    setPreviousStatus(order.status);
    setShowUndo(true);

    // Auto-hide Undo after 5 seconds
    setTimeout(() => setShowUndo(false), 5000);

    setUpdating(true);
    try {
      const updatedOrder = await ordersApi.updateStatus(order.id, newStatus);
      setOrder(updatedOrder);
      // Alert.alert('Success', `Order status updated to ${newStatus}`); // Removed to reduce noise
    } catch (error) {
      Alert.alert('Error', 'Failed to update order status');
    } finally {
      setUpdating(false);
    }
  };

  const handleUndo = async () => {
    if (!previousStatus || !order) return;
    setUpdating(true);
    try {
      const updatedOrder = await ordersApi.updateStatus(order.id, previousStatus);
      setOrder(updatedOrder);
      setShowUndo(false);
      setPreviousStatus(null);
    } catch (error) {
      Alert.alert('Error', 'Failed to undo status change');
    } finally {
      setUpdating(false);
    }
  };

  const saveNote = async () => {
    if (!order) return;
    setUpdating(true);
    try {
      const updatedOrder = await ordersApi.update(order.id, { notes: noteText });
      setOrder(updatedOrder);
      setEditingNote(false);
    } catch (error) {
      Alert.alert('Error', 'Failed to save note');
    } finally {
      setUpdating(false);
    }
  };

  const requestDelivery = async () => {
    if (!order) return;

    setUpdating(true);
    try {
      const newDelivery = await deliveryApi.create({
        order_id: order.id,
        status: 'requested',
        pickup_time: new Date(Date.now() + 30 * 60 * 1000).toISOString(), // 30 minutes from now
        fee: 5.00, // Default delivery fee
      });
      setDelivery(newDelivery);
      Alert.alert('Success', 'Delivery requested successfully');
    } catch (error) {
      Alert.alert('Error', 'Failed to request delivery');
    } finally {
      setUpdating(false);
    }
  };

  const handleCancelOrder = async () => {
    Alert.prompt(
      "Cancel Order",
      "Please enter a reason for cancellation:",
      [
        { text: "Keep Order", style: "cancel" },
        {
          text: "Cancel Order",
          style: "destructive",
          onPress: async (reason?: string) => {
            if (!reason || !order) return;
            setUpdating(true);
            try {
              await ordersApi.update(order.id, {
                status: 'cancelled',
                cancellation_reason: reason
              });
              await activityApi.logAction(order.id, 'cancellation', { reason });
              await loadOrderDetails();
            } catch (error) {
              Alert.alert("Error", "Failed to cancel order");
            } finally {
              setUpdating(false);
            }
          }
        }
      ],
      "plain-text"
    );
  };

  const handleSaveEdit = async () => {
    if (!order) return;
    setUpdating(true);
    try {
      const updates = {
        description: editForm.description,
        price: Number(editForm.price),
        address: editForm.address,
        updated_at: new Date().toISOString()
      };

      await ordersApi.update(order.id, updates);
      await activityApi.logAction(order.id, 'edit', updates);
      await loadOrderDetails();
      setEditingOrder(false);
    } catch (e) {
      Alert.alert('Error', 'Failed to update order');
    } finally {
      setUpdating(false);
    }
  };

  const uploadPhoto = async (uri: string) => {
    if (!order) return;
    setUpdating(true);
    try {
      const publicUrl = await storageApi.uploadImage(uri);

      // Update order attachments
      const currentAttachments = order.attachments || [];
      const updatedAttachments = [...currentAttachments, publicUrl];

      const updatedOrder = await ordersApi.update(order.id, { attachments: updatedAttachments });
      setOrder(updatedOrder);

      await activityApi.logAction(order.id, 'edit', { note: 'Added photo attachment' });
    } catch (error) {
      console.error("Upload failed in component:", error);
      if (error instanceof Error) {
        Alert.alert('Error', `Failed to upload: ${error.message}`);
      } else {
        Alert.alert('Error', 'Failed to upload photo (Unknown Error)');
      }
    } finally {
      setUpdating(false);
    }
  };

  const handleAddPhoto = async () => {
    if (!order) return;

    if (Platform.OS === 'web') {
      // On Web, launchImageLibraryAsync opens the system file picker, 
      // which allows selecting from Camera/Files depending on device capabilities.
      try {
        const result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          quality: 0.7,
        });
        if (!result.canceled) uploadPhoto(result.assets[0].uri);
      } catch (e) {
        Alert.alert('Error', 'Failed to open file picker');
      }
      return;
    }

    Alert.alert(
      "Add Photo",
      "Choose a source",
      [
        {
          text: "Camera",
          onPress: async () => {
            const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
            if (permissionResult.granted === false) {
              Alert.alert("Permission to access camera is required!");
              return;
            }

            const result = await ImagePicker.launchCameraAsync({
              mediaTypes: ImagePicker.MediaTypeOptions.Images,
              quality: 0.7,
            });
            if (!result.canceled) uploadPhoto(result.assets[0].uri);
          }
        },
        {
          text: "Photo Library",
          onPress: async () => {
            const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (permissionResult.granted === false) {
              Alert.alert("Permission to access photos is required!");
              return;
            }

            const result = await ImagePicker.launchImageLibraryAsync({
              mediaTypes: ImagePicker.MediaTypeOptions.Images,
              quality: 0.7,
            });
            if (!result.canceled) uploadPhoto(result.assets[0].uri);
          }
        },
        { text: "Cancel", style: "cancel" }
      ]
    );
  };

  useEffect(() => {
    loadOrderDetails();
  }, [id]);

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!order) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Order not found</Text>
      </View>
    );
  }

  const getStatusColor = (status: Order['status']) => {
    switch (status) {
      case 'created': return '#EF4444';
      case 'preparing': return '#F59E0B';
      case 'ready': return '#3B82F6';
      case 'completed': return '#10B981';
      default: return '#6B7280';
    }
  };

  const getNextStatus = (currentStatus: Order['status']): Order['status'] | null => {
    switch (currentStatus) {
      case 'created': return 'preparing';
      case 'preparing': return 'ready';
      case 'ready': return 'completed';
      default: return null;
    }
  };

  const nextStatus = getNextStatus(order.status);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <TouchableOpacity
            onPress={() => {
              if (router.canGoBack()) {
                router.back();
              } else {
                router.replace('/(tabs)');
              }
            }}
            style={styles.backButton}
          >
            <ArrowLeft size={24} color="#3B82F6" />
          </TouchableOpacity>

          <Text style={styles.title}>Order Details</Text>

          {!editingOrder && order && order.status !== 'cancelled' && order.status !== 'completed' ? (
            <TouchableOpacity onPress={() => setEditingOrder(true)} style={styles.editButton}>
              <Edit2 size={20} color="#3B82F6" />
            </TouchableOpacity>
          ) : (
            <View style={{ width: 24 }} /> /* Spacer to balance the header */
          )}
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.scrollContent, isDesktop && styles.scrollContentDesktop]}
      >
        <View style={isDesktop ? styles.desktopGrid : undefined}>
          {/* LEFT COLUMN (Main Info) */}
          <View style={isDesktop ? styles.leftColumn : undefined}>
            <View style={styles.orderCard}>
              <View style={styles.orderHeader}>
                <Text style={styles.orderNumber}>Order #{order.id.slice(-8)}</Text>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(order.status) }]}>
                  <Text style={styles.statusText}>{order.status.toUpperCase()}</Text>
                </View>
              </View>

              {editingOrder ? (
                <View style={{ gap: 12 }}>
                  <Input
                    label="Description"
                    value={editForm.description}
                    onChangeText={(t) => setEditForm(prev => ({ ...prev, description: t }))}
                    multiline
                  />
                  <Input
                    label="Price / Total ($)"
                    value={editForm.price}
                    onChangeText={(t) => setEditForm(prev => ({ ...prev, price: t }))}
                    keyboardType="decimal-pad"
                  />
                  <Input
                    label="Address"
                    value={editForm.address}
                    onChangeText={(t) => setEditForm(prev => ({ ...prev, address: t }))}
                  />
                  <View style={{ flexDirection: 'row', gap: 12, marginTop: 8 }}>
                    <Button title="Cancel" onPress={() => setEditingOrder(false)} variant="outline" style={{ flex: 1 }} />
                    <Button title="Save Changes" onPress={handleSaveEdit} style={{ flex: 1 }} disabled={updating} />
                  </View>
                </View>
              ) : (
                <>
                  <View style={styles.customerSection}>
                    <Text style={styles.sectionTitle}>Customer Information</Text>

                    <TouchableOpacity onPress={() => setShowStats(true)}>
                      <View style={[styles.infoRow, { marginBottom: 4 }]}>
                        <Text style={[styles.customerName, { textDecorationLine: 'underline', color: '#111827' }]}>
                          {order.customer_name}
                        </Text>
                        <Text style={{ fontSize: 12, color: '#3B82F6', marginLeft: 8 }}>(View Stats)</Text>
                      </View>
                    </TouchableOpacity>

                    <View style={styles.infoRow}>
                      <Phone size={16} color="#6B7280" />
                      <Text style={styles.infoText}>{order.customer_phone}</Text>
                    </View>
                    {order.address && (
                      <View style={styles.infoRow}>
                        <MapPin size={16} color="#6B7280" />
                        <Text style={styles.infoText}>{order.address}</Text>
                      </View>
                    )}
                  </View>

                  <Text style={styles.sectionTitle}>Order Details</Text>
                  <Text style={styles.description}>{order.description}</Text>

                  <View style={styles.priceBreakdown}>
                    {order.subtotal !== undefined && (
                      <View style={styles.priceRow}>
                        <Text style={styles.priceLabel}>Subtotal</Text>
                        <Text style={styles.priceValue}>${order.subtotal?.toFixed(2)}</Text>
                      </View>
                    )}
                    {order.tax !== undefined && order.tax > 0 && (
                      <View style={styles.priceRow}>
                        <Text style={styles.priceLabel}>Tax</Text>
                        <Text style={styles.priceValue}>${order.tax?.toFixed(2)}</Text>
                      </View>
                    )}
                    {order.delivery_fee !== undefined && order.delivery_fee > 0 && (
                      <View style={styles.priceRow}>
                        <Text style={styles.priceLabel}>Delivery Fee</Text>
                        <Text style={styles.priceValue}>${order.delivery_fee?.toFixed(2)}</Text>
                      </View>
                    )}
                    <View style={styles.totalRow}>
                      <Text style={styles.totalLabel}>Total</Text>
                      <Text style={styles.totalValue}>${order.total?.toFixed(2) || order.price.toFixed(2)}</Text>
                    </View>
                  </View>
                </>
              )}
            </View>

            {/* Activity Feed in Left Column on Desktop */}
            <View style={styles.sectionCard}>
              <Text style={[styles.sectionTitle, { marginBottom: 16 }]}>Order Activity</Text>
              <View style={styles.timelineContainer}>
                {activityLog.map((activity, index) => (
                  <View key={activity.id} style={styles.timelineItem}>
                    {index !== activityLog.length - 1 && (
                      <View style={styles.timelineConnector} />
                    )}

                    <View style={[styles.timelineDot, { backgroundColor: activity.action === 'cancellation' ? '#EF4444' : '#3B82F6' }]} />
                    <View style={styles.timelineContent}>
                      <Text style={styles.timelineTitle}>
                        {activity.action === 'status_change' ? 'Status Change' :
                          activity.action === 'cancellation' ? 'Cancelled' :
                            activity.action === 'edit' ? 'Order Edited' :
                              activity.action.charAt(0).toUpperCase() + activity.action.slice(1)}
                      </Text>
                      {activity.details?.reason && (
                        <Text style={{ color: '#EF4444', fontSize: 13, marginBottom: 2 }}>Reason: {activity.details.reason}</Text>
                      )}
                      <Text style={styles.timelineTime}>
                        {new Date(activity.created_at).toLocaleString()}
                      </Text>
                    </View>
                  </View>
                ))}
                {activityLog.length === 0 && (
                  <View style={styles.timelineItem}>
                    <View style={[styles.timelineDot, { backgroundColor: '#10B981' }]} />
                    <View style={styles.timelineContent}>
                      <Text style={styles.timelineTitle}>Order Created</Text>
                      <Text style={styles.timelineTime}>
                        {new Date(order.created_at).toLocaleString()}
                      </Text>
                    </View>
                  </View>
                )}
              </View>
            </View>
          </View>

          {/* RIGHT COLUMN (Actions, Notes, Delivery, Attachments) */}
          <View style={isDesktop ? styles.rightColumn : undefined}>

            {/* Main Action Buttons (Desktop top right) */}
            {nextStatus && order.status !== 'cancelled' && order.status !== 'completed' && (
              <View style={styles.actionsContainer}>
                {showUndo && (
                  <TouchableOpacity style={styles.undoContainer} onPress={handleUndo}>
                    <Text style={{ color: '#6B7280' }}>Mistake?</Text>
                    <Text style={styles.undoText}>Undo Change</Text>
                  </TouchableOpacity>
                )}

                <Button
                  title={`Mark as ${nextStatus.charAt(0).toUpperCase() + nextStatus.slice(1)}`}
                  onPress={() => updateOrderStatus(nextStatus)}
                  disabled={updating}
                  style={[
                    styles.actionButton,
                    { backgroundColor: getStatusColor(nextStatus) }
                  ]}
                />
              </View>
            )}

            <View style={styles.sectionCard}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <Text style={styles.sectionTitle}>Internal Notes</Text>
                {!editingNote && (
                  <TouchableOpacity onPress={() => {
                    setNoteText(order.notes || '');
                    setEditingNote(true);
                  }}>
                    <Text style={{ color: '#3B82F6', fontWeight: '600' }}>{order.notes ? 'Edit' : 'Add'}</Text>
                  </TouchableOpacity>
                )}
              </View>

              {editingNote ? (
                <View style={{ gap: 8 }}>
                  <Input
                    value={noteText}
                    onChangeText={setNoteText}
                    placeholder="Add private notes about this order..."
                    multiline
                    numberOfLines={3}
                  />
                  <View style={{ flexDirection: 'row', gap: 8, justifyContent: 'flex-end' }}>
                    <Button title="Cancel" variant="outline" size="small" onPress={() => setEditingNote(false)} />
                    <Button title="Save" size="small" onPress={saveNote} disabled={updating} />
                  </View>
                </View>
              ) : (
                <Text style={{ color: order.notes ? '#111827' : '#9CA3AF', fontStyle: order.notes ? 'normal' : 'italic', lineHeight: 20 }}>
                  {order.notes || 'No internal notes.'}
                </Text>
              )}
            </View>

            {order.delivery_required && (
              <View style={styles.sectionCard}>
                <Text style={styles.sectionTitle}>Delivery Information</Text>
                {delivery ? (
                  <View>
                    <View style={styles.infoRow}>
                      <Truck size={16} color="#3B82F6" />
                      <Text style={styles.infoText}>Status: {delivery.status}</Text>
                    </View>
                    <View style={styles.infoRow}>
                      <Clock size={16} color="#6B7280" />
                      <Text style={styles.infoText}>
                        Pickup Time: {new Date(delivery.pickup_time).toLocaleTimeString()}
                      </Text>
                    </View>
                    <View style={styles.infoRow}>
                      <Text style={styles.infoText}>Fee: ${delivery.fee.toFixed(2)}</Text>
                    </View>
                  </View>
                ) : (
                  <View>
                    <Text style={styles.infoText}>Delivery not yet requested</Text>
                    <Button
                      title="Request Delivery"
                      onPress={requestDelivery}
                      disabled={updating}
                      style={styles.deliveryButton}
                    />
                  </View>
                )}
              </View>
            )}

            <View style={styles.sectionCard}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <Text style={styles.sectionTitle}>Attachments</Text>
                <TouchableOpacity onPress={handleAddPhoto} disabled={updating} style={{ padding: 4 }}>
                  <Camera size={20} color="#3B82F6" />
                </TouchableOpacity>
              </View>

              {(!order.attachments || order.attachments.length === 0) ? (
                <Text style={{ color: '#9CA3AF', fontStyle: 'italic', fontSize: 14 }}>No photos added.</Text>
              ) : (
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
                  {order.attachments.map((url, index) => (
                    <TouchableOpacity key={index} onPress={() => setSelectedImage(url)}>
                      <Image source={{ uri: url }} style={styles.attachmentThumb} />
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>

            {order.status !== 'cancelled' && order.status !== 'completed' && (
              <View style={{ padding: 20, paddingTop: 0 }}>
                <Button
                  title="Cancel Order"
                  variant="outline"
                  onPress={handleCancelOrder}
                  style={{ borderColor: '#EF4444' }}
                  textStyle={{ color: '#EF4444' }}
                />
              </View>
            )}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  headerContent: {
    width: '100%',
    maxWidth: 800,
    alignSelf: 'center',
  },
  scrollView: {
    flex: 1,
    width: '100%',
  },
  scrollContent: {
    width: '100%',
    maxWidth: 800,
    alignSelf: 'center',
    paddingBottom: 40,
  },
  scrollContentDesktop: {
    maxWidth: 1200,
  },
  desktopGrid: {
    flexDirection: 'row',
    gap: 24,
    paddingHorizontal: 24,
    width: '100%',
  },
  leftColumn: {
    flex: 2,
  },
  rightColumn: {
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    paddingTop: 60,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backButton: {
    padding: 4,
  },
  editButton: {
    padding: 4,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
  },
  orderCard: {
    margin: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  orderNumber: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  customerSection: {
    marginBottom: 20,
  },
  sectionCard: {
    marginHorizontal: 20,
    marginBottom: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12,
  },
  customerName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#6B7280',
  },
  // Removed orderSection style
  description: {
    fontSize: 16,
    color: '#4B5563',
    marginBottom: 12,
    lineHeight: 24,
  },
  priceBreakdown: {
    backgroundColor: '#F3F4F6',
    padding: 12,
    borderRadius: 8,
    gap: 4,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  priceLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  priceValue: {
    fontSize: 14,
    color: '#111827',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#D1D5DB',
    paddingTop: 8,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
  },
  totalValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#059669',
  },
  undoContainer: {
    marginBottom: 12,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  undoText: {
    color: '#EF4444',
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  timelineContainer: {
    paddingLeft: 4,
  },
  timelineItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 24,
    position: 'relative',
  },
  timelineDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginTop: 4,
    marginRight: 16,
    zIndex: 2,
  },
  timelineConnector: {
    position: 'absolute',
    left: 5, // Center of dot (12/2 - 2/2 = 5)
    top: 16,
    bottom: -24, // Connect to next item
    width: 2,
    backgroundColor: '#E5E7EB',
    zIndex: 1,
  },
  timelineContent: {
    flex: 1,
  },
  timelineTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 2,
  },
  timelineTime: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  deliveryButton: {
    marginTop: 8,
  },
  actionsContainer: {
    padding: 20,
  },
  actionButton: {
    width: '100%',
  },
  errorText: {
    fontSize: 16,
    color: '#EF4444',
    textAlign: 'center',
    marginTop: 40,
  },
  attachmentThumb: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullImage: {
    width: '100%',
    height: '80%',
  },
  closeButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 10,
    padding: 8,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 20,
  },
  modalActions: {
    position: 'absolute',
    bottom: 40,
    width: '100%',
    paddingHorizontal: 20,
    alignItems: 'center',
  },
});