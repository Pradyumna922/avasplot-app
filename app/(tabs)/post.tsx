// ============================================================================
// ➕ POST PROPERTY SCREEN — Property Listing Creation
// ============================================================================

import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../../src/context/AuthContext';
import { images, properties } from '../../src/services/appwrite';
import { BorderRadius, Colors, Shadows, Spacing, Typography } from '../../src/theme';
import { PROPERTY_TYPES } from '../../src/types';

export default function PostScreen() {
    const { user, isLoggedIn, prefs } = useAuth();
    const router = useRouter();
    const insets = useSafeAreaInsets();

    const [title, setTitle] = useState('');
    const [price, setPrice] = useState('');
    const [area, setArea] = useState('');
    const [location, setLocation] = useState('');
    const [type, setType] = useState('');
    const [description, setDescription] = useState('');
    const [vastu, setVastu] = useState('');
    const [selectedImages, setSelectedImages] = useState<ImagePicker.ImagePickerAsset[]>([]);
    const [loading, setLoading] = useState(false);

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

    const pickImages = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsMultipleSelection: true,
            quality: 0.8,
            selectionLimit: 5,
        });

        if (!result.canceled) {
            setSelectedImages([...selectedImages, ...result.assets].slice(0, 5));
        }
    };

    const removeImage = (index: number) => {
        setSelectedImages(selectedImages.filter((_, i) => i !== index));
    };

    const handleSubmit = async () => {
        if (!title.trim() || !price || !area || !location.trim() || !type) {
            Alert.alert('Missing Fields', 'Please fill in all required fields.');
            return;
        }

        setLoading(true);
        try {
            // Upload images
            const uploadedIds: string[] = [];
            for (const img of selectedImages) {
                const fileName = img.uri.split('/').pop() || 'image.jpg';
                const uploaded = await images.upload(img.uri, fileName, img.mimeType || 'image/jpeg');
                uploadedIds.push(uploaded.$id);
            }

            // Create property
            await properties.create({
                title: title.trim(),
                price: parseFloat(price),
                area: area.trim(),
                location: location.trim(),
                type,
                description: description.trim(),
                vastu: vastu.trim(),
                images: uploadedIds,
                sellerName: user?.name || '',
                email: user?.email || '',
                mobile: prefs.phone || '',
            });

            Alert.alert('Success! 🎉', 'Your property has been listed.', [
                { text: 'View Listings', onPress: () => router.push('/(tabs)') },
            ]);

            // Reset form
            setTitle('');
            setPrice('');
            setArea('');
            setLocation('');
            setType('');
            setDescription('');
            setVastu('');
            setSelectedImages([]);
        } catch (err) {
            console.error('Post failed:', err);
            Alert.alert('Error', 'Failed to post property. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
                keyboardShouldPersistTaps="handled"
            >
                {/* Header */}
                <View style={styles.header}>
                    <Text style={styles.headerTitle}>Post Property</Text>
                    <Text style={styles.headerSubtitle}>List your property for thousands to see</Text>
                </View>

                {/* Image Picker */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Photos</Text>
                    <View style={styles.imageGrid}>
                        {selectedImages.map((img, i) => (
                            <View key={i} style={styles.imageItem}>
                                <Image source={{ uri: img.uri }} style={styles.imagePreview} />
                                <TouchableOpacity style={styles.removeImage} onPress={() => removeImage(i)}>
                                    <Ionicons name="close-circle" size={24} color={Colors.error} />
                                </TouchableOpacity>
                            </View>
                        ))}
                        {selectedImages.length < 5 && (
                            <TouchableOpacity style={styles.addImageButton} onPress={pickImages}>
                                <Ionicons name="camera-outline" size={28} color={Colors.primary} />
                                <Text style={styles.addImageText}>Add</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                </View>

                {/* Property Details */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Property Details</Text>

                    <Text style={styles.label}>Title *</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="e.g. 2 BHK Flat in Andheri West"
                        placeholderTextColor={Colors.textMuted}
                        value={title}
                        onChangeText={setTitle}
                    />

                    <Text style={styles.label}>Price (₹) *</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="e.g. 5000000"
                        placeholderTextColor={Colors.textMuted}
                        value={price}
                        onChangeText={setPrice}
                        keyboardType="numeric"
                    />

                    <Text style={styles.label}>Area (sq.ft) *</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="e.g. 1200"
                        placeholderTextColor={Colors.textMuted}
                        value={area}
                        onChangeText={setArea}
                        keyboardType="numeric"
                    />

                    <Text style={styles.label}>Location *</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="e.g. Mumbai, Maharashtra"
                        placeholderTextColor={Colors.textMuted}
                        value={location}
                        onChangeText={setLocation}
                    />

                    <Text style={styles.label}>Property Type *</Text>
                    <View style={styles.typeGrid}>
                        {PROPERTY_TYPES.map((t) => (
                            <TouchableOpacity
                                key={t}
                                onPress={() => setType(t)}
                                style={[styles.typeOption, type === t && styles.typeOptionActive]}
                            >
                                <Text style={[styles.typeOptionText, type === t && styles.typeOptionTextActive]}>
                                    {t}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    <Text style={styles.label}>Description</Text>
                    <TextInput
                        style={[styles.input, styles.textArea]}
                        placeholder="Describe your property..."
                        placeholderTextColor={Colors.textMuted}
                        value={description}
                        onChangeText={setDescription}
                        multiline
                        numberOfLines={4}
                        textAlignVertical="top"
                    />

                    <Text style={styles.label}>Vastu Details</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="e.g. East-facing, positive energy"
                        placeholderTextColor={Colors.textMuted}
                        value={vastu}
                        onChangeText={setVastu}
                    />
                </View>

                {/* Submit */}
                <TouchableOpacity onPress={handleSubmit} disabled={loading} activeOpacity={0.8}>
                    <LinearGradient
                        colors={[Colors.primary, Colors.secondary]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={styles.submitButton}
                    >
                        {loading ? (
                            <ActivityIndicator color="#FFF" />
                        ) : (
                            <>
                                <Ionicons name="cloud-upload" size={20} color="#FFF" />
                                <Text style={styles.submitButtonText}>Publish Listing</Text>
                            </>
                        )}
                    </LinearGradient>
                </TouchableOpacity>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.background },
    centerContent: { justifyContent: 'center', alignItems: 'center', gap: Spacing.lg },
    scrollContent: { padding: Spacing.xl, paddingBottom: 120 },

    header: { marginBottom: Spacing.xxl },
    headerTitle: { ...Typography.h1, color: Colors.text },
    headerSubtitle: { ...Typography.caption, color: Colors.textMuted },

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

    section: { marginBottom: Spacing.xxl },
    sectionTitle: { ...Typography.h3, color: Colors.text, marginBottom: Spacing.lg },

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

    label: { ...Typography.captionBold, color: Colors.textSecondary, marginBottom: Spacing.sm, marginTop: Spacing.md },
    input: {
        backgroundColor: Colors.surfaceBright,
        borderRadius: BorderRadius.md,
        borderWidth: 1, borderColor: Colors.border,
        paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md,
        ...Typography.body, color: Colors.text,
    },
    textArea: { height: 100, textAlignVertical: 'top' },

    typeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
    typeOption: {
        paddingHorizontal: Spacing.lg, paddingVertical: Spacing.sm,
        borderRadius: BorderRadius.full,
        backgroundColor: Colors.glass, borderWidth: 1, borderColor: Colors.glassBorder,
    },
    typeOptionActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
    typeOptionText: { ...Typography.captionBold, color: Colors.textSecondary },
    typeOptionTextActive: { color: '#FFF' },

    submitButton: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
        gap: Spacing.md, height: 56, borderRadius: BorderRadius.lg,
        marginTop: Spacing.lg, ...Shadows.lg,
    },
    submitButtonText: { ...Typography.bodyBold, color: '#FFF', fontSize: 16 },
});
