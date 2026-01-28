import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, RefreshControl, TextInput, TouchableOpacity, Platform, useWindowDimensions } from 'react-native';
import { useBusiness } from '@/contexts/BusinessContext';
import { ordersApi } from '@/lib/api';
import { Order } from '@/types';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { OrderCard } from '@/components/OrderCard';
import { router, useFocusEffect } from 'expo-router';
import { Search, Plus, Filter, Inbox } from 'lucide-react-native';

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
          <Inbox size={48} color="#D1D5DB" />
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
          <Search size={48} color="#D1D5DB" />
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
            {/* Optional: Add a small 'New Order' icon button if strict one-handed usage preferred */}
          </View>

          {/* Search Bar */}
          <View style={styles.searchContainer}>
            <Search size={20} color="#9CA3AF" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search name, phone, order ID..."
              placeholderTextColor="#9CA3AF"
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
                  // Optional: Show toast/alert
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
    backgroundColor: '#F3F4F6', // Slightly darker than white for contrast
  },
  header: {
    backgroundColor: '#FFFFFF',
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
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
    marginBottom: 12,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#111827',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingHorizontal: 12,
    height: 44,
    marginBottom: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#111827',
    height: '100%',
  },
  filterRow: {
    flexDirection: 'row',
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  activeFilterChip: {
    backgroundColor: '#EFF6FF',
    borderColor: '#3B82F6',
  },
  filterText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  activeFilterText: {
    color: '#3B82F6',
  },
  listContent: {
    padding: 16,
    paddingBottom: 100, // Space for tab bar
    flexGrow: 1,
    width: '100%',
    maxWidth: 800,
    alignSelf: 'center',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#374151',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
    marginBottom: 24,
  },
  createButton: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
  },
  createButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 16,
  },
});