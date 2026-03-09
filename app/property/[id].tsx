// ============================================================================
// 🏡 PROPERTY DETAIL SCREEN — Immersive Property View
// ============================================================================
'use no memo';

import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Animated,
    Dimensions,
    FlatList,
    Image,
    Linking,
    Platform,
    Share,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

let MapView: any = null;
let Marker: any = null;
let PROVIDER_GOOGLE: any = null;

if (Platform.OS !== 'web') {
    const Maps = require('react-native-maps');
    MapView = Maps.default;
    Marker = Maps.Marker;
    PROVIDER_GOOGLE = Maps.PROVIDER_GOOGLE;
}
import { geminiService } from '../../src/services/gemini';
import { formatArea, formatPrice, formatWhatsAppNumber, properties, timeAgo } from '../../src/services/appwrite';
import { BorderRadius, Colors, Shadows, Spacing, Typography } from '../../src/theme';
import { Property } from '../../src/types';

const { width, height } = Dimensions.get('window');
const IMAGE_HEIGHT = height * 0.45;

export default function PropertyDetailScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const [property, setProperty] = useState<Property | null>(null);
    const [loading, setLoading] = useState(true);
    const [activeImageIndex, setActiveImageIndex] = useState(0);

    const [aiSummary, setAiSummary] = useState<string | null>(null);
    const [loadingSummary, setLoadingSummary] = useState(false);

    // AI Market Forecast State
    const [aiStats, setAiStats] = useState<{ vastuScore: number; forecast?: { year: number, growthPct: number, priceStr: string }[] } | null>(null);
    const [loadingForecast, setLoadingForecast] = useState(false);

    const router = useRouter();
    const insets = useSafeAreaInsets();
    const scrollY = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        if (id) {
            properties.getById(id)
                .then((prop) => {
                    setProperty(prop);

                    // AI load triggers have been detached to manual buttons
                })
                .catch((err) => {
                    console.error('Failed to load property:', err);
                    Alert.alert('Error', 'Failed to load property details.');
                })
                .finally(() => setLoading(false));
        }
    }, [id]);

    if (loading) {
        return (
            <View style={[styles.container, styles.centerContent]}>
                <ActivityIndicator size="large" color={Colors.primary} />
            </View>
        );
    }

    if (!property) {
        return (
            <View style={[styles.container, styles.centerContent]}>
                <Ionicons name="alert-circle-outline" size={64} color={Colors.textMuted} />
                <Text style={styles.errorText}>Property not found</Text>
                <TouchableOpacity onPress={() => router.back()}>
                    <Text style={styles.backLink}>Go Back</Text>
                </TouchableOpacity>
            </View>
        );
    }

    const imageUrls = (property.images || []).map((id) => properties.getImageUrl(id));

    const handleWhatsApp = () => {
        if (property.mobile) {
            const phone = formatWhatsAppNumber(property.mobile);
            const message = `Hi, I'm interested in: ${property.title} (₹${property.price})`;
            Linking.openURL(`https://wa.me/${phone}?text=${encodeURIComponent(message)}`);
        } else {
            Alert.alert('No Contact', 'Seller phone number not available.');
        }
    };

    const handleCall = () => {
        if (property.mobile) {
            Linking.openURL(`tel:${property.mobile}`);
        }
    };

    const handleEmail = () => {
        if (property.email) {
            const subject = `Inquiry: ${property.title}`;
            Linking.openURL(`mailto:${property.email}?subject=${encodeURIComponent(subject)}`);
        }
    };

    const handleGenerateSummary = async () => {
        if (!property) return;
        setLoadingSummary(true);
        try {
            const summary = await geminiService.generatePropertySummary(property);
            setAiSummary(summary);
        } catch (error) {
            console.error(error);
        } finally {
            setLoadingSummary(false);
        }
    };

    const handleGenerateForecast = async () => {
        if (!property) return;
        setLoadingForecast(true);
        try {
            const stats = await geminiService.generateVastuAndGrowth(property);
            setAiStats(stats);
        } catch (error) {
            console.error(error);
        } finally {
            setLoadingForecast(false);
        }
    };

    const handleShare = async () => {
        try {
            await Share.share({
                message: `Check out this property on AvasPlot: ${property.title} - ${formatPrice(property.price)}\n\nhttps://avasplot.com/property/${property.$id}`,
            });
        } catch { /* ignore */ }
    };

    const headerOpacity = scrollY.interpolate({
        inputRange: [0, IMAGE_HEIGHT - 100],
        outputRange: [0, 1],
        extrapolate: 'clamp',
    });

    const details = [
        { icon: 'resize-outline', label: 'Area', value: formatArea(property.area) },
        { icon: 'pricetag-outline', label: 'Type', value: property.type },
        { icon: 'location-outline', label: 'Location', value: property.location },
        property.vastu ? { icon: 'compass-outline', label: 'Vastu', value: property.vastu } : null,
        property.$createdAt ? { icon: 'time-outline', label: 'Posted', value: timeAgo(property.$createdAt) } : null,
    ].filter(Boolean);

    return (
        <View style={styles.container}>
            <Animated.ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 120, paddingTop: insets.top + Spacing.xl }}
                onScroll={Animated.event(
                    [{ nativeEvent: { contentOffset: { y: scrollY } } }],
                    { useNativeDriver: true }
                )}
                scrollEventThrottle={16}
            >
                {/* Back Button matching web: <button id="detail-close-btn" class="fixed top-6 left-8 text-white bg-black/30 backdrop-blur-sm hover:bg-black/50 p-3 rounded-full z-50 transition-colors"> */}
                <TouchableOpacity onPress={() => router.back()} style={styles.webBackButton}>
                    <Ionicons name="arrow-back" size={24} color="#FFF" />
                </TouchableOpacity>

                {/* Compare Properties Floating Header Action */}
                <TouchableOpacity onPress={() => router.push('/compare')} style={styles.webCompareButton}>
                    <Ionicons name="git-compare-outline" size={24} color="#FFF" />
                </TouchableOpacity>

                <View style={styles.content}>
                    {/* Top Section: Image Gallery (Web layout) */}
                    <View style={styles.webImageSection}>
                        {imageUrls.length > 0 ? (
                            <>
                                <Image source={{ uri: imageUrls[activeImageIndex] }} style={styles.webMainImage} />
                                {/* Thumbnails */}
                                {imageUrls.length > 1 && (
                                    <View style={styles.webThumbnailsContainer}>
                                        {imageUrls.map((url, i) => (
                                            <TouchableOpacity
                                                key={i}
                                                onPress={() => setActiveImageIndex(i)}
                                                style={[
                                                    styles.webThumbnailWrapper,
                                                    i === activeImageIndex && styles.webThumbnailActive
                                                ]}
                                            >
                                                <Image source={{ uri: url }} style={styles.webThumbnailImage} />
                                            </TouchableOpacity>
                                        ))}
                                    </View>
                                )}
                            </>
                        ) : (
                            <LinearGradient
                                colors={[Colors.surfaceElevated, Colors.surfaceBright]}
                                style={styles.webMainImage}
                            >
                                <Ionicons name="image-outline" size={64} color={Colors.textMuted} />
                                <Text style={styles.imagePlaceholderText}>No Photos</Text>
                            </LinearGradient>
                        )}
                    </View>

                    {/* Details Section (Web layout) */}
                    <View style={styles.webHeaderRow}>
                        <View style={styles.webTitleBlock}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing.sm }}>
                                <Text style={styles.webLocationTitle}>{property.location}</Text>
                                <Ionicons name="location-outline" size={20} color={Colors.primary} />
                            </View>
                            <Text style={styles.webCitySubtitle}>{property.city}</Text>
                        </View>

                        {/* Verified Badge */}
                        {property.verified ? (
                            <View style={styles.webVerifiedBadge}>
                                <Ionicons name="shield-checkmark" size={16} color="#FFF" />
                                <Text style={styles.webVerifiedText}>Verified</Text>
                            </View>
                        ) : (
                            <View style={[styles.webVerifiedBadge, { backgroundColor: Colors.surfaceElevated }]}>
                                <Ionicons name="shield-checkmark-outline" size={16} color={Colors.textMuted} />
                                <Text style={[styles.webVerifiedText, { color: Colors.textMuted }]}>Unverified</Text>
                            </View>
                        )}
                    </View>

                    <View style={{ flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: Spacing.xl }}>
                        <Text style={styles.webPriceText}>{formatPrice(property.price)}</Text>
                        {property.status && (
                            <View style={{ paddingHorizontal: 12, paddingVertical: 6, backgroundColor: property.status.toLowerCase().includes('rent') ? 'rgba(59, 130, 246, 0.2)' : 'rgba(16, 185, 129, 0.2)', borderRadius: 8, borderWidth: 1, borderColor: property.status.toLowerCase().includes('rent') ? '#3B82F6' : '#10B981' }}>
                                <Text style={{ ...Typography.captionBold, color: property.status.toLowerCase().includes('rent') ? '#60A5FA' : Colors.success }}>{property.status}</Text>
                            </View>
                        )}
                    </View>

                    {/* AI Feature Cards Layout */}

                    {/* Dark Navy AI Summary Block */}
                    <View style={[styles.webAiSummaryCard, { backgroundColor: '#0F172A', borderColor: '#1E293B', borderWidth: 1 }]}>
                        <View style={[styles.webAiSummaryHeader, { justifyContent: 'space-between' }]}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, flexShrink: 1, paddingRight: Spacing.sm }}>
                                <Ionicons name="sparkles" size={20} color="#10B981" />
                                <Text style={[styles.webAiSummaryTitle, { color: '#FFF', flexShrink: 1 }]} numberOfLines={1}>AI Smart Summary</Text>
                            </View>
                            {!aiSummary && (
                                <TouchableOpacity
                                    style={{ backgroundColor: '#FFF', paddingHorizontal: 12, paddingVertical: 6, borderRadius: BorderRadius.sm, flexShrink: 0 }}
                                    onPress={handleGenerateSummary}
                                    disabled={loadingSummary}
                                >
                                    {loadingSummary ? <ActivityIndicator size="small" color="#0F172A" /> : <Text style={{ ...Typography.captionBold, color: '#0F172A' }}>Generate Summary</Text>}
                                </TouchableOpacity>
                            )}
                        </View>

                        {aiSummary ? (
                            <Text style={[styles.webAiSummaryText, { color: '#CBD5E1', marginTop: Spacing.md }]}>
                                {aiSummary}
                            </Text>
                        ) : (
                            <Text style={[styles.webAiSummaryText, { color: '#94A3B8', marginTop: Spacing.md }]}>
                                Get a quick AI-powered breakdown of this property's potential, pros, and cons.
                            </Text>
                        )}
                    </View>

                    {/* Dark Navy Market Forecast Block */}
                    <View style={[styles.webAiSummaryCard, { backgroundColor: '#0F172A', borderColor: '#1E293B', borderWidth: 1, marginTop: Spacing.lg }]}>
                        <View style={[styles.webAiSummaryHeader, { justifyContent: 'space-between', alignItems: 'flex-start' }]}>
                            <View style={{ flexShrink: 1, paddingRight: Spacing.sm }}>
                                <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginBottom: 4 }}>
                                    <Ionicons name="trending-up" size={20} color="#10B981" />
                                    <Text style={[styles.webAiSummaryTitle, { color: '#FFF', flexShrink: 1 }]} numberOfLines={1}>Market Forecast</Text>
                                </View>
                                <Text style={{ ...Typography.caption, color: '#94A3B8' }}>AI-Powered Price Prediction</Text>
                            </View>

                            {!aiStats && (
                                <TouchableOpacity
                                    style={{ backgroundColor: '#10B981', paddingHorizontal: 16, paddingVertical: 8, borderRadius: BorderRadius.md, flexShrink: 0 }}
                                    onPress={handleGenerateForecast}
                                    disabled={loadingForecast}
                                >
                                    {loadingForecast ? <ActivityIndicator size="small" color="#FFF" /> : <Text style={{ ...Typography.bodyBold, color: '#FFF' }}>Analyze Now</Text>}
                                </TouchableOpacity>
                            )}
                        </View>

                        {/* Expandable Forecast Grid */}
                        {aiStats && aiStats.forecast && (
                            <View style={{ marginTop: Spacing.xl }}>
                                <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: Spacing.sm }}>
                                    {aiStats.forecast.map((forecastItem, idx) => (
                                        <View key={idx} style={{ alignItems: 'center' }}>
                                            <Text style={{ ...Typography.bodyBold, color: '#10B981', marginBottom: 2 }}>{forecastItem.priceStr}</Text>
                                            <Text style={{ ...Typography.tiny, color: '#34D399', fontWeight: 'bold' }}>+{forecastItem.growthPct}%</Text>

                                            {/* Stylized Neon Underline */}
                                            <LinearGradient
                                                colors={['#10B981', '#047857']}
                                                style={{ height: 6, width: 60, borderRadius: 3, marginTop: Spacing.sm, marginBottom: Spacing.md }}
                                            />

                                            <Text style={{ ...Typography.captionBold, color: '#94A3B8' }}>{forecastItem.year}</Text>
                                        </View>
                                    ))}
                                </View>

                                <View style={{ backgroundColor: '#1E293B', padding: Spacing.md, borderRadius: BorderRadius.md, marginTop: Spacing.xl, alignItems: 'center' }}>
                                    <Text style={{ ...Typography.caption, color: '#94A3B8', textAlign: 'center' }}>
                                        Estimated market value based on current growth patterns.
                                    </Text>
                                </View>
                            </View>
                        )}
                    </View>

                    {/* Details Grid */}
                    <View style={styles.detailsGrid}>
                        {details.map((d: any) => (
                            <View key={d.label} style={styles.detailItem}>
                                <Ionicons name={d.icon} size={18} color={Colors.primary} />
                                <Text style={styles.detailLabel}>{d.label}</Text>
                                <Text style={styles.detailValue}>{d.value}</Text>
                            </View>
                        ))}
                    </View>

                    {/* Legal & Documents */}
                    <View style={styles.section}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginBottom: Spacing.md }}>
                            <Ionicons name="document-text" size={24} color={Colors.primary} />
                            <Text style={styles.sectionTitle}>Legal & Documents</Text>
                        </View>
                        <View style={{ flexDirection: 'row', gap: Spacing.md }}>
                            <View style={[styles.detailItem, property.aadhaar_url ? { borderColor: Colors.success } : {}]}>
                                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <Text style={styles.detailLabel}>Aadhaar Card</Text>
                                    <Ionicons name={property.aadhaar_url ? "shield-checkmark" : "shield-half-outline"} size={16} color={property.aadhaar_url ? Colors.success : Colors.textMuted} />
                                </View>
                                <Text style={styles.detailValue}>{property.aadhaar_url ? 'Verified' : 'Pending'}</Text>
                            </View>
                            <View style={[styles.detailItem, property.sev_twelve_url ? { borderColor: Colors.success } : {}]}>
                                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <Text style={styles.detailLabel}>7/12 & 8A Extract</Text>
                                    <Ionicons name={property.sev_twelve_url ? "shield-checkmark" : "shield-half-outline"} size={16} color={property.sev_twelve_url ? Colors.success : Colors.textMuted} />
                                </View>
                                <Text style={styles.detailValue}>{property.sev_twelve_url ? 'Verified' : 'Pending'}</Text>
                            </View>
                        </View>
                    </View>

                    {/* Description */}
                    {property.description && (
                        <View style={styles.section}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginBottom: Spacing.md }}>
                                <Ionicons name="information-circle" size={24} color={Colors.primary} />
                                <Text style={styles.sectionTitle}>About this Property</Text>
                            </View>
                            <Text style={styles.description}>{property.description}</Text>
                        </View>
                    )}

                    {/* INTERACTIVE MAP COMPONENT (Native Only) */}
                    {property.latitude && property.longitude && Platform.OS !== 'web' && MapView ? (
                        <View style={styles.mapContainerWebWrapper}>
                            <Text style={styles.sectionTitle}>Location map</Text>
                            <View style={styles.mapBoxContainer}>
                                <MapView
                                    provider={PROVIDER_GOOGLE}
                                    style={styles.mapViewInstance}
                                    initialRegion={{
                                        latitude: property.latitude,
                                        longitude: property.longitude,
                                        latitudeDelta: 0.005,
                                        longitudeDelta: 0.005,
                                    }}
                                >
                                    <Marker
                                        coordinate={{ latitude: property.latitude, longitude: property.longitude }}
                                        title={property.title || property.location}
                                        description={formatPrice(property.price)}
                                        pinColor={Colors.primary}
                                    />
                                </MapView>
                            </View>
                            <Text style={styles.mapContextSubtext}>
                                <Ionicons name="information-circle-outline" size={14} color="#64748B" /> Exact location point may vary slightly based on listed coordinates.
                            </Text>
                        </View>
                    ) : (
                        <View style={styles.mapContainerWebWrapper}>
                            <Text style={styles.sectionTitle}>Location map</Text>
                            <View style={[styles.mapBoxContainer, { justifyContent: 'center', alignItems: 'center', backgroundColor: '#F8FAFC' }]}>
                                {Platform.OS === 'web' ? (
                                    <>
                                        <Ionicons name="laptop-outline" size={48} color="#E2E8F0" style={{ marginBottom: Spacing.sm }} />
                                        <Text style={{ fontFamily: 'Outfit-Medium', color: '#94A3B8' }}>Interactive Map available on Mobile App</Text>
                                    </>
                                ) : (
                                    <>
                                        <Ionicons name="map-sharp" size={48} color="#E2E8F0" style={{ marginBottom: Spacing.sm }} />
                                        <Text style={{ fontFamily: 'Outfit-Medium', color: '#94A3B8' }}>Map coordinates unavailable</Text>
                                    </>
                                )}
                            </View>
                        </View>
                    )}

                    {/* Seller Info */}
                    {(property.sellerName || property.email) && (
                        <View style={styles.sellerCard}>
                            <LinearGradient
                                colors={[Colors.primary, Colors.secondary]}
                                style={styles.sellerAvatar}
                            >
                                <Ionicons name="person" size={20} color="#FFF" />
                            </LinearGradient>
                            <View style={styles.sellerInfo}>
                                <Text style={styles.sellerName}>{property.sellerName || 'Seller'}</Text>
                                {property.email && (
                                    <Text style={styles.sellerContact}>{property.email}</Text>
                                )}
                            </View>
                        </View>
                    )}
                </View>
            </Animated.ScrollView>

            {/* Bottom Contact Bar */}
            <View style={[styles.contactBar, { paddingBottom: insets.bottom + Spacing.md }]}>
                <TouchableOpacity style={styles.contactButton} onPress={handleCall}>
                    <View style={[styles.contactIcon, { backgroundColor: 'rgba(16, 185, 129, 0.15)' }]}>
                        <Ionicons name="call" size={20} color={Colors.success} />
                    </View>
                    <Text style={styles.contactLabel}>Call</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.contactButton} onPress={handleEmail}>
                    <View style={[styles.contactIcon, { backgroundColor: 'rgba(59, 130, 246, 0.15)' }]}>
                        <Ionicons name="mail" size={20} color="#3B82F6" />
                    </View>
                    <Text style={styles.contactLabel}>Email</Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={handleWhatsApp} activeOpacity={0.8} style={{ flex: 1 }}>
                    <LinearGradient
                        colors={['#25D366', '#128C7E']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={styles.whatsappButton}
                    >
                        <Ionicons name="logo-whatsapp" size={22} color="#FFF" />
                        <Text style={styles.whatsappText}>WhatsApp</Text>
                    </LinearGradient>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.background },
    centerContent: { justifyContent: 'center', alignItems: 'center', gap: Spacing.md },

    errorText: { ...Typography.h3, color: Colors.textMuted },
    backLink: { ...Typography.bodyBold, color: Colors.primary },

    // Web Layout Matching Styles
    webBackButton: {
        position: 'absolute',
        top: 24,
        left: 24,
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 50,
    },
    webCompareButton: {
        position: 'absolute',
        top: 24,
        right: Spacing.xl,
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 50,
    },
    content: { padding: Spacing.xl },

    webImageSection: { marginBottom: Spacing.xl },
    webMainImage: {
        width: '100%',
        height: height * 0.4,
        borderRadius: BorderRadius.lg,
        resizeMode: 'cover',
        ...Shadows.md,
    },
    webThumbnailsContainer: {
        flexDirection: 'row',
        marginTop: Spacing.sm,
        gap: Spacing.xs,
    },
    webThumbnailWrapper: {
        flex: 1,
        aspectRatio: 1.5,
        borderRadius: BorderRadius.md,
        overflow: 'hidden',
        borderWidth: 2,
        borderColor: 'transparent',
    },
    webThumbnailActive: { borderColor: Colors.primary },
    webThumbnailImage: { width: '100%', height: '100%', resizeMode: 'cover' },
    imagePlaceholderText: { ...Typography.caption, color: Colors.textMuted },

    webHeaderRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        paddingBottom: Spacing.md,
    },
    // MAP STYLES
    mapContainerWebWrapper: {
        marginBottom: Spacing.xxl + Spacing.lg,
    },
    mapBoxContainer: {
        height: 250,
        width: '100%',
        borderRadius: BorderRadius.xl,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: '#E2E8F0',
        ...Shadows.md,
    },
    mapViewInstance: {
        width: '100%',
        height: '100%',
    },
    mapContextSubtext: {
        ...Typography.caption,
        color: '#64748B',
        marginTop: Spacing.sm,
        marginLeft: Spacing.xs,
    },
    webTitleBlock: { flex: 1, paddingRight: Spacing.md },
    webLocationTitle: { ...Typography.h1, color: Colors.text },
    webCitySubtitle: { ...Typography.body, color: Colors.textSecondary, marginTop: Spacing.xs },

    webVerifiedBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.success,
        paddingHorizontal: Spacing.sm,
        paddingVertical: 4,
        borderRadius: BorderRadius.full,
        gap: 4,
    },
    webVerifiedText: { ...Typography.captionBold, color: '#FFF' },

    webPriceText: { ...Typography.price, color: Colors.primary, fontSize: 36, marginBottom: Spacing.xl },

    webAIGrid: {
        flexDirection: 'row',
        gap: Spacing.md,
        marginBottom: Spacing.xl,
    },
    webAiCard: {
        flex: 1,
        padding: Spacing.lg,
        borderRadius: BorderRadius.lg,
        borderWidth: 1,
        alignItems: 'center',
    },
    webAiGrowth: {
        backgroundColor: '#14532D', // Solid green-900
        borderColor: '#22C55E',   // Solid green-500
    },
    webAiVastu: {
        backgroundColor: '#713F12', // Solid yellow-900
        borderColor: '#EAB308',    // Solid yellow-500
    },
    webAiCardTitle: { ...Typography.captionBold, color: '#FFF', opacity: 0.9, marginBottom: 4 },
    webAiCardValue: { ...Typography.h3, color: '#FFF' },

    webAiSummaryCard: {
        padding: Spacing.lg,
        backgroundColor: '#0F172A', // Solid slate-900
        borderRadius: BorderRadius.lg,
        borderWidth: 1,
        borderColor: '#1E293B', // Solid slate-800
        marginBottom: Spacing.xxl,
    },
    webAiSummaryHeader: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginBottom: Spacing.sm },
    webAiSummaryTitle: { ...Typography.h3, color: '#F8FAFC' }, // slate-50
    webAiSummaryText: { ...Typography.body, color: '#CBD5E1', lineHeight: 24 }, // slate-300

    detailsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: Spacing.md,
        marginBottom: Spacing.xxl,
    },
    detailItem: {
        backgroundColor: Colors.surface,
        borderRadius: BorderRadius.md,
        borderWidth: 1,
        borderColor: Colors.glassBorder,
        padding: Spacing.lg,
        minWidth: '45%',
        flex: 1,
        gap: Spacing.xs,
    },
    detailLabel: { ...Typography.tiny, color: Colors.textMuted, textTransform: 'uppercase' },
    detailValue: { ...Typography.bodyBold, color: Colors.text },

    section: { marginBottom: Spacing.xxl },
    sectionTitle: { ...Typography.h3, color: Colors.text, marginBottom: Spacing.md },
    description: { ...Typography.body, color: Colors.textSecondary, lineHeight: 24 },

    sellerCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.surface,
        borderRadius: BorderRadius.lg,
        borderWidth: 1,
        borderColor: Colors.glassBorder,
        padding: Spacing.lg,
        gap: Spacing.md,
        marginBottom: Spacing.xl,
    },
    sellerAvatar: {
        width: 44, height: 44, borderRadius: 22,
        justifyContent: 'center', alignItems: 'center',
    },
    sellerInfo: { flex: 1 },
    sellerName: { ...Typography.bodyBold, color: Colors.text },
    sellerContact: { ...Typography.caption, color: Colors.textSecondary },

    // Contact Bar
    contactBar: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.surface,
        borderTopWidth: 1,
        borderTopColor: Colors.glassBorder,
        paddingHorizontal: Spacing.lg,
        paddingTop: Spacing.md,
        gap: Spacing.md,
    },
    contactButton: { alignItems: 'center', gap: 4 },
    contactIcon: {
        width: 44, height: 44, borderRadius: 22,
        justifyContent: 'center', alignItems: 'center',
    },
    contactLabel: { ...Typography.tiny, color: Colors.textMuted },
    whatsappButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: Spacing.sm,
        height: 48,
        borderRadius: BorderRadius.md,
    },
    whatsappText: { ...Typography.bodyBold, color: '#FFF' },
});
