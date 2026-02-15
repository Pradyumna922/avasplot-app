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
    Share,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
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
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const scrollY = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        if (id) {
            properties.getById(id)
                .then(setProperty)
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
            {/* Floating Header */}
            <Animated.View style={[styles.floatingHeader, { opacity: headerOpacity, paddingTop: insets.top }]}>
                <View style={styles.floatingHeaderContent}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.floatingBackButton}>
                        <Ionicons name="arrow-back" size={20} color={Colors.text} />
                    </TouchableOpacity>
                    <Text style={styles.floatingTitle} numberOfLines={1}>{property.title}</Text>
                    <TouchableOpacity onPress={handleShare} style={styles.floatingBackButton}>
                        <Ionicons name="share-outline" size={20} color={Colors.text} />
                    </TouchableOpacity>
                </View>
            </Animated.View>

            <Animated.ScrollView
                showsVerticalScrollIndicator={false}
                onScroll={Animated.event(
                    [{ nativeEvent: { contentOffset: { y: scrollY } } }],
                    { useNativeDriver: true }
                )}
                scrollEventThrottle={16}
            >
                {/* Image Gallery */}
                <View style={styles.imageSection}>
                    {imageUrls.length > 0 ? (
                        <FlatList
                            horizontal
                            pagingEnabled
                            showsHorizontalScrollIndicator={false}
                            data={imageUrls}
                            keyExtractor={(_, i) => String(i)}
                            onMomentumScrollEnd={(e) => {
                                const idx = Math.round(e.nativeEvent.contentOffset.x / width);
                                setActiveImageIndex(idx);
                            }}
                            renderItem={({ item }) => (
                                <Image source={{ uri: item }} style={styles.mainImage} />
                            )}
                        />
                    ) : (
                        <LinearGradient
                            colors={[Colors.surfaceElevated, Colors.surfaceBright]}
                            style={styles.imagePlaceholder}
                        >
                            <Ionicons name="image-outline" size={64} color={Colors.textMuted} />
                            <Text style={styles.imagePlaceholderText}>No Photos</Text>
                        </LinearGradient>
                    )}

                    {/* Back & Share buttons over image */}
                    <View style={[styles.imageOverlay, { paddingTop: insets.top + Spacing.md }]}>
                        <TouchableOpacity style={styles.overlayButton} onPress={() => router.back()}>
                            <Ionicons name="arrow-back" size={22} color="#FFF" />
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.overlayButton} onPress={handleShare}>
                            <Ionicons name="share-outline" size={22} color="#FFF" />
                        </TouchableOpacity>
                    </View>

                    {/* Image Indicators */}
                    {imageUrls.length > 1 && (
                        <View style={styles.indicators}>
                            {imageUrls.map((_, i) => (
                                <View
                                    key={i}
                                    style={[styles.indicator, i === activeImageIndex && styles.indicatorActive]}
                                />
                            ))}
                        </View>
                    )}

                    {/* Price overlay */}
                    <View style={styles.priceOverlay}>
                        <LinearGradient
                            colors={[Colors.primary, Colors.primaryDark]}
                            style={styles.priceGradient}
                        >
                            <Text style={styles.priceText}>{formatPrice(property.price)}</Text>
                        </LinearGradient>
                    </View>
                </View>

                {/* Content */}
                <View style={styles.content}>
                    {/* Title & Verified */}
                    <View style={styles.titleRow}>
                        <Text style={styles.title}>{property.title}</Text>
                        {property.verified && (
                            <View style={styles.verifiedBadge}>
                                <Ionicons name="shield-checkmark" size={16} color={Colors.success} />
                                <Text style={styles.verifiedText}>Verified</Text>
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

                    {/* Description */}
                    {property.description && (
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>About this Property</Text>
                            <Text style={styles.description}>{property.description}</Text>
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

    // Floating Header
    floatingHeader: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        backgroundColor: Colors.surface,
        borderBottomWidth: 1,
        borderBottomColor: Colors.glassBorder,
        zIndex: 100,
    },
    floatingHeaderContent: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: Spacing.lg,
        paddingVertical: Spacing.md,
        gap: Spacing.md,
    },
    floatingBackButton: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: Colors.glass,
        justifyContent: 'center',
        alignItems: 'center',
    },
    floatingTitle: { ...Typography.bodyBold, color: Colors.text, flex: 1 },

    // Image Section
    imageSection: { height: IMAGE_HEIGHT, position: 'relative' },
    mainImage: { width, height: IMAGE_HEIGHT, resizeMode: 'cover' },
    imagePlaceholder: {
        width: '100%',
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
        gap: Spacing.md,
    },
    imagePlaceholderText: { ...Typography.caption, color: Colors.textMuted },
    imageOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: Spacing.lg,
    },
    overlayButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    indicators: {
        position: 'absolute',
        bottom: 60,
        left: 0,
        right: 0,
        flexDirection: 'row',
        justifyContent: 'center',
        gap: Spacing.xs,
    },
    indicator: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: 'rgba(255,255,255,0.4)',
    },
    indicatorActive: { backgroundColor: '#FFF', width: 20 },
    priceOverlay: {
        position: 'absolute',
        bottom: Spacing.lg,
        left: Spacing.lg,
    },
    priceGradient: {
        paddingHorizontal: Spacing.xl,
        paddingVertical: Spacing.md,
        borderRadius: BorderRadius.md,
        ...Shadows.md,
    },
    priceText: { ...Typography.price, color: '#FFF' },

    // Content
    content: { padding: Spacing.xl, paddingBottom: 120 },
    titleRow: { marginBottom: Spacing.xl },
    title: { ...Typography.h1, color: Colors.text, marginBottom: Spacing.sm },
    verifiedBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.xs,
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        alignSelf: 'flex-start',
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.xs,
        borderRadius: BorderRadius.full,
    },
    verifiedText: { ...Typography.captionBold, color: Colors.success },

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
