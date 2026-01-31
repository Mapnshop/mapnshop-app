import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Pressable, Platform } from 'react-native';
import { Order } from '@/types';
import { MapPin, Phone, Clock, MessageCircle, Store, Check, ArrowRight, Play } from 'lucide-react-native';
import { Colors } from '@/constants/Colors';
import { Layout } from '@/constants/Layout';

interface OrderCardProps {
  order: Order;
  onPress: () => void;
  onQuickAction?: (action: 'prepare' | 'ready' | 'complete') => void;
}

export function OrderCard({ order, onPress, onQuickAction }: OrderCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  const getStatusColor = (status: Order['status']) => {
    switch (status) {
      case 'created': return Colors.status.error;
      case 'preparing': return Colors.status.warning;
      case 'ready': return Colors.status.info;
      case 'completed': return Colors.status.success;
      default: return Colors.text.secondary;
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
      icon = <Play size={14} color="white" />;
      color = Colors.status.warning;
    } else if (order.status === 'preparing') {
      action = 'ready';
      label = 'Ready';
      icon = <Check size={14} color="white" />;
      color = Colors.status.info;
    } else if (order.status === 'ready') {
      action = 'complete';
      label = 'Done';
      icon = <Check size={14} color="white" />;
      color = Colors.status.success;
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
            {order.source === 'whatsapp' ? <MessageCircle size={12} color="#25D366" /> : <Phone size={12} color={Colors.text.secondary} />}
            <Text style={styles.phone}>{order.customer_phone}</Text>
          </View>
        </View>

        {/* Time Badge - Highly visible for "operational" feel */}
        <View style={styles.timeBadge}>
          <Clock size={12} color={Colors.text.secondary} />
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
    backgroundColor: Colors.background,
    borderRadius: Layout.borderRadius.lg,
    padding: Layout.spacing.md,
    marginBottom: Layout.spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Platform.select({
      web: {
        boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.05)',
      },
      ios: {
        shadowColor: 'rgba(0,0,0,0.05)',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 1,
        shadowRadius: 2,
      },
      android: {
        elevation: 1,
      },
    }),
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Layout.spacing.sm,
  },
  customerInfo: {
    flex: 1,
    marginRight: Layout.spacing.sm,
  },
  customerName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: 2,
    letterSpacing: -0.3,
  },
  phoneRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  phone: {
    fontSize: 13,
    color: Colors.text.secondary,
  },
  timeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.surface,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: Layout.borderRadius.sm,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  timeText: {
    fontSize: 12,
    fontWeight: '500',
    color: Colors.text.secondary,
  },
  description: {
    fontSize: 15,
    color: Colors.text.primary, // Darker text for readability
    marginBottom: Layout.spacing.md,
    lineHeight: 22,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: Layout.spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
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
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: -0.2,
  },
  rightFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  price: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text.primary,
    fontVariant: ['tabular-nums'], // Better for numbers
  },
  quickActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999, // Pill shape
  },
  quickActionText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 12,
  },
  cardHovered: {
    transform: [{ translateY: -2 }],
    borderColor: Colors.primary,
    ...Platform.select({
      web: {
        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.05), 0 4px 6px -2px rgba(0, 0, 0, 0.025)',
      }
    }),
  }
});