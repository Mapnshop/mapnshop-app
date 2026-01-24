import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LucideIcon } from 'lucide-react-native';
import { Button } from '@/components/Button';

interface SettingsSectionProps {
  title: string;
  icon: LucideIcon;
  isEditing?: boolean;
  onEdit?: () => void;
  children: React.ReactNode;
  headerAction?: React.ReactNode;
}

export const SettingsSection = ({
  title,
  icon: Icon,
  isEditing,
  onEdit,
  children,
  headerAction
}: SettingsSectionProps) => {
  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <View style={styles.headerTitleRow}>
          <Icon size={20} color="#3B82F6" />
          <Text style={styles.sectionTitle}>{title}</Text>
        </View>

        {headerAction}

        {onEdit && !isEditing && !headerAction && (
          <Button
            title="Edit"
            onPress={onEdit}
            variant="outline"
            size="small"
          />
        )}
      </View>

      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  section: {
    marginHorizontal: 16,
    marginBottom: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
});
