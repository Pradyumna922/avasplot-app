// ============================================================================
// ℹ️ HELP & SUPPORT SCREEN
// ============================================================================
'use no memo';

import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { Linking, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BorderRadius, Colors, Spacing, Typography } from '../src/theme';

export default function HelpSupportScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();

    const faqs = [
        {
            q: "How do I list a property?",
            a: "Go to the 'Post' tab from the bottom navigation menu. Fill in the required details about your property, upload high-quality photos, and submit. Our team will review and approve it shortly."
        },
        {
            q: "What is the Scout Program?",
            a: "The Scout Program allows you to earn commissions by referring land deals in your local area to Avasplot. If a deal you submit is successfully closed, you receive a direct payout!"
        },
        {
            q: "How does the Citizen Membership work?",
            a: "Citizen Membership is our premium tier giving you access to AI Power Tools, Investment Insurance, and advanced Vastu analysis. You can subscribe from the Premium tab."
        },
        {
            q: "Is my personal data secure?",
            a: "Yes! We use industry-standard encryption to protect your data. Your contact information is only shared with verified buyers/sellers when you explicitly allow it."
        }
    ];

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            {/* Header */}
            <View style={styles.headerRow}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} activeOpacity={0.7}>
                    <Ionicons name="arrow-back" size={24} color={Colors.text} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Help & Support</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

                {/* Contact Options */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Contact Us</Text>
                    <Text style={styles.sectionDesc}>Need direct assistance? Reach out to our team.</Text>

                    <View style={styles.contactRow}>
                        <TouchableOpacity style={styles.contactBtn} onPress={() => Linking.openURL('mailto:support@avasplot.in')}>
                            <View style={[styles.iconWrap, { backgroundColor: 'rgba(59, 130, 246, 0.1)' }]}>
                                <Ionicons name="mail" size={24} color="#3B82F6" />
                            </View>
                            <Text style={styles.contactTxt}>Email Support</Text>
                            <Text style={styles.contactSub}>support@avasplot.in</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.contactBtn} onPress={() => Linking.openURL('tel:+919876543210')}>
                            <View style={[styles.iconWrap, { backgroundColor: 'rgba(16, 185, 129, 0.1)' }]}>
                                <Ionicons name="call" size={24} color="#10B981" />
                            </View>
                            <Text style={styles.contactTxt}>Call Us</Text>
                            <Text style={styles.contactSub}>Mon-Sat, 9AM-6PM</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* FAQ Section */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Frequently Asked Questions</Text>

                    {faqs.map((faq, idx) => (
                        <View key={idx} style={styles.faqCard}>
                            <Text style={styles.faqQ}>{faq.q}</Text>
                            <Text style={styles.faqA}>{faq.a}</Text>
                        </View>
                    ))}
                </View>

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
    section: {
        marginBottom: Spacing.xxl,
    },
    sectionTitle: {
        ...Typography.h3,
        color: Colors.text,
        marginBottom: 4,
    },
    sectionDesc: {
        ...Typography.body,
        color: Colors.textSecondary,
        marginBottom: Spacing.lg,
    },
    contactRow: {
        flexDirection: 'row',
        gap: Spacing.md,
    },
    contactBtn: {
        flex: 1,
        backgroundColor: Colors.surface,
        borderRadius: BorderRadius.lg,
        padding: Spacing.lg,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: Colors.glassBorder,
    },
    iconWrap: {
        width: 48,
        height: 48,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: Spacing.md,
    },
    contactTxt: {
        ...Typography.bodyBold,
        color: Colors.text,
        marginBottom: 2,
    },
    contactSub: {
        ...Typography.caption,
        color: Colors.textMuted,
    },
    faqCard: {
        backgroundColor: Colors.surface,
        borderRadius: BorderRadius.lg,
        padding: Spacing.lg,
        marginBottom: Spacing.md,
        borderWidth: 1,
        borderColor: Colors.glassBorder,
    },
    faqQ: {
        ...Typography.bodyBold,
        color: Colors.text,
        marginBottom: Spacing.sm,
    },
    faqA: {
        ...Typography.body,
        color: Colors.textSecondary,
        lineHeight: 22,
    },
});
