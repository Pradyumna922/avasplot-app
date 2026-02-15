// ============================================================================
// 🔍 SEARCH SCREEN — Advanced Property Search
// ============================================================================
'use no memo';

import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { formatArea, formatPrice, properties } from '../../src/services/appwrite';
import { BorderRadius, Colors, Shadows, Spacing, Typography } from '../../src/theme';
import { Property, PROPERTY_TYPES } from '../../src/types';

// Icons mapped to property types for visual variety
const TYPE_ICONS: Record<string, { icon: string; color: string }> = {
    'Residential Plot': { icon: 'home-outline', color: '#10B981' },
    'Commercial Plot': { icon: 'business-outline', color: '#3B82F6' },
    'Agricultural Land': { icon: 'leaf-outline', color: '#22C55E' },
    'Industrial Plot': { icon: 'construct-outline', color: '#F97316' },
    'Farm House': { icon: 'flower-outline', color: '#8B5CF6' },
    'Flat / Apartment': { icon: 'grid-outline', color: '#06B6D4' },
    'Villa': { icon: 'diamond-outline', color: '#EC4899' },
    'Office Space': { icon: 'briefcase-outline', color: '#6366F1' },
    'Shop / Showroom': { icon: 'storefront-outline', color: '#14B8A6' },
    'Warehouse': { icon: 'cube-outline', color: '#64748B' },
};

export default function SearchScreen() {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<Property[]>([]);
    const [loading, setLoading] = useState(false);
    const [searched, setSearched] = useState(false);
    const [selectedType, setSelectedType] = useState<string>('');
    const router = useRouter();
    const insets = useSafeAreaInsets();

    const handleSearch = useCallback(async () => {
        if (!query.trim() && !selectedType) return;
        setLoading(true);
        setSearched(true);
        try {
            const result = await properties.search(query.trim(), {
                type: selectedType || undefined,
            });
            setResults(result.documents);
        } catch (err) {
            console.error('Search failed:', err);
        } finally {
            setLoading(false);
        }
    }, [query, selectedType]);

    const handleTypeSelect = (type: string) => {
        const newType = type === selectedType ? '' : type;
        setSelectedType(newType);
    };

    // ---- Result Card ----
    const renderResultCard = ({ item }: { item: Property }) => {
        const imageUrl = item.images?.[0] ? properties.getImageThumbnail(item.images[0]) : null;
        const typeInfo = TYPE_ICONS[item.type] || { icon: 'location-outline', color: Colors.primary };

        return (
            <TouchableOpacity
                style={styles.resultCard}
                onPress={() => router.push(`/property/${item.$id}`)}
                activeOpacity={0.7}
            >
                {/* Image Section */}
                <View style={styles.resultImageWrap}>
                    {imageUrl ? (
                        <Image source={{ uri: imageUrl }} style={styles.resultImage} />
                    ) : (
                        <LinearGradient
                            colors={[Colors.surfaceElevated, Colors.background]}
                            style={styles.resultImagePlaceholder}
                        >
                            <Ionicons name="image-outline" size={28} color={Colors.textMuted} />
                        </LinearGradient>
                    )}
                    {/* Price overlay */}
                    <View style={styles.priceTag}>
                        <Text style={styles.priceTagText}>{formatPrice(item.price)}</Text>
                    </View>
                    {/* Verified badge */}
                    {item.verified && (
                        <View style={styles.verifiedBadge}>
                            <Ionicons name="checkmark-circle" size={14} color="#FFF" />
                        </View>
                    )}
                </View>

                {/* Detail Section */}
                <View style={styles.resultDetails}>
                    <Text style={styles.resultTitle} numberOfLines={1}>{item.title}</Text>
                    <View style={styles.resultMeta}>
                        <Ionicons name="location-outline" size={13} color={Colors.primary} />
                        <Text style={styles.resultLocation} numberOfLines={1}>{item.location}</Text>
                    </View>
                    <View style={styles.resultFooter}>
                        <View style={[styles.typePill, { backgroundColor: typeInfo.color + '15' }]}>
                            <Text style={[styles.typePillText, { color: typeInfo.color }]}>
                                {item.type?.replace(' / ', '/')}
                            </Text>
                        </View>
                        <View style={styles.areaBadge}>
                            <Ionicons name="expand-outline" size={11} color={Colors.textMuted} />
                            <Text style={styles.areaText}>{formatArea(item.area)}</Text>
                        </View>
                    </View>
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            {/* ─── Header ─── */}
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Search</Text>
                <Text style={styles.headerSubtitle}>Find your perfect property</Text>
            </View>

            {/* ─── Search Input ─── */}
            <View style={styles.searchSection}>
                <View style={styles.searchBar}>
                    <Ionicons name="search-outline" size={18} color={Colors.textMuted} />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Location, project, or keyword..."
                        placeholderTextColor={Colors.textMuted}
                        value={query}
                        onChangeText={setQuery}
                        onSubmitEditing={handleSearch}
                        returnKeyType="search"
                    />
                    {query ? (
                        <TouchableOpacity onPress={() => { setQuery(''); setResults([]); setSearched(false); }}>
                            <Ionicons name="close-circle" size={18} color={Colors.textMuted} />
                        </TouchableOpacity>
                    ) : null}
                </View>
                <TouchableOpacity onPress={handleSearch} activeOpacity={0.8}>
                    <LinearGradient
                        colors={[Colors.primary, Colors.primaryDark]}
                        style={styles.searchButton}
                    >
                        <Ionicons name="search" size={18} color="#FFF" />
                    </LinearGradient>
                </TouchableOpacity>
            </View>

            {/* ─── Filter Chips ─── */}
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.chipRow}
            >
                <TouchableOpacity
                    onPress={() => { setSelectedType(''); }}
                    style={[styles.chip, !selectedType && styles.chipActive]}
                    activeOpacity={0.7}
                >
                    <Text style={[styles.chipText, !selectedType && styles.chipTextActive]}>All</Text>
                </TouchableOpacity>
                {PROPERTY_TYPES.map((type) => {
                    const isActive = selectedType === type;
                    const info = TYPE_ICONS[type] || { icon: 'ellipse-outline', color: Colors.primary };
                    return (
                        <TouchableOpacity
                            key={type}
                            onPress={() => handleTypeSelect(type)}
                            style={[styles.chip, isActive && styles.chipActive]}
                            activeOpacity={0.7}
                        >
                            <Ionicons
                                name={info.icon as keyof typeof Ionicons.glyphMap}
                                size={14}
                                color={isActive ? '#FFF' : info.color}
                            />
                            <Text style={[styles.chipText, isActive && styles.chipTextActive]}>
                                {type.replace(' / ', '/')}
                            </Text>
                        </TouchableOpacity>
                    );
                })}
            </ScrollView>

            {/* ─── Content ─── */}
            {loading ? (
                <View style={styles.centered}>
                    <ActivityIndicator size="large" color={Colors.primary} />
                    <Text style={styles.loadingText}>Searching properties...</Text>
                </View>
            ) : searched ? (
                <FlatList
                    data={results}
                    keyExtractor={(item) => item.$id}
                    renderItem={renderResultCard}
                    contentContainerStyle={styles.resultsList}
                    showsVerticalScrollIndicator={false}
                    ListEmptyComponent={
                        <View style={styles.centered}>
                            <View style={styles.emptyIconWrap}>
                                <Ionicons name="search-outline" size={36} color={Colors.textMuted} />
                            </View>
                            <Text style={styles.emptyTitle}>No Results Found</Text>
                            <Text style={styles.emptySubtitle}>Try different keywords or filters</Text>
                        </View>
                    }
                    ListHeaderComponent={
                        <View style={styles.resultsHeader}>
                            <Text style={styles.resultCount}>
                                {results.length} {results.length === 1 ? 'property' : 'properties'} found
                            </Text>
                        </View>
                    }
                />
            ) : (
                /* ─── Empty / Discovery State ─── */
                <View style={styles.discoveryContainer}>
                    {/* Hero illustration */}
                    <View style={styles.discoveryHero}>
                        <LinearGradient
                            colors={[Colors.primary, Colors.secondary]}
                            style={styles.discoveryIcon}
                        >
                            <Ionicons name="search" size={32} color="#FFF" />
                        </LinearGradient>
                        <Text style={styles.discoveryTitle}>Discover Properties</Text>
                        <Text style={styles.discoverySubtitle}>
                            Search by location, project name, or browse by type
                        </Text>
                    </View>

                    {/* Quick Category Grid */}
                    <Text style={styles.sectionLabel}>Browse by Category</Text>
                    <View style={styles.categoryGrid}>
                        {PROPERTY_TYPES.slice(0, 6).map((type) => {
                            const info = TYPE_ICONS[type] || { icon: 'ellipse-outline', color: Colors.primary };
                            return (
                                <TouchableOpacity
                                    key={type}
                                    style={styles.categoryCard}
                                    activeOpacity={0.7}
                                    onPress={() => {
                                        setSelectedType(type);
                                        setQuery('');
                                        handleSearch();
                                    }}
                                >
                                    <View style={[styles.categoryIconWrap, { backgroundColor: info.color + '12' }]}>
                                        <Ionicons
                                            name={info.icon as keyof typeof Ionicons.glyphMap}
                                            size={22}
                                            color={info.color}
                                        />
                                    </View>
                                    <Text style={styles.categoryLabel} numberOfLines={2}>{type}</Text>
                                </TouchableOpacity>
                            );
                        })}
                    </View>
                </View>
            )}
        </View>
    );
}

// ============================================================================
// 🎨 STYLES
// ============================================================================

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.background },

    // ─── Header ───
    header: {
        paddingHorizontal: Spacing.xl,
        paddingTop: Spacing.md,
        paddingBottom: Spacing.sm,
    },
    headerTitle: {
        ...Typography.h1,
        color: Colors.text,
    },
    headerSubtitle: {
        ...Typography.caption,
        color: Colors.textMuted,
        marginTop: 2,
    },

    // ─── Search Bar ───
    searchSection: {
        flexDirection: 'row',
        paddingHorizontal: Spacing.xl,
        gap: Spacing.sm,
        marginTop: Spacing.md,
        marginBottom: Spacing.md,
    },
    searchBar: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.surface,
        borderRadius: BorderRadius.md,
        paddingHorizontal: Spacing.md,
        height: 44,
        gap: Spacing.sm,
        borderWidth: 1,
        borderColor: Colors.border,
        ...Shadows.sm,
    },
    searchInput: {
        flex: 1,
        fontSize: 14,
        fontWeight: '400',
        color: Colors.text,
    },
    searchButton: {
        width: 44,
        height: 44,
        borderRadius: BorderRadius.md,
        justifyContent: 'center',
        alignItems: 'center',
    },

    // ─── Filter Chips ───
    chipRow: {
        paddingHorizontal: Spacing.xl,
        gap: 8,
        paddingBottom: Spacing.md,
    },
    chip: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
        paddingHorizontal: 14,
        height: 34,
        borderRadius: 17,
        backgroundColor: Colors.surface,
        borderWidth: 1,
        borderColor: Colors.border,
    },
    chipActive: {
        backgroundColor: Colors.primary,
        borderColor: Colors.primary,
    },
    chipText: {
        fontSize: 12,
        fontWeight: '600',
        color: Colors.textSecondary,
    },
    chipTextActive: {
        color: '#FFF',
    },

    // ─── Results ───
    resultsList: {
        paddingHorizontal: Spacing.xl,
        paddingBottom: 100,
    },
    resultsHeader: {
        marginBottom: Spacing.md,
    },
    resultCount: {
        ...Typography.caption,
        color: Colors.textMuted,
    },

    // ─── Result Card ───
    resultCard: {
        backgroundColor: Colors.surface,
        borderRadius: BorderRadius.lg,
        marginBottom: Spacing.md,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: Colors.border,
        ...Shadows.sm,
    },
    resultImageWrap: {
        width: '100%',
        height: 160,
        backgroundColor: Colors.surfaceElevated,
    },
    resultImage: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    resultImagePlaceholder: {
        width: '100%',
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
    },
    priceTag: {
        position: 'absolute',
        bottom: Spacing.sm,
        left: Spacing.sm,
        backgroundColor: Colors.primary,
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 6,
    },
    priceTagText: {
        fontSize: 13,
        fontWeight: '700',
        color: '#FFF',
    },
    verifiedBadge: {
        position: 'absolute',
        top: Spacing.sm,
        right: Spacing.sm,
        backgroundColor: Colors.primary,
        borderRadius: 12,
        width: 24,
        height: 24,
        justifyContent: 'center',
        alignItems: 'center',
    },
    resultDetails: {
        padding: Spacing.md,
        gap: 6,
    },
    resultTitle: {
        fontSize: 15,
        fontWeight: '600',
        color: Colors.text,
    },
    resultMeta: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    resultLocation: {
        fontSize: 12,
        color: Colors.textSecondary,
        flex: 1,
    },
    resultFooter: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: 4,
    },
    typePill: {
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 6,
    },
    typePillText: {
        fontSize: 11,
        fontWeight: '600',
    },
    areaBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 3,
    },
    areaText: {
        fontSize: 11,
        color: Colors.textMuted,
        fontWeight: '500',
    },

    // ─── Centered / Empty State ───
    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        gap: Spacing.md,
        paddingHorizontal: Spacing.xxxl,
    },
    loadingText: {
        ...Typography.caption,
        color: Colors.textMuted,
    },
    emptyIconWrap: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: Colors.surfaceElevated,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: Spacing.sm,
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

    // ─── Discovery State ───
    discoveryContainer: {
        flex: 1,
        paddingHorizontal: Spacing.xl,
    },
    discoveryHero: {
        alignItems: 'center',
        paddingVertical: Spacing.xxl,
    },
    discoveryIcon: {
        width: 72,
        height: 72,
        borderRadius: 36,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: Spacing.lg,
        ...Shadows.glow,
    },
    discoveryTitle: {
        ...Typography.h2,
        color: Colors.text,
        marginBottom: 4,
    },
    discoverySubtitle: {
        ...Typography.caption,
        color: Colors.textMuted,
        textAlign: 'center',
        maxWidth: 260,
    },

    // ─── Category Grid ───
    sectionLabel: {
        ...Typography.captionBold,
        color: Colors.textSecondary,
        textTransform: 'uppercase',
        letterSpacing: 0.8,
        marginBottom: Spacing.md,
    },
    categoryGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: Spacing.sm,
    },
    categoryCard: {
        width: '31%',
        backgroundColor: Colors.surface,
        borderRadius: BorderRadius.md,
        paddingVertical: Spacing.lg,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: Colors.border,
        gap: Spacing.sm,
        ...Shadows.sm,
    },
    categoryIconWrap: {
        width: 44,
        height: 44,
        borderRadius: 22,
        justifyContent: 'center',
        alignItems: 'center',
    },
    categoryLabel: {
        fontSize: 11,
        fontWeight: '600',
        color: Colors.textSecondary,
        textAlign: 'center',
        paddingHorizontal: 4,
    },
});
