import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Users, Trash2, Share2 } from 'lucide-react-native';
import { Input } from '@/components/Input';
import { Button } from '@/components/Button';
import { SettingsSection } from './SettingsSection';
import { BusinessMember, Business } from '@/types';

interface TeamManagementSectionProps {
    business: Business;
    members: BusinessMember[];
    inviteEmail: string;
    setInviteEmail: (email: string) => void;
    onInvite: () => void;
    inviting: boolean;
    onRemove: (id: string) => void;
    onShare: (email: string) => void;
    showTeam: boolean;
    setShowTeam: (show: boolean) => void;
}

export const TeamManagementSection = ({
    business,
    members,
    inviteEmail,
    setInviteEmail,
    onInvite,
    inviting,
    onRemove,
    onShare,
    showTeam,
    setShowTeam,
}: TeamManagementSectionProps) => {

    // Only owner should access detailed controls (ensured by props or logic above)

    return (
        <SettingsSection
            title="Team Management"
            icon={Users}
            headerAction={
                <TouchableOpacity onPress={() => setShowTeam(!showTeam)}>
                    <Text style={{ color: '#3B82F6' }}>{showTeam ? 'Hide' : 'Manage'}</Text>
                </TouchableOpacity>
            }
        >
            {showTeam && (
                <View style={{ marginTop: 8 }}>
                    <View style={styles.inviteRow}>
                        <Input
                            placeholder="staff@email.com"
                            value={inviteEmail}
                            onChangeText={setInviteEmail}
                            autoCapitalize="none"
                            keyboardType="email-address"
                            containerStyle={{ flex: 1, marginBottom: 0 }}
                        />
                        <Button
                            title={inviting ? "..." : "Invite"}
                            onPress={onInvite}
                            disabled={inviting}
                            size="small"
                            style={{ marginLeft: 8, height: 50, justifyContent: 'center' }}
                        />
                    </View>

                    {members.map(member => (
                        <View
                            key={member.id}
                            style={[
                                styles.memberCard,
                                member.status === 'invited' && styles.memberCardPending
                            ]}
                        >
                            <View>
                                <Text style={styles.memberEmail}>{member.email || 'Unknown User'}</Text>
                                <View style={styles.roleBadge}>
                                    <Text style={[
                                        styles.roleText,
                                        member.status === 'invited' && styles.roleTextPending
                                    ]}>
                                        {member.role.toUpperCase()} • {member.status === 'invited' ? '⏳ PENDING' : '✓ ACTIVE'}
                                    </Text>
                                </View>
                            </View>
                            <View style={{ flexDirection: 'row', gap: 12 }}>
                                <TouchableOpacity onPress={() => onShare(member.email || '')}>
                                    <Share2 size={18} color="#3B82F6" />
                                </TouchableOpacity>
                                {member.role !== 'owner' && (
                                    <TouchableOpacity onPress={() => onRemove(member.id)}>
                                        <Trash2 size={18} color="#EF4444" />
                                    </TouchableOpacity>
                                )}
                            </View>
                        </View>
                    ))}
                </View>
            )}
        </SettingsSection>
    );
};

const styles = StyleSheet.create({
    inviteRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 16,
    },
    memberCard: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 12,
        backgroundColor: '#F9FAFB',
        borderRadius: 8,
        marginBottom: 8,
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    memberEmail: {
        fontSize: 14,
        fontWeight: '600',
        color: '#111827',
    },
    roleBadge: {
        marginTop: 2,
    },
    roleText: {
        fontSize: 10,
        color: '#6B7280',
        fontWeight: '500',
    },
    memberCardPending: {
        backgroundColor: '#FEF3C7',
        borderColor: '#F59E0B',
        borderStyle: 'dashed',
    },
    roleTextPending: {
        color: '#D97706',
        fontWeight: '600',
    },
});
