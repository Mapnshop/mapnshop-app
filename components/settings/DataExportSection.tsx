import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { Download, FileText } from 'lucide-react-native';
import { SettingsSection } from './SettingsSection';
import { Button } from '@/components/Button';
import { ordersApi } from '@/lib/api';
import { exportUtil } from '@/lib/exportUtil';

interface DataExportSectionProps {
    businessId: string;
}

export const DataExportSection = ({ businessId }: DataExportSectionProps) => {
    const [exporting, setExporting] = useState(false);

    const handleExport = async (range: 'today' | 'week' | 'month') => {
        setExporting(true);
        try {
            // 1. Fetch Orders
            // Note: We need a new API method to fetch strict date ranges for export, 
            // ensuring we get ALL records, not just a page.
            // reusing existing list method for now with a large limit might be an MVP hack,
            // but simpler is to rely on the daily report logic extended or a specific export endpoint.

            // For MVP: Fetch "recent" (limit 100) or assume local state? 
            // Better: Use the supabase client directly here or extend API.
            // Let's assume we extend ordersApi.list with a 'limit' param.

            const orders = await ordersApi.list(businessId, 'all');
            // 'all' status fetches everything. We might need client-side date filtering or server-side.

            const filteredOrders = orders.filter(o => {
                const d = new Date(o.created_at);
                const now = new Date();
                if (range === 'today') return d.toDateString() === now.toDateString();
                if (range === 'week') {
                    const weekAgo = new Date();
                    weekAgo.setDate(now.getDate() - 7);
                    return d >= weekAgo;
                }
                if (range === 'month') {
                    const monthAgo = new Date();
                    monthAgo.setDate(now.getDate() - 30); // Approx
                    return d >= monthAgo;
                }
                return true;
            });

            if (filteredOrders.length === 0) {
                Alert.alert('No Data', 'No orders found for this period.');
                return;
            }

            // 2. Generate CSV
            const csv = exportUtil.generateOrdersCSV(filteredOrders);

            // 3. Share
            await exportUtil.shareFile(csv, `orders_export_${range}_${Date.now()}.csv`);

        } catch (error) {
            Alert.alert('Error', 'Failed to export data');
            console.error(error);
        } finally {
            setExporting(false);
        }
    };

    return (
        <SettingsSection
            title="Data & Export"
            icon={Download}
        >
            <Text style={styles.description}>
                Export your order history as a CSV file for accounting or analysis.
            </Text>

            <View style={styles.buttonGrid}>
                <Button
                    title="Today"
                    onPress={() => handleExport('today')}
                    variant="outline"
                    size="small"
                    disabled={exporting}
                    icon={<FileText size={14} color="#3B82F6" />}
                />
                <Button
                    title="Last 7 Days"
                    onPress={() => handleExport('week')}
                    variant="outline"
                    size="small"
                    disabled={exporting}
                    icon={<FileText size={14} color="#3B82F6" />}
                />
                <Button
                    title="Last 30 Days"
                    onPress={() => handleExport('month')}
                    variant="outline"
                    size="small"
                    disabled={exporting}
                    icon={<FileText size={14} color="#3B82F6" />}
                />
            </View>
        </SettingsSection>
    );
};

const styles = StyleSheet.create({
    description: {
        fontSize: 14,
        color: '#6B7280',
        marginBottom: 16,
    },
    buttonGrid: {
        flexDirection: 'row',
        gap: 8,
        flexWrap: 'wrap',
    },
});
