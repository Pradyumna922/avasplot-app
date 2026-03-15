// ============================================================================
// 📝 SIGNUP SCREEN — Premium Registration
// ============================================================================
'use no memo';

import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Animated,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { useAuth } from '../../src/context/AuthContext';
import { BorderRadius, Colors, Shadows, Spacing, Typography } from '../../src/theme';

export default function SignupScreen() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const { signup, isLoggedIn } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (isLoggedIn) {
            router.replace('/onboarding');
        }
    }, [isLoggedIn, router]);

    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(30)).current;

    React.useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
            Animated.timing(slideAnim, { toValue: 0, duration: 800, useNativeDriver: true }),
        ]).start();
    }, []);

    const handleSignup = async () => {
        if (!name.trim() || !email.trim() || !password.trim()) {
            Alert.alert('Missing Fields', 'Please fill in all fields.');
            return;
        }
        if (password !== confirmPassword) {
            Alert.alert('Password Mismatch', 'Passwords do not match.');
            return;
        }
        if (password.length < 8) {
            Alert.alert('Weak Password', 'Password must be at least 8 characters.');
            return;
        }

        setLoading(true);
        try {
            await signup(email.trim(), password, name.trim());
            // Navigation handled by useEffect watching isLoggedIn
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'Signup failed. Please try again.';
            Alert.alert('Signup Failed', message);
            setLoading(false);
        }
    };

    return (
        <LinearGradient
            colors={[Colors.background, '#F1F5F9', Colors.background]}
            style={styles.container}
        >
            <View style={[styles.orb, styles.orbPrimary]} />
            <View style={[styles.orb, styles.orbSecondary]} />

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.keyboardView}
            >
                <ScrollView
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                >
                    <Animated.View
                        style={[styles.content, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}
                    >
                        {/* Header */}
                        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                            <Ionicons name="arrow-back" size={24} color={Colors.text} />
                        </TouchableOpacity>

                        <View style={styles.header}>
                            <LinearGradient
                                colors={[Colors.accent, Colors.primary]}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 1 }}
                                style={styles.logoGradient}
                            >
                                <Ionicons name="person-add" size={28} color="#FFF" />
                            </LinearGradient>
                            <Text style={styles.title}>Create Account</Text>
                            <Text style={styles.subtitle}>Join India's smartest property community</Text>
                        </View>

                        {/* Form Card */}
                        <View style={styles.card}>
                            {/* Name */}
                            <View style={styles.inputContainer}>
                                <Ionicons name="person-outline" size={20} color={Colors.textMuted} style={styles.inputIcon} />
                                <TextInput
                                    style={styles.input}
                                    placeholder="Full Name"
                                    placeholderTextColor={Colors.textMuted}
                                    value={name}
                                    onChangeText={setName}
                                    autoCapitalize="words"
                                />
                            </View>

                            {/* Email */}
                            <View style={styles.inputContainer}>
                                <Ionicons name="mail-outline" size={20} color={Colors.textMuted} style={styles.inputIcon} />
                                <TextInput
                                    style={styles.input}
                                    placeholder="Email address"
                                    placeholderTextColor={Colors.textMuted}
                                    value={email}
                                    onChangeText={setEmail}
                                    keyboardType="email-address"
                                    autoCapitalize="none"
                                />
                            </View>

                            {/* Password */}
                            <View style={styles.inputContainer}>
                                <Ionicons name="lock-closed-outline" size={20} color={Colors.textMuted} style={styles.inputIcon} />
                                <TextInput
                                    style={[styles.input, { flex: 1 }]}
                                    placeholder="Password (min 8 chars)"
                                    placeholderTextColor={Colors.textMuted}
                                    value={password}
                                    onChangeText={setPassword}
                                    secureTextEntry={!showPassword}
                                />
                                <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                                    <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={20} color={Colors.textMuted} />
                                </TouchableOpacity>
                            </View>

                            {/* Confirm Password */}
                            <View style={styles.inputContainer}>
                                <Ionicons name="shield-checkmark-outline" size={20} color={Colors.textMuted} style={styles.inputIcon} />
                                <TextInput
                                    style={styles.input}
                                    placeholder="Confirm Password"
                                    placeholderTextColor={Colors.textMuted}
                                    value={confirmPassword}
                                    onChangeText={setConfirmPassword}
                                    secureTextEntry={!showPassword}
                                />
                            </View>

                            {/* Signup Button */}
                            <TouchableOpacity onPress={handleSignup} disabled={loading} activeOpacity={0.8}>
                                <LinearGradient
                                    colors={[Colors.accent, Colors.primary]}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 0 }}
                                    style={styles.submitButton}
                                >
                                    {loading ? (
                                        <ActivityIndicator color="#FFF" />
                                    ) : (
                                        <>
                                            <Text style={styles.submitButtonText}>Create Account</Text>
                                            <Ionicons name="rocket" size={20} color="#FFF" />
                                        </>
                                    )}
                                </LinearGradient>
                            </TouchableOpacity>
                        </View>

                        {/* Login Link */}
                        <View style={styles.loginRow}>
                            <Text style={styles.loginText}>Already have an account? </Text>
                            <TouchableOpacity onPress={() => router.push('/(auth)/login')}>
                                <Text style={styles.loginLink}>Sign In</Text>
                            </TouchableOpacity>
                        </View>
                    </Animated.View>
                </ScrollView>
            </KeyboardAvoidingView>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    keyboardView: { flex: 1 },
    scrollContent: {
        flexGrow: 1,
        justifyContent: 'center',
        paddingHorizontal: Spacing.xl,
        paddingVertical: Spacing.huge,
    },
    content: { alignItems: 'center' },

    orb: { position: 'absolute', borderRadius: 999 },
    orbPrimary: { width: 250, height: 250, backgroundColor: 'rgba(16, 185, 129, 0.10)', top: -80, left: -60 },
    orbSecondary: { width: 200, height: 200, backgroundColor: 'rgba(5, 150, 105, 0.08)', bottom: 50, right: -50 },

    backButton: {
        alignSelf: 'flex-start',
        width: 40,
        height: 40,
        borderRadius: BorderRadius.full,
        backgroundColor: Colors.glass,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: Spacing.xl,
        borderWidth: 1,
        borderColor: Colors.glassBorder,
    },

    header: { alignItems: 'center', marginBottom: Spacing.xxl },
    logoGradient: {
        width: 64,
        height: 64,
        borderRadius: BorderRadius.lg,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: Spacing.lg,
        ...Shadows.glow,
    },
    title: { ...Typography.h1, color: Colors.text, marginBottom: Spacing.xs },
    subtitle: { ...Typography.caption, color: Colors.textMuted },

    card: {
        width: '100%',
        backgroundColor: Colors.glass,
        borderRadius: BorderRadius.xl,
        borderWidth: 1,
        borderColor: Colors.glassBorder,
        padding: Spacing.xxl,
        ...Shadows.md,
    },

    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.surfaceBright,
        borderRadius: BorderRadius.md,
        borderWidth: 1,
        borderColor: Colors.border,
        marginBottom: Spacing.lg,
        paddingHorizontal: Spacing.lg,
        height: 52,
    },
    inputIcon: { marginRight: Spacing.md },
    input: { flex: 1, ...Typography.body, color: Colors.text, height: '100%' },

    submitButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: Spacing.sm,
        height: 52,
        borderRadius: BorderRadius.md,
        marginTop: Spacing.sm,
        ...Shadows.lg,
    },
    submitButtonText: { ...Typography.bodyBold, color: '#FFF' },

    loginRow: { flexDirection: 'row', alignItems: 'center', marginTop: Spacing.xxl },
    loginText: { ...Typography.body, color: Colors.textSecondary },
    loginLink: { ...Typography.bodyBold, color: Colors.accent },
});
