// ============================================================================
// ➕ POST PROPERTY SCREEN — Multi-Step Property Listing Creation
// ============================================================================

import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter, useLocalSearchParams } from 'expo-router';
import React, { useState, useRef } from 'react';
import {
    ActivityIndicator,
    Alert,
    Image,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

let MapView: any;
let Marker: any;
let PROVIDER_GOOGLE: any;

if (Platform.OS !== 'web') {
    const Maps = require('react-native-maps');
    MapView = Maps.default;
    Marker = Maps.Marker;
    PROVIDER_GOOGLE = Maps.PROVIDER_GOOGLE;
} else {
    // For Web fallback
    const WebMaps = require('../components/MapView.web');
    MapView = WebMaps.default;
    Marker = WebMaps.Marker;
    PROVIDER_GOOGLE = WebMaps.PROVIDER_GOOGLE;
}
// Import ENV
import { ENV } from '../../src/config/env';

import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../../src/context/AuthContext';
import { images, properties } from '../../src/services/appwrite';
import { BorderRadius, Colors, Shadows, Spacing, Typography } from '../../src/theme';
import { PROPERTY_TYPES } from '../../src/types';

const STEPS = ['Details', 'Location', 'Images', 'Verify'];

export default function EditScreen() {
    const { user, isLoggedIn, prefs } = useAuth();
    const router = useRouter();
    const { id } = useLocalSearchParams();
    const insets = useSafeAreaInsets();

    const [currentStep, setCurrentStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [isFetchingInitial, setIsFetchingInitial] = useState(true);

    // Step 1 State
    const [listingType, setListingType] = useState<'For Sale' | 'For Rent'>('For Sale');
    const [type, setType] = useState('');
    const [title, setTitle] = useState('');
    const [price, setPrice] = useState('');
    const [area, setArea] = useState('');
    const [vastu, setVastu] = useState('');

    // Step 2 State
    const [location, setLocation] = useState('');
    const [city, setCity] = useState('');
    const [description, setDescription] = useState('');
    const [pinLocation, setPinLocation] = useState<{ latitude: number; longitude: number } | null>(null);
    const [mapSearchQuery, setMapSearchQuery] = useState('');
    const [isSearchingMap, setIsSearchingMap] = useState(false);
    const [mapRegion, setMapRegion] = useState({
        latitude: 19.0760, // Default to Mumbai
        longitude: 72.8777,
        latitudeDelta: 0.1,
        longitudeDelta: 0.1,
    });
    const mapRef = useRef<any>(null);

    // Step 3 State
    const [selectedImages, setSelectedImages] = useState<ImagePicker.ImagePickerAsset[]>([]);

    // Step 4 State
    const [aadhaarImage, setAadhaarImage] = useState<ImagePicker.ImagePickerAsset | null>(null);
    const [sevTwelveImage, setSevTwelveImage] = useState<ImagePicker.ImagePickerAsset | null>(null);

    React.useEffect(() => {
        const fetchExistingProperty = async () => {
            if (!id) return;
            try {
                const prop = await properties.getById(id as string);
                setTitle(prop.title || '');
                setPrice(prop.price ? prop.price.toString() : '');
                setArea(prop.area ? prop.area.toString() : '');
                setType(prop.type || '');
                setVastu(prop.vastu || '');
                setCity(prop.city || '');
                setLocation(prop.location || '');
                setDescription(prop.description || '');

                if (prop.PinLocation) {
                    const [lat, lng] = prop.PinLocation.split(',');
                    const parsedLat = parseFloat(lat);
                    const parsedLng = parseFloat(lng);
                    setPinLocation({ latitude: parsedLat, longitude: parsedLng });
                    setMapRegion({
                        latitude: parsedLat,
                        longitude: parsedLng,
                        latitudeDelta: 0.05,
                        longitudeDelta: 0.05,
                    });
                }
            } catch (error) {
                console.error('Failed to fetch property details:', error);
            } finally {
                setIsFetchingInitial(false);
            }
        };
        fetchExistingProperty();
    }, [id]);

    if (!isLoggedIn) {
        return (
            <View style={[styles.container, styles.centerContent, { paddingTop: insets.top }]}>
                <LinearGradient
                    colors={[Colors.primary, Colors.secondary]}
                    style={styles.loginPromptIcon}
                >
                    <Ionicons name="lock-closed" size={32} color="#FFF" />
                </LinearGradient>
                <Text style={styles.loginPromptTitle}>Sign In Required</Text>
                <Text style={styles.loginPromptSubtitle}>
                    You need to sign in to post a property listing
                </Text>
                <TouchableOpacity onPress={() => router.push('/(auth)/login')} activeOpacity={0.8}>
                    <LinearGradient
                        colors={[Colors.primary, Colors.primaryDark]}
                        style={styles.loginPromptButton}
                    >
                        <Text style={styles.loginPromptButtonText}>Sign In</Text>
                    </LinearGradient>
                </TouchableOpacity>
            </View>
        );
    }

    const pickImages = async (
        multiple: boolean,
        maxImages: number,
        setter: (assets: ImagePicker.ImagePickerAsset[]) => void
    ) => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsMultipleSelection: multiple,
            quality: 0.8,
            selectionLimit: maxImages,
        });

        if (!result.canceled) {
            setter(result.assets);
        }
    };

    const nextStep = () => {
        if (currentStep === 1) {
            if (!title.trim() || !price || !area || !type) {
                Alert.alert('Missing Fields', 'Please fill in all required fields (marked with *).');
                return;
            }
        } else if (currentStep === 2) {
            if (!location.trim() || !city.trim()) {
                Alert.alert('Missing Fields', 'Location and City are required.');
                return;
            }
        } else if (currentStep === 3) {
            // Edit mode: they might not select new images, so we skip this hard requirement.
        }
        setCurrentStep((prev) => Math.min(prev + 1, 4));
    };

    const prevStep = () => setCurrentStep((prev) => Math.max(prev - 1, 1));

    const handleMapSearch = async () => {
        if (!mapSearchQuery.trim()) return;
        setIsSearchingMap(true);
        try {
            const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
                mapSearchQuery
            )}&key=${ENV.googleMaps.apiKey}`;
            const response = await fetch(url);
            const data = await response.json();

            if (data.results && data.results.length > 0) {
                const { lat, lng } = data.results[0].geometry.location;
                setPinLocation({ latitude: lat, longitude: lng });

                // Animate smoothly to new region instead of fighting component state
                mapRef.current?.animateToRegion({
                    latitude: lat,
                    longitude: lng,
                    latitudeDelta: 0.05,
                    longitudeDelta: 0.05,
                }, 1000);
            } else {
                Alert.alert('Location not found', 'Please try a different search term.');
            }
        } catch (error) {
            console.error('Geocoding error:', error);
            Alert.alert('Error', 'Failed to search location.');
        } finally {
            setIsSearchingMap(false);
        }
    };

    const handleSubmit = async () => {
        setLoading(true);
        try {
            // Upload Property Images
            const uploadedIds: string[] = [];
            for (const img of selectedImages) {
                const fileName = img.uri.split('/').pop() || 'image.jpg';
                const uploaded = await images.upload(img.uri, fileName, img.mimeType || 'image/jpeg');
                uploadedIds.push(uploaded.$id);
            }

            // Upload Aadhaar (if any)
            let aadhaarUrl = '';
            if (aadhaarImage) {
                const fileName = aadhaarImage.uri.split('/').pop() || 'aadhaar.jpg';
                const uploaded = await images.upload(
                    aadhaarImage.uri,
                    fileName,
                    aadhaarImage.mimeType || 'image/jpeg'
                );
                aadhaarUrl = uploaded.$id;
            }

            // Upload 7/12 (if any)
            let sevTwelveUrl = '';
            if (sevTwelveImage) {
                const fileName = sevTwelveImage.uri.split('/').pop() || '712.jpg';
                const uploaded = await images.upload(
                    sevTwelveImage.uri,
                    fileName,
                    sevTwelveImage.mimeType || 'image/jpeg'
                );
                sevTwelveUrl = uploaded.$id;
            }

            const updatePayload: any = {
                title: title.trim(),
                price: parseFloat(price),
                area: parseFloat(area.trim()) || 0,
                location: location.trim(),
                city: city.trim(),
                type: type,
                propertyType: type,
                description: description.trim(),
                vastu: vastu.trim(),
            };

            if (uploadedIds.length > 0) updatePayload.images = uploadedIds;
            if (aadhaarUrl) updatePayload.AadharCard = [aadhaarUrl];
            if (sevTwelveUrl) updatePayload.Extract = [sevTwelveUrl];
            if (pinLocation) updatePayload.PinLocation = `${pinLocation.latitude},${pinLocation.longitude}`;

            // Update property instead of create
            await properties.update(id as string, updatePayload);

            Alert.alert('Success! 🎉', 'Your property listing has been updated.', [
                { text: 'View Listings', onPress: () => router.push('/(tabs)') },
            ]);
            setCurrentStep(1);
            setTitle('');
            setPrice('');
            setArea('');
            setLocation('');
            setCity('');
            setType('');
            setDescription('');
            setPinLocation(null);
            setVastu('');
            setSelectedImages([]);
            setAadhaarImage(null);
            setSevTwelveImage(null);
        } catch (err) {
            console.error('Post failed:', err);
            Alert.alert('Error', 'Failed to post property. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const renderStepIndicator = () => (
        <View style={styles.stepIndicatorContainer}>
            {STEPS.map((step, index) => {
                const stepNum = index + 1;
                const isActive = stepNum === currentStep;
                const isCompleted = stepNum < currentStep;

                return (
                    <View key={step} style={styles.stepItem}>
                        <View
                            style={[
                                styles.stepCircle,
                                isActive && styles.stepCircleActive,
                                isCompleted && styles.stepCircleCompleted,
                            ]}
                        >
                            {isCompleted ? (
                                <Ionicons name="checkmark" size={16} color="#FFF" />
                            ) : (
                                <Text
                                    style={[
                                        styles.stepCircleText,
                                        (isActive || isCompleted) && styles.stepCircleTextActive,
                                    ]}
                                >
                                    {stepNum}
                                </Text>
                            )}
                        </View>
                        <Text
                            style={[
                                styles.stepLabel,
                                (isActive || isCompleted) && styles.stepLabelActive,
                            ]}
                        >
                            {step}
                        </Text>
                    </View>
                );
            })}
            <View style={styles.stepConnectorBg} />
            <View
                style={[
                    styles.stepConnectorActive,
                    { width: `${((currentStep - 1) / (STEPS.length - 1)) * 100}%` },
                ]}
            />
        </View>
    );

    const renderStep1 = () => (
        <View style={styles.section}>
            <Text style={styles.sectionTitle}>Basic Details</Text>

            <Text style={styles.label}>I want to... *</Text>
            <View style={styles.grid2Col}>
                {(['For Sale', 'For Rent'] as const).map((opt) => (
                    <TouchableOpacity
                        key={opt}
                        onPress={() => setListingType(opt)}
                        style={[styles.typeOption, listingType === opt && styles.typeOptionActive]}
                    >
                        <Ionicons
                            name={opt === 'For Sale' ? 'pricetag' : 'key'}
                            size={20}
                            color={listingType === opt ? '#FFF' : Colors.primary}
                            style={{ marginBottom: 4 }}
                        />
                        <Text style={[styles.typeOptionText, listingType === opt && styles.typeOptionTextActive]}>
                            {opt}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            <Text style={styles.label}>Property Type *</Text>
            <View style={styles.typeGrid}>
                {PROPERTY_TYPES.map((t) => (
                    <TouchableOpacity
                        key={t}
                        onPress={() => setType(t)}
                        style={[styles.smallTypeOption, type === t && styles.typeOptionActive]}
                    >
                        <Text style={[styles.smallTypeOptionText, type === t && styles.typeOptionTextActive, { textTransform: 'capitalize' }]}>
                            {t}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            <Text style={styles.label}>Title *</Text>
            <TextInput
                style={styles.input}
                placeholder="e.g. 2 BHK Plot in Andheri West"
                placeholderTextColor={Colors.textMuted}
                value={title}
                onChangeText={setTitle}
            />

            <View style={styles.grid2Col}>
                <View>
                    <Text style={styles.label}>Price (₹) *</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="e.g. 5000000"
                        placeholderTextColor={Colors.textMuted}
                        value={price}
                        onChangeText={setPrice}
                        keyboardType="numeric"
                    />
                </View>
                <View>
                    <Text style={styles.label}>Area (sq.ft) *</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="e.g. 1200"
                        placeholderTextColor={Colors.textMuted}
                        value={area}
                        onChangeText={setArea}
                        keyboardType="numeric"
                    />
                </View>
            </View>

            <Text style={styles.label}>Vastu Details</Text>
            <TextInput
                style={styles.input}
                placeholder="e.g. East-facing, square shape"
                placeholderTextColor={Colors.textMuted}
                value={vastu}
                onChangeText={setVastu}
            />
        </View>
    );

    const renderStep2 = () => (
        <View style={styles.section}>
            <Text style={styles.sectionTitle}>Location Information</Text>

            <Text style={styles.label}>City *</Text>
            <TextInput
                style={styles.input}
                placeholder="e.g. Pune"
                placeholderTextColor={Colors.textMuted}
                value={city}
                onChangeText={setCity}
            />

            <Text style={styles.label}>Location / Locality *</Text>
            <TextInput
                style={styles.input}
                placeholder="e.g. Hinjawadi Phase 1"
                placeholderTextColor={Colors.textMuted}
                value={location}
                onChangeText={setLocation}
            />

            <Text style={styles.label}>Description</Text>
            <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Describe the property's surroundings, nearby amenities, etc..."
                placeholderTextColor={Colors.textMuted}
                value={description}
                onChangeText={setDescription}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
            />

            <Text style={styles.label}>Map Location (Tap to pin)</Text>

            {/* Map Search Bar */}
            <View style={styles.mapSearchContainer}>
                <Ionicons name="search" size={20} color={Colors.textMuted} style={styles.mapSearchIcon} />
                <TextInput
                    style={styles.mapSearchInput}
                    placeholder="Search an address or city..."
                    placeholderTextColor={Colors.textMuted}
                    value={mapSearchQuery}
                    onChangeText={setMapSearchQuery}
                    onSubmitEditing={handleMapSearch}
                    returnKeyType="search"
                />
                <TouchableOpacity
                    style={styles.mapSearchButton}
                    onPress={handleMapSearch}
                    disabled={isSearchingMap}
                >
                    {isSearchingMap ? (
                        <ActivityIndicator size="small" color="#FFF" />
                    ) : (
                        <Text style={styles.mapSearchButtonText}>Find</Text>
                    )}
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.mapSearchButton, { backgroundColor: Colors.secondary }]}
                    onPress={() => setPinLocation({ latitude: mapRegion.latitude, longitude: mapRegion.longitude })}
                >
                    <Ionicons name="location" size={16} color="#FFF" />
                    <Text style={[styles.mapSearchButtonText, { marginLeft: 4 }]}>Pin</Text>
                </TouchableOpacity>
            </View>

            <View style={styles.mapContainer}>
                {Platform.OS !== 'web' ? (
                    <MapView
                        ref={mapRef}
                        provider={PROVIDER_GOOGLE}
                        style={styles.map}
                        initialRegion={mapRegion}
                        onRegionChangeComplete={(r: any) => setMapRegion(r)}
                        onPress={(e: any) => setPinLocation(e.nativeEvent.coordinate)}
                    >
                        {pinLocation && (
                            <Marker
                                coordinate={pinLocation}
                                title="Property Location"
                                pinColor={Colors.primary}
                            />
                        )}
                    </MapView>
                ) : (
                    <View style={styles.webMapFallback}>
                        <Ionicons name="map" size={48} color={Colors.primary} />
                        <Text style={styles.webMapText}>Interactive Map available on Mobile App</Text>
                        <Text style={styles.webMapSubtext}>Coordinates will be captured automatically</Text>
                    </View>
                )}
            </View>
        </View>
    );

    const renderStep3 = () => (
        <View style={styles.section}>
            <Text style={styles.sectionTitle}>Property Photos</Text>
            <Text style={styles.label}>Upload up to 5 clear images of your property. *</Text>

            <View style={styles.imageGrid}>
                {selectedImages.map((img, i) => (
                    <View key={i} style={styles.imageItem}>
                        <Image source={{ uri: img.uri }} style={styles.imagePreview} />
                        <TouchableOpacity
                            style={styles.removeImage}
                            onPress={() => setSelectedImages(selectedImages.filter((_, idx) => idx !== i))}
                        >
                            <Ionicons name="close-circle" size={24} color={Colors.error} />
                        </TouchableOpacity>
                    </View>
                ))}
                {selectedImages.length < 5 && (
                    <TouchableOpacity
                        style={styles.addImageButton}
                        onPress={() =>
                            pickImages(true, 5 - selectedImages.length, (assets) =>
                                setSelectedImages((prev) => [...prev, ...assets])
                            )
                        }
                    >
                        <Ionicons name="image-outline" size={28} color={Colors.primary} />
                        <Text style={styles.addImageText}>Add</Text>
                    </TouchableOpacity>
                )}
            </View>
        </View>
    );

    const renderStep4 = () => (
        <View style={styles.section}>
            <Text style={styles.sectionTitle}>Document Verification</Text>
            <Text style={styles.label}>Upload documents to get a &quot;Verified&quot; badge and build trust with buyers.</Text>

            <View style={styles.docUploadContainer}>
                <Text style={styles.docLabel}>Aadhaar Card (Optional)</Text>
                {aadhaarImage ? (
                    <View style={styles.docPreview}>
                        <Image source={{ uri: aadhaarImage.uri }} style={styles.docImage} />
                        <TouchableOpacity style={styles.removeDocBtn} onPress={() => setAadhaarImage(null)}>
                            <Text style={styles.removeDocText}>Remove</Text>
                        </TouchableOpacity>
                    </View>
                ) : (
                    <TouchableOpacity
                        style={styles.docUploadBtn}
                        onPress={() => pickImages(false, 1, (assets) => setAadhaarImage(assets[0]))}
                    >
                        <Ionicons name="id-card-outline" size={32} color={Colors.primary} />
                        <Text style={styles.docUploadBtnText}>Upload Aadhaar Photo</Text>
                    </TouchableOpacity>
                )}
            </View>

            <View style={[styles.docUploadContainer, { marginTop: Spacing.xl }]}>
                <Text style={styles.docLabel}>7/12 Extract (Optional)</Text>
                {sevTwelveImage ? (
                    <View style={styles.docPreview}>
                        <Image source={{ uri: sevTwelveImage.uri }} style={styles.docImage} />
                        <TouchableOpacity style={styles.removeDocBtn} onPress={() => setSevTwelveImage(null)}>
                            <Text style={styles.removeDocText}>Remove</Text>
                        </TouchableOpacity>
                    </View>
                ) : (
                    <TouchableOpacity
                        style={styles.docUploadBtn}
                        onPress={() => pickImages(false, 1, (assets) => setSevTwelveImage(assets[0]))}
                    >
                        <Ionicons name="document-text-outline" size={32} color={Colors.primary} />
                        <Text style={styles.docUploadBtnText}>Upload 7/12 Photo</Text>
                    </TouchableOpacity>
                )}
            </View>
        </View>
    );

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
                keyboardShouldPersistTaps="handled"
            >
                <View style={styles.header}>
                    <Text style={styles.headerTitle}>Edit Property</Text>
                    {renderStepIndicator()}
                </View>

                {isFetchingInitial ? (
                    <View style={{ padding: Spacing.xl, alignItems: 'center' }}>
                        <ActivityIndicator size="large" color={Colors.primary} />
                        <Text style={{ marginTop: Spacing.md, color: Colors.textMuted }}>Loading your property...</Text>
                    </View>
                ) : (
                    <>
                        {currentStep === 1 && renderStep1()}
                        {currentStep === 2 && renderStep2()}
                        {currentStep === 3 && renderStep3()}
                        {currentStep === 4 && renderStep4()}
                    </>
                )}

                {/* Navigation Buttons */}
                {!isFetchingInitial && (
                    <View style={styles.navigationButtons}>
                        {currentStep > 1 && (
                            <TouchableOpacity style={styles.backButton} onPress={prevStep} disabled={loading}>
                                <Text style={styles.backButtonText}>Back</Text>
                            </TouchableOpacity>
                        )}

                        {currentStep < 4 ? (
                            <TouchableOpacity style={styles.nextButton} onPress={nextStep}>
                                <LinearGradient
                                    colors={[Colors.primary, Colors.secondary]}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 0 }}
                                    style={styles.buttonGradient}
                                >
                                    <Text style={styles.submitButtonText}>Next</Text>
                                    <Ionicons name="arrow-forward" size={20} color="#FFF" />
                                </LinearGradient>
                            </TouchableOpacity>
                        ) : (
                            <TouchableOpacity style={styles.nextButton} onPress={handleSubmit} disabled={loading}>
                                <LinearGradient
                                    colors={[Colors.success, '#10b981']}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 0 }}
                                    style={styles.buttonGradient}
                                >
                                    {loading ? (
                                        <ActivityIndicator color="#FFF" />
                                    ) : (
                                        <>
                                            <Text style={styles.submitButtonText}>Update Listing</Text>
                                            <Ionicons name="checkmark-circle" size={20} color="#FFF" />
                                        </>
                                    )}
                                </LinearGradient>
                            </TouchableOpacity>
                        )}
                    </View>
                )}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.background },
    centerContent: { justifyContent: 'center', alignItems: 'center', gap: Spacing.lg },
    scrollContent: { padding: Spacing.xl, paddingBottom: 120 },

    header: { marginBottom: Spacing.xl },
    headerTitle: { ...Typography.h1, color: Colors.text, marginBottom: Spacing.md },

    // Step Indicator
    stepIndicatorContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        position: 'relative',
        marginTop: Spacing.md,
    },
    stepItem: { alignItems: 'center', zIndex: 2, width: 60 },
    stepCircle: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: Colors.surfaceBright,
        borderWidth: 2,
        borderColor: Colors.border,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 4,
    },
    stepCircleActive: { borderColor: Colors.primary, backgroundColor: Colors.glass },
    stepCircleCompleted: { borderColor: Colors.success, backgroundColor: Colors.success },
    stepCircleText: { ...Typography.captionBold, color: Colors.textMuted },
    stepCircleTextActive: { color: Colors.text },
    stepLabel: { ...Typography.tiny, color: Colors.textMuted, textAlign: 'center' },
    stepLabelActive: { color: Colors.text, fontWeight: '600' },
    stepConnectorBg: {
        position: 'absolute',
        top: 15,
        left: 20,
        right: 20,
        height: 2,
        backgroundColor: Colors.border,
        zIndex: 1,
    },
    stepConnectorActive: {
        position: 'absolute',
        top: 15,
        left: 20,
        height: 2,
        backgroundColor: Colors.success,
        zIndex: 1,
    },

    // Forms
    section: { marginBottom: Spacing.xxl },
    sectionTitle: { ...Typography.h3, color: Colors.text, marginBottom: Spacing.lg },

    label: { ...Typography.captionBold, color: Colors.textSecondary, marginBottom: Spacing.sm, marginTop: Spacing.md },
    input: {
        backgroundColor: Colors.surfaceBright,
        borderRadius: BorderRadius.md,
        borderWidth: 1, borderColor: Colors.border,
        paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md,
        ...Typography.body, color: Colors.text,
    },
    textArea: { height: 100, textAlignVertical: 'top' },

    grid2Col: { flexDirection: 'row', gap: Spacing.md, justifyContent: 'space-between' },

    typeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
    typeOption: {
        flex: 1,
        paddingVertical: Spacing.lg,
        borderRadius: BorderRadius.md,
        backgroundColor: Colors.glass,
        borderWidth: 1, borderColor: Colors.glassBorder,
        alignItems: 'center',
    },
    smallTypeOption: {
        paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm,
        borderRadius: BorderRadius.full,
        backgroundColor: Colors.glass, borderWidth: 1, borderColor: Colors.glassBorder,
    },
    typeOptionActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
    typeOptionText: { ...Typography.captionBold, color: Colors.textSecondary },
    smallTypeOptionText: { ...Typography.caption, color: Colors.textSecondary },
    typeOptionTextActive: { color: '#FFF' },

    // Images
    imageGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.md },
    imageItem: { width: 100, height: 100, borderRadius: BorderRadius.md, overflow: 'hidden', position: 'relative' },
    imagePreview: { width: '100%', height: '100%', resizeMode: 'cover' },
    removeImage: { position: 'absolute', top: 4, right: 4 },
    addImageButton: {
        width: 100, height: 100, borderRadius: BorderRadius.md,
        backgroundColor: Colors.glass, borderWidth: 1, borderColor: Colors.glassBorder,
        justifyContent: 'center', alignItems: 'center', borderStyle: 'dashed',
    },
    addImageText: { ...Typography.tiny, color: Colors.primary, marginTop: 4 },

    // Documents
    docUploadContainer: {
        backgroundColor: Colors.surfaceBright,
        borderRadius: BorderRadius.md,
        borderWidth: 1, borderColor: Colors.border, borderStyle: 'dashed',
        padding: Spacing.lg,
    },
    docLabel: { ...Typography.captionBold, color: Colors.text, marginBottom: Spacing.sm },
    docUploadBtn: {
        alignItems: 'center', justifyContent: 'center',
        padding: Spacing.xl,
    },
    docUploadBtnText: { ...Typography.captionBold, color: Colors.primary, marginTop: Spacing.sm },
    docPreview: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        backgroundColor: Colors.surface, padding: Spacing.sm, borderRadius: BorderRadius.sm,
    },
    docImage: { width: 60, height: 60, borderRadius: BorderRadius.sm, resizeMode: 'cover' },
    removeDocBtn: { padding: Spacing.sm },
    removeDocText: { ...Typography.captionBold, color: Colors.error },

    // Navigation Buttons
    navigationButtons: {
        flexDirection: 'row',
        gap: Spacing.md,
        marginTop: Spacing.xl,
    },
    backButton: {
        flex: 1,
        height: 56,
        borderRadius: BorderRadius.lg,
        backgroundColor: Colors.surfaceBright,
        borderWidth: 1,
        borderColor: Colors.border,
        justifyContent: 'center',
        alignItems: 'center',
    },
    backButtonText: { ...Typography.bodyBold, color: Colors.text },
    nextButton: {
        flex: 2,
    },
    buttonGradient: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
        gap: Spacing.sm, height: 56, borderRadius: BorderRadius.lg,
        ...Shadows.md,
    },
    submitButtonText: { ...Typography.bodyBold, color: '#FFF', fontSize: 16 },

    // Login Prompt
    loginPromptIcon: {
        width: 80, height: 80, borderRadius: 40,
        justifyContent: 'center', alignItems: 'center',
        ...Shadows.glow,
    },
    loginPromptTitle: { ...Typography.h2, color: Colors.text },
    loginPromptSubtitle: { ...Typography.body, color: Colors.textMuted, textAlign: 'center' },
    loginPromptButton: {
        paddingHorizontal: Spacing.xxxl, paddingVertical: Spacing.lg,
        borderRadius: BorderRadius.md,
    },
    loginPromptButtonText: { ...Typography.bodyBold, color: '#FFF' },

    // Interactive Map
    mapSearchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.surfaceBright,
        borderRadius: BorderRadius.md,
        borderWidth: 1,
        borderColor: Colors.border,
        paddingHorizontal: Spacing.sm,
        marginBottom: Spacing.sm,
    },
    mapSearchIcon: {
        marginRight: Spacing.xs,
    },
    mapSearchInput: {
        flex: 1,
        height: 48,
        ...Typography.body,
        color: Colors.text,
    },
    mapSearchButton: {
        backgroundColor: Colors.primary,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.sm,
        borderRadius: BorderRadius.sm,
        marginLeft: Spacing.xs,
    },
    mapSearchButtonText: {
        ...Typography.captionBold,
        color: '#FFF',
    },
    mapContainer: {
        height: 250,
        borderRadius: BorderRadius.md,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: Colors.border,
        marginTop: Spacing.xs,
    },
    map: { flex: 1 },
    webMapFallback: {
        flex: 1, backgroundColor: Colors.surfaceBright,
        justifyContent: 'center', alignItems: 'center', padding: Spacing.lg,
    },
    webMapText: { ...Typography.bodyBold, color: Colors.text, marginTop: Spacing.md },
    webMapSubtext: { ...Typography.caption, color: Colors.textMuted, marginTop: Spacing.xs },
});
