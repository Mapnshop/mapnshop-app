import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import { Order } from '@/types';

export const exportUtil = {
    generateOrdersCSV: (orders: Order[]) => {
        const header = [
            'Order ID',
            'Date',
            'Customer Name',
            'Phone',
            'Status',
            'Total ($)',
            'Subtotal',
            'Tax',
            'Delivery Fee',
            'Address',
            'Source'
        ].join(',');

        const rows = orders.map(order => {
            const date = new Date(order.created_at).toLocaleDateString();
            const safeAddress = `"${(order.address || '').replace(/"/g, '""')}"`;
            const safeName = `"${(order.customer_name || '').replace(/"/g, '""')}"`;

            return [
                order.id.slice(0, 8),
                date,
                safeName,
                order.customer_phone,
                order.status,
                (order.total || order.price).toFixed(2),
                (order.subtotal || 0).toFixed(2),
                (order.tax || 0).toFixed(2),
                (order.delivery_fee || 0).toFixed(2),
                safeAddress,
                order.source
            ].join(',');
        });

        return [header, ...rows].join('\n');
    },

    shareFile: async (content: string, filename: string) => {
        try {
            const fileUri = FileSystem.documentDirectory + filename;
            await FileSystem.writeAsStringAsync(fileUri, content, {
                encoding: 'utf8',
            });

            if (await Sharing.isAvailableAsync()) {
                await Sharing.shareAsync(fileUri);
            } else {
                throw new Error('Sharing is not available on this device');
            }
        } catch (error) {
            console.error('Share failed:', error);
            throw error;
        }
    }
};
