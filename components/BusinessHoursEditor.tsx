import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Switch } from 'react-native';
import { Input } from './Input';

interface BusinessHoursEditorProps {
    value: string;
    onChange: (value: string) => void;
}

// Simple structure for the editor
// We will output a string like "Mon-Fri: 09:00-17:00, Sat: 10:00-14:00, Sun: Closed"
export function BusinessHoursEditor({ value, onChange }: BusinessHoursEditorProps) {
    // Local state for the "simple" editor mode
    const [weekdaysOpen, setWeekdaysOpen] = useState(true);
    const [weekdaysStart, setWeekdaysStart] = useState('09:00');
    const [weekdaysEnd, setWeekdaysEnd] = useState('18:00');

    const [weekendsOpen, setWeekendsOpen] = useState(false);
    const [weekendsStart, setWeekendsStart] = useState('10:00');
    const [weekendsEnd, setWeekendsEnd] = useState('15:00');

    // Initial parse effect - run only once on mount or when value dramatically changes externally
    // We essentially ignore value updates while editing to rely on local state, 
    // but we need to load the saved state initially.
    useEffect(() => {
        if (!value) return;

        // Simple parser for "Mon-Fri: 09:00-18:00, Sat-Sun: 10:00-15:00" format
        // This is fragile but suffices for this simple editor.
        if (value.includes('Mon-Fri: Closed')) {
            setWeekdaysOpen(false);
        } else {
            const match = value.match(/Mon-Fri: (\d{2}:\d{2})-(\d{2}:\d{2})/);
            if (match) {
                setWeekdaysOpen(true);
                setWeekdaysStart(match[1]);
                setWeekdaysEnd(match[2]);
            }
        }

        if (value.includes('Sat-Sun: Closed')) {
            setWeekendsOpen(false);
        } else {
            const match = value.match(/Sat-Sun: (\d{2}:\d{2})-(\d{2}:\d{2})/);
            if (match) {
                setWeekendsOpen(true);
                setWeekendsStart(match[1]);
                setWeekendsEnd(match[2]);
            }
        }
    }, []); // Empty dependency array = only populate from prop on mount


    // Effect to update parent whenever local state changes
    useEffect(() => {
        const parts = [];
        if (weekdaysOpen) {
            parts.push(`Mon-Fri: ${weekdaysStart}-${weekdaysEnd}`);
        } else {
            parts.push('Mon-Fri: Closed');
        }

        if (weekendsOpen) {
            parts.push(`Sat-Sun: ${weekendsStart}-${weekendsEnd}`);
        } else {
            parts.push('Sat-Sun: Closed');
        }

        const newValue = parts.join(', ');
        // Only update if it's different to avoid loops (though string comp is cheap)
        if (value !== newValue) {
            onChange(newValue);
        }
    }, [weekdaysOpen, weekdaysStart, weekdaysEnd, weekendsOpen, weekendsStart, weekendsEnd]);

    return (
        <View style={styles.container}>
            <Text style={styles.label}>Business Hours Config</Text>

            {/* Weekdays Section */}
            <View style={styles.section}>
                <View style={styles.row}>
                    <Text style={styles.sectionTitle}>Weekdays (Mon-Fri)</Text>
                    <Switch value={weekdaysOpen} onValueChange={setWeekdaysOpen} />
                </View>

                {weekdaysOpen && (
                    <View style={styles.timeRow}>
                        <Input
                            value={weekdaysStart}
                            onChangeText={setWeekdaysStart}
                            placeholder="09:00"
                            containerStyle={{ flex: 1 }}
                        />
                        <Text style={styles.toText}>to</Text>
                        <Input
                            value={weekdaysEnd}
                            onChangeText={setWeekdaysEnd}
                            placeholder="18:00"
                            containerStyle={{ flex: 1 }}
                        />
                    </View>
                )}
            </View>

            {/* Weekends Section */}
            <View style={styles.section}>
                <View style={styles.row}>
                    <Text style={styles.sectionTitle}>Weekends (Sat-Sun)</Text>
                    <Switch value={weekendsOpen} onValueChange={setWeekendsOpen} />
                </View>

                {weekendsOpen && (
                    <View style={styles.timeRow}>
                        <Input
                            value={weekendsStart}
                            onChangeText={setWeekendsStart}
                            placeholder="10:00"
                            containerStyle={{ flex: 1 }}
                        />
                        <Text style={styles.toText}>to</Text>
                        <Input
                            value={weekendsEnd}
                            onChangeText={setWeekendsEnd}
                            placeholder="15:00"
                            containerStyle={{ flex: 1 }}
                        />
                    </View>
                )}
            </View>

            <Text style={styles.previewLabel}>Preview: {value}</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginBottom: 16,
        gap: 12,
    },
    label: {
        fontSize: 16,
        fontWeight: '600',
        color: '#374151',
        marginBottom: 8,
    },
    section: {
        backgroundColor: '#F9FAFB',
        padding: 12,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    sectionTitle: {
        fontSize: 14,
        fontWeight: '500',
        color: '#111827',
    },
    timeRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    toText: {
        fontSize: 14,
        color: '#6B7280',
        marginTop: -16, // Align with input text roughly
    },
    previewLabel: {
        fontSize: 12,
        color: '#6B7280',
        fontStyle: 'italic',
    }
});
