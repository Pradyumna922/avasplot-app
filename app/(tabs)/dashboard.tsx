// ============================================================================
// 📊 DASHBOARD SCREEN — Lead Management & Stats
// ============================================================================

import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    RefreshControl,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../../src/context/AuthContext';
import { leads, timeAgo } from '../../src/services/appwrite';
import { BorderRadius, Colors, Shadows, Spacing, Typography } from '../../src/theme';
import { Lead, LEAD_STATUS_COLORS, ROLE_ICONS, ROLE_LABELS } from '../../src/types';

export default function DashboardScreen() {
    const { user, isLoggedIn, prefs } = useAuth();
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const [receivedLeads, setReceivedLeads] = useState<Lead[]>([]);
    const [sentLeads, setSentLeads] = useState<Lead[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [activeTab, setActiveTab] = useState<'received' | 'sent'>('received');

    const loadLeads = useCallback(async () => {
        if (!user?.$id) return;
        try {
            const [received, sent] = await Promise.all([
                leads.getReceived(user.$id),
                leads.getSent(user.$id),
            ]);
            setReceivedLeads(received);
            setSentLeads(sent);
        } catch (err) {
            console.error('Failed to load leads:', err);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [user?.$id]);

    useEffect(() => {
        if (isLoggedIn) loadLeads();
        else setLoading(false);
    }, [isLoggedIn, loadLeads]);

    if (!isLoggedIn) {
        return (
            <View style={[styles.container, styles.centerContent, { paddingTop: insets.top }]}>
                <LinearGradient colors={[Colors.primary, Colors.secondary]} style={styles.lockIcon}>
                    <Ionicons name="grid" size={32} color="#FFF" />
                </LinearGradient>
                <Text style={styles.loginTitle}>Dashboard</Text>
                <Text style={styles.loginSubtitle}>Sign in to manage your leads and listings</Text>
                <TouchableOpacity onPress={() => router.push('/(auth)/login')} activeOpacity={0.8}>
                    <LinearGradient colors={[Colors.primary, Colors.primaryDark]} style={styles.loginButton}>
                        <Text style={styles.loginButtonText}>Sign In</Text>
                    </LinearGradient>
                </TouchableOpacity>
            </View>
        );
    }

    const currentLeads = activeTab === 'received' ? receivedLeads : sentLeads;

    // Stats
    const stats = [
        { label: 'Received', value: receivedLeads.length, icon: 'arrow-down-circle', color: Colors.secondary },
        { label: 'Sent', value: sentLeads.length, icon: 'arrow-up-circle', color: Colors.accent },
        { label: 'Pending', value: receivedLeads.filter(l => l.status === 'pending').length, icon: 'time', color: Colors.warning },
        { label: 'Accepted', value: receivedLeads.filter(l => l.status === 'accepted').length, icon: 'checkmark-circle', color: Colors.success },
    ];

    const handleUpdateStatus = async (leadId: string, status: string) => {
        try {
            await leads.updateStatus(leadId, status);
            loadLeads();
        } catch (err) {
            console.error('Failed to update lead status:', err);
        }
    };

    const renderLead = ({ item }: { item: Lead }) => {
        const statusColors = LEAD_STATUS_COLORS[item.status];
        return (
            <View style={styles.leadCard}>
                <View style={styles.leadHeader}>
                    <View style={styles.leadInfo}>
                        <Text style={styles.leadName}>
                            {activeTab === 'received' ? item.fromUserName : item.toUserName}
                        </Text>
                        <Text style={styles.leadRole}>
                            {ROLE_ICONS[activeTab === 'received' ? item.fromUserRole : item.toUserRole]}{' '}
                            {ROLE_LABELS[activeTab === 'received' ? item.fromUserRole : item.toUserRole]}
                        </Text>
                    </View>
                    <View style={[styles.statusBadge, { backgroundColor: statusColors.bg }]}>
                        <Text style={[styles.statusText, { color: statusColors.text }]}>
                            {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                        </Text>
                    </View>
                </View>

                <View style={styles.leadBody}>
                    <View style={styles.leadDetail}>
                        <Ionicons name="person-outline" size={14} color={Colors.textMuted} />
                        <Text style={styles.leadDetailText}>{item.clientName}</Text>
                    </View>
                    <View style={styles.leadDetail}>
                        <Ionicons name="call-outline" size={14} color={Colors.textMuted} />
                        <Text style={styles.leadDetailText}>{item.clientPhone}</Text>
                    </View>
                    {item.message && (
                        <Text style={styles.leadMessage} numberOfLines={2}>{item.message}</Text>
                    )}
                </View>

                {activeTab === 'received' && item.status === 'pending' && (
                    <View style={styles.leadActions}>
                        <TouchableOpacity
                            style={[styles.actionButton, styles.acceptButton]}
                            onPress={() => handleUpdateStatus(item.$id, 'accepted')}
                        >
                            <Ionicons name="checkmark" size={16} color="#FFF" />
                            <Text style={styles.actionButtonText}>Accept</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.actionButton, styles.rejectButton]}
                            onPress={() => handleUpdateStatus(item.$id, 'rejected')}
                        >
                            <Ionicons name="close" size={16} color="#FFF" />
                            <Text style={styles.actionButtonText}>Reject</Text>
                        </TouchableOpacity>
                    </View>
                )}

                {item.$createdAt && (
                    <Text style={styles.leadTime}>{timeAgo(item.$createdAt)}</Text>
                )}
            </View>
        );
    };

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Dashboard</Text>
                <Text style={styles.headerSubtitle}>
                    {prefs.role ? `${ROLE_ICONS[prefs.role]} ${ROLE_LABELS[prefs.role]}` : 'Your command center'}
                </Text>
            </View>

            {/* Stats Grid */}
            <View style={styles.statsGrid}>
                {stats.map((stat) => (
                    <View key={stat.label} style={styles.statCard}>
                        <Ionicons name={stat.icon as any} size={24} color={stat.color} />
                        <Text style={styles.statValue}>{stat.value}</Text>
                        <Text style={styles.statLabel}>{stat.label}</Text>
                    </View>
                ))}
            </View>

            {/* Tab Switcher */}
            <View style={styles.tabSwitcher}>
                <TouchableOpacity
                    style={[styles.tab, activeTab === 'received' && styles.tabActive]}
                    onPress={() => setActiveTab('received')}
                >
                    <Text style={[styles.tabText, activeTab === 'received' && styles.tabTextActive]}>
                        Received ({receivedLeads.length})
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.tab, activeTab === 'sent' && styles.tabActive]}
                    onPress={() => setActiveTab('sent')}
                >
                    <Text style={[styles.tabText, activeTab === 'sent' && styles.tabTextActive]}>
                        Sent ({sentLeads.length})
                    </Text>
                </TouchableOpacity>
            </View>

            {/* Leads List */}
            {loading ? (
                <View style={styles.centerContent}>
                    <ActivityIndicator size="large" color={Colors.primary} />
                </View>
            ) : (
                <FlatList
                    data={currentLeads}
                    keyExtractor={(item) => item.$id}
                    renderItem={renderLead}
                    contentContainerStyle={styles.leadsList}
                    showsVerticalScrollIndicator={false}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadLeads(); }} tintColor={Colors.primary} />
                    }
                    ListEmptyComponent={
                        <View style={[styles.centerContent, { paddingVertical: Spacing.huge * 2 }]}>
                            <Ionicons name="mail-open-outline" size={48} color={Colors.textMuted} />
                            <Text style={styles.emptyTitle}>No Leads Yet</Text>
                            <Text style={styles.emptySubtitle}>
                                {activeTab === 'received' ? 'Leads from other users will appear here' : 'Leads you send will appear here'}
                            </Text>
                        </View>
                    }
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.background },
    centerContent: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: Spacing.md },

    header: { paddingHorizontal: Spacing.xl, paddingVertical: Spacing.md },
    headerTitle: { ...Typography.h1, color: Colors.text },
    headerSubtitle: { ...Typography.caption, color: Colors.textMuted },

    lockIcon: { width: 72, height: 72, borderRadius: 36, justifyContent: 'center', alignItems: 'center', ...Shadows.glow },
    loginTitle: { ...Typography.h2, color: Colors.text },
    loginSubtitle: { ...Typography.body, color: Colors.textMuted, textAlign: 'center' },
    loginButton: { paddingHorizontal: Spacing.xxxl, paddingVertical: Spacing.lg, borderRadius: BorderRadius.md },
    loginButtonText: { ...Typography.bodyBold, color: '#FFF' },

    statsGrid: {
        flexDirection: 'row',
        paddingHorizontal: Spacing.xl,
        gap: Spacing.md,
        marginBottom: Spacing.xl,
    },
    statCard: {
        flex: 1,
        backgroundColor: Colors.surface,
        borderRadius: BorderRadius.lg,
        borderWidth: 1,
        borderColor: Colors.glassBorder,
        padding: Spacing.md,
        alignItems: 'center',
        gap: Spacing.xs,
    },
    statValue: { ...Typography.h2, color: Colors.text },
    statLabel: { ...Typography.tiny, color: Colors.textMuted },

    tabSwitcher: {
        flexDirection: 'row',
        marginHorizontal: Spacing.xl,
        backgroundColor: Colors.surface,
        borderRadius: BorderRadius.md,
        padding: 3,
        marginBottom: Spacing.lg,
    },
    tab: {
        flex: 1,
        paddingVertical: Spacing.md,
        alignItems: 'center',
        borderRadius: BorderRadius.sm,
    },
    tabActive: { backgroundColor: Colors.primary },
    tabText: { ...Typography.captionBold, color: Colors.textMuted },
    tabTextActive: { color: '#FFF' },

    leadsList: { paddingHorizontal: Spacing.xl, paddingBottom: 100 },

    leadCard: {
        backgroundColor: Colors.surface,
        borderRadius: BorderRadius.lg,
        borderWidth: 1,
        borderColor: Colors.glassBorder,
        padding: Spacing.lg,
        marginBottom: Spacing.md,
    },
    leadHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: Spacing.md,
    },
    leadInfo: { flex: 1 },
    leadName: { ...Typography.bodyBold, color: Colors.text },
    leadRole: { ...Typography.tiny, color: Colors.textMuted, marginTop: 2 },
    statusBadge: {
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.xs,
        borderRadius: BorderRadius.full,
    },
    statusText: { ...Typography.tiny, fontWeight: '600' },

    leadBody: { gap: Spacing.xs },
    leadDetail: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
    leadDetailText: { ...Typography.caption, color: Colors.textSecondary },
    leadMessage: { ...Typography.caption, color: Colors.textMuted, marginTop: Spacing.xs, fontStyle: 'italic' },

    leadActions: {
        flexDirection: 'row',
        gap: Spacing.md,
        marginTop: Spacing.lg,
    },
    actionButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: Spacing.xs,
        paddingVertical: Spacing.md,
        borderRadius: BorderRadius.sm,
    },
    acceptButton: { backgroundColor: Colors.success },
    rejectButton: { backgroundColor: Colors.error },
    actionButtonText: { ...Typography.captionBold, color: '#FFF' },

    leadTime: { ...Typography.tiny, color: Colors.textMuted, marginTop: Spacing.md, textAlign: 'right' },

    emptyTitle: { ...Typography.h3, color: Colors.text },
    emptySubtitle: { ...Typography.body, color: Colors.textMuted, textAlign: 'center' },
});
