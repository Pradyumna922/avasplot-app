// ============================================================================
// 👤 PROFILE SCREEN — User Profile & Settings
// ============================================================================

import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Image,
    Linking,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../../src/context/AuthContext';
import { formatPrice, images as imageService, profiles, properties, subscriptions } from '../../src/services/appwrite';
import { BorderRadius, Colors, Shadows, Spacing, Typography } from '../../src/theme';
import { Property, ROLE_COLORS, ROLE_ICONS, ROLE_LABELS } from '../../src/types';

export default function ProfileScreen() {
    const { user, isLoggedIn, prefs, logout, updatePrefs } = useAuth();
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const [subscription, setSubscription] = useState<any>(null);
    const [profile, setProfile] = useState<any>(null);
    const [myProperties, setMyProperties] = useState<Property[]>([]);
    const [loadingProps, setLoadingProps] = useState(false);
    const [uploadingPhoto, setUploadingPhoto] = useState(false);
    const [address, setAddress] = useState('');
    const [license, setLicense] = useState('');
    const [savingDetails, setSavingDetails] = useState(false);

    const loadProfile = useCallback(async () => {
        if (!user?.$id) return;
        try {
            setLoadingProps(true);
            const [sub, prof, myPropsRes] = await Promise.all([
                subscriptions.get(user.$id),
                profiles.get(user.$id),
                properties.getByUser(user.$id)
            ]);
            setSubscription(sub);
            setProfile(prof);
            if (prof?.address) setAddress(prof.address);
            if (prof?.rera) setLicense(prof.rera);
            setMyProperties(myPropsRes.documents);
        } catch { /* ignore */ } finally {
            setLoadingProps(false);
        }
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

    const handleDeleteProperty = (id: string, title: string) => {
        Alert.alert('Delete Property', `Are you sure you want to delete "${title}"?`, [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Delete',
                style: 'destructive',
                onPress: async () => {
                    try {
                        await properties.delete(id);
                        setMyProperties((prev) => prev.filter(p => p.$id !== id));
                        Alert.alert('Deleted', 'Your property was removed.', [{ text: 'OK' }]);
                    } catch {
                        Alert.alert('Error', 'Failed to delete property.');
                    }
                },
            },
        ]);
    };

    const handleSaveDetails = async () => {
        if (!user?.$id) return;
        setSavingDetails(true);
        try {
            await profiles.createOrUpdate(user.$id, { address, rera: license });
            Alert.alert('Success', 'Information saved successfully!');
        } catch (err) {
            Alert.alert('Error', 'Failed to save information.');
        } finally {
            setSavingDetails(false);
        }
    };

    const roleColor = prefs.role ? ROLE_COLORS[prefs.role] : Colors.primary;
    const initials = user?.name
        ? user.name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)
        : '?';
    const avatarUrl = prefs.avatarUrl;

    const handleChangePhoto = async () => {
        try {
            const permResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (!permResult.granted) {
                Alert.alert('Permission Required', 'Please allow access to your photo library.');
                return;
            }

            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ['images'],
                allowsEditing: true,
                aspect: [1, 1],
                quality: 0.7,
            });

            if (result.canceled || !result.assets?.[0]) return;

            setUploadingPhoto(true);
            const asset = result.assets[0];
            const fileName = asset.fileName || `avatar_${Date.now()}.jpg`;
            const fileType = asset.mimeType || 'image/jpeg';

            // Upload to Appwrite storage
            const uploaded = await imageService.upload(asset.uri, fileName, fileType);

            // Build the preview URL from Appwrite
            const photoUrl = properties.getImageUrl(uploaded.$id).toString();

            // Save to user prefs
            await updatePrefs({ avatarUrl: photoUrl });
            Alert.alert('Success', 'Profile photo updated!');
        } catch (err) {
            console.error('Photo upload error:', err);
            Alert.alert('Error', 'Failed to update profile photo. Please try again.');
        } finally {
            setUploadingPhoto(false);
        }
    };

    type MenuItem = { icon: string; label: string; color: string; value?: string; onPress?: () => void };
    const menuSections: { title: string; items: MenuItem[] }[] = [
        {
            title: 'Account',
            items: [
                { icon: 'shield-checkmark-outline', label: 'Verification', value: prefs.email_verified ? 'Verified ✓' : 'Not Verified', color: prefs.email_verified ? Colors.success : Colors.warning, onPress: () => router.push('/verification') },
                { icon: 'diamond-outline', label: 'Subscription', value: subscription?.plan || 'Free', color: Colors.accent },
                { icon: 'call-outline', label: 'Phone', value: prefs.phone || 'Not set', color: Colors.secondary },
            ],
        },
        {
            title: 'Settings',
            items: [
                { icon: 'notifications-outline', label: 'Notifications', onPress: () => router.push('/notifications'), color: Colors.primary },
                { icon: 'globe-outline', label: 'Visit Website', onPress: () => Linking.openURL('https://avasplot.in'), color: Colors.secondary },
                { icon: 'help-circle-outline', label: 'Help & Support', onPress: () => router.push('/help'), color: Colors.success },
                { icon: 'document-text-outline', label: 'Privacy Policy', onPress: () => router.push('/privacy'), color: Colors.textMuted },
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
                    <TouchableOpacity style={styles.avatarContainer} onPress={handleChangePhoto} activeOpacity={0.8}>
                        {avatarUrl ? (
                            <Image source={{ uri: avatarUrl }} style={styles.avatarImage} />
                        ) : (
                            <LinearGradient
                                colors={[roleColor, Colors.primary]}
                                style={styles.avatarGradient}
                            >
                                <Text style={styles.avatarText}>{initials}</Text>
                            </LinearGradient>
                        )}
                        <View style={styles.cameraOverlay}>
                            {uploadingPhoto ? (
                                <ActivityIndicator size="small" color="#FFF" />
                            ) : (
                                <Ionicons name="camera" size={14} color="#FFF" />
                            )}
                        </View>
                    </TouchableOpacity>
                    <View style={styles.nameRow}>
                        <Text style={styles.userName}>{user?.name || 'User'}</Text>
                        {prefs?.email_verified && (
                            <Ionicons name="checkmark-circle" size={18} color={Colors.success} style={styles.verifiedIcon} />
                        )}
                    </View>
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

                {/* Professional Details Section */}
                <View style={styles.menuSection}>
                    <Text style={styles.sectionTitle}>Details</Text>
                    <View style={styles.detailsCard}>
                        <Text style={styles.inputLabel}>Office Address</Text>
                        <TextInput
                            style={styles.detailInput}
                            placeholder="Enter your full office address"
                            value={address}
                            onChangeText={setAddress}
                            multiline
                            textAlignVertical="top"
                        />
                        <Text style={styles.inputLabel}>License / RERA Number</Text>
                        <TextInput
                            style={styles.detailInput}
                            placeholder="e.g. RERA-123456"
                            value={license}
                            onChangeText={setLicense}
                        />
                        <TouchableOpacity
                            style={styles.saveBtn}
                            onPress={handleSaveDetails}
                            disabled={savingDetails}
                        >
                            <Text style={styles.saveBtnText}>{savingDetails ? 'Saving...' : 'Save Details'}</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* My Listings Section */}
                <View style={styles.menuSection}>
                    <Text style={styles.sectionTitle}>My Listings</Text>
                    {loadingProps ? (
                        <View style={{ padding: Spacing.xl, alignItems: 'center' }}>
                            <Text style={{ color: Colors.textMuted }}>Loading listings...</Text>
                        </View>
                    ) : myProperties.length === 0 ? (
                        <View style={styles.emptyCard}>
                            <Ionicons name="home-outline" size={32} color={Colors.textMuted} />
                            <Text style={styles.emptyText}>You haven't listed any properties yet.</Text>
                        </View>
                    ) : (
                        <View style={{ gap: Spacing.md }}>
                            {myProperties.map(prop => (
                                <View key={prop.$id} style={styles.listingCard}>
                                    <View style={styles.listingCardRow}>
                                        <View style={styles.listingCardImagePlaceholder}>
                                            <Ionicons name="image-outline" size={24} color={Colors.primary} />
                                        </View>
                                        <View style={styles.listingCardDetails}>
                                            <Text style={styles.listingCardTitle} numberOfLines={1}>{prop.title}</Text>
                                            <Text style={styles.listingCardSubtitle} numberOfLines={1}>{prop.location}</Text>
                                            <Text style={styles.listingCardPrice}>{formatPrice(prop.price)}</Text>
                                        </View>
                                    </View>
                                    <View style={styles.listingCardActions}>
                                        <TouchableOpacity style={styles.actionBtn} onPress={() => router.push(`/property/${prop.$id}`)}>
                                            <Ionicons name="eye-outline" size={16} color={Colors.primary} />
                                            <Text style={styles.actionBtnText}>View</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity style={styles.actionBtn} onPress={() => router.push(`/edit/${prop.$id}`)}>
                                            <Ionicons name="pencil-outline" size={16} color={Colors.text} />
                                            <Text style={[styles.actionBtnText, { color: Colors.text }]}>Edit</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity style={styles.actionBtnError} onPress={() => handleDeleteProperty(prop.$id, prop.title)}>
                                            <Ionicons name="trash-outline" size={16} color={Colors.error} />
                                            <Text style={styles.actionBtnTextError}>Delete</Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            ))}
                        </View>
                    )}
                </View>

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
    avatarContainer: { marginBottom: Spacing.lg, position: 'relative' },
    avatarGradient: {
        width: 80, height: 80, borderRadius: 40,
        justifyContent: 'center', alignItems: 'center',
        ...Shadows.glow,
    },
    avatarImage: {
        width: 80, height: 80, borderRadius: 40,
        ...Shadows.glow,
    },
    avatarText: { ...Typography.h1, color: '#FFF' },
    cameraOverlay: {
        position: 'absolute', bottom: 0, right: -4,
        width: 28, height: 28, borderRadius: 14,
        backgroundColor: Colors.primary,
        justifyContent: 'center', alignItems: 'center',
        borderWidth: 2, borderColor: Colors.surface,
    },
    nameRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs, marginBottom: 4 },
    verifiedIcon: { marginTop: 2 },
    userName: { ...Typography.h2, color: Colors.text },
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

    emptyCard: {
        padding: Spacing.xxl,
        alignItems: 'center',
        backgroundColor: Colors.surface,
        borderRadius: BorderRadius.lg,
        borderWidth: 1,
        borderColor: Colors.glassBorder,
        gap: Spacing.md,
    },
    emptyText: {
        ...Typography.body,
        color: Colors.textSecondary,
        textAlign: 'center',
    },
    detailsCard: {
        backgroundColor: Colors.surface,
        borderRadius: BorderRadius.xl,
        padding: Spacing.xl,
        borderWidth: 1,
        borderColor: Colors.border,
        gap: Spacing.md,
    },
    inputLabel: {
        ...Typography.captionBold,
        color: Colors.textSecondary,
    },
    detailInput: {
        backgroundColor: Colors.background,
        borderWidth: 1,
        borderColor: Colors.border,
        borderRadius: BorderRadius.md,
        padding: Spacing.md,
        ...Typography.body,
        color: Colors.text,
        minHeight: 48,
    },
    saveBtn: {
        backgroundColor: Colors.primary,
        borderRadius: BorderRadius.md,
        paddingVertical: Spacing.md,
        alignItems: 'center',
        marginTop: Spacing.sm,
    },
    saveBtnText: {
        ...Typography.bodyBold,
        color: '#FFF',
    },
    listingCard: {
        backgroundColor: Colors.surface,
        borderRadius: BorderRadius.lg,
        borderWidth: 1,
        borderColor: Colors.glassBorder,
        overflow: 'hidden',
    },
    listingCardRow: {
        flexDirection: 'row',
        padding: Spacing.md,
        gap: Spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: Colors.glassBorder,
    },
    listingCardImagePlaceholder: {
        width: 80, height: 80, borderRadius: BorderRadius.md,
        backgroundColor: Colors.glass,
        justifyContent: 'center', alignItems: 'center',
    },
    listingCardDetails: { flex: 1, justifyContent: 'center' },
    listingCardTitle: { ...Typography.bodyBold, color: Colors.text, marginBottom: 2 },
    listingCardSubtitle: { ...Typography.caption, color: Colors.textSecondary, marginBottom: Spacing.sm },
    listingCardPrice: { ...Typography.captionBold, color: Colors.primary },

    listingCardActions: {
        flexDirection: 'row',
    },
    actionBtn: {
        flex: 1,
        flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
        paddingVertical: Spacing.md,
        gap: Spacing.xs,
        borderRightWidth: 1,
        borderRightColor: Colors.glassBorder,
    },
    actionBtnError: {
        flex: 1,
        flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
        paddingVertical: Spacing.md,
        gap: Spacing.xs,
        backgroundColor: 'rgba(239, 68, 68, 0.05)',
    },
    actionBtnText: { ...Typography.captionBold, color: Colors.primary },
    actionBtnTextError: { ...Typography.captionBold, color: Colors.error },
});
