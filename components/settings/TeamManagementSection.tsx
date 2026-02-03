import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Users, Trash2, Share2 } from 'lucide-react-native';
import { Input } from '@/components/Input';
import { Button } from '@/components/Button';
import { SettingsSection } from './SettingsSection';
import { BusinessMember, Business } from '@/types';
import { Colors } from '@/constants/Colors';
import { Layout } from '@/constants/Layout';

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

    return (
        <SettingsSection
            title="Team Management"
            icon={Users}
            headerAction={
                <TouchableOpacity onPress={() => setShowTeam(!showTeam)}>
                    <Text style={styles.toggleText}>{showTeam ? 'Hide' : 'Manage'}</Text>
                </TouchableOpacity>
            }
        >
            {showTeam && (
                <View style={styles.content}>
                    <View style={styles.inviteRow}>
                        <Input
                            placeholder="staff@email.com"
                            value={inviteEmail}
                            onChangeText={setInviteEmail}
                            autoCapitalize="none"
                            keyboardType="email-address"
                            containerStyle={styles.inputContainer}
                        />
                        <Button
                            title={inviting ? "..." : "Invite"}
                            onPress={onInvite}
                            disabled={inviting}
                            size="small"
                            style={styles.inviteButton}
                        />
                    </View>

                    {members.length === 0 ? (
                        <View style={styles.emptyState}>
                            <Users size={32} color={Colors.text.placeholder} />
                            <Text style={styles.emptyText}>No team members yet</Text>
                            <Text style={styles.emptySubtext}>Invite someone to get started</Text>
                        </View>
                    ) : (
                        members.map(member => (
                            <View
                                key={member.id}
                                style={[
                                    styles.memberCard,
                                    member.status === 'invited' && styles.memberCardPending
                                ]}
                            >
                                <View style={styles.memberInfo}>
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
                                <View style={styles.actions}>
                                    <TouchableOpacity
                                        onPress={() => onShare(member.email || '')}
                                        style={styles.actionButton}
                                    >
                                        <Share2 size={20} color={Colors.primary} />
                                    </TouchableOpacity>
                                    {member.role !== 'owner' && (
                                        <TouchableOpacity
                                            onPress={() => onRemove(member.id)}
                                            style={styles.actionButton}
                                        >
                                            <Trash2 size={20} color={Colors.status.error} />
                                        </TouchableOpacity>
                                    )}
                                </View>
                            </View>
                        ))
                    )}
                </View>
            )}
        </SettingsSection>
    );
};

const styles = StyleSheet.create({
    content: {
        marginTop: Layout.spacing.md,
    },
    toggleText: {
        color: Colors.primary,
        fontSize: 14,
        fontWeight: '600',
    },
    inviteRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: Layout.spacing.lg,
        gap: Layout.spacing.sm,
    },
    inputContainer: {
        flex: 1,
        marginBottom: 0,
    },
    inviteButton: {
        height: 50,
        justifyContent: 'center',
        paddingHorizontal: Layout.spacing.lg,
    },
    emptyState: {
        alignItems: 'center',
        paddingVertical: Layout.spacing.xl * 2,
        gap: Layout.spacing.sm,
    },
    emptyText: {
        fontSize: 16,
        fontWeight: '600',
        color: Colors.text.secondary,
        marginTop: Layout.spacing.sm,
    },
    emptySubtext: {
        fontSize: 14,
        color: Colors.text.placeholder,
    },
    memberCard: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: Layout.spacing.md,
        backgroundColor: Colors.surface,
        borderRadius: Layout.borderRadius.lg,
        marginBottom: Layout.spacing.md,
        borderWidth: 1,
        borderColor: Colors.border,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
    },
    memberCardPending: {
        backgroundColor: '#FEF3C7',
        borderColor: '#F59E0B',
        borderWidth: 2,
        borderStyle: 'dashed',
    },
    memberInfo: {
        flex: 1,
    },
    memberEmail: {
        fontSize: 15,
        fontWeight: '600',
        color: Colors.text.primary,
        marginBottom: 4,
    },
    roleBadge: {
        alignSelf: 'flex-start',
    },
    roleText: {
        fontSize: 11,
        color: Colors.text.secondary,
        fontWeight: '600',
        letterSpacing: 0.3,
    },
    roleTextPending: {
        color: '#D97706',
    },
    actions: {
        flexDirection: 'row',
        gap: Layout.spacing.sm,
        marginLeft: Layout.spacing.md,
    },
    actionButton: {
        padding: Layout.spacing.sm,
        borderRadius: Layout.borderRadius.md,
        backgroundColor: Colors.background,
        borderWidth: 1,
        borderColor: Colors.border,
    },
});
