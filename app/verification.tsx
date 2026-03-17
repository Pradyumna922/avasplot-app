// ============================================================================
// ✅ VERIFICATION SCREEN
// ============================================================================
'use no memo';

import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../src/context/AuthContext';
import { BorderRadius, Colors, Shadows, Spacing, Typography } from '../src/theme';

export default function VerificationScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { user, prefs, updatePrefs } = useAuth();

    // States for phone verification
    const [phone, setPhone] = useState(prefs.phone || '');
    const [verifyingPhone, setVerifyingPhone] = useState(false);

    // States for email verification
    const [email, setEmail] = useState(user?.email || '');
    const [verifyingEmail, setVerifyingEmail] = useState(false);

    const handleVerifyPhone = async () => {
        if (!phone) {
            Alert.alert('Error', 'Please enter a valid phone number');
            return;
        }
        setVerifyingPhone(true);
        try {
            // Simulated API call for sending/verifying OTP
            setTimeout(async () => {
                await updatePrefs({ phone: phone, phone_verified: true });
                setVerifyingPhone(false);
                Alert.alert('Success', 'Phone number verified successfully!');
            }, 1500);
        } catch (e) {
            setVerifyingPhone(false);
        }
    };

    const handleVerifyEmail = async () => {
        if (!email) {
            Alert.alert('Error', 'Please enter a valid email address');
            return;
        }
        setVerifyingEmail(true);
        try {
            // Simulated API call for sending verification link
            setTimeout(async () => {
                await updatePrefs({ email_verified: true });
                setVerifyingEmail(false);
                Alert.alert('Email Sent', 'A verification link has been sent to your email. Please check your inbox.');
            }, 1500);
        } catch (e) {
            setVerifyingEmail(false);
        }
    };

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            {/* Header */}
            <View style={styles.headerRow}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} activeOpacity={0.7}>
                    <Ionicons name="arrow-back" size={24} color={Colors.text} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Account Verification</Text>
                <View style={{ width: 40 }} />
            </View>

            <View style={styles.content}>
                <Text style={styles.description}>
                    Verify your contact information to build trust with buyers and sellers on Avasplot. Verified profiles get more visibility.
                </Text>

                {/* Email Verification */}
                <View style={styles.card}>
                    <View style={styles.cardHeader}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing.sm }}>
                            <Ionicons name="mail-outline" size={24} color={Colors.primary} />
                            <Text style={styles.cardTitle}>Email Verification</Text>
                        </View>
                        {prefs.email_verified ? (
                            <View style={styles.verifiedBadge}>
                                <Ionicons name="checkmark-circle" size={16} color={Colors.success} />
                                <Text style={styles.verifiedTxt}>Verified</Text>
                            </View>
                        ) : null}
                    </View>
                    <TextInput
                        style={[styles.input, prefs.email_verified && styles.inputDisabled]}
                        value={email}
                        onChangeText={setEmail}
                        placeholder="Enter your email address"
                        editable={!prefs.email_verified}
                        autoCapitalize="none"
                        keyboardType="email-address"
                    />
                    {!prefs.email_verified && (
                        <TouchableOpacity
                            style={styles.verifyBtn}
                            onPress={handleVerifyEmail}
                            disabled={verifyingEmail}
                        >
                            <Text style={styles.verifyBtnTxt}>{verifyingEmail ? 'Sending...' : 'Send Verification Link'}</Text>
                        </TouchableOpacity>
                    )}
                </View>

                {/* Phone Verification */}
                <View style={styles.card}>
                    <View style={styles.cardHeader}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing.sm }}>
                            <Ionicons name="call-outline" size={24} color={Colors.secondary} />
                            <Text style={styles.cardTitle}>Phone Verification</Text>
                        </View>
                        {prefs.phone_verified ? (
                            <View style={styles.verifiedBadge}>
                                <Ionicons name="checkmark-circle" size={16} color={Colors.success} />
                                <Text style={styles.verifiedTxt}>Verified</Text>
                            </View>
                        ) : null}
                    </View>
                    <TextInput
                        style={[styles.input, prefs.phone_verified && styles.inputDisabled]}
                        value={phone}
                        onChangeText={setPhone}
                        placeholder="Enter your phone number"
                        keyboardType="phone-pad"
                        editable={!prefs.phone_verified}
                    />
                    {!prefs.phone_verified && (
                        <TouchableOpacity
                            style={[styles.verifyBtn, { backgroundColor: Colors.secondary }]}
                            onPress={handleVerifyPhone}
                            disabled={verifyingPhone}
                        >
                            <Text style={styles.verifyBtnTxt}>{verifyingPhone ? 'Verifying...' : 'Verify Phone Number'}</Text>
                        </TouchableOpacity>
                    )}
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
    },
    headerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: Spacing.xl,
        paddingVertical: Spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: Colors.glassBorder,
        backgroundColor: Colors.surface,
    },
    backBtn: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'flex-start',
    },
    headerTitle: {
        ...Typography.h2,
        color: Colors.text,
    },
    content: {
        padding: Spacing.xl,
    },
    description: {
        ...Typography.body,
        color: Colors.textSecondary,
        marginBottom: Spacing.xxl,
        lineHeight: 22,
    },
    card: {
        backgroundColor: Colors.surface,
        borderRadius: BorderRadius.xl,
        padding: Spacing.xl,
        marginBottom: Spacing.xl,
        borderWidth: 1,
        borderColor: Colors.glassBorder,
        ...Shadows.md,
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: Spacing.lg,
    },
    cardTitle: {
        ...Typography.h3,
        color: Colors.text,
    },
    verifiedBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        paddingHorizontal: Spacing.md,
        paddingVertical: 4,
        borderRadius: BorderRadius.full,
        gap: 4,
    },
    verifiedTxt: {
        ...Typography.captionBold,
        color: Colors.success,
    },
    input: {
        height: 52,
        backgroundColor: Colors.background,
        borderWidth: 1,
        borderColor: Colors.border,
        borderRadius: BorderRadius.md,
        paddingHorizontal: Spacing.md,
        ...Typography.body,
        color: Colors.text,
        marginBottom: Spacing.md,
    },
    inputDisabled: {
        backgroundColor: Colors.glass,
        color: Colors.textMuted,
    },
    verifyBtn: {
        height: 52,
        backgroundColor: Colors.primary,
        borderRadius: BorderRadius.md,
        justifyContent: 'center',
        alignItems: 'center',
    },
    verifyBtnTxt: {
        ...Typography.bodyBold,
        color: '#FFF',
    },
});
