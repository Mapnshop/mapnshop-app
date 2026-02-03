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
import { Colors } from '@/constants/Colors';




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
      case 'created': return Colors.status.error;
      case 'preparing': return Colors.status.warning;
      case 'ready': return Colors.status.info;
      case 'completed': return Colors.status.success;
      default: return Colors.text.secondary;
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

  const getStatusGradient = (status: Order['status']) => {
    switch (status) {
      case 'created': return ['#FF6B6B', '#EE5253'];
      case 'preparing': return ['#FF9F43', '#F368E0'];
      case 'ready': return ['#54A0FF', '#2E86DE'];
      case 'completed': return ['#1DD1A1', '#10AC84'];
      default: return ['#C8D6E5', '#8395A7'];
    }
  };

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
            <ArrowLeft size={24} color={Colors.text.primary} />
          </TouchableOpacity>

          <Text style={styles.title}>Order #{order.id.slice(-8)}</Text>

          {!editingOrder && order && order.status !== 'cancelled' && order.status !== 'completed' ? (
            <TouchableOpacity onPress={() => setEditingOrder(true)} style={styles.editButton}>
              <Edit2 size={20} color={Colors.text.primary} />
            </TouchableOpacity>
          ) : (
            <View style={{ width: 40 }} />
          )}
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.scrollContent, isDesktop && styles.scrollContentDesktop]}
        showsVerticalScrollIndicator={false}
      >
        <View style={isDesktop ? styles.desktopGrid : undefined}>

          {/* LEFT COLUMN */}
          <View style={isDesktop ? styles.leftColumn : undefined}>

            {/* MAIN ORDER CARD */}
            <View style={styles.orderCard}>
              <View style={styles.orderHeader}>
                {/* Redundant Order Number removed */}
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(order.status) }]}>
                  <Text style={styles.statusText}>{order.status}</Text>
                </View>
              </View>

              {editingOrder ? (
                <View style={{ gap: 16 }}>
                  <Input
                    label="Description"
                    value={editForm.description}
                    onChangeText={(t) => setEditForm(prev => ({ ...prev, description: t }))}
                    multiline
                  />
                  <Input
                    label="Price ($)"
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
                    <Button title="Save" onPress={handleSaveEdit} style={{ flex: 1 }} disabled={updating} />
                  </View>
                </View>
              ) : (
                <>
                  <View style={styles.customerSection}>
                    <Text style={styles.sectionTitle}>Customer Details</Text>
                    <Text style={styles.customerName}>{order.customer_name}</Text>
                    <View style={styles.infoRow}>
                      <Phone size={15} color={Colors.text.secondary} />
                      <Text style={styles.infoText}>{order.customer_phone}</Text>
                    </View>
                    {order.address && (
                      <View style={styles.infoRow}>
                        <MapPin size={15} color={Colors.text.secondary} />
                        <Text style={styles.infoText}>{order.address}</Text>
                      </View>
                    )}
                  </View>

                  <Text style={styles.sectionTitle}>Order Items</Text>
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
                        <Text style={styles.priceLabel}>Delivery</Text>
                        <Text style={styles.priceValue}>${order.delivery_fee?.toFixed(2)}</Text>
                      </View>
                    )}
                    <View style={styles.totalRow}>
                      <Text style={styles.totalLabel}>Total Amount</Text>
                      <Text style={styles.totalValue}>${order.total?.toFixed(2) || order.price.toFixed(2)}</Text>
                    </View>
                  </View>
                </>
              )}
            </View>

            {/* ATTACHMENTS */}
            <View style={styles.sectionCard}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <Text style={[styles.sectionTitle, { marginBottom: 0 }]}>Attachments</Text>
                <TouchableOpacity onPress={handleAddPhoto}>
                  <Text style={{ color: Colors.primary, fontWeight: '600' }}>+ Add Photo</Text>
                </TouchableOpacity>
              </View>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 12 }}>
                {(!order.attachments || order.attachments.length === 0) ? (
                  <Text style={{ color: Colors.text.secondary, fontStyle: 'italic' }}>No photos attached.</Text>
                ) : (
                  order.attachments.map((url, index) => (
                    <TouchableOpacity key={index} onPress={() => setSelectedImage(url)}>
                      <Image source={{ uri: url }} style={styles.attachmentThumb} />
                    </TouchableOpacity>
                  ))
                )}
              </ScrollView>
            </View>

          </View>

          {/* RIGHT COLUMN */}
          <View style={isDesktop ? styles.rightColumn : undefined}>

            {/* ACTION CENTER */}
            {nextStatus && order.status !== 'cancelled' && order.status !== 'completed' && (
              <View style={styles.actionsContainer}>
                {showUndo && (
                  <View style={styles.undoContainer}>
                    <AlertTriangle size={14} color={Colors.status.error} />
                    <TouchableOpacity onPress={handleUndo}>
                      <Text style={styles.undoText}>Undo limit change</Text>
                    </TouchableOpacity>
                  </View>
                )}
                <Button
                  title={`Mark as ${nextStatus.toUpperCase()}`}
                  onPress={() => updateOrderStatus(nextStatus)}
                  disabled={updating}
                  style={[styles.actionButton, { backgroundColor: getStatusColor(nextStatus), borderColor: getStatusColor(nextStatus) }]}
                />
              </View>
            )}

            {/* DELIVERY INFO */}
            {order.delivery_required && (
              <View style={styles.sectionCard}>
                <Text style={styles.sectionTitle}>Delivery Status</Text>
                {delivery ? (
                  <View style={{ backgroundColor: '#F9FAFB', padding: 16, borderRadius: 12 }}>
                    <View style={[styles.infoRow, { marginBottom: 4 }]}>
                      <Truck size={16} color={Colors.primary} />
                      <Text style={{ fontWeight: '700', color: Colors.primary, fontSize: 16, textTransform: 'capitalize' }}>{delivery.status}</Text>
                    </View>
                    <View style={styles.infoRow}>
                      <Clock size={14} color={Colors.text.secondary} />
                      <Text style={styles.infoText}>Pickup: {new Date(delivery.pickup_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
                    </View>
                  </View>
                ) : (
                  <Button
                    title="Request Driver"
                    onPress={requestDelivery}
                    disabled={updating}
                    variant="outline"
                    style={styles.deliveryButton}
                  />
                )}
              </View>
            )}

            {/* INTERNAL NOTES */}
            <View style={styles.sectionCard}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <Text style={[styles.sectionTitle, { marginBottom: 0 }]}>Internal Notes</Text>
                <TouchableOpacity onPress={() => {
                  setNoteText(order.notes || '');
                  setEditingNote(true);
                }}>
                  <Text style={{ color: Colors.primary, fontWeight: '600', fontSize: 13 }}>{editingNote ? '' : 'Edit'}</Text>
                </TouchableOpacity>
              </View>

              {editingNote ? (
                <View style={{ gap: 10 }}>
                  <Input value={noteText} onChangeText={setNoteText} multiline numberOfLines={3} placeholder="Add a private note..." />
                  <View style={{ flexDirection: 'row', justifyContent: 'flex-end', gap: 10 }}>
                    <Button title="Cancel" size="small" variant="ghost" onPress={() => setEditingNote(false)} />
                    <Button title="Save" size="small" onPress={saveNote} />
                  </View>
                </View>
              ) : (
                <Text style={{ fontSize: 15, color: Colors.text.primary, lineHeight: 22 }}>{order.notes || 'No notes added.'}</Text>
              )}
            </View>

            {/* TIMELINE */}
            <View style={styles.sectionCard}>
              <Text style={styles.sectionTitle}>Activity Timeline</Text>
              <View style={styles.timelineContainer}>
                {activityLog.map((activity, index) => (
                  <View key={activity.id} style={styles.timelineItem}>
                    <View style={styles.timelineConnector} />
                    <View style={[styles.timelineDot, {
                      borderColor: activity.action === 'cancellation' ? Colors.status.error : Colors.primary,
                      backgroundColor: '#FFF'
                    }]} />
                    <View style={styles.timelineContent}>
                      <Text style={styles.timelineTitle}>
                        {activity.action === 'status_change' ? 'Status Update' :
                          activity.action === 'cancellation' ? 'Order Cancelled' :
                            activity.action === 'edit' ? 'Order Edited' : 'Update'}
                      </Text>
                      <Text style={styles.timelineTime}>
                        {new Date(activity.created_at).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </Text>
                    </View>
                  </View>
                ))}

                {/* Fallback Initial State */}
                {activityLog.length === 0 && (
                  <View style={styles.timelineItem}>
                    <View style={[styles.timelineDot, { borderColor: Colors.status.success, backgroundColor: '#FFF' }]} />
                    <View style={styles.timelineContent}>
                      <Text style={styles.timelineTitle}>Order Created</Text>
                      <Text style={styles.timelineTime}>{new Date(order.created_at).toLocaleString()}</Text>
                    </View>
                  </View>
                )}
              </View>
            </View>

            {order.status !== 'cancelled' && order.status !== 'completed' && (
              <View style={{ alignItems: 'center', marginTop: 10 }}>
                <TouchableOpacity onPress={handleCancelOrder} style={{ padding: 12 }}>
                  <Text style={{ color: '#EF4444', fontWeight: '600' }}>Cancel Order</Text>
                </TouchableOpacity>
              </View>
            )}

            <View style={{ height: 40 }} />
          </View>
        </View>
      </ScrollView>

      {/* MODALS */}
      <Modal visible={!!selectedImage} transparent={true} animationType="fade" onRequestClose={() => setSelectedImage(null)}>
        <View style={styles.modalOverlay}>
          <TouchableOpacity style={styles.closeButton} onPress={() => setSelectedImage(null)}>
            <X size={24} color="#FFF" />
          </TouchableOpacity>
          <Image source={{ uri: selectedImage || '' }} style={styles.fullImage} resizeMode="contain" />
          <View style={styles.modalActions}>
            <TouchableOpacity onPress={() => selectedImage && handleDeletePhoto(selectedImage)} style={{ padding: 16, backgroundColor: 'rgba(255,59,48,0.2)', borderRadius: 100 }}>
              <Trash2 size={24} color="#FF3B30" />
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <CustomerStatsModal
        visible={showStats}
        onClose={() => setShowStats(false)}
        customerPhone={order.customer_phone}
        customerName={order.customer_name}
        businessId={business?.id || ''}
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 20,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    zIndex: 10,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    maxWidth: 1200,
    alignSelf: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    padding: 8,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  editButton: {
    padding: 8,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 17,
    fontWeight: '700',
    color: '#111827',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    width: '100%',
    maxWidth: 800,
    alignSelf: 'center',
    paddingVertical: 20,
    paddingBottom: 80,
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
  /* Cards */
  orderCard: {
    marginHorizontal: 16,
    marginBottom: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 12,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  sectionCard: {
    marginHorizontal: 16,
    marginBottom: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  /* Typography & Sections */
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'flex-end', // Only status badge
    alignItems: 'center',
    marginBottom: 20,
  },
  orderNumber: {
    fontSize: 22,
    fontWeight: '800',
    color: '#111827',
    display: 'none', // Hidden as duplicates header
  },
  statusBadge: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 100,
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#6B7280', // Softer gray
    marginBottom: 16,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  /* Customer Info */
  customerSection: {
    marginBottom: 28,
  },
  customerName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 6,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
    gap: 8,
  },
  infoText: {
    fontSize: 15,
    color: '#4B5563',
    fontWeight: '500',
  },
  /* Order Description & Price */
  description: {
    fontSize: 16,
    color: '#1F2937',
    marginBottom: 24,
    lineHeight: 24,
    // Removed background box for cleaner look
    paddingHorizontal: 4,
  },
  priceBreakdown: {
    backgroundColor: '#F9FAFB',
    padding: 20,
    borderRadius: 16,
    gap: 12,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  priceLabel: {
    fontSize: 15,
    color: '#6B7280',
    fontWeight: '500',
  },
  priceValue: {
    fontSize: 15,
    color: '#111827',
    fontWeight: '600',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '800',
    color: '#111827',
  },
  totalValue: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.primary,
  },
  /* Timeline */
  timelineContainer: {
    paddingLeft: 8,
    paddingVertical: 8,
  },
  timelineItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 28,
    position: 'relative',
  },
  timelineDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    marginTop: 3,
    marginRight: 16,
    zIndex: 2,
    borderWidth: 3,
    borderColor: '#FFFFFF',
    // Shadow for dot
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  timelineConnector: {
    position: 'absolute',
    left: 6,
    top: 18,
    bottom: -32,
    width: 2,
    backgroundColor: '#E5E7EB',
    zIndex: 1,
    borderRadius: 1,
  },
  timelineContent: {
    flex: 1,
  },
  timelineTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  timelineTime: {
    fontSize: 13,
    color: '#9CA3AF',
    fontWeight: '500',
  },
  /* Actions */
  actionsContainer: {
    paddingHorizontal: 16,
    marginBottom: 24,
    alignItems: 'center',
    gap: 16,
  },
  actionButton: {
    width: '100%',
    backgroundColor: Colors.primary,
    borderRadius: 16,
    paddingVertical: 16,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 8,
  },
  undoContainer: {
    marginBottom: 8,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#FEF2F2',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 100,
  },
  undoText: {
    color: Colors.status.error,
    fontWeight: '600',
    fontSize: 14,
  },
  deliveryButton: {
    marginTop: 12,
  },
  /* Attachments */
  attachmentThumb: {
    width: 90,
    height: 90,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
  },
  /* Errors & Modals */
  errorText: {
    fontSize: 16,
    color: Colors.status.error,
    textAlign: 'center',
    marginTop: 40,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.95)',
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
    top: 60,
    right: 20,
    zIndex: 10,
    padding: 12,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 100,
  },
  modalActions: {
    position: 'absolute',
    bottom: 50,
    width: '100%',
    paddingHorizontal: 20,
    alignItems: 'center',
  },
});