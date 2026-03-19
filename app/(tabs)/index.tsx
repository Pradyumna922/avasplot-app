// ============================================================================
// 🏠 HOME / EXPLORE SCREEN — Property Discovery
// ============================================================================
'use no memo';
// ============================================================================

import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  Dimensions,
  FlatList,
  Image,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Alert,
  Modal,
  Platform,
  Linking,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../../src/context/AuthContext';
import { useNotifications } from '../../src/context/NotificationContext';
import { formatArea, formatPrice, properties, subscriptions, timeAgo } from '../../src/services/appwrite';
import { openRazorpayCheckout } from '../../src/services/razorpay';
import { BorderRadius, Colors, Shadows, Spacing, Typography } from '../../src/theme';
import { Property, PROPERTY_TYPES } from '../../src/types';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width - Spacing.xl * 2;

// ============================================================================
// 🃏 PROPERTY CARD COMPONENT
// ============================================================================

function PropertyCard({
  property,
  index,
  onPress,
  isFavorite,
  isCompared,
  onToggleFavorite,
  onToggleCompare,
}: {
  property: Property;
  index: number;
  onPress: () => void;
  isFavorite: boolean;
  isCompared: boolean;
  onToggleFavorite: () => void;
  onToggleCompare: () => void;
}) {
  const router = useRouter();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(40)).current;

  useEffect(() => {
    const delay = index * 100;
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        delay,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 500,
        delay,
        useNativeDriver: true,
      }),
    ]).start();
  }, [index]);

  const imageUrl = property.images?.[0]
    ? properties.getImageUrl(property.images[0])
    : null;

  // Determine actual lister name fallback (owner_name -> sellerName -> 'Verified Listing')
  const authorName = property.owner_name || property.sellerName || 'Verified Listing';
  // Compute the first initial, defaulting to 'V' if unavailable
  const authorInitial = authorName.charAt(0).toUpperCase() || 'V';

  return (
    <Animated.View
      style={[
        styles.card,
        { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
      ]}
    >
      <TouchableOpacity onPress={onPress} activeOpacity={0.9}>
        {/* Image Box */}
        <View style={styles.cardImageContainer}>
          {imageUrl ? (
            <Image source={{ uri: imageUrl }} style={styles.cardImage} />
          ) : (
            <LinearGradient
              colors={[Colors.surfaceElevated, Colors.surfaceBright]}
              style={styles.cardImagePlaceholder}
            >
              <Ionicons name="image-outline" size={48} color={Colors.textMuted} />
            </LinearGradient>
          )}

          {/* TOP LEFT: Verified Badge (Redesigned) */}
          {property.verified && (
            <View style={styles.webVerifiedBadge}>
              <Ionicons name="shield-checkmark" size={12} color="#FFF" />
              <Text style={styles.webVerifiedText}>VERIFIED SELLER</Text>
            </View>
          )}

          {/* TOP RIGHT: Action Buttons */}
          <View style={styles.cardActions}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={(e) => {
                e.preventDefault();
                onToggleFavorite();
              }}
            >
              <View style={styles.actionButtonInner}>
                <Ionicons name={isFavorite ? "heart" : "heart-outline"} size={16} color={isFavorite ? "#EF4444" : "#FFF"} />
              </View>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, styles.compareButton]}
              onPress={(e) => {
                e.preventDefault();
                onToggleCompare();
              }}
            >
              <View style={[styles.actionButtonInner, styles.compareButtonInner, isCompared && styles.compareButtonSelected]}>
                <Ionicons name="git-compare-outline" size={16} color="#FFF" />
              </View>
            </TouchableOpacity>
          </View>

          {/* BOTTOM GRADIENT: Location & Price */}
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.8)']}
            style={styles.imageBottomOverlay}
          >
            <View style={styles.webImageLocationRow}>
              <Ionicons name="location-outline" size={14} color="#CBD5E1" />
              <Text style={styles.webImageLocationText} numberOfLines={1}>
                {property.city || property.location}
              </Text>
            </View>
            <Text style={styles.webImagePrice}>{formatPrice(property.price)}</Text>
          </LinearGradient>

          {/* BOTTOM RIGHT: Area Box */}
          <View style={styles.webAreaBox}>
            <Text style={styles.webAreaLabel}>AREA</Text>
            <Text style={styles.webAreaValue}>{property.area}</Text>
            <Text style={styles.webAreaUnit}>sqft</Text>
          </View>
        </View>

        {/* AVAS INSIGHT Wrapper */}
        <View style={styles.insightWrapper}>
          <View style={styles.insightBox}>
            <View style={styles.insightAvatar}>
              <Ionicons name="planet" size={18} color="#FFF" />
            </View>
            <View style={styles.insightContent}>
              <View style={styles.insightHeader}>
                <Ionicons name="sparkles" size={12} color="#10B981" />
                <Text style={styles.insightTitle}>AVAS INSIGHT</Text>
              </View>
              <Text style={styles.insightText}>
                "{property.description?.substring(0, 90) || 'Premium asset for high-value growth. Verified title for hassle-free ownership.'}"
              </Text>
            </View>
          </View>
        </View>

        {/* TITLE & DETAILS SECTION */}
        <View style={styles.detailsContainer}>
          <View style={styles.detailsHeaderRow}>
            <View style={{ flex: 1, paddingRight: Spacing.md }}>
              <Text style={styles.newCardTitle}>
                {property.title}
              </Text>
            </View>

            <View style={styles.listedByBox}>
              <View style={styles.listedByTextWrap}>
                <Text style={styles.listedByLabel}>LISTED BY</Text>
                <Text style={styles.listedByName} numberOfLines={1}>{authorName}</Text>
              </View>
              <View style={styles.listedByAvatar}>
                <Text style={styles.listedByAvatarText}>{authorInitial}</Text>
              </View>
            </View>
          </View>

          {/* TAGS */}
          <View style={styles.tagsRow}>
            {property.verified && <View style={styles.tagPill}><Text style={styles.tagText}>Verified</Text></View>}
            {property.vastu && <View style={styles.tagPill}><Text style={styles.tagText}>{property.vastu}</Text></View>}
            <View style={styles.tagPill}><Text style={styles.tagText}>{property.type}</Text></View>
            {property.$createdAt && (
              <View style={styles.tagPill}><Text style={styles.tagText}>{timeAgo(property.$createdAt)}</Text></View>
            )}
          </View>
        </View>

        {/* FOOTER ACTIONS */}
        <View style={styles.cardStickyFooter}>
          <TouchableOpacity
            style={styles.mapBtn}
            onPress={() => {
              // Deep link to external maps
              if (property.latitude && property.longitude) {
                const latLng = `${property.latitude},${property.longitude}`;
                const label = encodeURIComponent(property.title || property.location || 'Property Location');
                const url = Platform.select({
                  ios: `maps:0,0?q=${label}@${latLng}`,
                  android: `geo:0,0?q=${latLng}(${label})`,
                  default: `https://maps.google.com/?q=${latLng}`
                });
                if (url) Linking.openURL(url);
              } else {
                // If no exact coordinates, search by location name
                const query = encodeURIComponent(property.location || property.city || '');
                if (query) {
                  Linking.openURL(`https://maps.google.com/?q=${query}`);
                }
              }
            }}
          >
            <Ionicons name="map-outline" size={16} color="#475569" />
            <Text style={styles.mapBtnText}>Map</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.viewBtn} onPress={onPress}>
            <Text style={styles.viewBtnText}>View Opportunity</Text>
            <Ionicons name="arrow-forward" size={16} color="#FFF" />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

// ============================================================================
// 🏠 MAIN HOME SCREEN
// ============================================================================

const mockProfessionals = [
  {
    id: '1',
    category: 'Legal',
    name: 'Adv. Rajesh Kumar',
    title: 'Property & Land Lawyer',
    avatar: '👨‍⚖️',
    rating: 4.8,
    reviews: 234,
    location: 'Mumbai',
    services: ['Title Search', '7/12 Verification', 'Sale Deed'],
    experience: '10 years',
    pricing: '₹15k - ₹100k',
  },
  {
    id: '2',
    category: 'Survey',
    name: 'Surveyor Amit Patel',
    title: 'Licensed Land Surveyor',
    avatar: '📐',
    rating: 4.9,
    reviews: 189,
    location: 'Pune',
    services: ['Boundary Survey', 'Plot Demarcation', 'Topographic Survey'],
    experience: '15 years',
    pricing: '₹8k - ₹50k',
  },
  {
    id: '3',
    category: 'Vastu',
    name: 'Dr. Sunita Sharma',
    title: 'Vastu Consultant',
    avatar: '🧘‍♂️',
    rating: 4.7,
    reviews: 312,
    location: 'Delhi',
    services: ['Residential Vastu', 'Commercial Vastu', 'Plot Analysis'],
    experience: '12 years',
    pricing: '₹5k - ₹30k',
  },
  {
    id: '4',
    category: 'Architecture',
    name: 'Arch. Priya Desai',
    title: 'Architect & Planner',
    avatar: '🏗️',
    rating: 4.9,
    reviews: 156,
    location: 'Bangalore',
    services: ['Site Planning', 'Architectural Design', 'Building Plans'],
    experience: '10 years',
    pricing: '₹50k - ₹200k',
  },
  {
    id: '5',
    category: 'Legal',
    name: 'Adv. Meera Iyer',
    title: 'Real Estate Lawyer',
    avatar: '⚖️',
    rating: 4.8,
    reviews: 278,
    location: 'Chennai',
    services: ['Property Disputes', 'Litigation', 'Court Cases'],
    experience: '18 years',
    pricing: '₹10k - ₹50k',
  },
  {
    id: '6',
    category: 'Wealth & Income',
    name: 'CA Vikram Malhotra',
    title: 'Wealth & Income Mentor',
    avatar: '💼',
    rating: 4.9,
    reviews: 198,
    location: 'Gurgaon',
    services: ['Investment Strategy', 'Tax Planning', 'Portfolio Management'],
    experience: '14 years',
    pricing: '₹15k - ₹50k',
  }
];

const mockFranchises = [
  {
    id: 'f1',
    title: 'Real Estate Broker',
    territory: '1 KM Radius',
    price: '₹3,00,000',
    contract: '2 Years Contract',
    theme: { border: '#10B981', text: '#10B981', bg: 'rgba(16,185,129,0.05)', icon: 'people-outline' },
    popular: false,
    features: [
      'Exclusive 1 KM radius territory',
      'Lead generation from platform',
      'CRM and analytics dashboard',
      'Marketing support',
      'Commission on transactions',
      'Training and onboarding'
    ]
  },
  {
    id: 'f2',
    title: 'Developer',
    territory: '1 Pincode',
    price: '₹3,50,000',
    contract: '1 Year Contract',
    theme: { border: '#3B82F6', text: '#3B82F6', bg: 'rgba(59,130,246,0.05)', icon: 'business-outline' },
    popular: true,
    features: [
      'Exclusive pincode rights',
      'Project listing priority',
      'Buyer lead generation',
      'Marketing and promotion',
      'Analytics dashboard',
      'Dedicated support'
    ]
  },
  {
    id: 'f3',
    title: 'Architect & Designer',
    territory: '1 Pincode',
    price: '₹2,50,000',
    contract: '5 Years Contract',
    theme: { border: '#8B5CF6', text: '#8B5CF6', bg: 'rgba(139,92,246,0.05)', icon: 'color-palette-outline' },
    popular: false,
    features: [
      'Exclusive pincode rights',
      'Client referrals from platform',
      'Portfolio showcase',
      'Lead management system',
      'Marketing support',
      '5-year partnership'
    ]
  },
  {
    id: 'f4',
    title: 'Wealth & Income Mentor',
    territory: '1 Pincode',
    price: '₹2,00,000',
    contract: '5 Years Contract',
    theme: { border: '#F59E0B', text: '#F59E0B', bg: 'rgba(245,158,11,0.05)', icon: 'trending-up-outline' },
    popular: false,
    features: [
      'Exclusive pincode rights',
      'Client lead generation',
      'Platform integration',
      'Marketing materials',
      'Revenue sharing model',
      'Long-term partnership'
    ]
  },
  {
    id: 'f5',
    title: 'Legal Advisor (Lawyer)',
    territory: '1 Pincode',
    price: '₹1,50,000',
    contract: '5 Years Contract',
    theme: { border: '#6366F1', text: '#6366F1', bg: 'rgba(99,102,241,0.05)', icon: 'hammer-outline' },
    popular: false,
    features: [
      'Exclusive pincode rights',
      'Legal service requests',
      'Document verification leads',
      'Platform visibility',
      'Client management tools',
      '5-year contract'
    ]
  },
  {
    id: 'f6',
    title: 'Land Surveyor',
    territory: '1 Pincode',
    price: '₹1,50,000',
    contract: '5 Years Contract',
    theme: { border: '#EA580C', text: '#EA580C', bg: 'rgba(234,88,12,0.05)', icon: 'construct-outline' },
    popular: false,
    features: [
      'Exclusive pincode rights',
      'Survey request leads',
      'Project assignments',
      'Platform integration',
      'Marketing support',
      'Long-term partnership'
    ]
  },
  {
    id: 'f7',
    title: 'Vastu Consultant',
    territory: '1 Pincode',
    price: '₹1,50,000',
    contract: '5 Years Contract',
    theme: { border: '#E11D48', text: '#E11D48', bg: 'rgba(225,29,72,0.05)', icon: 'compass-outline' },
    popular: false,
    features: [
      'Exclusive pincode rights',
      'Consultation requests',
      'Client lead generation',
      'Platform visibility',
      'Marketing materials',
      '5-year partnership'
    ]
  }
];

const serviceCategories = ['All Services', 'Legal', 'Survey', 'Vastu', 'Architecture', 'Wealth & Income'];

const whyPartnerFeats = [
  { icon: 'map-outline', title: 'Exclusive Territory', desc: 'Get exclusive rights to operate in your chosen city or region' },
  { icon: 'people-outline', title: 'Lead Generation', desc: 'Receive qualified leads from our platform automatically' },
  { icon: 'trending-up-outline', title: 'Revenue Sharing', desc: 'Earn commission on every transaction in your territory' },
  { icon: 'shield-checkmark-outline', title: 'Brand Support', desc: 'Leverage Avasplot brand and marketing materials' },
  { icon: 'briefcase-outline', title: 'Business Tools', desc: 'Access to CRM, analytics, and management dashboard' },
  { icon: 'checkmark-circle-outline', title: 'Training & Support', desc: 'Comprehensive training and ongoing support' },
];

const howItWorksSteps = [
  { step: '1', title: 'Apply', desc: 'Submit franchise application' },
  { step: '2', title: 'Review', desc: 'Territory assessment & approval' },
  { step: '3', title: 'Onboard', desc: 'Training & system setup' },
  { step: '4', title: 'Launch', desc: 'Start earning commissions' }
];

export default function HomeScreen() {
  // Main Tabs State
  const topTabs = ['Plots', 'Services', 'Franchise', 'Scouts'];
  const [mainTab, setMainTab] = useState<'Plots' | 'Services' | 'Franchise' | 'Scouts'>('Plots');
  const [selectedServiceCategory, setSelectedServiceCategory] = useState('All Services');


  const [listings, setListings] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string | null>(null);

  // Advanced Filter States
  const [isFilterVisible, setIsFilterVisible] = useState(false);
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [minArea, setMinArea] = useState('');
  const [maxArea, setMaxArea] = useState('');
  const [selectedVastu, setSelectedVastu] = useState<string | null>(null);

  // Scout Form States
  const [isScoutFormVisible, setIsScoutFormVisible] = useState(false);
  const [scoutLocation, setScoutLocation] = useState('');
  const [scoutContact, setScoutContact] = useState('');
  const [scoutPrice, setScoutPrice] = useState('');
  const [scoutSize, setScoutSize] = useState('');
  const [scoutNotes, setScoutNotes] = useState('');

  // Interaction States
  const [favorites, setFavorites] = useState<string[]>([]);
  const [compareList, setCompareList] = useState<Property[]>([]);

  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user, isLoggedIn, prefs } = useAuth();
  const { unreadCount } = useNotifications();
  const scrollY = useRef(new Animated.Value(0)).current;
  const [subscriptionLoading, setSubscriptionLoading] = useState(false);

  const handleSubscribe = async () => {
    if (!isLoggedIn || !user) {
      Alert.alert('Sign In Required', 'Please sign in to subscribe to Premium.', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Sign In', onPress: () => router.push('/(auth)/login') },
      ]);
      return;
    }
    setSubscriptionLoading(true);
    try {
      const result = await openRazorpayCheckout(
        user.email ?? '',
        user.name ?? 'AvasPlot User',
        {
          name: 'Citizen Membership',
          description: 'AvasPlot Premium — 1 Month',
          amount: 499900, // ₹4999 in paise
        }
      );
      if (result.success) {
        // Record subscription in Appwrite
        try {
          await subscriptions.create(
            user.$id,
            'citizen_monthly',
            result.paymentId ?? `manual_${Date.now()}`
          );
        } catch (dbErr) {
          console.warn('Could not save subscription to DB:', dbErr);
        }
        Alert.alert(
          '🎉 Welcome to Premium!',
          'Your Citizen Membership is now active. Enjoy AI insights, legal consults, and more.',
          [{ text: 'Awesome!' }]
        );
      } else {
        Alert.alert('Payment Cancelled', result.message ?? 'The payment was not completed.');
      }
    } catch (err) {
      Alert.alert('Error', 'Something went wrong. Please try again.');
    } finally {
      setSubscriptionLoading(false);
    }
  };

  const handleToggleFavorite = useCallback((id: string) => {
    setFavorites(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  }, []);

  const handleToggleCompare = useCallback((property: Property) => {
    setCompareList(prev => {
      const isSelected = prev.some(p => p.$id === property.$id);
      if (isSelected) {
        return prev.filter(p => p.$id !== property.$id);
      } else {
        if (prev.length >= 2) {
          Alert.alert('Compare Limit', 'You can only compare up to 2 properties at once.');
          return prev;
        }
        return [...prev, property];
      }
    });
  }, []);

  const loadProperties = useCallback(async () => {
    try {
      const result = await properties.getAll(30);
      setListings(result.documents);
    } catch (err) {
      console.error('Failed to load properties:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadProperties();
  }, [loadProperties]);

  const handleRefresh = () => {
    setRefreshing(true);
    loadProperties();
  };

  const filteredListings = listings.filter((p) => {
    // 1. Keyword search (Title & Location)
    const matchesSearch = !searchQuery ||
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.location.toLowerCase().includes(searchQuery.toLowerCase());

    // 2. Exact Type Match ('residential', 'commercial', etc)
    let matchesType = !selectedType || selectedType === 'All';
    if (!matchesType) {
      matchesType =
        p.propertyType === selectedType ||
        p.type === selectedType ||
        p.type?.toLowerCase() === selectedType?.toLowerCase();
    }

    // 3. Advanced Numerical Bounds & Vastu Match
    const matchesVastu = !selectedVastu || p.vastu === selectedVastu;

    let matchesPrice = true;
    if (minPrice) matchesPrice = matchesPrice && p.price >= parseInt(minPrice.replace(/\D/g, ''), 10);
    if (maxPrice) matchesPrice = matchesPrice && p.price <= parseInt(maxPrice.replace(/\D/g, ''), 10);

    let matchesArea = true;
    if (minArea) matchesArea = matchesArea && p.area >= parseInt(minArea.replace(/\D/g, ''), 10);
    if (maxArea) matchesArea = matchesArea && p.area <= parseInt(maxArea.replace(/\D/g, ''), 10);

    return matchesSearch && matchesType && matchesVastu && matchesPrice && matchesArea;
  });

  const filteredProfessionals = mockProfessionals.filter(
    pro => selectedServiceCategory === 'All Services' || pro.category === selectedServiceCategory
  );


  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 80],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  // Quick filter chips
  const filterChips = ['All', 'residential', 'commercial', 'agricultural', 'industrial'];

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Floating Header Background */}
      <Animated.View style={[styles.headerBg, { opacity: headerOpacity }]} />

      {/* Header */}
      <View style={styles.header}>
        <View style={[styles.headerLeft, { flexDirection: 'row', alignItems: 'center', gap: Spacing.md }]}>
          <Image
            source={require('../../assets/images/new-logo-transparent.png')}
            style={{ width: 48, height: 48, resizeMode: 'contain' }}
          />
          <View>
            <Text style={styles.greeting}>
              {isLoggedIn ? `Hey, ${user?.name?.split(' ')[0] || 'there'} 👋` : 'Welcome to'}
            </Text>
            <Text style={[styles.appName, { fontSize: 24 }]}>AvasPlot</Text>
          </View>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing.md }}>
          <TouchableOpacity
            style={styles.notificationBtn}
            onPress={() => router.push('/notifications')}
          >
            <Ionicons name="notifications-outline" size={24} color={Colors.text} />
            {isLoggedIn && unreadCount > 0 && <View style={styles.notificationDot} />}
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.avatarButton}
            onPress={() => isLoggedIn ? router.push('/(tabs)/profile') : router.push('/(auth)/login')}
          >
            {isLoggedIn && prefs.avatarUrl ? (
              <Image
                source={{ uri: prefs.avatarUrl }}
                style={styles.avatar}
              />
            ) : (
              <LinearGradient
                colors={[Colors.primary, Colors.secondary]}
                style={styles.avatar}
              >
                <Ionicons name="person" size={18} color="#FFF" />
              </LinearGradient>
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* HEADER TABS (Plots, Services, etc) */}
      <View style={styles.topTabsContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.topTabsScroll}>
          {topTabs.map(tab => (
            <TouchableOpacity
              key={tab}
              style={[styles.topTabBtn, mainTab === tab && styles.topTabBtnActive]}
              onPress={() => setMainTab(tab as typeof mainTab)}
            >
              <Text style={[styles.topTabTxt, mainTab === tab && styles.topTabTxtActive]}>{tab}</Text>
              {mainTab === tab && <View style={styles.topTabIndicator} />}
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {mainTab === 'Plots' ? (
        <>
          {/* Search Bar & Filter Toggle */}
          <View style={[styles.searchContainer, { zIndex: 10, elevation: 10 }]} pointerEvents="box-none">
            <View style={{ flexDirection: 'row', gap: Spacing.sm, alignItems: 'center', pointerEvents: 'auto' }}>
              <View style={[styles.searchBar, { flex: 1 }]}>
                <Ionicons name="search" size={20} color={Colors.textMuted} />
                <TextInput
                  style={styles.searchInput}
                  placeholder="Search properties, locations..."
                  placeholderTextColor={Colors.textMuted}
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                />
                {searchQuery ? (
                  <TouchableOpacity onPress={() => setSearchQuery('')}>
                    <Ionicons name="close-circle" size={20} color={Colors.textMuted} />
                  </TouchableOpacity>
                ) : null}
              </View>

              <TouchableOpacity
                style={styles.filterToggleButton}
                onPress={() => setIsFilterVisible(true)}
              >
                <Ionicons name="options-outline" size={22} color="#FFF" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Filter Chips */}
          <View style={styles.filterContainer}>
            <FlatList
              horizontal
              showsHorizontalScrollIndicator={false}
              data={filterChips}
              keyExtractor={(item) => item}
              contentContainerStyle={styles.filterList}
              renderItem={({ item }) => {
                const isActive = item === 'All' ? !selectedType : selectedType === item;
                return (
                  <TouchableOpacity
                    onPress={() => setSelectedType(item === 'All' ? null : item)}
                    activeOpacity={0.7}
                  >
                    {isActive ? (
                      <LinearGradient
                        colors={[Colors.primary, Colors.primaryDark]}
                        style={styles.filterChip}
                      >
                        <Text style={[styles.filterChipText, styles.filterChipTextActive]}>
                          {item}
                        </Text>
                      </LinearGradient>
                    ) : (
                      <View style={[styles.filterChip, styles.filterChipInactive]}>
                        <Text style={styles.filterChipText}>{item}</Text>
                      </View>
                    )}
                  </TouchableOpacity>
                );
              }}
            />
          </View>

          {/* Property Listings */}
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={Colors.primary} />
              <Text style={styles.loadingText}>Discovering properties...</Text>
            </View>
          ) : (
            <Animated.FlatList
              data={filteredListings}
              keyExtractor={(item) => item.$id}
              renderItem={({ item, index }) => (
                <PropertyCard
                  property={item}
                  index={index}
                  onPress={() => router.push(`/property/${item.$id}`)}
                  isFavorite={favorites.includes(item.$id)}
                  isCompared={compareList.some(p => p.$id === item.$id)}
                  onToggleFavorite={() => handleToggleFavorite(item.$id)}
                  onToggleCompare={() => handleToggleCompare(item)}
                />
              )}
              contentContainerStyle={styles.listContent}
              showsVerticalScrollIndicator={false}
              refreshControl={
                <RefreshControl
                  refreshing={refreshing}
                  onRefresh={handleRefresh}
                  tintColor={Colors.primary}
                  colors={[Colors.primary]}
                />
              }
              onScroll={Animated.event(
                [{ nativeEvent: { contentOffset: { y: scrollY } } }],
                { useNativeDriver: false }
              )}
              scrollEventThrottle={16}
              ListEmptyComponent={
                <View style={styles.emptyContainer}>
                  <Ionicons name="home-outline" size={64} color={Colors.textMuted} />
                  <Text style={styles.emptyTitle}>No Properties Found</Text>
                  <Text style={styles.emptySubtitle}>
                    Try adjusting your filters or search query
                  </Text>
                </View>
              }
              ListHeaderComponent={
                <View style={styles.listHeader}>
                  <Text style={styles.resultCount}>
                    {filteredListings.length} {filteredListings.length === 1 ? 'property' : 'properties'} found
                  </Text>
                </View>
              }
            />
          )}

          {/* Floating Compare Action Bar */}
          {compareList.length > 0 && (
            <Animated.View style={styles.floatingCompareBarWrapper}>
              <TouchableOpacity
                style={styles.floatingCompareBar}
                onPress={() => {
                  const pA = compareList[0]?.$id;
                  const pB = compareList[1]?.$id;
                  if (!pA) return;
                  if (pB) {
                    router.push({ pathname: '/compare', params: { propA: pA, propB: pB } });
                  } else {
                    router.push({ pathname: '/compare', params: { propA: pA } });
                  }
                }}
                activeOpacity={0.9}
              >
                <Text style={styles.floatingCompareCount}>
                  {compareList.length} Selected
                </Text>
                <Text style={styles.floatingCompareText}>
                  COMPARE NOW
                </Text>
              </TouchableOpacity>
            </Animated.View>
          )}

          {/* Avas AI Chatbot FAB */}
          <TouchableOpacity
            style={styles.fabContainer}
            onPress={() => router.push('/chat')}
            activeOpacity={0.8}
          >
            <Image
              source={require('../../assets/images/avas-ai-avatar.png')}
              style={styles.fabGradient}
            />
          </TouchableOpacity>
        </>
      ) : mainTab === 'Services' ? (
        <ScrollView showsVerticalScrollIndicator={false} style={{ flex: 1, backgroundColor: '#F8FAFC' }}>
          {/* Hero Banner */}
          <LinearGradient colors={[Colors.primary, Colors.primaryDark]} style={styles.servicesHero}>
            <Text style={styles.servicesHeroTitle}>Land Ecosystem Services</Text>
            <Text style={styles.servicesHeroSub}>Connect with verified lawyers, surveyors, architects, and consultants</Text>
            <View style={styles.servicesSearch}>
              <Ionicons name="search" size={20} color={Colors.textMuted} />
              <TextInput style={styles.servicesSearchInput} placeholder="Search for services or professionals..." placeholderTextColor={Colors.textMuted} />
            </View>
          </LinearGradient>

          {/* Categories list */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.servicesCatScroll}>
            {serviceCategories.map(cat => (
              <TouchableOpacity
                key={cat}
                style={[styles.serviceCatBtn, selectedServiceCategory === cat && styles.serviceCatBtnActive]}
                onPress={() => setSelectedServiceCategory(cat)}
              >
                <Text style={[styles.serviceCatTxt, selectedServiceCategory === cat && styles.serviceCatTxtActive]}>{cat}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Professional Cards List */}
          <View style={styles.proList}>
            <Text style={styles.proCount}>Showing {filteredProfessionals.length} professionals</Text>
            {filteredProfessionals.map(pro => (
              <View key={pro.id} style={styles.proCard}>
                <View style={styles.proHeaderRow}>
                  <View style={styles.proAvatarWrap}>
                    <Text style={{ fontSize: 28 }}>{pro.avatar}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.proName}>{pro.name}</Text>
                    <Text style={styles.proTitle}>{pro.title}</Text>
                  </View>
                  <View style={styles.proVerified}>
                    <Ionicons name="shield-checkmark" size={14} color={Colors.primary} />
                    <Text style={styles.proVerifiedTxt}>VERIFIED</Text>
                  </View>
                </View>

                <View style={styles.proMetaRow}>
                  <Ionicons name="star" size={14} color="#F59E0B" />
                  <Text style={styles.proRatingTxt}>{pro.rating}</Text>
                  <Text style={styles.proReviewTxt}>({pro.reviews})</Text>
                  <Ionicons name="location-outline" size={14} color={Colors.textMuted} style={{ marginLeft: 8 }} />
                  <Text style={styles.proReviewTxt}>{pro.location}</Text>
                </View>

                <Text style={styles.proSubtitle}>Services Offered</Text>
                <View style={styles.proServicesBox}>
                  {pro.services.map((svc, idx) => (
                    <View key={idx} style={styles.proSvcPill}><Text style={styles.proSvcTxt}>{svc}</Text></View>
                  ))}
                  <View style={styles.proSvcPill}><Text style={styles.proSvcTxt}>+1 more</Text></View>
                </View>

                <View style={styles.proStatsRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.proStatLabel}>Experience</Text>
                    <Text style={styles.proStatValue}>{pro.experience}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.proStatLabel}>Pricing</Text>
                    <Text style={styles.proStatValue}>{pro.pricing}</Text>
                  </View>
                </View>

                <View style={styles.proActionRow}>
                  <TouchableOpacity style={styles.proContactBtn}>
                    <Ionicons name="call-outline" size={20} color="#FFF" />
                    <Text style={styles.proContactTxt}>Contact</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.proMsgBtn}>
                    <Ionicons name="mail-outline" size={22} color={Colors.textSecondary} />
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        </ScrollView>
      ) : mainTab === 'Franchise' ? (
        <ScrollView showsVerticalScrollIndicator={false} style={{ flex: 1, backgroundColor: '#F8FAFC' }}>
          {/* Hero Section */}
          <LinearGradient colors={['#0F172A', '#1E293B']} style={styles.franchiseHero}>
            <View style={styles.franchiseBadge}>
              <Text style={styles.franchiseBadgeTxt}>SERVICE PARTNER PROGRAM</Text>
            </View>
            <Text style={styles.franchiseTitle}>Own the Territory.</Text>
            <Text style={[styles.franchiseTitle, { color: Colors.primary }]}>Build a Monopoly.</Text>
            <Text style={styles.franchiseSub}>Secure exclusive rights to a pincode with Avasplot's ecosystem.</Text>
          </LinearGradient>

          {/* Cards Scroll */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.franchiseScroll}
            snapToInterval={width * 0.85 + Spacing.lg} // card width + gap
            decelerationRate="fast"
          >
            {mockFranchises.map((fCard, index) => (
              <View key={fCard.id} style={[styles.franCard, { borderColor: fCard.theme.border, borderTopWidth: 4 }]}>
                {fCard.popular && (
                  <View style={styles.franPopularBadge}>
                    <Text style={styles.franPopularTxt}>MOST POPULAR</Text>
                  </View>
                )}

                <Ionicons name={fCard.theme.icon as any} size={32} color={fCard.theme.border} style={{ marginBottom: Spacing.md }} />
                <Text style={styles.franTitle}>{fCard.title}</Text>
                <Text style={styles.franSub}>{fCard.territory}</Text>

                <View style={styles.franPriceBox}>
                  <Text style={styles.franPriceTxt}>{fCard.price}</Text>
                  <Text style={styles.franSub}>Upfront Fee (Excl. GST)</Text>
                </View>

                <View style={[styles.franContractBox, { backgroundColor: fCard.theme.bg }]}>
                  <Text style={[styles.franContractTxt, { color: fCard.theme.text }]}>{fCard.contract}</Text>
                </View>

                <View style={styles.franFeatureList}>
                  {fCard.features.map((feat, i) => (
                    <View key={i} style={styles.franFeatRow}>
                      <Ionicons name="checkmark-circle-outline" size={18} color={fCard.theme.border} />
                      <Text style={styles.franFeatTxt}>{feat}</Text>
                    </View>
                  ))}
                </View>

                <TouchableOpacity style={[styles.franApplyBtn, fCard.popular && { backgroundColor: '#0F172A' }]}>
                  <Text style={[styles.franApplyTxt, fCard.popular && { color: '#FFF' }]}>Apply Now</Text>
                </TouchableOpacity>
              </View>
            ))}
          </ScrollView>

          {/* Why Partner Section */}
          <View style={styles.whyPartnerContainer}>
            <Text style={styles.sectionHeading}>Why Partner With Avasplot?</Text>

            <View style={styles.whyGrid}>
              {whyPartnerFeats.map((feat, idx) => (
                <View key={idx} style={styles.whyCard}>
                  <View style={styles.whyIconWrap}>
                    <Ionicons name={feat.icon as any} size={20} color="#10B981" />
                  </View>
                  <Text style={styles.whyTitle}>{feat.title}</Text>
                  <Text style={styles.whyDesc}>{feat.desc}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* How It Works Section */}
          <View style={styles.howWorksContainer}>
            <Text style={styles.sectionHeading}>How It Works</Text>

            <View style={styles.howWorksGrid}>
              {howItWorksSteps.map((step, idx) => (
                <View key={idx} style={styles.howCard}>
                  <View style={styles.stepCircle}>
                    <Text style={styles.stepNumTxt}>{step.step}</Text>
                  </View>
                  <Text style={styles.howTitle}>{step.title}</Text>
                  <Text style={styles.howDesc}>{step.desc}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Footer CTA CTA Block */}
          <View style={styles.franFooterContainer}>
            <LinearGradient colors={['#0F172A', '#1E293B']} style={styles.franCtaBlock}>
              <Text style={styles.franCtaTitle}>Ready to Build Your Land Empire?</Text>
              <Text style={styles.franCtaSub}>Join India's fastest-growing land ecosystem platform</Text>
              <TouchableOpacity style={styles.franEmailBtn}>
                <Text style={styles.franEmailTxt}>Email Us</Text>
              </TouchableOpacity>
            </LinearGradient>
          </View>

        </ScrollView>
      ) : mainTab === 'Scouts' ? (
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
      ) : mainTab === 'Premium' ? (
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
              style={[styles.franEmailBtn, { backgroundColor: Colors.primary, marginTop: Spacing.xl, paddingHorizontal: Spacing.xxl * 2, flexDirection: 'row', alignItems: 'center', gap: Spacing.sm }]}
              onPress={handleSubscribe}
              disabled={subscriptionLoading}
              activeOpacity={0.8}
            >
              {subscriptionLoading ? (
                <ActivityIndicator color="#FFF" size="small" />
              ) : (
                <Ionicons name="card-outline" size={18} color="#FFF" />
              )}
              <Text style={[styles.franEmailTxt, { color: '#FFF' }]}>
                {subscriptionLoading ? 'Processing...' : 'Subscribe Now'}
              </Text>
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
                    <Text style={[styles.insightTitle, { color: '#FCD34D', fontSize: 12 }]}>{tool.title}</Text>
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
      ) : null}

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

      {/* ADVANCED FILTER MODAL */}
      <Modal visible={isFilterVisible} transparent animationType="slide" onRequestClose={() => setIsFilterVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.filterSectionTitle}>Advanced Filters</Text>
              <TouchableOpacity onPress={() => setIsFilterVisible(false)}>
                <Ionicons name="close-circle" size={28} color={Colors.textMuted} />
              </TouchableOpacity>
            </View>

            <View style={styles.filterSection}>
              <Text style={styles.filterSectionTitle}>Price Range</Text>
              <View style={styles.filterRow}>
                <TextInput style={styles.filterInput} placeholder="Min (₹)" value={minPrice} onChangeText={setMinPrice} keyboardType="numeric" />
                <TextInput style={styles.filterInput} placeholder="Max (₹)" value={maxPrice} onChangeText={setMaxPrice} keyboardType="numeric" />
              </View>
            </View>

            <View style={styles.filterSection}>
              <Text style={styles.filterSectionTitle}>Vastu Preference</Text>
              <View style={styles.vastuRow}>
                {['East Facing', 'North Facing', 'West Facing'].map(dir => (
                  <TouchableOpacity key={dir} style={[styles.vastuPill, selectedVastu === dir && styles.vastuPillActive]} onPress={() => setSelectedVastu(selectedVastu === dir ? null : dir)}>
                    <Text style={[styles.vastuPillText, selectedVastu === dir && styles.vastuPillTextActive]}>{dir}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.clearFilterBtn} onPress={() => { setMinPrice(''); setMaxPrice(''); setSelectedVastu(null); }}>
                <Text style={styles.clearFilterText}>Clear All</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.applyFilterBtn} onPress={() => setIsFilterVisible(false)}>
                <Text style={styles.applyFilterText}>Show Results</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

    </View>
  );
}

// ============================================================================
// 🎨 STYLES
// ============================================================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },

  headerBg: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 120,
    backgroundColor: Colors.surface,
    zIndex: 1,
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    zIndex: 2,
  },
  headerLeft: {},
  greeting: {
    ...Typography.caption,
    color: Colors.textSecondary,
  },
  appName: {
    ...Typography.h1,
    color: Colors.text,
  },
  avatarButton: {},
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notificationBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
    position: 'relative',
  },
  notificationDot: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.error,
    borderWidth: 1,
    borderColor: Colors.surface,
  },

  searchContainer: {
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.md,
    zIndex: 2,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceBright,
    borderRadius: BorderRadius.lg,
    paddingHorizontal: Spacing.lg,
    height: 48,
    gap: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  searchInput: {
    flex: 1,
    ...Typography.body,
    color: Colors.text,
  },

  filterToggleButton: {
    backgroundColor: Colors.primary,
    height: 48,
    width: 48,
    borderRadius: BorderRadius.lg,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  filterContainer: {
    marginBottom: Spacing.md,
    zIndex: 2,
  },
  filterList: {
    paddingHorizontal: Spacing.xl,
    gap: Spacing.sm,
  },
  filterChip: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
  },
  filterChipInactive: {
    backgroundColor: Colors.glass,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
  },
  filterChipText: {
    ...Typography.captionBold,
    color: Colors.textSecondary,
  },
  filterChipTextActive: {
    color: '#FFF',
  },

  listContent: {
    paddingHorizontal: Spacing.xl,
    paddingBottom: 100,
  },
  listHeader: {
    paddingVertical: Spacing.sm,
  },
  resultCount: {
    ...Typography.caption,
    color: Colors.textMuted,
  },

  // Property Card
  card: {
    marginBottom: Spacing.lg,
    borderRadius: BorderRadius.xl,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
    overflow: 'hidden',
    ...Shadows.md,
  },
  cardImageContainer: {
    height: 200,
    position: 'relative',
  },
  cardImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  cardImagePlaceholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  priceBadge: {
    position: 'absolute',
    bottom: Spacing.md,
    left: Spacing.md,
  },
  priceBadgeGradient: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.sm,
  },
  priceText: {
    ...Typography.price,
    color: '#FFF',
    fontSize: 16,
  },
  typeBadge: {
    position: 'absolute',
    top: Spacing.md,
    left: Spacing.md,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.sm,
  },
  typeBadgeText: {
    ...Typography.tiny,
    color: '#FFF',
  },
  verifiedBadge: {
    position: 'absolute',
    top: Spacing.md,
    right: Spacing.md,
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
    borderRadius: BorderRadius.sm,
  },
  verifiedText: {
    ...Typography.tiny,
    color: Colors.success,
  },
  cardActions: {
    position: 'absolute',
    top: Spacing.md,
    right: Spacing.md,
    flexDirection: 'row',
    gap: Spacing.xs,
  },
  actionButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    overflow: 'hidden',
  },
  actionButtonInner: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  compareButton: {
    ...Shadows.sm,
  },
  compareButtonInner: {
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  compareButtonSelected: {
    backgroundColor: '#10B981', // Emerald 500 block fill
  },
  cardContent: {
    display: 'none', // Deprecated old block
  },

  // --- New Web Map UI Styles ---
  webVerifiedBadge: {
    position: 'absolute',
    top: Spacing.md,
    left: Spacing.md,
    backgroundColor: '#10B981', // Solid Emerald
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
    borderRadius: BorderRadius.full,
    gap: 4,
  },
  webVerifiedText: {
    ...Typography.captionBold,
    color: '#FFF',
    fontSize: 10,
    letterSpacing: 0.5,
  },
  imageBottomOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 80,
    justifyContent: 'flex-end',
    padding: Spacing.md,
  },
  webImageLocationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 2,
  },
  webImageLocationText: {
    ...Typography.captionBold,
    color: '#F8FAFC',
  },
  webImagePrice: {
    ...Typography.h2,
    color: '#FFF',
  },
  webAreaBox: {
    position: 'absolute',
    bottom: Spacing.md,
    right: Spacing.md,
    backgroundColor: 'rgba(30, 41, 59, 0.85)', // Dark Slate transparent
    padding: Spacing.sm,
    borderRadius: BorderRadius.md,
    minWidth: 60,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  webAreaLabel: { ...Typography.tiny, color: '#94A3B8', letterSpacing: 0.5, marginBottom: 2 },
  webAreaValue: { ...Typography.bodyBold, color: '#FFF' },
  webAreaUnit: { ...Typography.tiny, color: '#94A3B8', marginTop: -2 },

  insightWrapper: {
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.lg,
  },
  insightBox: {
    flexDirection: 'row',
    backgroundColor: '#ECFDF5', // Emerald 50
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: '#D1FAE5', // Emerald 100
    gap: Spacing.md,
  },
  insightAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#10B981',
    justifyContent: 'center',
    alignItems: 'center',
  },
  insightContent: { flex: 1 },
  insightHeader: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 4 },
  insightTitle: { ...Typography.captionBold, color: '#059669', fontSize: 10, letterSpacing: 0.5 },
  insightText: { ...Typography.caption, color: '#0F172A', lineHeight: 18 },

  detailsContainer: {
    padding: Spacing.lg,
  },
  detailsHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: Spacing.md,
  },
  newCardTitle: {
    ...Typography.h3,
    color: '#0F172A',
    lineHeight: 24,
  },
  listedByBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: '#F8FAFC',
    padding: Spacing.xs,
    paddingRight: Spacing.sm,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  listedByTextWrap: { alignItems: 'flex-end' },
  listedByLabel: { ...Typography.tiny, color: '#94A3B8', textTransform: 'uppercase', fontSize: 8 },
  listedByName: { ...Typography.captionBold, color: '#334155', fontSize: 10, maxWidth: 60 },
  listedByAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#A7F3D0', // Emerald 200
    justifyContent: 'center',
    alignItems: 'center',
  },
  listedByAvatarText: { ...Typography.captionBold, color: '#064E3B', fontSize: 10 },

  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    marginTop: Spacing.md,
  },
  tagPill: {
    backgroundColor: '#F1F5F9', // Slate 100
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: '#E2E8F0', // Slate 200
  },
  tagText: { ...Typography.caption, color: '#475569', fontSize: 11 },

  cardStickyFooter: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    padding: Spacing.lg,
    gap: Spacing.md,
    alignItems: 'center',
  },
  mapBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    paddingVertical: 12,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  mapBtnText: { ...Typography.bodyBold, color: '#334155' },
  viewBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    backgroundColor: '#0F172A', // Navy Dark
    paddingVertical: 12,
    borderRadius: BorderRadius.lg,
  },
  viewBtnText: { ...Typography.bodyBold, color: '#FFF' },

  subtleDateMarker: {
    position: 'absolute',
    bottom: 8,
    left: 16,
    ...Typography.tiny,
    color: '#94A3B8',
    opacity: 0.5,
  },

  // --- End New UI Styles ---

  // Loading
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing.lg,
  },
  loadingText: {
    ...Typography.body,
    color: Colors.textSecondary,
  },

  // Empty
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.huge * 2,
    gap: Spacing.md,
  },
  emptyTitle: {
    ...Typography.h3,
    color: Colors.text,
  },
  emptySubtitle: {
    ...Typography.body,
    color: Colors.textMuted,
    textAlign: 'center',
  },

  // Floating Action Button
  fabContainer: {
    position: 'absolute',
    bottom: Spacing.xl,
    right: Spacing.xl,
    width: 56,
    height: 56,
    borderRadius: 28,
    ...Shadows.lg,
    elevation: 8,
  },
  fabGradient: {
    width: '100%',
    height: '100%',
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  floatingCompareBarWrapper: {
    position: 'absolute',
    bottom: Spacing.xl + 60, // Above FAB
    alignSelf: 'center',
    zIndex: 10,
  },
  floatingCompareBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0F172A',
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.full,
    gap: Spacing.lg,
    ...Shadows.lg,
    elevation: 10,
  },
  floatingCompareCount: {
    ...Typography.captionBold,
    color: '#FFF',
  },
  floatingCompareText: {
    ...Typography.bodyBold,
    color: '#10B981', // Emerald 500
  },

  // ============================================================================
  // 🔍 MODAL STYLES (Filter UI)
  // ============================================================================
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.6)', // Dark slate backdrop
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: BorderRadius.xxl,
    borderTopRightRadius: BorderRadius.xxl,
    padding: Spacing.xl,
    paddingBottom: Platform.OS === 'ios' ? 40 : Spacing.xl,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 10,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  filterSection: {
    marginBottom: Spacing.xl,
  },
  filterSectionTitle: {
    ...Typography.h3,
    color: '#475569', // slate-600
    marginBottom: Spacing.md,
  },
  filterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.md,
  },
  filterInput: {
    flex: 1,
    height: 48,
    backgroundColor: '#F8FAFC', // slate-50
    borderWidth: 1,
    borderColor: '#E2E8F0', // slate-200
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    ...Typography.body,
    color: '#0F172A',
  },
  vastuRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  vastuPill: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    backgroundColor: '#F1F5F9', // slate-100
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: '#E2E8F0', // slate-200
  },
  vastuPillActive: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)', // emerald-500 light
    borderColor: '#10B981', // emerald-500
  },
  vastuPillText: {
    ...Typography.bodyBold,
    color: '#64748B', // slate-500
  },
  vastuPillTextActive: {
    color: '#059669', // emerald-600
  },
  modalActions: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginTop: Spacing.md,
  },
  clearFilterBtn: {
    flex: 1,
    height: 52,
    borderRadius: BorderRadius.lg,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F1F5F9', // slate-100
  },
  clearFilterText: {
    ...Typography.bodyBold,
    color: '#475569', // slate-600
  },
  applyFilterBtn: {
    flex: 2,
    height: 52,
    borderRadius: BorderRadius.lg,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.primary, // emerald-500
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  applyFilterText: {
    ...Typography.bodyBold,
    color: '#FFF',
  },

  // ============================================================================
  // 🏢 TOP TABS STYLES
  // ============================================================================
  topTabsContainer: {
    backgroundColor: Colors.surface,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.sm,
    marginBottom: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    zIndex: 2,
  },
  topTabsScroll: {
    paddingHorizontal: Spacing.xl,
    gap: Spacing.md,
    flexGrow: 1,
    justifyContent: 'space-between',
  },
  topTabBtn: {
    paddingVertical: Spacing.sm,
    position: 'relative',
  },
  topTabBtnActive: {
    // 
  },
  topTabTxt: {
    ...Typography.bodyBold,
    color: Colors.textMuted,
  },
  topTabTxtActive: {
    color: Colors.primary,
  },
  topTabIndicator: {
    position: 'absolute',
    bottom: -1,
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: Colors.primary,
    borderTopLeftRadius: 3,
    borderTopRightRadius: 3,
  },

  // ============================================================================
  // 💼 SERVICES DIRECTORY STYLES
  // ============================================================================
  servicesHero: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.xl + 40, // Space for header
    paddingBottom: Spacing.xxl,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  servicesHeroTitle: {
    ...Typography.h1,
    color: '#FFF',
    marginBottom: Spacing.xs,
  },
  servicesHeroSub: {
    ...Typography.body,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: Spacing.xl,
  },
  servicesSearch: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: BorderRadius.lg,
    paddingHorizontal: Spacing.lg,
    height: 52,
    gap: Spacing.md,
    ...Shadows.md,
  },
  servicesSearchInput: {
    flex: 1,
    ...Typography.body,
    color: Colors.text,
  },
  servicesCatScroll: {
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.lg,
    gap: Spacing.md,
  },
  serviceCatBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.sm,
    backgroundColor: '#FFF',
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  serviceCatBtnActive: {
    backgroundColor: '#0F172A',
    borderColor: '#0F172A',
  },
  serviceCatTxt: {
    ...Typography.bodyBold,
    color: Colors.textSecondary,
  },
  serviceCatTxtActive: {
    color: '#FFF',
  },

  // Components
  proList: {
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.xxl,
    gap: Spacing.lg,
  },
  proCount: {
    ...Typography.captionBold,
    color: Colors.textMuted,
    marginBottom: Spacing.xs,
  },
  proCard: {
    backgroundColor: '#FFF',
    borderRadius: BorderRadius.xl,
    padding: Spacing.xl,
    ...Shadows.md,
    elevation: 4,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  proHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.lg,
    marginBottom: Spacing.md,
  },
  proAvatarWrap: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  proName: {
    ...Typography.h3,
    color: Colors.text,
  },
  proTitle: {
    ...Typography.caption,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  proVerified: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    paddingHorizontal: Spacing.md,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
    gap: 4,
  },
  proVerifiedTxt: {
    ...Typography.captionBold,
    fontSize: 10,
    color: Colors.primary,
  },
  proMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  proRatingTxt: {
    ...Typography.captionBold,
    color: '#F59E0B',
    marginLeft: 4,
    marginRight: 2,
  },
  proReviewTxt: {
    ...Typography.caption,
    color: Colors.textMuted,
  },
  proSubtitle: {
    ...Typography.captionBold,
    color: Colors.text,
    marginBottom: Spacing.sm,
  },
  proServicesBox: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  proSvcPill: {
    backgroundColor: '#F8FAFC',
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  proSvcTxt: {
    ...Typography.caption,
    color: Colors.textSecondary,
  },
  proStatsRow: {
    flexDirection: 'row',
    backgroundColor: '#F8FAFC',
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.lg,
  },
  proStatLabel: {
    ...Typography.caption,
    color: Colors.textMuted,
    marginBottom: 4,
  },
  proStatValue: {
    ...Typography.bodyBold,
    color: Colors.text,
  },
  proActionRow: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  proContactBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.lg,
    height: 48,
    gap: Spacing.sm,
  },
  proContactTxt: {
    ...Typography.bodyBold,
    color: '#FFF',
  },
  proMsgBtn: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
  },

  // ============================================================================
  // 🤝 FRANCHISE STYLES
  // ============================================================================
  franchiseHero: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.xl + 60,
    paddingBottom: Spacing.xl,
    alignItems: 'center',
  },
  franchiseBadge: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
    marginBottom: Spacing.xl,
  },
  franchiseBadgeTxt: {
    ...Typography.captionBold,
    color: '#10B981',
  },
  franchiseTitle: {
    fontFamily: 'Outfit-Bold',
    fontSize: 28,
    color: '#FFF',
    textAlign: 'center',
    lineHeight: 34,
  },
  franchiseSub: {
    ...Typography.body,
    color: 'rgba(255,255,255,0.7)',
    textAlign: 'center',
    marginTop: Spacing.lg,
    paddingHorizontal: Spacing.xl,
  },
  franchiseScroll: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.xl,
    gap: Spacing.lg,
  },
  franCard: {
    width: width * 0.85,
    backgroundColor: '#FFF',
    borderRadius: BorderRadius.xl,
    padding: Spacing.xl,
    ...Shadows.lg,
    elevation: 6,
    position: 'relative',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  franPopularBadge: {
    position: 'absolute',
    top: -12,
    alignSelf: 'center',
    backgroundColor: '#3B82F6',
    paddingHorizontal: Spacing.lg,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
    zIndex: 2,
  },
  franPopularTxt: {
    ...Typography.captionBold,
    color: '#FFF',
    fontSize: 10,
  },
  franTitle: {
    ...Typography.h2,
    color: '#0F172A',
    marginBottom: 4,
  },
  franSub: {
    ...Typography.caption,
    color: Colors.textMuted,
  },
  franPriceBox: {
    marginVertical: Spacing.lg,
  },
  franPriceTxt: {
    fontFamily: 'Outfit-Bold',
    fontSize: 26,
    color: '#0F172A',
    marginBottom: 4,
  },
  franContractBox: {
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  franContractTxt: {
    ...Typography.bodyBold,
  },
  franFeatureList: {
    gap: Spacing.md,
    marginBottom: Spacing.xl,
  },
  franFeatRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  franFeatTxt: {
    ...Typography.body,
    flex: 1,
    color: '#475569',
  },
  franApplyBtn: {
    height: 52,
    backgroundColor: '#F1F5F9',
    borderRadius: BorderRadius.lg,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 'auto',
  },
  franApplyTxt: {
    ...Typography.bodyBold,
    color: '#0F172A',
  },

  // Additional Franchise Sections
  sectionHeading: {
    fontFamily: 'Outfit-Bold',
    fontSize: 22,
    color: '#0F172A',
    textAlign: 'center',
    marginBottom: Spacing.xl,
  },
  whyPartnerContainer: {
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.xxl,
    backgroundColor: '#F8FAFC',
  },
  whyGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
    justifyContent: 'space-between',
  },
  whyCard: {
    width: '48%',
    backgroundColor: '#FFF',
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: Spacing.md,
  },
  whyIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  whyTitle: {
    ...Typography.captionBold,
    color: '#0F172A',
    marginBottom: 4,
  },
  whyDesc: {
    fontSize: 12,
    color: '#64748B',
    lineHeight: 18,
  },
  howWorksContainer: {
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.lg,
    backgroundColor: '#F8FAFC',
  },
  howWorksGrid: {
    flexDirection: 'column',
    gap: Spacing.md,
  },
  howCard: {
    backgroundColor: '#FFF',
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
  },
  stepCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#0F172A',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  stepNumTxt: {
    ...Typography.bodyBold,
    color: '#FFF',
  },
  howTitle: {
    ...Typography.bodyBold,
    color: '#0F172A',
    marginBottom: 4,
  },
  howDesc: {
    ...Typography.caption,
    color: '#64748B',
    textAlign: 'center',
  },
  franFooterContainer: {
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.xxl,
  },
  franCtaBlock: {
    borderRadius: BorderRadius.xl,
    padding: Spacing.xxl,
    alignItems: 'center',
  },
  franCtaTitle: {
    fontFamily: 'Outfit-Bold',
    fontSize: 24,
    color: '#FFF',
    textAlign: 'center',
    marginBottom: 8,
  },
  franCtaSub: {
    ...Typography.body,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
    marginBottom: Spacing.xl,
  },
  franEmailBtn: {
    backgroundColor: '#10B981',
    paddingHorizontal: Spacing.xxl,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.lg,
  },
  franEmailTxt: {
    ...Typography.bodyBold,
    color: '#FFF',
  },

});
