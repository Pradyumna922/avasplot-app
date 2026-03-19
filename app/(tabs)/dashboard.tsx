// ============================================================================
// 📊 DASHBOARD SCREEN — Lead Management & Stats (Premium Redesign)
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
import { Lead, LEAD_STATUS_COLORS, ROLE_COLORS, ROLE_ICONS, ROLE_LABELS } from '../../src/types';

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
            <View style={[styles.container, { paddingTop: insets.top }]}>
                <View style={styles.guestContainer}>
                    <LinearGradient
                        colors={['#0F172A', '#1E293B']}
                        style={styles.guestHero}
                    >
                        <View style={styles.guestIconWrap}>
                            <LinearGradient colors={[Colors.primary, Colors.accent]} style={styles.guestIconGradient}>
                                <Ionicons name="grid" size={36} color="#FFF" />
                            </LinearGradient>
                        </View>
                        <Text style={styles.guestTitle}>Command Center</Text>
                        <Text style={styles.guestSubtitle}>
                            Sign in to manage leads, track performance, and grow your real estate business
                        </Text>
                        <TouchableOpacity onPress={() => router.push('/(auth)/login')} activeOpacity={0.85}>
                            <LinearGradient colors={[Colors.primary, Colors.primaryDark]} style={styles.guestButton}>
                                <Text style={styles.guestButtonText}>Sign In to Dashboard</Text>
                                <Ionicons name="arrow-forward" size={18} color="#FFF" />
                            </LinearGradient>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => router.push('/(auth)/signup')}>
                            <Text style={styles.guestCreateText}>Create New Account</Text>
                        </TouchableOpacity>
                    </LinearGradient>
                </View>
            </View>
        );
    }

    const currentLeads = activeTab === 'received' ? receivedLeads : sentLeads;
    const roleColor = prefs.role ? ROLE_COLORS[prefs.role] : Colors.primary;

    // Stats
    const stats = [
        { label: 'Received', value: receivedLeads.length, icon: 'arrow-down-circle', color: '#3B82F6', bg: 'rgba(59,130,246,0.12)' },
        { label: 'Sent', value: sentLeads.length, icon: 'arrow-up-circle', color: '#8B5CF6', bg: 'rgba(139,92,246,0.12)' },
        { label: 'Pending', value: receivedLeads.filter(l => l.status === 'pending').length, icon: 'time', color: '#F59E0B', bg: 'rgba(245,158,11,0.12)' },
        { label: 'Closed', value: receivedLeads.filter(l => l.status === 'accepted').length, icon: 'checkmark-circle', color: '#10B981', bg: 'rgba(16,185,129,0.12)' },
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
        const otherName = activeTab === 'received' ? item.fromUserName : item.toUserName;
        const otherRole = activeTab === 'received' ? item.fromUserRole : item.toUserRole;
        const otherRoleColor = ROLE_COLORS[otherRole] || Colors.primary;
        const initial = otherName?.charAt(0)?.toUpperCase() || '?';

        return (
            <View style={styles.leadCard}>
                {/* Top colored accent */}
                <View style={[styles.leadAccent, { backgroundColor: otherRoleColor }]} />

                <View style={styles.leadContent}>
                    <View style={styles.leadHeader}>
                        <View style={[styles.leadAvatar, { backgroundColor: `${otherRoleColor}20` }]}>
                            <Text style={[styles.leadAvatarText, { color: otherRoleColor }]}>{initial}</Text>
                        </View>
                        <View style={styles.leadInfo}>
                            <Text style={styles.leadName}>{otherName}</Text>
                            <Text style={styles.leadRole}>
                                {ROLE_ICONS[otherRole]} {ROLE_LABELS[otherRole]}
                            </Text>
                        </View>
                        <View style={[styles.statusBadge, { backgroundColor: statusColors.bg }]}>
                            <View style={[styles.statusDot, { backgroundColor: statusColors.text }]} />
                            <Text style={[styles.statusText, { color: statusColors.text }]}>
                                {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                            </Text>
                        </View>
                    </View>

                    <View style={styles.leadDivider} />

                    <View style={styles.leadBody}>
                        <View style={styles.leadDetailRow}>
                            <View style={styles.leadDetail}>
                                <View style={styles.detailIconWrap}>
                                    <Ionicons name="person-outline" size={13} color={Colors.primary} />
                                </View>
                                <Text style={styles.leadDetailText}>{item.clientName}</Text>
                            </View>
                            <View style={styles.leadDetail}>
                                <View style={styles.detailIconWrap}>
                                    <Ionicons name="call-outline" size={13} color={Colors.primary} />
                                </View>
                                <Text style={styles.leadDetailText}>{item.clientPhone}</Text>
                            </View>
                        </View>
                        {item.pincode && (
                            <View style={styles.leadDetail}>
                                <View style={styles.detailIconWrap}>
                                    <Ionicons name="location-outline" size={13} color={Colors.primary} />
                                </View>
                                <Text style={styles.leadDetailText}>Pincode: {item.pincode}</Text>
                            </View>
                        )}
                        {item.message && (
                            <View style={styles.messageBox}>
                                <Ionicons name="chatbubble-outline" size={12} color={Colors.textMuted} />
                                <Text style={styles.leadMessage} numberOfLines={2}>{item.message}</Text>
                            </View>
                        )}
                    </View>

                    {activeTab === 'received' && item.status === 'pending' && (
                        <View style={styles.leadActions}>
                            <TouchableOpacity
                                style={styles.acceptButton}
                                onPress={() => handleUpdateStatus(item.$id, 'accepted')}
                                activeOpacity={0.8}
                            >
                                <LinearGradient colors={['#10B981', '#059669']} style={styles.actionGradient}>
                                    <Ionicons name="checkmark" size={16} color="#FFF" />
                                    <Text style={styles.actionButtonText}>Accept</Text>
                                </LinearGradient>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.rejectButton}
                                onPress={() => handleUpdateStatus(item.$id, 'rejected')}
                                activeOpacity={0.8}
                            >
                                <Ionicons name="close" size={16} color={Colors.error} />
                                <Text style={[styles.actionButtonText, { color: Colors.error }]}>Decline</Text>
                            </TouchableOpacity>
                        </View>
                    )}

                    {item.$createdAt && (
                        <Text style={styles.leadTime}>
                            <Ionicons name="time-outline" size={10} color={Colors.textMuted} /> {timeAgo(item.$createdAt)}
                        </Text>
                    )}
                </View>
            </View>
        );
    };

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            {/* Premium Header */}
            <LinearGradient
                colors={[roleColor, Colors.primaryDark]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.headerGradient}
            >
                <View style={styles.headerOverlay}>
                    <View style={styles.headerTop}>
                        <View>
                            <Text style={styles.headerGreeting}>
                                {prefs.role ? `${ROLE_ICONS[prefs.role]} ${ROLE_LABELS[prefs.role]}` : 'Dashboard'}
                            </Text>
                            <Text style={styles.headerTitle}>Command Center</Text>
                        </View>
                        <View style={styles.headerBadge}>
                            <Ionicons name="pulse" size={18} color="#FFF" />
                        </View>
                    </View>

                    {/* Stats Row */}
                    <View style={styles.statsRow}>
                        {stats.map((stat) => (
                            <View key={stat.label} style={styles.statCard}>
                                <View style={[styles.statIconWrap, { backgroundColor: stat.bg }]}>
                                    <Ionicons name={stat.icon as any} size={18} color={stat.color} />
                                </View>
                                <Text style={styles.statValue}>{stat.value}</Text>
                                <Text style={styles.statLabel}>{stat.label}</Text>
                            </View>
                        ))}
                    </View>
                </View>
            </LinearGradient>

            {/* Tab Switcher */}
            <View style={styles.tabContainer}>
                <View style={styles.tabSwitcher}>
                    {(['received', 'sent'] as const).map((tab) => (
                        <TouchableOpacity
                            key={tab}
                            style={[styles.tab, activeTab === tab && styles.tabActive]}
                            onPress={() => setActiveTab(tab)}
                            activeOpacity={0.8}
                        >
                            {activeTab === tab ? (
                                <LinearGradient
                                    colors={[Colors.primary, Colors.primaryDark]}
                                    style={styles.tabGradient}
                                >
                                    <Ionicons
                                        name={tab === 'received' ? 'arrow-down-circle' : 'arrow-up-circle'}
                                        size={14}
                                        color="#FFF"
                                    />
                                    <Text style={styles.tabTextActive}>
                                        {tab === 'received' ? `Received (${receivedLeads.length})` : `Sent (${sentLeads.length})`}
                                    </Text>
                                </LinearGradient>
                            ) : (
                                <View style={styles.tabInner}>
                                    <Ionicons
                                        name={tab === 'received' ? 'arrow-down-circle-outline' : 'arrow-up-circle-outline'}
                                        size={14}
                                        color={Colors.textMuted}
                                    />
                                    <Text style={styles.tabText}>
                                        {tab === 'received' ? `Received (${receivedLeads.length})` : `Sent (${sentLeads.length})`}
                                    </Text>
                                </View>
                            )}
                        </TouchableOpacity>
                    ))}
                </View>
            </View>

            {/* Leads List */}
            {loading ? (
                <View style={styles.centerContent}>
                    <ActivityIndicator size="large" color={Colors.primary} />
                    <Text style={{ ...Typography.caption, color: Colors.textMuted, marginTop: Spacing.md }}>Loading leads...</Text>
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
                        <View style={styles.emptyContainer}>
                            <View style={styles.emptyIconWrap}>
                                <Ionicons name="mail-open-outline" size={40} color={Colors.primary} />
                            </View>
                            <Text style={styles.emptyTitle}>No Leads Yet</Text>
                            <Text style={styles.emptySubtitle}>
                                {activeTab === 'received'
                                    ? 'Leads from other professionals will appear here'
                                    : 'Leads you send to others will appear here'}
                            </Text>
                        </View>
                    }
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F1F5F9' },
    centerContent: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: Spacing.md },

    // Guest View
    guestContainer: { flex: 1 },
    guestHero: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: Spacing.xxxl,
        gap: Spacing.lg,
    },
    guestIconWrap: { marginBottom: Spacing.md },
    guestIconGradient: {
        width: 80, height: 80, borderRadius: 24,
        justifyContent: 'center', alignItems: 'center',
        ...Shadows.glow,
    },
    guestTitle: { ...Typography.h1, color: '#FFF', fontSize: 28 },
    guestSubtitle: { ...Typography.body, color: 'rgba(255,255,255,0.6)', textAlign: 'center', lineHeight: 22 },
    guestButton: {
        flexDirection: 'row', alignItems: 'center', gap: Spacing.sm,
        paddingHorizontal: Spacing.xxxl, paddingVertical: Spacing.lg,
        borderRadius: BorderRadius.md,
    },
    guestButtonText: { ...Typography.bodyBold, color: '#FFF' },
    guestCreateText: { ...Typography.bodyBold, color: 'rgba(255,255,255,0.5)', marginTop: Spacing.lg },

    // Header
    headerGradient: {
        paddingBottom: Spacing.xxl,
    },
    headerOverlay: {
        paddingHorizontal: Spacing.xl,
        paddingTop: Spacing.lg,
    },
    headerTop: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: Spacing.xl,
    },
    headerGreeting: { ...Typography.caption, color: 'rgba(255,255,255,0.7)', marginBottom: 4 },
    headerTitle: { ...Typography.h1, color: '#FFF', fontSize: 26 },
    headerBadge: {
        width: 40, height: 40, borderRadius: 12,
        backgroundColor: 'rgba(255,255,255,0.15)',
        justifyContent: 'center', alignItems: 'center',
    },

    // Stats
    statsRow: {
        flexDirection: 'row',
        gap: Spacing.sm,
    },
    statCard: {
        flex: 1,
        backgroundColor: 'rgba(255,255,255,0.12)',
        borderRadius: BorderRadius.lg,
        padding: Spacing.md,
        alignItems: 'center',
        gap: 4,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.08)',
    },
    statIconWrap: {
        width: 32, height: 32, borderRadius: 10,
        justifyContent: 'center', alignItems: 'center',
        marginBottom: 2,
    },
    statValue: { ...Typography.h3, color: '#FFF', fontSize: 20 },
    statLabel: { ...Typography.tiny, color: 'rgba(255,255,255,0.6)' },

    // Tabs
    tabContainer: {
        paddingHorizontal: Spacing.xl,
        marginTop: -Spacing.md,
        marginBottom: Spacing.md,
    },
    tabSwitcher: {
        flexDirection: 'row',
        backgroundColor: Colors.surface,
        borderRadius: BorderRadius.lg,
        padding: 4,
        ...Shadows.sm,
        borderWidth: 1,
        borderColor: Colors.glassBorder,
    },
    tab: {
        flex: 1,
        borderRadius: BorderRadius.md,
        overflow: 'hidden',
    },
    tabActive: {},
    tabGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: Spacing.xs,
        paddingVertical: Spacing.md,
        borderRadius: BorderRadius.md,
    },
    tabInner: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: Spacing.xs,
        paddingVertical: Spacing.md,
    },
    tabText: { ...Typography.captionBold, color: Colors.textMuted },
    tabTextActive: { ...Typography.captionBold, color: '#FFF' },

    // Leads List
    leadsList: { paddingHorizontal: Spacing.xl, paddingBottom: 120 },

    leadCard: {
        backgroundColor: Colors.surface,
        borderRadius: BorderRadius.xl,
        overflow: 'hidden',
        marginBottom: Spacing.md,
        ...Shadows.sm,
        borderWidth: 1,
        borderColor: Colors.glassBorder,
    },
    leadAccent: {
        height: 3,
        width: '100%',
    },
    leadContent: {
        padding: Spacing.lg,
    },
    leadHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.md,
    },
    leadAvatar: {
        width: 40, height: 40, borderRadius: 12,
        justifyContent: 'center', alignItems: 'center',
    },
    leadAvatarText: { fontSize: 16, fontWeight: '700' },
    leadInfo: { flex: 1 },
    leadName: { ...Typography.bodyBold, color: Colors.text },
    leadRole: { ...Typography.tiny, color: Colors.textMuted, marginTop: 2 },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
        paddingHorizontal: Spacing.md,
        paddingVertical: 5,
        borderRadius: BorderRadius.full,
    },
    statusDot: {
        width: 6, height: 6, borderRadius: 3,
    },
    statusText: { ...Typography.tiny, fontWeight: '700', fontSize: 10 },

    leadDivider: {
        height: 1,
        backgroundColor: Colors.glassBorder,
        marginVertical: Spacing.md,
    },

    leadBody: { gap: Spacing.sm },
    leadDetailRow: {
        flexDirection: 'row',
        gap: Spacing.lg,
    },
    leadDetail: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
    detailIconWrap: {
        width: 24, height: 24, borderRadius: 6,
        backgroundColor: `${Colors.primary}12`,
        justifyContent: 'center', alignItems: 'center',
    },
    leadDetailText: { ...Typography.caption, color: Colors.textSecondary },
    messageBox: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: Spacing.sm,
        backgroundColor: '#F8FAFC',
        borderRadius: BorderRadius.md,
        padding: Spacing.md,
        marginTop: Spacing.xs,
    },
    leadMessage: { ...Typography.caption, color: Colors.textMuted, flex: 1, fontStyle: 'italic', lineHeight: 18 },

    leadActions: {
        flexDirection: 'row',
        gap: Spacing.md,
        marginTop: Spacing.lg,
    },
    acceptButton: {
        flex: 1,
        borderRadius: BorderRadius.md,
        overflow: 'hidden',
    },
    actionGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: Spacing.xs,
        paddingVertical: Spacing.md,
    },
    rejectButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: Spacing.xs,
        paddingVertical: Spacing.md,
        borderRadius: BorderRadius.md,
        borderWidth: 1.5,
        borderColor: 'rgba(239, 68, 68, 0.3)',
        backgroundColor: 'rgba(239, 68, 68, 0.05)',
    },
    actionButtonText: { ...Typography.captionBold, color: '#FFF' },

    leadTime: { ...Typography.tiny, color: Colors.textMuted, marginTop: Spacing.md, textAlign: 'right' },

    // Empty State
    emptyContainer: {
        alignItems: 'center',
        paddingVertical: Spacing.huge * 2,
        gap: Spacing.md,
    },
    emptyIconWrap: {
        width: 72, height: 72, borderRadius: 20,
        backgroundColor: `${Colors.primary}12`,
        justifyContent: 'center', alignItems: 'center',
        marginBottom: Spacing.sm,
    },
    emptyTitle: { ...Typography.h3, color: Colors.text },
    emptySubtitle: { ...Typography.body, color: Colors.textMuted, textAlign: 'center', paddingHorizontal: Spacing.xxxl },
});
