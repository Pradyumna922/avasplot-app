// ============================================================================
// 🔒 PRIVACY POLICY SCREEN
// ============================================================================
'use no memo';

import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Spacing, Typography } from '../src/theme';

export default function PrivacyPolicyScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();

    const sections = [
        {
            title: "1. Information We Collect",
            content: "We collect information you provide directly to us, such as when you create or modify your account, request on-demand services, contact customer support, or otherwise communicate with us. This information may include: name, email, phone number, profile picture, payment method, and other information."
        },
        {
            title: "2. How We Use Your Information",
            content: "We use the information we collect to provide, maintain, and improve our services, including to facilitate real estate transactions, provide AI estimations, send receipts, provide customer support, and develop new features."
        },
        {
            title: "3. Sharing of Information",
            content: "We may share the information we collect about you as described in this Statement or as described at the time of collection or sharing, including: with real estate professionals, consultants, and service providers who need access to such information to carry out work on our behalf."
        },
        {
            title: "4. Data Security",
            content: "We take reasonable measures to help protect information about you from loss, theft, misuse and unauthorized access, disclosure, alteration and destruction."
        },
        {
            title: "5. Contact Us",
            content: "If you have any questions about this Privacy Statement, please contact us at privacy@avasplot.in."
        }
    ];

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            {/* Header */}
            <View style={styles.headerRow}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} activeOpacity={0.7}>
                    <Ionicons name="arrow-back" size={24} color={Colors.text} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Privacy Policy</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

                <Text style={styles.lastUpdated}>Last Updated: October 2026</Text>

                <Text style={styles.introText}>
                    Welcome to Avasplot! This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our mobile application. Please read this privacy policy carefully. If you do not agree with the terms of this privacy policy, please do not access the application.
                </Text>

                {sections.map((sec, idx) => (
                    <View key={idx} style={styles.section}>
                        <Text style={styles.sectionTitle}>{sec.title}</Text>
                        <Text style={styles.sectionContent}>{sec.content}</Text>
                    </View>
                ))}

            </ScrollView>
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
    scrollContent: {
        padding: Spacing.xl,
        paddingBottom: 80,
    },
    lastUpdated: {
        ...Typography.captionBold,
        color: Colors.textMuted,
        marginBottom: Spacing.md,
    },
    introText: {
        ...Typography.body,
        color: Colors.textSecondary,
        lineHeight: 24,
        marginBottom: Spacing.xl,
    },
    section: {
        marginBottom: Spacing.xl,
    },
    sectionTitle: {
        ...Typography.h3,
        color: Colors.text,
        marginBottom: Spacing.sm,
    },
    sectionContent: {
        ...Typography.body,
        color: Colors.textSecondary,
        lineHeight: 24,
    },
});
