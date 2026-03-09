import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Image,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    Dimensions
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { formatArea, formatPrice, properties } from '../src/services/appwrite';
import { geminiService } from '../src/services/gemini';
import { BorderRadius, Colors, Shadows, Spacing, Typography } from '../src/theme';
import { Property } from '../src/types';

const { width } = Dimensions.get('window');

export default function ComparePropertiesScreen() {
    const router = useRouter();
    const params = useLocalSearchParams<{ propA?: string; propB?: string }>();
    const insets = useSafeAreaInsets();

    // Master List and Selectors
    const [allProperties, setAllProperties] = useState<Property[]>([]);
    const [propA, setPropA] = useState<Property | null>(null);
    const [propB, setPropB] = useState<Property | null>(null);

    // Modal states
    const [showPickerFor, setShowPickerFor] = useState<'A' | 'B' | null>(null);

    // AI Analysis
    const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);

    useEffect(() => {
        properties.getAll(50)
            .then(res => {
                const docs = res.documents;
                setAllProperties(docs);

                // Auto-fill selected properties from Route Params
                if (params.propA) {
                    const foundA = docs.find(d => d.$id === params.propA);
                    if (foundA) setPropA(foundA);
                }
                if (params.propB) {
                    const foundB = docs.find(d => d.$id === params.propB);
                    if (foundB) setPropB(foundB);
                }
            })
            .catch(err => {
                console.error('Failed fetching props for compare:', err);
                Alert.alert('Error', 'Unable to fetch properties for comparison.');
            });
    }, [params.propA, params.propB]);

    const runAnalysis = async () => {
        if (!propA || !propB) return;
        setIsAnalyzing(true);
        setAiAnalysis(null);
        try {
            const result = await geminiService.compareProperties(propA, propB);
            setAiAnalysis(result);
        } catch (error) {
            Alert.alert('AI Error', 'Failed to analyze properties.');
        } finally {
            setIsAnalyzing(false);
        }
    };

    const calculatePricePerSqft = (price: number, area: number | string) => {
        const numericArea = typeof area === 'string' ? parseFloat(area) : area;
        if (isNaN(numericArea) || numericArea <= 0) return '--';
        const v = Math.round(price / numericArea);
        return `₹${v.toLocaleString('en-IN')}/sqft`;
    };

    const PropertyColumn = ({ prop, label, side }: { prop: Property | null, label: string, side: 'A' | 'B' }) => (
        <View style={styles.propColumn}>
            {prop ? (
                <>
                    <TouchableOpacity
                        style={styles.changePropBtn}
                        onPress={() => setShowPickerFor(side)}
                    >
                        <Ionicons name="swap-horizontal" size={14} color={Colors.textMuted} />
                        <Text style={styles.changePropText}>Change</Text>
                    </TouchableOpacity>

                    <Text style={styles.colTitle} numberOfLines={2}>{prop.title}</Text>
                    <Text style={styles.colPrice}>{formatPrice(prop.price)}</Text>
                    <Text style={styles.colAreaPrice}>{calculatePricePerSqft(prop.price, prop.area)}</Text>

                    <View style={styles.attrList}>
                        <View style={styles.attrRow}>
                            <Text style={styles.attrLabel}>Location</Text>
                            <Text style={styles.attrValue} numberOfLines={1}>{prop.city || prop.location}</Text>
                        </View>
                        <View style={styles.attrRow}>
                            <Text style={styles.attrLabel}>Area</Text>
                            <Text style={styles.attrValue}>{formatArea(prop.area)}</Text>
                        </View>
                        <View style={styles.attrRow}>
                            <Text style={styles.attrLabel}>Type</Text>
                            <Text style={styles.attrValue}>{prop.type}</Text>
                        </View>
                        <View style={styles.attrRow}>
                            <Text style={styles.attrLabel}>Vastu</Text>
                            <Text style={styles.attrValue}>{prop.vastu || '--'}</Text>
                        </View>
                    </View>
                </>
            ) : (
                <TouchableOpacity
                    style={styles.emptyCol}
                    onPress={() => setShowPickerFor(side)}
                >
                    <Ionicons name="add-circle-outline" size={32} color={Colors.primary} />
                    <Text style={styles.emptyColText}>Select {label}</Text>
                </TouchableOpacity>
            )}
        </View>
    );

    const parseAIResponse = (text: string) => {
        const parts = text.split('Recommendation:');
        const bullets = parts[0].trim().split('\n').filter(l => l.trim().startsWith('•'));
        const recommendation = parts.length > 1 ? parts[1].trim() : null;

        return { bullets, recommendation };
    };

    // Helper text renderer to parse simple **bold** markdown tags from Gemini
    const renderMarkdownText = (text: string) => {
        // Remove the starting bullet and space
        const cleanText = text.replace('•', '').trim();

        // Split by the bold markers
        const parts = cleanText.split(/(\*\*.*?\*\*)/g);

        return parts.map((part, index) => {
            if (part.startsWith('**') && part.endsWith('**')) {
                // Remove the asterisks and render bold
                const boldText = part.slice(2, -2);
                return <Text key={index} style={{ fontWeight: 'bold', color: '#FFF' }}>{boldText}</Text>;
            }
            return <Text key={index}>{part}</Text>;
        });
    };

    const aiParsed = aiAnalysis ? parseAIResponse(aiAnalysis) : null;

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            <View style={styles.modalBg}>
                <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

                    {/* Main Comparison Modal Box */}
                    <View style={styles.compareCard}>
                        {/* Header */}
                        <View style={styles.cardHeader}>
                            <View style={styles.headerTitleWrap}>
                                <Ionicons name="git-compare-outline" size={24} color={Colors.text} />
                                <Text style={styles.cardHeaderTitle}>Property Comparison</Text>
                            </View>
                            <TouchableOpacity style={styles.closeBtn} onPress={() => router.back()}>
                                <Ionicons name="close" size={20} color={Colors.text} />
                            </TouchableOpacity>
                        </View>

                        {/* Two Columns */}
                        <View style={styles.columnsWrap}>
                            <PropertyColumn prop={propA} label="Property A" side="A" />
                            <View style={styles.colDivider} />
                            <PropertyColumn prop={propB} label="Property B" side="B" />
                        </View>

                        {/* Analysis Trigger Button */}
                        {(propA && propB) && (
                            <TouchableOpacity
                                style={[styles.aiTriggerBtn, isAnalyzing && { opacity: 0.7 }]}
                                onPress={runAnalysis}
                                disabled={isAnalyzing}
                                activeOpacity={0.8}
                            >
                                <View style={styles.aiTriggerLeft}>
                                    <Ionicons name="sparkles" size={20} color={Colors.primary} />
                                    <Text style={styles.aiTriggerTitle}>AI Comparative Analysis</Text>
                                </View>
                                <View style={styles.aiAnalyzeBadge}>
                                    {isAnalyzing ? (
                                        <ActivityIndicator size="small" color="#FFF" />
                                    ) : (
                                        <Text style={styles.aiAnalyzeText}>Analyze Difference</Text>
                                    )}
                                </View>
                            </TouchableOpacity>
                        )}
                    </View>

                    {/* AI Output Section */}
                    {aiParsed && (
                        <View style={styles.aiResultsSection}>
                            {/* Smart Summary Card */}
                            <View style={styles.aiSummaryCard}>
                                <View style={styles.aiSummaryHeader}>
                                    <Ionicons name="sparkles" size={20} color={Colors.primary} />
                                    <Text style={styles.aiSummaryTitle}>AI Smart Summary</Text>
                                </View>
                                <View style={styles.aiBulletList}>
                                    {aiParsed.bullets.map((bullet, idx) => (
                                        <View key={idx} style={styles.bulletRow}>
                                            <View style={styles.bulletDot} />
                                            <Text style={styles.bulletText}>
                                                {renderMarkdownText(bullet)}
                                            </Text>
                                        </View>
                                    ))}
                                </View>
                            </View>

                            {/* Recommendation Card */}
                            {aiParsed.recommendation && (
                                <View style={styles.aiRecCard}>
                                    <Text style={styles.aiRecLabel}>AI Recommendation</Text>
                                    <Text style={styles.aiRecText}>{aiParsed.recommendation}</Text>
                                </View>
                            )}
                        </View>
                    )}

                </ScrollView>
            </View>

            {/* Selector Modal */}
            <Modal visible={!!showPickerFor} animationType="slide" transparent={true}>
                <View style={[styles.pickerOverlay, { paddingBottom: insets.bottom }]}>
                    <View style={styles.pickerContent}>
                        <View style={styles.pickerHeader}>
                            <Text style={styles.pickerTitle}>Choose Property {showPickerFor}</Text>
                            <TouchableOpacity onPress={() => setShowPickerFor(null)}>
                                <Ionicons name="close" size={28} color={Colors.text} />
                            </TouchableOpacity>
                        </View>
                        <ScrollView style={styles.pickerList}>
                            {allProperties.map(p => {
                                if ((showPickerFor === 'A' && propB?.$id === p.$id) || (showPickerFor === 'B' && propA?.$id === p.$id)) {
                                    return null;
                                }
                                return (
                                    <TouchableOpacity
                                        key={p.$id}
                                        style={styles.pickerItem}
                                        onPress={() => {
                                            if (showPickerFor === 'A') setPropA(p);
                                            else setPropB(p);
                                            setShowPickerFor(null);
                                        }}
                                    >
                                        <View style={styles.pickerItemImgWrap}>
                                            {p.images?.[0] ? (
                                                <Image source={{ uri: properties.getImageUrl(p.images[0]) }} style={styles.pickerItemImage} />
                                            ) : (
                                                <Ionicons name="image" size={20} color={Colors.textMuted} />
                                            )}
                                        </View>
                                        <View style={styles.pickerItemInfo}>
                                            <Text style={styles.pickerItemTitle}>{p.title}</Text>
                                            <Text style={styles.pickerItemSub}>{p.location} • {formatPrice(p.price)}</Text>
                                        </View>
                                    </TouchableOpacity>
                                );
                            })}
                        </ScrollView>
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#EFF6FF' }, // Match subtle blue/gray bg of website
    modalBg: { flex: 1, padding: Spacing.lg },
    scrollContent: { paddingBottom: 100 },

    compareCard: {
        backgroundColor: '#FFF',
        borderRadius: BorderRadius.xl,
        padding: Spacing.xl,
        ...Shadows.lg,
        elevation: 10,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: Spacing.xl,
    },
    headerTitleWrap: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
    cardHeaderTitle: { ...Typography.h2, color: '#0F172A' },
    closeBtn: {
        width: 32, height: 32, borderRadius: 16, backgroundColor: Colors.surfaceBright,
        justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: Colors.border,
    },

    columnsWrap: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: Spacing.xl,
    },
    colDivider: {
        width: 1,
        backgroundColor: Colors.border,
        marginHorizontal: Spacing.md,
    },
    propColumn: {
        flex: 1,
    },
    emptyCol: {
        flex: 1,
        minHeight: 200,
        backgroundColor: Colors.surfaceBright,
        borderRadius: BorderRadius.lg,
        borderWidth: 1,
        borderColor: Colors.border,
        borderStyle: 'dashed',
        justifyContent: 'center',
        alignItems: 'center',
        gap: Spacing.sm,
    },
    emptyColText: { ...Typography.captionBold, color: Colors.primary },

    changePropBtn: { alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: Spacing.md, paddingVertical: 4, paddingHorizontal: 8, backgroundColor: Colors.surfaceBright, borderRadius: BorderRadius.full },
    changePropText: { ...Typography.tiny, color: Colors.textSecondary },

    colTitle: { ...Typography.captionBold, color: '#1E293B', marginBottom: Spacing.md, height: 40 },
    colPrice: { ...Typography.h2, color: '#10B981', marginBottom: 2 }, // Emerald-500
    colAreaPrice: { ...Typography.tiny, color: '#94A3B8', marginBottom: Spacing.lg }, // Slate-400

    attrList: { gap: Spacing.sm },
    attrRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingBottom: Spacing.sm,
        borderBottomWidth: 1,
        borderBottomColor: Colors.glassBorder,
    },
    attrLabel: { ...Typography.caption, color: '#64748B' }, // Slate-500
    attrValue: { ...Typography.captionBold, color: '#0F172A', textAlign: 'right', flex: 1 },

    aiTriggerBtn: {
        backgroundColor: '#0F172A', // Slate-900 / Dark Navy
        borderRadius: BorderRadius.lg,
        flexDirection: 'column', // Stacked natively to prevent overlap
        justifyContent: 'center',
        alignItems: 'stretch',
        padding: Spacing.sm,
        gap: Spacing.sm,
    },
    aiTriggerLeft: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: Spacing.sm },
    aiTriggerTitle: { ...Typography.bodyBold, color: '#FFF' },
    aiAnalyzeBadge: {
        backgroundColor: '#10B981', // Emerald-500
        paddingHorizontal: Spacing.md,
        paddingVertical: 12,
        borderRadius: BorderRadius.md,
        alignItems: 'center',
    },
    aiAnalyzeText: { ...Typography.captionBold, color: '#FFF' },

    aiResultsSection: { marginTop: Spacing.xxl },
    aiSummaryCard: {
        backgroundColor: '#0F172A',
        borderRadius: BorderRadius.xl,
        padding: Spacing.xl,
        borderWidth: 1,
        borderColor: '#1E293B',
        marginBottom: Spacing.lg,
    },
    aiSummaryHeader: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginBottom: Spacing.lg },
    aiSummaryTitle: { ...Typography.h2, color: '#FFF' },
    aiBulletList: {
        backgroundColor: '#1E293B',
        borderRadius: BorderRadius.lg,
        padding: Spacing.lg,
        gap: Spacing.md,
    },
    bulletRow: { flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.md },
    bulletDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#10B981', marginTop: 8 },
    bulletText: { flex: 1, ...Typography.body, color: '#E2E8F0', lineHeight: 24 }, // Slate-200

    aiRecCard: {
        backgroundColor: '#10B981', // Solid emerald-500 block for recommendation
        borderRadius: BorderRadius.xl,
        padding: Spacing.xl,
    },
    aiRecLabel: { ...Typography.captionBold, color: '#FFF', textTransform: 'uppercase', marginBottom: Spacing.sm },
    aiRecText: { ...Typography.bodyBold, color: '#FFF', lineHeight: 24 },

    // Modals
    pickerOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
    pickerContent: { backgroundColor: Colors.surface, borderTopLeftRadius: BorderRadius.xl, borderTopRightRadius: BorderRadius.xl, height: '70%', padding: Spacing.xl },
    pickerHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.xl },
    pickerTitle: { ...Typography.h3, color: Colors.text },
    pickerList: { flex: 1 },
    pickerItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: Spacing.md, borderBottomWidth: 1, borderBottomColor: Colors.glassBorder, gap: Spacing.md },
    pickerItemImgWrap: { width: 50, height: 50, borderRadius: BorderRadius.sm, backgroundColor: Colors.glass, justifyContent: 'center', alignItems: 'center', overflow: 'hidden' },
    pickerItemImage: { width: '100%', height: '100%' },
    pickerItemInfo: { flex: 1 },
    pickerItemTitle: { ...Typography.bodyBold, color: Colors.text, marginBottom: 2 },
    pickerItemSub: { ...Typography.caption, color: Colors.textMuted },
});
