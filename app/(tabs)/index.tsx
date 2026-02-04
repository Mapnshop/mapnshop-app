import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, RefreshControl, TextInput, TouchableOpacity, Platform, useWindowDimensions } from 'react-native';
import { useBusiness } from '@/contexts/BusinessContext';
import { ordersApi } from '@/lib/api';
import { supabase } from '@/lib/supabase';
import { Order } from '@/types';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { OrderCard } from '@/components/OrderCard';
import { router, useFocusEffect } from 'expo-router';
import { Search, Plus, Filter, Inbox } from 'lucide-react-native';
import { Colors } from '@/constants/Colors';
import { Layout } from '@/constants/Layout';

type FilterType = 'active' | 'completed' | 'cancelled' | 'all';

export default function InboxScreen() {
  const { business } = useBusiness();
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeFilter, setActiveFilter] = useState<FilterType>('active');
  const [searchQuery, setSearchQuery] = useState('');

  // Responsive Grid State
  const { width } = useWindowDimensions();
  // 1 col mobile, 2 tablet, 3 desktop
  const numColumns = width > 1200 ? 3 : width > 768 ? 2 : 1;
  const gap = 16;

  // Pagination State
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const LIMIT = 15;

  const loadOrders = async (targetPage = 0, shouldRefresh = false) => {
    if (!business) return;
    if (targetPage > 0 && !hasMore) return;

    try {
      if (targetPage === 0) setLoading(true);
      else setLoadingMore(true);

      const apiFilter = activeFilter === 'all' ? undefined : activeFilter;

      const newOrders = await ordersApi.getByBusinessId(business.id, {
        status: apiFilter as any,
        search: searchQuery || undefined,
        page: targetPage,
        limit: LIMIT
      });

      if (newOrders.length < LIMIT) {
        setHasMore(false);
      } else {
        setHasMore(true);
      }

      if (targetPage === 0 || shouldRefresh) {
        setOrders(newOrders);
      } else {
        setOrders(prev => [...prev, ...newOrders]);
      }

      setPage(targetPage);
    } catch (error) {
      console.error('Failed to load orders:', error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
      setRefreshing(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    setHasMore(true);
    await loadOrders(0, true);
  };

  const handleLoadMore = () => {
    if (!loadingMore && !loading && hasMore) {
      loadOrders(page + 1);
    }
  };

  // Debounced search effect or just reset page on search change
  useEffect(() => {
    // Reset pagination when search or filter changes
    setOrders([]);
    setPage(0);
    setHasMore(true);
    loadOrders(0, true);
  }, [activeFilter, searchQuery]); // Re-fetch when filter/search changes

  useFocusEffect(
    useCallback(() => {
      loadOrders(0, true);
    }, [business]) // Refresh on focus, but maybe just page 0?
  );

  // Real-time subscription for order changes
  useEffect(() => {
    if (!business) return;

    console.log('Setting up real-time subscription for orders');

    const channel = supabase
      .channel('orders-changes')
      .on(
        'postgres_changes',
        {
          event: '*', // Listen to all events (INSERT, UPDATE, DELETE)
          schema: 'public',
          table: 'orders',
          filter: `business_id=eq.${business.id}`
        },
        (payload) => {
          console.log('Order change detected:', payload);
          // Refresh the list when any order changes
          loadOrders(0, true);
        }
      )
      .subscribe();

    return () => {
      console.log('Cleaning up real-time subscription');
      supabase.removeChannel(channel);
    };
  }, [business?.id, activeFilter, searchQuery]);

  // Client-side filtering is no longer primary if we server-search, 
  // but for smoothing UX we can keep it if needed. 
  // However, since we moved search to API, we direct filteredOrders = orders.
  useEffect(() => {
    setFilteredOrders(orders);
  }, [orders]);

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      {activeFilter === 'active' && !searchQuery ? (
        <>
          <Inbox size={48} color={Colors.border} />
          <Text style={styles.emptyText}>All caught up!</Text>
          <Text style={styles.emptySubtext}>No active orders right now.</Text>
          <TouchableOpacity
            style={styles.createButton}
            onPress={() => router.push('/(tabs)/create-order')}
          >
            <Text style={styles.createButtonText}>Create New Order</Text>
          </TouchableOpacity>
        </>
      ) : (
        <>
          <Search size={48} color={Colors.border} />
          <Text style={styles.emptyText}>No orders found</Text>
          <Text style={styles.emptySubtext}>Try adjusting your filters or search.</Text>
        </>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header Area */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.titleRow}>
            <Text style={styles.title}>Inbox</Text>
          </View>

          {/* Search Bar */}
          <View style={styles.searchContainer}>
            <Search size={20} color={Colors.text.placeholder} style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search name, phone, order ID..."
              placeholderTextColor={Colors.text.placeholder}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>

          {/* Filter Chips */}
          <View style={styles.filterRow}>
            {(['active', 'completed', 'cancelled', 'all'] as FilterType[]).map((f) => (
              <TouchableOpacity
                key={f}
                style={[
                  styles.filterChip,
                  activeFilter === f && styles.activeFilterChip,
                ]}
                onPress={() => setActiveFilter(f)}
              >
                <Text
                  style={[
                    styles.filterText,
                    activeFilter === f && styles.activeFilterText,
                  ]}
                >
                  {f.charAt(0).toUpperCase() + f.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>

      {/* Orders List */}
      {loading && !refreshing ? (
        <LoadingSpinner />
      ) : (
        <FlatList
          data={filteredOrders}
          renderItem={({ item }) => (
            <OrderCard
              order={item}
              onPress={() => router.push(`/order/${item.id}`)}
              onQuickAction={async (action) => {
                try {
                  let newStatus: Order['status'] | null = null;
                  if (action === 'prepare') newStatus = 'preparing';
                  if (action === 'ready') newStatus = 'ready';
                  if (action === 'complete') newStatus = 'completed';

                  if (newStatus) {
                    await ordersApi.updateStatus(item.id, newStatus);
                    await loadOrders(); // Refresh list to show new status/move item
                  }
                } catch (error) {
                  console.error('Failed to update status:', error);
                }
              }}
            />
          )}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.5}
          ListFooterComponent={loadingMore ? <LoadingSpinner /> : <View style={{ height: 20 }} />}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          ListEmptyComponent={renderEmptyState}
          showsVerticalScrollIndicator={false}
          keyboardDismissMode="on-drag"
          keyboardShouldPersistTaps="handled"
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.surface, // Matches the page background off-white
  },
  header: {
    backgroundColor: Colors.background,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: Layout.spacing.lg,
    paddingHorizontal: Layout.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerContent: {
    width: '100%',
    maxWidth: 800,
    alignSelf: 'center',
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Layout.spacing.md,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: Colors.text.primary,
    letterSpacing: -0.5,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: Layout.borderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: Layout.spacing.md,
    height: 48,
    marginBottom: Layout.spacing.md,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: Colors.text.primary,
    height: '100%',
  },
  filterRow: {
    flexDirection: 'row',
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 999, // Pill shape
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  activeFilterChip: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  filterText: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.text.secondary,
  },
  activeFilterText: {
    color: Colors.primaryForeground,
    fontWeight: '600',
  },
  listContent: {
    padding: Layout.spacing.md,
    paddingBottom: 100, // Space for tab bar
    flexGrow: 1,
    width: '100%',
    maxWidth: 800,
    alignSelf: 'center',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 80,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text.primary,
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: Colors.text.secondary,
    marginTop: 4,
    marginBottom: 24,
  },
  createButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 999,
  },
  createButtonText: {
    color: Colors.primaryForeground,
    fontWeight: '600',
    fontSize: 15,
  },
});