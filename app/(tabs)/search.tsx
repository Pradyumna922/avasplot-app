// ============================================================================
// 💎 PREMIUM SCREEN — Citizen Membership
// ============================================================================
'use no memo';

import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import {
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BorderRadius, Colors, Spacing, Typography } from '../../src/theme';

export default function PremiumScreen() {
    const insets = useSafeAreaInsets();

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            <ScrollView showsVerticalScrollIndicator={false} style={{ flex: 1, backgroundColor: '#111827' }}>
                {/* Premium Hero */}
                <LinearGradient colors={['#78350F', '#451A03']} style={[styles.franchiseHero, { paddingBottom: Spacing.xxl }]}>
                    <Ionicons name="diamond" size={48} color="#F59E0B" style={{ marginBottom: Spacing.md }} />
                    <Text style={[styles.franchiseTitle, { color: '#FCD34D' }]}>Citizen Membership</Text>
                    <Text style={styles.franchiseSub}>Unlock the ultimate real estate investing advantage with AI-tools and professional services.</Text>
                    <View style={[styles.franPriceBox, { backgroundColor: 'rgba(245, 158, 11, 0.1)', paddingVertical: Spacing.md, paddingHorizontal: Spacing.xl, borderRadius: BorderRadius.lg, marginTop: Spacing.lg }]}>
                        <Text style={[styles.franPriceTxt, { color: '#FCD34D', textAlign: 'center' }]}>₹4,999</Text>
                        <Text style={[styles.franSub, { color: '#FDE68A', marginTop: 0 }]}>per month</Text>
                    </View>
                    <TouchableOpacity
                        style={[styles.franEmailBtn, { backgroundColor: Colors.primary, marginTop: Spacing.xl, paddingHorizontal: Spacing.xxl * 2 }]}
                        onPress={() => Alert.alert('Coming Soon', 'Premium features and citizen memberships are coming shortly!')}
                        activeOpacity={0.85}
                    >
                        <Text style={[styles.franEmailTxt, { color: '#FFF' }]}>Subscribe Now</Text>
                    </TouchableOpacity>
                </LinearGradient>

                <View style={{ paddingHorizontal: Spacing.xl, paddingVertical: Spacing.xxl }}>
                    <Text style={[styles.sectionHeading, { color: '#FFF', textAlign: 'left', marginBottom: Spacing.lg }]}>AI Power Tools</Text>
                    <View style={{ gap: Spacing.md }}>
                        {[
                            { icon: 'trending-up', title: 'Unlimited Price Predictions', desc: 'Instant market value assessment using advanced AI models.' },
                            { icon: 'compass-outline', title: 'Instant Vastu Analysis', desc: 'AI-driven Vastu scores and orientation insights for every plot.' },
                            { icon: 'analytics-outline', title: 'Growth Reports', desc: 'Detailed connectivity, infrastructure, and real estate trend reports.' }
                        ].map((tool, idx) => (
                            <View key={idx} style={[styles.insightBox, { backgroundColor: 'rgba(245, 158, 11, 0.05)', borderColor: 'rgba(245, 158, 11, 0.2)' }]}>
                                <View style={[styles.insightAvatar, { backgroundColor: 'rgba(245, 158, 11, 0.2)' }]}>
                                    <Ionicons name={tool.icon as any} size={16} color="#FCD34D" />
                                </View>
                                <View style={styles.insightContent}>
                                    <Text style={[styles.insightTitle, { color: '#FCD34D', fontSize: 13 }]}>{tool.title}</Text>
                                    <Text style={[styles.insightText, { color: '#D1D5DB' }]}>{tool.desc}</Text>
                                </View>
                            </View>
                        ))}
                    </View>

                    <Text style={[styles.sectionHeading, { color: '#FFF', textAlign: 'left', marginTop: Spacing.xxl, marginBottom: Spacing.lg }]}>Investment Insurance</Text>
                    <View style={styles.whyGrid}>
                        {[
                            { icon: 'document-text-outline', title: '1x Legal Consult', desc: 'Direct consultation with a verified real estate lawyer.' },
                            { icon: 'briefcase-outline', title: '1x Wealth Session', desc: 'Portfolio planning with an expert.' },
                            { icon: 'map-outline', title: '1x Basic Survey', desc: 'Verify land boundaries before you purchase.' },
                            { icon: 'shield-checkmark-outline', title: 'Fraud Protection', desc: 'Ensures totally secure investments.' }
                        ].map((feat, idx) => (
                            <View key={idx} style={[styles.whyCard, { backgroundColor: '#1F2937', borderColor: '#374151' }]}>
                                <View style={[styles.whyIconWrap, { backgroundColor: 'rgba(245, 158, 11, 0.1)' }]}>
                                    <Ionicons name={feat.icon as any} size={20} color="#F59E0B" />
                                </View>
                                <Text style={[styles.whyTitle, { color: '#F3F4F6' }]}>{feat.title}</Text>
                                <Text style={[styles.whyDesc, { color: '#9CA3AF' }]}>{feat.desc}</Text>
                            </View>
                        ))}
                    </View>

                    <Text style={[styles.sectionHeading, { color: '#FFF', textAlign: 'left', marginTop: Spacing.xxl, marginBottom: Spacing.lg }]}>Security & Protection</Text>
                    <View style={styles.whyGrid}>
                        {[
                            { icon: 'shield-checkmark-outline', title: 'Fraud Protection', desc: 'Included in membership to ensure secure deals.' },
                            { icon: 'people-outline', title: 'Trusted Community', desc: 'Trusted by over 2,000 investors in the region.' },
                            { icon: 'card-outline', title: 'Secure Payment', desc: 'Managed via UPI/Card.' },
                            { icon: 'calendar-outline', title: 'Flexibility', desc: 'Cancel membership at any time.' }
                        ].map((feat, idx) => (
                            <View key={idx} style={[styles.whyCard, { backgroundColor: '#1F2937', borderColor: '#374151', width: '48%' }]}>
                                <View style={[styles.whyIconWrap, { backgroundColor: 'rgba(16, 185, 129, 0.1)' }]}>
                                    <Ionicons name={feat.icon as any} size={20} color="#10B981" />
                                </View>
                                <Text style={[styles.whyTitle, { color: '#F3F4F6' }]}>{feat.title}</Text>
                                <Text style={[styles.whyDesc, { color: '#9CA3AF' }]}>{feat.desc}</Text>
                            </View>
                        ))}
                    </View>
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#111827',
    },
    franchiseHero: {
        alignItems: 'center',
        paddingHorizontal: Spacing.xl,
        paddingTop: Spacing.xxl,
        paddingBottom: Spacing.xxl,
    },
    franchiseTitle: {
        fontSize: 28,
        fontWeight: '800',
        color: '#FFF',
        textAlign: 'center',
        marginBottom: Spacing.sm,
    },
    franchiseSub: {
        ...Typography.body,
        color: 'rgba(255,255,255,0.7)',
        textAlign: 'center',
        paddingHorizontal: Spacing.lg,
    },
    franPriceBox: {
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(245, 158, 11, 0.3)',
    },
    franPriceTxt: {
        fontSize: 32,
        fontWeight: '800',
    },
    franSub: {
        ...Typography.tiny,
    },
    franEmailBtn: {
        paddingVertical: Spacing.md,
        borderRadius: BorderRadius.md,
    },
    franEmailTxt: {
        ...Typography.bodyBold,
    },
    sectionHeading: {
        fontSize: 20,
        fontWeight: '700',
    },
    insightBox: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: Spacing.md,
        borderRadius: BorderRadius.md,
        borderWidth: 1,
    },
    insightAvatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: Spacing.md,
    },
    insightContent: {
        flex: 1,
    },
    insightTitle: {
        ...Typography.bodyBold,
        marginBottom: 2,
    },
    insightText: {
        ...Typography.tiny,
        lineHeight: 16,
    },
    whyGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: Spacing.md,
        justifyContent: 'space-between',
    },
    whyCard: {
        width: '48%',
        padding: Spacing.md,
        borderRadius: BorderRadius.md,
        borderWidth: 1,
        alignItems: 'center',
    },
    whyIconWrap: {
        width: 44,
        height: 44,
        borderRadius: 22,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: Spacing.sm,
    },
    whyTitle: {
        ...Typography.bodyBold,
        textAlign: 'center',
        marginBottom: 4,
        fontSize: 13,
    },
    whyDesc: {
        ...Typography.tiny,
        textAlign: 'center',
        lineHeight: 14,
    },
});
