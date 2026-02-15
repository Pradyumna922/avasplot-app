// ============================================================================
// 👤 PROFILE SCREEN — User Profile & Settings
// ============================================================================

import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
    Alert,
    Linking,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../../src/context/AuthContext';
import { profiles, subscriptions } from '../../src/services/appwrite';
import { BorderRadius, Colors, Shadows, Spacing, Typography } from '../../src/theme';
import { ROLE_COLORS, ROLE_ICONS, ROLE_LABELS } from '../../src/types';

export default function ProfileScreen() {
    const { user, isLoggedIn, prefs, logout } = useAuth();
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const [subscription, setSubscription] = useState<any>(null);
    const [profile, setProfile] = useState<any>(null);

    const loadProfile = useCallback(async () => {
        if (!user?.$id) return;
        try {
            const [sub, prof] = await Promise.all([
                subscriptions.get(user.$id),
                profiles.get(user.$id),
            ]);
            setSubscription(sub);
            setProfile(prof);
        } catch { /* ignore */ }
    }, [user?.$id]);

    useEffect(() => {
        if (isLoggedIn) loadProfile();
    }, [isLoggedIn, loadProfile]);

    if (!isLoggedIn) {
        return (
            <View style={[styles.container, styles.centerContent, { paddingTop: insets.top }]}>
                <LinearGradient colors={[Colors.accent, Colors.primary]} style={styles.guestAvatar}>
                    <Ionicons name="person" size={48} color="#FFF" />
                </LinearGradient>
                <Text style={styles.guestTitle}>Welcome to AvasPlot</Text>
                <Text style={styles.guestSubtitle}>Sign in to access your profile, leads, and listings</Text>
                <TouchableOpacity onPress={() => router.push('/(auth)/login')} activeOpacity={0.8}>
                    <LinearGradient colors={[Colors.primary, Colors.primaryDark]} style={styles.guestButton}>
                        <Text style={styles.guestButtonText}>Sign In</Text>
                        <Ionicons name="arrow-forward" size={18} color="#FFF" />
                    </LinearGradient>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => router.push('/(auth)/signup')}>
                    <Text style={styles.createAccountText}>Create New Account</Text>
                </TouchableOpacity>
            </View>
        );
    }

    const handleLogout = () => {
        Alert.alert('Logout', 'Are you sure you want to sign out?', [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Sign Out',
                style: 'destructive',
                onPress: async () => {
                    await logout();
                    router.replace('/(auth)/login');
                },
            },
        ]);
    };

    const roleColor = prefs.role ? ROLE_COLORS[prefs.role] : Colors.primary;
    const initials = user?.name
        ? user.name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)
        : '?';

    type MenuItem = { icon: string; label: string; color: string; value?: string; onPress?: () => void };
    const menuSections: { title: string; items: MenuItem[] }[] = [
        {
            title: 'Account',
            items: [
                { icon: 'shield-checkmark-outline', label: 'Verification', value: prefs.email_verified ? 'Verified ✓' : 'Not Verified', color: prefs.email_verified ? Colors.success : Colors.warning },
                { icon: 'diamond-outline', label: 'Subscription', value: subscription?.plan || 'Free', color: Colors.accent },
                { icon: 'call-outline', label: 'Phone', value: prefs.phone || 'Not set', color: Colors.secondary },
            ],
        },
        {
            title: 'Settings',
            items: [
                { icon: 'notifications-outline', label: 'Notifications', onPress: () => { }, color: Colors.primary },
                { icon: 'globe-outline', label: 'Visit Website', onPress: () => Linking.openURL('https://avasplot.com'), color: Colors.secondary },
                { icon: 'help-circle-outline', label: 'Help & Support', onPress: () => { }, color: Colors.success },
                { icon: 'document-text-outline', label: 'Privacy Policy', onPress: () => { }, color: Colors.textMuted },
            ],
        },
    ];

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                {/* Profile Header Card */}
                <View style={styles.profileCard}>
                    <LinearGradient
                        colors={[roleColor, Colors.primaryDark]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.profileCardBg}
                    />
                    <View style={styles.avatarContainer}>
                        <LinearGradient
                            colors={[roleColor, Colors.primary]}
                            style={styles.avatarGradient}
                        >
                            <Text style={styles.avatarText}>{initials}</Text>
                        </LinearGradient>
                    </View>
                    <Text style={styles.userName}>{user?.name || 'User'}</Text>
                    <Text style={styles.userEmail}>{user?.email}</Text>
                    {prefs.role && (
                        <View style={styles.roleBadge}>
                            <Text style={styles.roleText}>
                                {ROLE_ICONS[prefs.role]} {ROLE_LABELS[prefs.role]}
                            </Text>
                        </View>
                    )}
                </View>

                {/* Menu Sections */}
                {menuSections.map((section) => (
                    <View key={section.title} style={styles.menuSection}>
                        <Text style={styles.sectionTitle}>{section.title}</Text>
                        <View style={styles.menuCard}>
                            {section.items.map((item, idx) => (
                                <TouchableOpacity
                                    key={item.label}
                                    style={[styles.menuItem, idx < section.items.length - 1 && styles.menuItemBorder]}
                                    onPress={item.onPress}
                                    disabled={!item.onPress}
                                    activeOpacity={0.7}
                                >
                                    <View style={[styles.menuIcon, { backgroundColor: `${item.color}15` }]}>
                                        <Ionicons name={item.icon as any} size={20} color={item.color} />
                                    </View>
                                    <Text style={styles.menuLabel}>{item.label}</Text>
                                    {item.value ? (
                                        <Text style={[styles.menuValue, { color: item.color }]}>{item.value}</Text>
                                    ) : (
                                        <Ionicons name="chevron-forward" size={18} color={Colors.textMuted} />
                                    )}
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>
                ))}

                {/* Logout */}
                <TouchableOpacity style={styles.logoutButton} onPress={handleLogout} activeOpacity={0.7}>
                    <Ionicons name="log-out-outline" size={20} color={Colors.error} />
                    <Text style={styles.logoutText}>Sign Out</Text>
                </TouchableOpacity>

                <Text style={styles.version}>AvasPlot v1.0.0</Text>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.background },
    centerContent: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: Spacing.lg, paddingHorizontal: Spacing.xxxl },
    scrollContent: { paddingBottom: 120 },

    guestAvatar: { width: 96, height: 96, borderRadius: 48, justifyContent: 'center', alignItems: 'center', ...Shadows.glow },
    guestTitle: { ...Typography.h2, color: Colors.text },
    guestSubtitle: { ...Typography.body, color: Colors.textMuted, textAlign: 'center' },
    guestButton: {
        flexDirection: 'row', alignItems: 'center', gap: Spacing.sm,
        paddingHorizontal: Spacing.xxxl, paddingVertical: Spacing.lg, borderRadius: BorderRadius.md,
    },
    guestButtonText: { ...Typography.bodyBold, color: '#FFF' },
    createAccountText: { ...Typography.bodyBold, color: Colors.primary, marginTop: Spacing.lg },

    profileCard: {
        marginHorizontal: Spacing.xl,
        marginTop: Spacing.lg,
        borderRadius: BorderRadius.xl,
        overflow: 'hidden',
        alignItems: 'center',
        paddingVertical: Spacing.xxxl,
        paddingHorizontal: Spacing.xl,
        backgroundColor: Colors.surface,
        borderWidth: 1,
        borderColor: Colors.glassBorder,
        marginBottom: Spacing.xxl,
    },
    profileCardBg: {
        ...StyleSheet.absoluteFillObject,
        opacity: 0.15,
    },
    avatarContainer: { marginBottom: Spacing.lg },
    avatarGradient: {
        width: 80, height: 80, borderRadius: 40,
        justifyContent: 'center', alignItems: 'center',
        ...Shadows.glow,
    },
    avatarText: { ...Typography.h1, color: '#FFF' },
    userName: { ...Typography.h2, color: Colors.text, marginBottom: 4 },
    userEmail: { ...Typography.caption, color: Colors.textSecondary, marginBottom: Spacing.md },
    roleBadge: {
        backgroundColor: Colors.glass,
        paddingHorizontal: Spacing.lg,
        paddingVertical: Spacing.xs,
        borderRadius: BorderRadius.full,
        borderWidth: 1,
        borderColor: Colors.glassBorder,
    },
    roleText: { ...Typography.captionBold, color: Colors.text },

    menuSection: { paddingHorizontal: Spacing.xl, marginBottom: Spacing.xl },
    sectionTitle: { ...Typography.captionBold, color: Colors.textMuted, marginBottom: Spacing.md, textTransform: 'uppercase', letterSpacing: 1 },
    menuCard: {
        backgroundColor: Colors.surface,
        borderRadius: BorderRadius.lg,
        borderWidth: 1,
        borderColor: Colors.glassBorder,
        overflow: 'hidden',
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: Spacing.lg,
        gap: Spacing.md,
    },
    menuItemBorder: { borderBottomWidth: 1, borderBottomColor: Colors.border },
    menuIcon: {
        width: 36, height: 36, borderRadius: 10,
        justifyContent: 'center', alignItems: 'center',
    },
    menuLabel: { ...Typography.body, color: Colors.text, flex: 1 },
    menuValue: { ...Typography.captionBold },

    logoutButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: Spacing.sm,
        marginHorizontal: Spacing.xl,
        paddingVertical: Spacing.lg,
        borderRadius: BorderRadius.md,
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        borderWidth: 1,
        borderColor: 'rgba(239, 68, 68, 0.2)',
        marginBottom: Spacing.xl,
    },
    logoutText: { ...Typography.bodyBold, color: Colors.error },

    version: { ...Typography.tiny, color: Colors.textMuted, textAlign: 'center', marginBottom: Spacing.xl },
});
