import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, TouchableOpacity, Platform } from 'react-native';
import { useBusiness } from '@/contexts/BusinessContext';
import { dashboardApi } from '@/lib/api';
import { DailyReport } from '@/types';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { TrendingUp, Package, Truck, DollarSign } from 'lucide-react-native';
import { Colors } from '@/constants/Colors';
import { Layout } from '@/constants/Layout';
import { ScreenContainer } from '@/components/ScreenContainer';

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
    <ScreenContainer scrollable>
      <View style={styles.header}>
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

      <View style={styles.metricsContainer}>
        {/* Revenue Card (Primary) */}
        <View style={[styles.metricCard, styles.primaryCard]}>
          <View style={[styles.metricIcon, { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
            <DollarSign size={24} color="#FFFFFF" />
          </View>
          <Text style={[styles.metricNumber, { color: '#FFFFFF' }]}>${report.total_revenue.toFixed(0)}</Text>
          <Text style={[styles.metricLabel, { color: 'rgba(255,255,255,0.8)' }]}>Revenue</Text>
        </View>

        {/* Other Cards */}
        <View style={styles.metricCard}>
          <View style={[styles.metricIcon, { backgroundColor: Colors.surface }]}>
            <Package size={24} color={Colors.primary} />
          </View>
          <Text style={styles.metricNumber}>{report.orders_today}</Text>
          <Text style={styles.metricLabel}>Orders</Text>
        </View>

        <View style={styles.metricCard}>
          <View style={[styles.metricIcon, { backgroundColor: Colors.surface }]}>
            <Truck size={24} color={Colors.text.primary} />
          </View>
          <Text style={styles.metricNumber}>{report.delivered_count}</Text>
          <Text style={styles.metricLabel}>Deliveries</Text>
        </View>

        <View style={styles.metricCard}>
          <View style={[styles.metricIcon, { backgroundColor: Colors.surface }]}>
            <TrendingUp size={24} color={Colors.text.primary} />
          </View>
          <Text style={styles.metricNumber}>{report.pickup_count}</Text>
          <Text style={styles.metricLabel}>Pickups</Text>
        </View>
      </View>

      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>Performance ({getDateLabel()})</Text>

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

      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>Quick Insights</Text>

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

      {/* Spacer for bottom tabs */}
      <View style={{ height: 40 }} />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    marginBottom: Layout.spacing.lg,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: Colors.text.primary,
    marginBottom: 12,
    letterSpacing: -0.5,
  },
  filterRow: {
    flexDirection: 'row',
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 999,
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
  metricsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: Layout.spacing.lg,
  },
  metricCard: {
    width: '48%', // Approx 2 columns
    backgroundColor: Colors.surface,
    borderRadius: Layout.borderRadius.lg,
    padding: 16,
    alignItems: 'flex-start',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  primaryCard: {
    width: '100%', // Full width for revenue
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 24,
  },
  metricIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  metricNumber: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.text.primary,
    marginBottom: 2,
    letterSpacing: -0.5,
  },
  metricLabel: {
    fontSize: 13,
    color: Colors.text.secondary,
    fontWeight: '500',
  },
  sectionCard: {
    backgroundColor: Colors.surface,
    borderRadius: Layout.borderRadius.lg,
    padding: Layout.spacing.lg,
    marginBottom: Layout.spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text.primary,
    marginBottom: 16,
    letterSpacing: -0.3,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  summaryLabel: {
    fontSize: 15,
    color: Colors.text.secondary,
  },
  summaryValue: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.text.primary,
  },
  insightText: {
    fontSize: 14,
    color: Colors.text.secondary,
    lineHeight: 22,
    marginBottom: 8,
  },
  errorText: {
    fontSize: 16,
    color: Colors.status.error,
    textAlign: 'center',
    marginTop: 40,
  },
});