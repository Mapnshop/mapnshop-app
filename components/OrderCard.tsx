import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Pressable, Platform } from 'react-native';
import { Order } from '@/types';
import { MapPin, Phone, Clock, MessageCircle, Store, Check, ArrowRight, Play } from 'lucide-react-native';

interface OrderCardProps {
  order: Order;
  onPress: () => void;
  onQuickAction?: (action: 'prepare' | 'ready' | 'complete') => void;
}

export function OrderCard({ order, onPress, onQuickAction }: OrderCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  const getStatusColor = (status: Order['status']) => {
    switch (status) {
      case 'created': return '#EF4444';
      case 'preparing': return '#F59E0B';
      case 'ready': return '#3B82F6';
      case 'completed': return '#10B981';
      default: return '#6B7280';
    }
  };

  const getStatusText = (status: Order['status']) => {
    switch (status) {
      case 'created': return 'New';
      case 'preparing': return 'Preparing';
      case 'ready': return 'Ready';
      case 'completed': return 'Completed';
      default: return status;
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const now = new Date();
    const created = new Date(dateString);
    const diffInMinutes = Math.floor((now.getTime() - created.getTime()) / 60000);

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;
    return `${Math.floor(diffInHours / 24)}d ago`;
  };

  const renderQuickAction = () => {
    if (!onQuickAction) return null;

    // One-tap logic: Suggest the NEXT logical step
    let action: 'prepare' | 'ready' | 'complete' | null = null;
    let label = '';
    let icon = null;
    let color = '';

    if (order.status === 'created') {
      action = 'prepare';
      label = 'Start';
      icon = <Play size={16} color="white" />;
      color = '#F59E0B'; // Go to Orange (Preparing)
    } else if (order.status === 'preparing') {
      action = 'ready';
      label = 'Ready';
      icon = <Check size={16} color="white" />;
      color = '#3B82F6'; // Go to Blue (Ready)
    } else if (order.status === 'ready') {
      action = 'complete';
      label = 'Done';
      icon = <Check size={16} color="white" />;
      color = '#10B981'; // Go to Green (Completed)
    }

    if (!action) return null;

    return (
      <TouchableOpacity
        style={[styles.quickActionButton, { backgroundColor: color }]}
        onPress={(e) => {
          e.stopPropagation(); // Prevent opening details
          onQuickAction(action!);
        }}
      >
        {icon}
        <Text style={styles.quickActionText}>{label}</Text>
      </TouchableOpacity>
    );
  };

  return (
    <Pressable
      style={[
        styles.card,
        isHovered && Platform.OS === 'web' && styles.cardHovered
      ]}
      onPress={onPress}
      onHoverIn={() => setIsHovered(true)}
      onHoverOut={() => setIsHovered(false)}
    >
      <View style={styles.header}>
        <View style={styles.customerInfo}>
          <Text style={styles.customerName} numberOfLines={1}>{order.customer_name}</Text>
          <View style={styles.phoneRow}>
            {order.source === 'whatsapp' ? <MessageCircle size={12} color="#25D366" /> : <Phone size={12} color="#6B7280" />}
            <Text style={styles.phone}>{order.customer_phone}</Text>
          </View>
        </View>

        {/* Time Badge - Highly visible for "operational" feel */}
        <View style={styles.timeBadge}>
          <Clock size={12} color="#6B7280" />
          <Text style={styles.timeText}>{formatTimeAgo(order.created_at)}</Text>
        </View>
      </View>

      <Text style={styles.description} numberOfLines={2}>
        {order.description}
      </Text>

      <View style={styles.footer}>
        <View style={styles.statusRow}>
          <View style={[styles.statusDot, { backgroundColor: getStatusColor(order.status) }]} />
          <Text style={[styles.statusLabel, { color: getStatusColor(order.status) }]}>
            {getStatusText(order.status)}
          </Text>
        </View>

        <View style={styles.rightFooter}>
          <Text style={styles.price}>${order.price.toFixed(2)}</Text>
          {renderQuickAction()}
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  customerInfo: {
    flex: 1,
    marginRight: 8,
  },
  customerName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 2,
  },
  phoneRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  phone: {
    fontSize: 13,
    color: '#6B7280',
  },
  timeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  timeText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#4B5563',
  },
  description: {
    fontSize: 15,
    color: '#374151',
    marginBottom: 16,
    lineHeight: 20,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
  rightFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  price: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
  },
  quickActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    elevation: 1,
  },
  quickActionText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 13,
  },
  cardHovered: {
    transform: [{ translateY: -2 }],
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    borderColor: '#3B82F6',
  }
});