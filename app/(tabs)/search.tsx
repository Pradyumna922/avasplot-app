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
    Modal,
    Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { formatArea, formatPrice, properties } from '../../src/services/appwrite';
import { BorderRadius, Colors, Shadows, Spacing, Typography } from '../../src/theme';
import { Property, PROPERTY_TYPES } from '../../src/types';

// Icons mapped to property types for visual variety
const TYPE_ICONS: Record<string, { icon: string; color: string }> = {
    'residential': { icon: 'home-outline', color: '#10B981' },
    'commercial': { icon: 'business-outline', color: '#3B82F6' },
    'agricultural': { icon: 'leaf-outline', color: '#22C55E' },
    'industrial': { icon: 'construct-outline', color: '#F97316' },
    'farm house': { icon: 'flower-outline', color: '#8B5CF6' },
    'flat / apartment': { icon: 'grid-outline', color: '#06B6D4' },
    'villa': { icon: 'diamond-outline', color: '#EC4899' },
    'office space': { icon: 'briefcase-outline', color: '#6366F1' },
    'shop / showroom': { icon: 'storefront-outline', color: '#14B8A6' },
    'warehouse': { icon: 'cube-outline', color: '#64748B' },
};

export default function SearchScreen() {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<Property[]>([]);
    const [loading, setLoading] = useState(false);
    const [searched, setSearched] = useState(false);
    const [selectedType, setSelectedType] = useState<string>('');
    const [isFilterVisible, setIsFilterVisible] = useState(false);
    const [minPrice, setMinPrice] = useState('');
    const [maxPrice, setMaxPrice] = useState('');
    const [minArea, setMinArea] = useState('');
    const [maxArea, setMaxArea] = useState('');
    const [selectedVastu, setSelectedVastu] = useState<string | null>(null);

    const router = useRouter();
    const insets = useSafeAreaInsets();

    const executeSearch = useCallback(async (params: {
        query: string;
        type?: string;
        minPrice?: string;
        maxPrice?: string;
        minArea?: string;
        maxArea?: string;
        vastu?: string | null;
    }) => {
        if (!params.query.trim() && !params.type && !params.minPrice && !params.maxPrice && !params.vastu && !params.minArea && !params.maxArea) {
            setResults([]);
            setSearched(false);
            return;
        }

        setLoading(true);
        setSearched(true);
        try {
            const result = await properties.search(params.query.trim(), {
                type: params.type || undefined,
                minPrice: params.minPrice ? parseInt(params.minPrice.replace(/\D/g, ''), 10) : undefined,
                maxPrice: params.maxPrice ? parseInt(params.maxPrice.replace(/\D/g, ''), 10) : undefined,
                minArea: params.minArea ? parseInt(params.minArea.replace(/\D/g, ''), 10) : undefined,
                maxArea: params.maxArea ? parseInt(params.maxArea.replace(/\D/g, ''), 10) : undefined,
                vastu: params.vastu || undefined,
            });
            setResults(result.documents);
        } catch (err) {
            console.error('Search failed:', err);
        } finally {
            setLoading(false);
            setIsFilterVisible(false);
        }
    }, []);

    const handleSearch = () => {
        executeSearch({
            query,
            type: selectedType,
            minPrice,
            maxPrice,
            minArea,
            maxArea,
            vastu: selectedVastu
        });
    };

    const handleTypeSelect = (type: string) => {
        const newType = type === selectedType ? '' : type;
        setSelectedType(newType);

        executeSearch({
            query,
            type: newType,
            minPrice,
            maxPrice,
            minArea,
            maxArea,
            vastu: selectedVastu
        });
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
                            <Text style={[styles.typePillText, { color: typeInfo.color, textTransform: 'capitalize' }]}>
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
            <View style={{ flexDirection: 'row', gap: Spacing.sm, alignItems: 'center', marginHorizontal: Spacing.xl, marginVertical: Spacing.md }}>
                <View style={[styles.searchBar, { flex: 1 }]}>
                    <Ionicons name="search-outline" size={18} color={Colors.textMuted} />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Location, project..."
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
                <TouchableOpacity
                    style={styles.filterToggleButton}
                    onPress={() => setIsFilterVisible(true)}
                >
                    <Ionicons name="options-outline" size={22} color="#FFF" />
                </TouchableOpacity>
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
                            <Text style={[styles.chipText, isActive && styles.chipTextActive, { textTransform: 'capitalize' }]}>
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
                    <ScrollView contentContainerStyle={{ paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
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
                                        onPress={() => handleTypeSelect(type)}
                                    >
                                        <View style={[styles.categoryIconWrap, { backgroundColor: info.color + '12' }]}>
                                            <Ionicons
                                                name={info.icon as keyof typeof Ionicons.glyphMap}
                                                size={22}
                                                color={info.color}
                                            />
                                        </View>
                                        <Text style={[styles.categoryLabel, { textTransform: 'capitalize' }]} numberOfLines={2}>{type}</Text>
                                    </TouchableOpacity>
                                );
                            })}
                        </View>
                    </ScrollView>
                </View>
            )}

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
                            <Text style={styles.filterSectionTitle}>Area Range (sq.ft)</Text>
                            <View style={styles.filterRow}>
                                <TextInput style={styles.filterInput} placeholder="Min Area" value={minArea} onChangeText={setMinArea} keyboardType="numeric" />
                                <TextInput style={styles.filterInput} placeholder="Max Area" value={maxArea} onChangeText={setMaxArea} keyboardType="numeric" />
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
                            <TouchableOpacity style={styles.clearFilterBtn} onPress={() => {
                                setMinPrice(''); setMaxPrice(''); setMinArea(''); setMaxArea(''); setSelectedVastu(null);
                                executeSearch({ query, type: selectedType, minPrice: '', maxPrice: '', minArea: '', maxArea: '', vastu: null });
                            }}>
                                <Text style={styles.clearFilterText}>Clear All</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.applyFilterBtn} onPress={handleSearch}>
                                <Text style={styles.applyFilterText}>Apply Filters</Text>
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
    filterToggleButton: {
        width: 44,
        height: 44,
        borderRadius: BorderRadius.md,
        backgroundColor: '#0F172A',
        justifyContent: 'center',
        alignItems: 'center',
    },

    // ─── Filter Chips ───
    chipRow: {
        paddingHorizontal: Spacing.xl,
        gap: 8,
        paddingBottom: Spacing.sm,
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
        flexGrow: 1,
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

    // ============================================================================
    // 🔍 MODAL STYLES (Filter UI)
    // ============================================================================
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(15, 23, 42, 0.6)',
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
        color: '#475569',
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
        backgroundColor: '#F8FAFC',
        borderWidth: 1,
        borderColor: '#E2E8F0',
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
        backgroundColor: '#F1F5F9',
        borderRadius: BorderRadius.full,
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },
    vastuPillActive: {
        backgroundColor: 'rgba(16, 185, 129, 0.15)',
        borderColor: '#10B981',
    },
    vastuPillText: {
        ...Typography.bodyBold,
        color: '#64748B',
    },
    vastuPillTextActive: {
        color: '#059669',
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
        backgroundColor: '#F1F5F9',
    },
    clearFilterText: {
        ...Typography.bodyBold,
        color: '#475569',
    },
    applyFilterBtn: {
        flex: 2,
        height: 52,
        borderRadius: BorderRadius.lg,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: Colors.primary,
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
});
