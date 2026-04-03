// ============================================================================
// 🔍 SCOUTS SCREEN — Scout Program & Lead Submission
// ============================================================================
'use no memo';

import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useState } from 'react';
import {
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BorderRadius, Colors, Shadows, Spacing, Typography } from '../../src/theme';

export default function ScoutsScreen() {
  const insets = useSafeAreaInsets();

  // Scout Form States
  const [isScoutFormVisible, setIsScoutFormVisible] = useState(false);
  const [scoutLocation, setScoutLocation] = useState('');
  const [scoutContact, setScoutContact] = useState('');
  const [scoutPrice, setScoutPrice] = useState('');
  const [scoutSize, setScoutSize] = useState('');
  const [scoutNotes, setScoutNotes] = useState('');

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView showsVerticalScrollIndicator={false} style={{ flex: 1, backgroundColor: '#F8FAFC' }}>
        {/* Scout Hero */}
        <LinearGradient colors={['#0F172A', '#1E293B']} style={styles.franchiseHero}>
          <View style={[styles.franchiseBadge, { borderColor: '#3B82F6', backgroundColor: 'rgba(59, 130, 246, 0.15)' }]}>
            <Text style={[styles.franchiseBadgeTxt, { color: '#3B82F6' }]}>SCOUT PROGRAM</Text>
          </View>
          <Text style={styles.franchiseTitle}>Earn by <Text style={{ color: '#10B981' }}>Finding Land</Text></Text>
          <Text style={styles.franchiseSub}>Turn your local knowledge into income. Get paid for every land plot you discover.</Text>
        </LinearGradient>

        {/* Program Stats */}
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: Spacing.xl, paddingVertical: Spacing.lg, gap: Spacing.md, justifyContent: 'space-between' }}>
          {[
            { value: '2,500+', label: 'Active Scouts' },
            { value: '15,000+', label: 'Leads Submitted' },
            { value: '₹2.5 Cr+', label: 'Total Paid Out' },
            { value: '₹25,000', label: 'Avg. Monthly Earning' }
          ].map((stat, idx) => (
            <View key={idx} style={{ width: '47%', backgroundColor: '#1E293B', padding: Spacing.lg, borderRadius: BorderRadius.lg, alignItems: 'center' }}>
              <Text style={{ fontFamily: 'Outfit-Bold', fontSize: 20, color: '#10B981' }}>{stat.value}</Text>
              <Text style={{ ...Typography.caption, color: '#9CA3AF', marginTop: 4 }}>{stat.label}</Text>
            </View>
          ))}
        </View>

        {/* Why Become a Scout */}
        <View style={[styles.whyPartnerContainer, { paddingVertical: Spacing.xl }]}>
          <Text style={styles.sectionHeading}>Why Become a Scout?</Text>
          <View style={styles.whyGrid}>
            {[
              { icon: 'cash-outline', title: 'Earn ₹5,000 - ₹50,000', desc: 'Per successful land referral' },
              { icon: 'time-outline', title: 'Flexible Work', desc: 'Work on your own schedule' },
              { icon: 'trending-up-outline', title: 'Unlimited Earnings', desc: 'No cap on monthly income' },
              { icon: 'ribbon-outline', title: 'Performance Bonuses', desc: 'Extra rewards for top scouts' }
            ].map((feat, idx) => (
              <View key={idx} style={[styles.whyCard, { width: '48%', alignItems: 'center', padding: Spacing.xl }]}>
                <View style={[styles.whyIconWrap, { backgroundColor: 'rgba(16, 185, 129, 0.1)', width: 48, height: 48, borderRadius: 24 }]}>
                  <Ionicons name={feat.icon as any} size={24} color="#10B981" />
                </View>
                <Text style={[styles.whyTitle, { textAlign: 'center', marginTop: Spacing.sm }]}>{feat.title}</Text>
                <Text style={[styles.whyDesc, { textAlign: 'center' }]}>{feat.desc}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Commission Structure */}
        <View style={styles.whyPartnerContainer}>
          <Text style={styles.sectionHeading}>Commission Structure</Text>
          <View style={styles.whyGrid}>
            <View style={styles.whyCard}>
              <View style={[styles.whyIconWrap, { backgroundColor: 'rgba(59, 130, 246, 0.1)' }]}>
                <Text style={{ fontSize: 16 }}>₹</Text>
              </View>
              <Text style={styles.whyTitle}>Deals up to ₹50L</Text>
              <Text style={[styles.franPriceTxt, { fontSize: 22, marginTop: Spacing.sm }]}>₹5,000</Text>
            </View>
            <View style={styles.whyCard}>
              <View style={[styles.whyIconWrap, { backgroundColor: 'rgba(59, 130, 246, 0.1)' }]}>
                <Text style={{ fontSize: 16 }}>₹</Text>
              </View>
              <Text style={styles.whyTitle}>₹50L - ₹1Cr</Text>
              <Text style={[styles.franPriceTxt, { fontSize: 22, marginTop: Spacing.sm }]}>₹15,000</Text>
            </View>
            <View style={styles.whyCard}>
              <View style={[styles.whyIconWrap, { backgroundColor: 'rgba(59, 130, 246, 0.1)' }]}>
                <Text style={{ fontSize: 16 }}>₹</Text>
              </View>
              <Text style={styles.whyTitle}>₹1Cr - ₹5Cr</Text>
              <Text style={[styles.franPriceTxt, { fontSize: 22, marginTop: Spacing.sm }]}>₹30,000</Text>
            </View>
            <View style={styles.whyCard}>
              <View style={[styles.whyIconWrap, { backgroundColor: 'rgba(59, 130, 246, 0.1)' }]}>
                <Text style={{ fontSize: 16 }}>₹</Text>
              </View>
              <Text style={styles.whyTitle}>Above ₹5Cr</Text>
              <Text style={[styles.franPriceTxt, { fontSize: 22, marginTop: Spacing.sm }]}>₹50,000+</Text>
            </View>
          </View>
        </View>

        {/* How It Works */}
        <View style={styles.howWorksContainer}>
          <Text style={styles.sectionHeading}>How It Works</Text>
          <View style={styles.howWorksGrid}>
            {[
              { step: '1', title: 'Find Land', desc: 'Identify land plots for sale in your local area.' },
              { step: '2', title: 'Submit Details', desc: 'Provide map location, owner contact, estimated price, size, and photos.' },
              { step: '3', title: 'Verification', desc: 'The Avasplot team verifies the information and contacts the owner.' },
              { step: '4', title: 'Get Paid', desc: 'Earn a commission once the deal is successfully closed.' }
            ].map((step, idx) => (
              <View key={idx} style={styles.howCard}>
                <View style={[styles.stepCircle, { backgroundColor: '#3B82F6' }]}>
                  <Text style={styles.stepNumTxt}>{step.step}</Text>
                </View>
                <Text style={styles.howTitle}>{step.title}</Text>
                <Text style={styles.howDesc}>{step.desc}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Footer CTA */}
        <View style={styles.franFooterContainer}>
          <LinearGradient colors={['#0F172A', '#1E293B']} style={styles.franCtaBlock}>
            <Text style={styles.franCtaTitle}>Ready to Start Earning?</Text>
            <Text style={styles.franCtaSub}>Join the Scout Program today and monetize your local knowledge.</Text>
            <TouchableOpacity
              style={[styles.franEmailBtn, { backgroundColor: Colors.primary }]}
              onPress={() => setIsScoutFormVisible(true)}
            >
              <Text style={styles.franEmailTxt}>Join Scouts Program</Text>
            </TouchableOpacity>
          </LinearGradient>
        </View>
      </ScrollView>

      {/* SCOUT LEAD FORM MODAL */}
      <Modal visible={isScoutFormVisible} transparent animationType="slide" onRequestClose={() => setIsScoutFormVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { height: '85%' }]}>
            <View style={styles.modalHeader}>
              <Text style={styles.filterSectionTitle}>Submit a Land Lead</Text>
              <TouchableOpacity onPress={() => setIsScoutFormVisible(false)}>
                <Ionicons name="close-circle" size={28} color={Colors.textMuted} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: Spacing.xl }}>
              <View style={styles.filterSection}>
                <Text style={styles.proSubtitle}>Land Location *</Text>
                <TextInput
                  style={styles.filterInput}
                  placeholder="e.g., Survey No. 123, Village Name, City"
                  value={scoutLocation}
                  onChangeText={setScoutLocation}
                />
              </View>

              <View style={styles.filterSection}>
                <Text style={styles.proSubtitle}>Owner Contact (if available)</Text>
                <TextInput
                  style={styles.filterInput}
                  placeholder="Phone number or name"
                  value={scoutContact}
                  onChangeText={setScoutContact}
                />
              </View>

              <View style={styles.filterRow}>
                <View style={[styles.filterSection, { flex: 1 }]}>
                  <Text style={styles.proSubtitle}>Estimated Price</Text>
                  <TextInput
                    style={styles.filterInput}
                    placeholder="Approx Value"
                    value={scoutPrice}
                    onChangeText={setScoutPrice}
                  />
                </View>
                <View style={[styles.filterSection, { flex: 1 }]}>
                  <Text style={styles.proSubtitle}>Plot Size</Text>
                  <TextInput
                    style={styles.filterInput}
                    placeholder="Approx Area"
                    value={scoutSize}
                    onChangeText={setScoutSize}
                  />
                </View>
              </View>

              <View style={styles.filterSection}>
                <Text style={styles.proSubtitle}>Additional Notes</Text>
                <TextInput
                  style={[styles.filterInput, { height: 100, textAlignVertical: 'top' }]}
                  placeholder="Any additional information..."
                  multiline
                  value={scoutNotes}
                  onChangeText={setScoutNotes}
                />
              </View>

              <View style={styles.filterSection}>
                <TouchableOpacity style={[styles.proCard, { alignItems: 'center', borderStyle: 'dashed' }]}>
                  <Ionicons name="camera-outline" size={24} color={Colors.textMuted} style={{ marginBottom: Spacing.sm }} />
                  <Text style={styles.proSubtitle}>Upload Photos (Optional)</Text>
                  <Text style={styles.proReviewTxt}>Photos increase verification speed</Text>
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                style={[styles.franEmailBtn, { backgroundColor: Colors.primary, marginTop: Spacing.xl }]}
                onPress={() => {
                  if (!scoutLocation) {
                    Alert.alert('Required Field', 'Please provide a land location.');
                    return;
                  }
                  Alert.alert('Scout Lead Submitted!', 'Thank you! The Avasplot team will verify this lead shortly.');
                  setIsScoutFormVisible(false);
                  setScoutLocation('');
                  setScoutContact('');
                  setScoutPrice('');
                  setScoutSize('');
                  setScoutNotes('');
                }}
              >
                <Text style={[styles.franEmailTxt, { color: '#FFF', textAlign: 'center' }]}>Submit Lead</Text>
              </TouchableOpacity>
              <Text style={[styles.proReviewTxt, { textAlign: 'center', marginTop: Spacing.md, fontSize: 10 }]}>By submitting, you agree to our scout program terms.</Text>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },

  // Hero
  franchiseHero: {
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.xxl * 1.5,
    alignItems: 'center',
  },
  franchiseBadge: {
    borderWidth: 1,
    borderRadius: BorderRadius.full,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.xs,
    marginBottom: Spacing.lg,
  },
  franchiseBadgeTxt: {
    ...Typography.tiny,
    fontWeight: '700',
    letterSpacing: 1.5,
  },
  franchiseTitle: {
    ...Typography.h1,
    color: '#FFF',
    fontSize: 28,
    textAlign: 'center',
    marginBottom: Spacing.md,
  },
  franchiseSub: {
    ...Typography.body,
    color: 'rgba(255,255,255,0.6)',
    textAlign: 'center',
    lineHeight: 22,
  },

  // Why Partner
  whyPartnerContainer: {
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.xxl,
  },
  sectionHeading: {
    ...Typography.h2,
    color: Colors.text,
    marginBottom: Spacing.lg,
    textAlign: 'center',
  },
  whyGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
    justifyContent: 'center',
  },
  whyCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
    ...Shadows.sm,
  },
  whyIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  whyTitle: {
    ...Typography.bodyBold,
    color: Colors.text,
    marginBottom: 4,
  },
  whyDesc: {
    ...Typography.caption,
    color: Colors.textMuted,
    lineHeight: 18,
  },

  // Commission
  franPriceTxt: {
    fontFamily: 'Outfit-Bold',
    fontSize: 18,
    color: Colors.primary,
  },

  // How It Works
  howWorksContainer: {
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.xxl,
    backgroundColor: '#F1F5F9',
  },
  howWorksGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
    justifyContent: 'center',
  },
  howCard: {
    width: '47%',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    alignItems: 'center',
    ...Shadows.sm,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
  },
  stepCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  stepNumTxt: {
    ...Typography.bodyBold,
    color: '#FFF',
    fontSize: 16,
  },
  howTitle: {
    ...Typography.bodyBold,
    color: Colors.text,
    textAlign: 'center',
    marginBottom: 4,
  },
  howDesc: {
    ...Typography.caption,
    color: Colors.textMuted,
    textAlign: 'center',
    lineHeight: 18,
  },

  // Footer CTA
  franFooterContainer: {
    padding: Spacing.xl,
  },
  franCtaBlock: {
    borderRadius: BorderRadius.xl,
    padding: Spacing.xxl,
    alignItems: 'center',
  },
  franCtaTitle: {
    ...Typography.h2,
    color: '#FFF',
    textAlign: 'center',
    marginBottom: Spacing.md,
  },
  franCtaSub: {
    ...Typography.body,
    color: 'rgba(255,255,255,0.6)',
    textAlign: 'center',
    marginBottom: Spacing.xl,
    lineHeight: 22,
  },
  franEmailBtn: {
    paddingHorizontal: Spacing.xxxl,
    paddingVertical: Spacing.lg,
    borderRadius: BorderRadius.md,
  },
  franEmailTxt: {
    ...Typography.bodyBold,
    color: '#FFF',
  },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
    padding: Spacing.xl,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  filterSectionTitle: {
    ...Typography.h3,
    color: Colors.text,
  },
  filterSection: {
    marginBottom: Spacing.lg,
  },
  filterRow: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  filterInput: {
    backgroundColor: '#F1F5F9',
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    ...Typography.body,
    color: Colors.text,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
    marginTop: Spacing.sm,
  },
  proSubtitle: {
    ...Typography.captionBold,
    color: Colors.textSecondary,
  },
  proCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: BorderRadius.lg,
    padding: Spacing.xl,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
  },
  proReviewTxt: {
    ...Typography.caption,
    color: Colors.textMuted,
  },
});
