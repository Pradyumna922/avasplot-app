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
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../../src/context/AuthContext';
import { formatArea, formatPrice, properties, timeAgo } from '../../src/services/appwrite';
import { BorderRadius, Colors, Shadows, Spacing, Typography } from '../../src/theme';
import { Property } from '../../src/types';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width - Spacing.xl * 2;

// ============================================================================
// 🃏 PROPERTY CARD COMPONENT
// ============================================================================

function PropertyCard({
  property,
  index,
  onPress,
}: {
  property: Property;
  index: number;
  onPress: () => void;
}) {
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

  return (
    <Animated.View
      style={[
        styles.card,
        { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
      ]}
    >
      <TouchableOpacity onPress={onPress} activeOpacity={0.9}>
        {/* Image */}
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
          {/* Price Badge */}
          <View style={styles.priceBadge}>
            <LinearGradient
              colors={[Colors.primary, Colors.primaryDark]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.priceBadgeGradient}
            >
              <Text style={styles.priceText}>{formatPrice(property.price)}</Text>
            </LinearGradient>
          </View>
          {/* Type Badge */}
          <View style={styles.typeBadge}>
            <Text style={styles.typeBadgeText}>{property.type}</Text>
          </View>
          {/* Verified Badge */}
          {property.verified && (
            <View style={styles.verifiedBadge}>
              <Ionicons name="shield-checkmark" size={14} color={Colors.success} />
              <Text style={styles.verifiedText}>Verified</Text>
            </View>
          )}
        </View>

        {/* Content */}
        <View style={styles.cardContent}>
          <Text style={styles.cardTitle} numberOfLines={2}>
            {property.title}
          </Text>

          <View style={styles.cardRow}>
            <Ionicons name="location-outline" size={14} color={Colors.secondary} />
            <Text style={styles.cardLocation} numberOfLines={1}>
              {property.location}
            </Text>
          </View>

          <View style={styles.cardFooter}>
            <View style={styles.cardStat}>
              <Ionicons name="resize-outline" size={14} color={Colors.textMuted} />
              <Text style={styles.cardStatText}>{formatArea(property.area)}</Text>
            </View>
            {property.$createdAt && (
              <Text style={styles.cardTime}>{timeAgo(property.$createdAt)}</Text>
            )}
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

// ============================================================================
// 🏠 MAIN HOME SCREEN
// ============================================================================

export default function HomeScreen() {
  const [listings, setListings] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const { user, isLoggedIn } = useAuth();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const scrollY = useRef(new Animated.Value(0)).current;

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
    const matchesSearch = !searchQuery ||
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.location.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = !selectedType || p.type === selectedType;
    return matchesSearch && matchesType;
  });

  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 80],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  // Quick filter chips
  const filterChips = ['All', 'Residential Plot', 'Commercial Plot', 'Flat / Apartment', 'Villa', 'Farm House'];

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Floating Header Background */}
      <Animated.View style={[styles.headerBg, { opacity: headerOpacity }]} />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.greeting}>
            {isLoggedIn ? `Hey, ${user?.name?.split(' ')[0] || 'there'} 👋` : 'Welcome to'}
          </Text>
          <Text style={styles.appName}>AvasPlot</Text>
        </View>
        <TouchableOpacity
          style={styles.avatarButton}
          onPress={() => isLoggedIn ? router.push('/(tabs)/profile') : router.push('/(auth)/login')}
        >
          <LinearGradient
            colors={[Colors.primary, Colors.secondary]}
            style={styles.avatar}
          >
            <Ionicons name="person" size={18} color="#FFF" />
          </LinearGradient>
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
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
            { useNativeDriver: true }
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
  cardContent: {
    padding: Spacing.lg,
  },
  cardTitle: {
    ...Typography.h3,
    color: Colors.text,
    marginBottom: Spacing.sm,
  },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    marginBottom: Spacing.md,
  },
  cardLocation: {
    ...Typography.caption,
    color: Colors.textSecondary,
    flex: 1,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  cardStatText: {
    ...Typography.caption,
    color: Colors.textMuted,
  },
  cardTime: {
    ...Typography.tiny,
    color: Colors.textMuted,
  },

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
});
