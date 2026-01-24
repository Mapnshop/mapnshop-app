import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, TouchableOpacity } from 'react-native';
import { useBusiness } from '@/contexts/BusinessContext';
import { dashboardApi } from '@/lib/api';
import { DailyReport } from '@/types';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { TrendingUp, Package, Truck, DollarSign } from 'lucide-react-native';

type DateRange = 'today' | 'yesterday' | 'week';

export default function ReportsScreen() {
  const { business } = useBusiness();
  const [report, setReport] = useState<DailyReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [dateRange, setDateRange] = useState<DateRange>('today');

  const loadReport = async () => {
    if (!business) return;

    try {
      const reportData = await dashboardApi.getDailyReport(business.id, dateRange);
      setReport(reportData);
    } catch (error) {
      console.error('Failed to load report:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadReport();
    setRefreshing(false);
  };

  useEffect(() => {
    loadReport();
  }, [business, dateRange]);

  if (loading && !refreshing && !report) {
    return <LoadingSpinner />;
  }

  if (!report) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Failed to load report data</Text>
      </View>
    );
  }

  const getDateLabel = () => {
    if (dateRange === 'today') return "Today";
    if (dateRange === 'yesterday') return "Yesterday";
    return "Last 7 Days";
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.title}>Summary</Text>

          {/* Date Switcher */}
          <View style={styles.filterRow}>
            {(['today', 'yesterday', 'week'] as DateRange[]).map((range) => (
              <TouchableOpacity
                key={range}
                style={[
                  styles.filterChip,
                  dateRange === range && styles.activeFilterChip
                ]}
                onPress={() => setDateRange(range)}
              >
                <Text style={[
                  styles.filterText,
                  dateRange === range && styles.activeFilterText
                ]}>
                  {range === 'week' ? 'Last 7 Days' : range.charAt(0).toUpperCase() + range.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.metricsContainer}>
          <View style={styles.metricCard}>
            <View style={[styles.metricIcon, { backgroundColor: '#EBF8FF' }]}>
              <Package size={24} color="#3B82F6" />
            </View>
            <Text style={styles.metricNumber}>{report.orders_today}</Text>
            <Text style={styles.metricLabel}>Orders</Text>
          </View>

          <View style={styles.metricCard}>
            <View style={[styles.metricIcon, { backgroundColor: '#F0FDF4' }]}>
              <DollarSign size={24} color="#059669" />
            </View>
            <Text style={styles.metricNumber}>${report.total_revenue.toFixed(0)}</Text>
            <Text style={styles.metricLabel}>Revenue</Text>
          </View>

          <View style={styles.metricCard}>
            <View style={[styles.metricIcon, { backgroundColor: '#FEF3C7' }]}>
              <Truck size={24} color="#D97706" />
            </View>
            <Text style={styles.metricNumber}>{report.delivered_count}</Text>
            <Text style={styles.metricLabel}>Deliveries</Text>
          </View>

          <View style={styles.metricCard}>
            <View style={[styles.metricIcon, { backgroundColor: '#F3E8FF' }]}>
              <TrendingUp size={24} color="#7C3AED" />
            </View>
            <Text style={styles.metricNumber}>{report.pickup_count}</Text>
            <Text style={styles.metricLabel}>Pickups</Text>
          </View>
        </View>

        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Performance ({getDateLabel()})</Text>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Average Order Value</Text>
            <Text style={styles.summaryValue}>
              ${report.orders_today > 0 ? (report.total_revenue / report.orders_today).toFixed(2) : '0.00'}
            </Text>
          </View>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Delivery Rate</Text>
            <Text style={styles.summaryValue}>
              {report.orders_today > 0 ? Math.round((report.delivered_count / report.orders_today) * 100) : 0}%
            </Text>
          </View>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Pickup Rate</Text>
            <Text style={styles.summaryValue}>
              {report.orders_today > 0 ? Math.round((report.pickup_count / report.orders_today) * 100) : 0}%
            </Text>
          </View>
        </View>

        <View style={styles.insightsCard}>
          <Text style={styles.insightsTitle}>Quick Insights</Text>

          {report.orders_today === 0 ? (
            <Text style={styles.insightText}>No orders in this period.</Text>
          ) : (
            <>
              <Text style={styles.insightText}>
                • You've processed {report.orders_today} order{report.orders_today !== 1 ? 's' : ''}
              </Text>
              <Text style={styles.insightText}>
                • {report.delivered_count > report.pickup_count ? 'Delivery' : 'Pickup'} was the primary method
              </Text>
              <Text style={styles.insightText}>
                • Revenue: ${report.total_revenue.toFixed(2)}
              </Text>
            </>
          )}
        </View>
      </ScrollView>
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
  },
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
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 12,
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
  metricsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 20,
    gap: 16,
  },
  metricCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  metricIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  metricNumber: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  metricLabel: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
  summaryCard: {
    margin: 20,
    marginTop: 0,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  summaryLabel: {
    fontSize: 16,
    color: '#6B7280',
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  insightsCard: {
    margin: 20,
    marginTop: 0,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  insightsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12,
  },
  insightText: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
    marginBottom: 8,
  },
  errorText: {
    fontSize: 16,
    color: '#EF4444',
    textAlign: 'center',
    marginTop: 40,
  },
});