// ============================================================================
// 🔐 LOGIN SCREEN — Premium Glassmorphism Design
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
    Dimensions,
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

const { width, height } = Dimensions.get('window');

export default function LoginScreen() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const { login, loginWithGoogle, isLoggedIn } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (isLoggedIn) {
            router.replace('/(tabs)');
        }
    }, [isLoggedIn, router]);

    // Animations
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(30)).current;
    const scaleAnim = useRef(new Animated.Value(0.95)).current;

    React.useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 800,
                useNativeDriver: true,
            }),
            Animated.timing(slideAnim, {
                toValue: 0,
                duration: 800,
                useNativeDriver: true,
            }),
            Animated.spring(scaleAnim, {
                toValue: 1,
                tension: 50,
                friction: 7,
                useNativeDriver: true,
            }),
        ]).start();
    }, []);

    const handleLogin = async () => {
        if (!email.trim() || !password.trim()) {
            Alert.alert('Missing Fields', 'Please enter both email and password.');
            return;
        }
        setLoading(true);
        try {
            await login(email.trim(), password);
            // Navigation is now handled by the useEffect watching isLoggedIn
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'Login failed. Please try again.';
            Alert.alert('Login Failed', message);
            setLoading(false);
        }
    };

    const handleGoogleLogin = async () => {
        setLoading(true);
        try {
            await loginWithGoogle();
            // Navigation is handled by the useEffect watching isLoggedIn
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'Google sign-in failed. Please try again.';
            Alert.alert('Google Sign-In Failed', message);
            setLoading(false);
        }
    };

    return (
        <LinearGradient
            colors={[Colors.background, '#F1F5F9', Colors.background]}
            style={styles.container}
        >
            {/* Decorative orbs */}
            <View style={[styles.orb, styles.orbPrimary]} />
            <View style={[styles.orb, styles.orbSecondary]} />
            <View style={[styles.orb, styles.orbAccent]} />

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
                        style={[
                            styles.content,
                            {
                                opacity: fadeAnim,
                                transform: [{ translateY: slideAnim }, { scale: scaleAnim }],
                            },
                        ]}
                    >
                        {/* Logo & Branding */}
                        <View style={styles.brandContainer}>
                            <LinearGradient
                                colors={[Colors.primary, Colors.secondary]}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 1 }}
                                style={styles.logoGradient}
                            >
                                <Ionicons name="home" size={32} color="#FFF" />
                            </LinearGradient>
                            <Text style={styles.brandName}>AvasPlot</Text>
                            <Text style={styles.brandTagline}>India's Smartest Property Platform</Text>
                        </View>

                        {/* Login Card */}
                        <View style={styles.card}>
                            <Text style={styles.cardTitle}>Welcome Back</Text>
                            <Text style={styles.cardSubtitle}>Sign in to continue your journey</Text>

                            {/* Email Input */}
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
                                    autoComplete="email"
                                />
                            </View>

                            {/* Password Input */}
                            <View style={styles.inputContainer}>
                                <Ionicons name="lock-closed-outline" size={20} color={Colors.textMuted} style={styles.inputIcon} />
                                <TextInput
                                    style={[styles.input, { flex: 1 }]}
                                    placeholder="Password"
                                    placeholderTextColor={Colors.textMuted}
                                    value={password}
                                    onChangeText={setPassword}
                                    secureTextEntry={!showPassword}
                                    autoComplete="password"
                                />
                                <TouchableOpacity
                                    onPress={() => setShowPassword(!showPassword)}
                                    style={styles.eyeButton}
                                >
                                    <Ionicons
                                        name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                                        size={20}
                                        color={Colors.textMuted}
                                    />
                                </TouchableOpacity>
                            </View>

                            {/* Login Button */}
                            <TouchableOpacity
                                onPress={handleLogin}
                                disabled={loading}
                                activeOpacity={0.8}
                            >
                                <LinearGradient
                                    colors={[Colors.primary, Colors.primaryDark]}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 0 }}
                                    style={styles.loginButton}
                                >
                                    {loading ? (
                                        <ActivityIndicator color="#FFF" />
                                    ) : (
                                        <>
                                            <Text style={styles.loginButtonText}>Sign In</Text>
                                            <Ionicons name="arrow-forward" size={20} color="#FFF" />
                                        </>
                                    )}
                                </LinearGradient>
                            </TouchableOpacity>

                            {/* Divider */}
                            <View style={styles.divider}>
                                <View style={styles.dividerLine} />
                                <Text style={styles.dividerText}>or</Text>
                                <View style={styles.dividerLine} />
                            </View>

                            {/* Social Login */}
                            <TouchableOpacity
                                style={styles.socialButton}
                                activeOpacity={0.7}
                                onPress={handleGoogleLogin}
                                disabled={loading}
                            >
                                <Ionicons name="logo-google" size={20} color={Colors.text} />
                                <Text style={styles.socialButtonText}>Continue with Google</Text>
                            </TouchableOpacity>
                        </View>

                        {/* Sign Up Link */}
                        <View style={styles.signupRow}>
                            <Text style={styles.signupText}>Don't have an account? </Text>
                            <TouchableOpacity onPress={() => router.push('/(auth)/signup')}>
                                <Text style={styles.signupLink}>Create Account</Text>
                            </TouchableOpacity>
                        </View>
                    </Animated.View>
                </ScrollView>
            </KeyboardAvoidingView>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    keyboardView: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
        justifyContent: 'center',
        paddingHorizontal: Spacing.xl,
        paddingVertical: Spacing.huge,
    },
    content: {
        alignItems: 'center',
    },

    // Decorative orbs
    orb: {
        position: 'absolute',
        borderRadius: 999,
    },
    orbPrimary: {
        width: 300,
        height: 300,
        backgroundColor: 'rgba(16, 185, 129, 0.10)',
        top: -100,
        right: -80,
    },
    orbSecondary: {
        width: 200,
        height: 200,
        backgroundColor: 'rgba(5, 150, 105, 0.08)',
        bottom: 100,
        left: -60,
    },
    orbAccent: {
        width: 150,
        height: 150,
        backgroundColor: 'rgba(15, 23, 42, 0.04)',
        top: height * 0.4,
        right: -40,
    },

    // Branding
    brandContainer: {
        alignItems: 'center',
        marginBottom: Spacing.xxxl,
    },
    logoGradient: {
        width: 64,
        height: 64,
        borderRadius: BorderRadius.lg,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: Spacing.lg,
        ...Shadows.glow,
    },
    brandName: {
        ...Typography.hero,
        color: Colors.text,
        marginBottom: Spacing.xs,
    },
    brandTagline: {
        ...Typography.caption,
        color: Colors.textMuted,
    },

    // Card
    card: {
        width: '100%',
        backgroundColor: Colors.glass,
        borderRadius: BorderRadius.xl,
        borderWidth: 1,
        borderColor: Colors.glassBorder,
        padding: Spacing.xxl,
        ...Shadows.md,
    },
    cardTitle: {
        ...Typography.h2,
        color: Colors.text,
        marginBottom: Spacing.xs,
    },
    cardSubtitle: {
        ...Typography.caption,
        color: Colors.textSecondary,
        marginBottom: Spacing.xxl,
    },

    // Inputs
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
    inputIcon: {
        marginRight: Spacing.md,
    },
    input: {
        flex: 1,
        ...Typography.body,
        color: Colors.text,
        height: '100%',
    },
    eyeButton: {
        padding: Spacing.sm,
        marginLeft: Spacing.sm,
    },

    // Login Button
    loginButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: Spacing.sm,
        height: 52,
        borderRadius: BorderRadius.md,
        marginTop: Spacing.sm,
        ...Shadows.lg,
    },
    loginButtonText: {
        ...Typography.bodyBold,
        color: '#FFF',
    },

    // Divider
    divider: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: Spacing.xl,
    },
    dividerLine: {
        flex: 1,
        height: 1,
        backgroundColor: Colors.border,
    },
    dividerText: {
        ...Typography.caption,
        color: Colors.textMuted,
        marginHorizontal: Spacing.lg,
    },

    // Social Button
    socialButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: Spacing.md,
        height: 52,
        borderRadius: BorderRadius.md,
        borderWidth: 1,
        borderColor: Colors.borderLight,
        backgroundColor: Colors.glass,
    },
    socialButtonText: {
        ...Typography.bodyBold,
        color: Colors.text,
    },

    // Sign Up
    signupRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: Spacing.xxl,
    },
    signupText: {
        ...Typography.body,
        color: Colors.textSecondary,
    },
    signupLink: {
        ...Typography.bodyBold,
        color: Colors.primary,
    },
});
