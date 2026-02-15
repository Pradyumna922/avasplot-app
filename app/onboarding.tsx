// ============================================================================
// 🚀 ONBOARDING SCREEN — Role Selection & Setup
// ============================================================================
'use no memo';

import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useRef, useState } from 'react';
import {
    Animated,
    Dimensions,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../src/context/AuthContext';
import { BorderRadius, Colors, Shadows, Spacing, Typography } from '../src/theme';
import { ROLE_COLORS, ROLE_ICONS, ROLE_LABELS, UserRole } from '../src/types';

const { width } = Dimensions.get('window');

const ROLES: UserRole[] = [
    'broker', 'developer', 'architect', 'mentor',
    'lawyer', 'surveyor', 'vastu', 'buyer', 'investor',
];

export default function OnboardingScreen() {
    const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
    const [loading, setLoading] = useState(false);
    const { updatePrefs } = useAuth();
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const scaleAnim = useRef(new Animated.Value(0.95)).current;

    React.useEffect(() => {
        Animated.spring(scaleAnim, {
            toValue: 1,
            tension: 50,
            friction: 7,
            useNativeDriver: true,
        }).start();
    }, []);

    const handleComplete = async () => {
        if (!selectedRole) return;
        setLoading(true);
        try {
            await updatePrefs({ role: selectedRole, onboarded: true });
            router.replace('/(tabs)');
        } catch (err) {
            console.error('Onboarding failed:', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <LinearGradient
            colors={[Colors.background, '#F1F5F9', Colors.background]}
            style={[styles.container, { paddingTop: insets.top }]}
        >
            <View style={[styles.orb, styles.orbPrimary]} />
            <View style={[styles.orb, styles.orbSecondary]} />

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                <Animated.View style={[styles.content, { transform: [{ scale: scaleAnim }] }]}>
                    {/* Header */}
                    <View style={styles.header}>
                        <LinearGradient
                            colors={[Colors.primary, Colors.secondary]}
                            style={styles.logoIcon}
                        >
                            <Ionicons name="sparkles" size={28} color="#FFF" />
                        </LinearGradient>
                        <Text style={styles.title}>What describes you best?</Text>
                        <Text style={styles.subtitle}>
                            Choose your role to personalize your experience
                        </Text>
                    </View>

                    {/* Role Grid */}
                    <View style={styles.roleGrid}>
                        {ROLES.map((role) => {
                            const isSelected = selectedRole === role;
                            const color = ROLE_COLORS[role];

                            return (
                                <TouchableOpacity
                                    key={role}
                                    style={[
                                        styles.roleCard,
                                        isSelected && { borderColor: color, borderWidth: 2 },
                                    ]}
                                    onPress={() => setSelectedRole(role)}
                                    activeOpacity={0.7}
                                >
                                    {isSelected && (
                                        <View style={[styles.selectedIndicator, { backgroundColor: color }]} />
                                    )}
                                    <Text style={styles.roleEmoji}>{ROLE_ICONS[role]}</Text>
                                    <Text style={[styles.roleLabel, isSelected && { color }]}>
                                        {ROLE_LABELS[role]}
                                    </Text>
                                    {isSelected && (
                                        <Ionicons name="checkmark-circle" size={20} color={color} style={styles.checkIcon} />
                                    )}
                                </TouchableOpacity>
                            );
                        })}
                    </View>

                    {/* Continue Button */}
                    <TouchableOpacity
                        onPress={handleComplete}
                        disabled={!selectedRole || loading}
                        activeOpacity={0.8}
                        style={{ opacity: selectedRole ? 1 : 0.5 }}
                    >
                        <LinearGradient
                            colors={selectedRole ? [ROLE_COLORS[selectedRole], Colors.primaryDark] : [Colors.textMuted, Colors.textMuted]}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            style={styles.continueButton}
                        >
                            <Text style={styles.continueText}>
                                {loading ? 'Setting up...' : 'Continue'}
                            </Text>
                            <Ionicons name="arrow-forward" size={20} color="#FFF" />
                        </LinearGradient>
                    </TouchableOpacity>

                    <TouchableOpacity onPress={() => router.replace('/(tabs)')}>
                        <Text style={styles.skipText}>Skip for now</Text>
                    </TouchableOpacity>
                </Animated.View>
            </ScrollView>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    scrollContent: { flexGrow: 1, paddingHorizontal: Spacing.xl, paddingBottom: Spacing.huge },
    content: { flex: 1, justifyContent: 'center' },

    orb: { position: 'absolute', borderRadius: 999 },
    orbPrimary: { width: 280, height: 280, backgroundColor: 'rgba(16, 185, 129, 0.08)', top: -80, right: -80 },
    orbSecondary: { width: 200, height: 200, backgroundColor: 'rgba(5, 150, 105, 0.06)', bottom: 50, left: -60 },

    header: { alignItems: 'center', marginBottom: Spacing.xxxl },
    logoIcon: {
        width: 56, height: 56, borderRadius: BorderRadius.lg,
        justifyContent: 'center', alignItems: 'center',
        marginBottom: Spacing.lg, ...Shadows.glow,
    },
    title: { ...Typography.h1, color: Colors.text, textAlign: 'center', marginBottom: Spacing.xs },
    subtitle: { ...Typography.body, color: Colors.textMuted, textAlign: 'center' },

    roleGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: Spacing.md,
        justifyContent: 'center',
        marginBottom: Spacing.xxxl,
    },
    roleCard: {
        width: (width - Spacing.xl * 2 - Spacing.md * 2) / 3,
        backgroundColor: Colors.surface,
        borderRadius: BorderRadius.lg,
        borderWidth: 1,
        borderColor: Colors.glassBorder,
        padding: Spacing.lg,
        alignItems: 'center',
        gap: Spacing.sm,
        position: 'relative',
        overflow: 'hidden',
    },
    selectedIndicator: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: 3,
    },
    roleEmoji: { fontSize: 28 },
    roleLabel: { ...Typography.tiny, color: Colors.textSecondary, textAlign: 'center' },
    checkIcon: { position: 'absolute', top: Spacing.xs, right: Spacing.xs },

    continueButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: Spacing.sm,
        height: 56,
        borderRadius: BorderRadius.lg,
        ...Shadows.lg,
    },
    continueText: { ...Typography.bodyBold, color: '#FFF', fontSize: 16 },

    skipText: {
        ...Typography.body,
        color: Colors.textMuted,
        textAlign: 'center',
        marginTop: Spacing.xl,
    },
});
