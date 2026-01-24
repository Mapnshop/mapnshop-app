import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Clock } from 'lucide-react-native';
import { SettingsSection } from './SettingsSection';
import { BusinessHoursEditor } from '@/components/BusinessHoursEditor';
import { Button } from '@/components/Button';
import { Business } from '@/types';

interface BusinessHoursSectionProps {
    business: Business;
    formData: any;
    setFormData: (data: any) => void;
    loading: boolean;
    onSave: () => void;
}

export const BusinessHoursSection = ({
    business,
    formData,
    setFormData,
    loading,
    onSave,
}: BusinessHoursSectionProps) => {
    const [editing, setEditing] = useState(false);

    return (
        <SettingsSection
            title="Business Hours"
            icon={Clock}
            isEditing={editing}
            onEdit={() => setEditing(true)}
        >
            {editing ? (
                <View>
                    <BusinessHoursEditor
                        value={formData.opening_hours}
                        onChange={(text: string) => setFormData({ ...formData, opening_hours: text })}
                    />
                    <View style={{ flexDirection: 'row', gap: 12, marginTop: 16 }}>
                        <Button
                            title="Cancel"
                            onPress={() => setEditing(false)}
                            variant="outline"
                            style={{ flex: 1 }}
                        />
                        <Button
                            title={loading ? 'Saving...' : 'Save'}
                            onPress={() => {
                                onSave();
                                setEditing(false);
                            }}
                            disabled={loading}
                            style={{ flex: 1 }}
                        />
                    </View>
                </View>
            ) : (
                <View style={{ gap: 8 }}>
                    <Text style={{ fontSize: 14, color: '#111827' }}>
                        {business.opening_hours || 'No hours set'}
                    </Text>
                </View>
            )}
        </SettingsSection>
    );
};

