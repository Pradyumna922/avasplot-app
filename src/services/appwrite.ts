// ============================================================================
// 🔌 APPWRITE SERVICE LAYER FOR REACT NATIVE
// ============================================================================

import { Account, Client, Databases, ID, Query, Storage, Permission, Role } from 'appwrite';
import { Platform } from 'react-native';
import { ENV } from '../config/env';
import { Lead, Property, UserPrefs, UserRole } from '../types';

// Initialize Appwrite client
const client = new Client();
client
    .setEndpoint(ENV.appwrite.endpoint)
    .setProject(ENV.appwrite.projectId);

const account = new Account(client);
const databases = new Databases(client);
const storage = new Storage(client);

const DB = ENV.appwrite.databaseId;
const COLL = ENV.appwrite.collections;
const BUCKET = ENV.appwrite.buckets;

// ============================================================================
// 🔐 AUTHENTICATION
// ============================================================================

export const auth = {
    async login(email: string, password: string) {
        try {
            await account.deleteSession('current');
        } catch { /* ignore if no session */ }
        return account.createEmailPasswordSession(email, password);
    },

    async signup(email: string, password: string, name: string) {
        try {
            await account.deleteSession('current');
        } catch { /* ignore if no session */ }

        await account.create(ID.unique(), email, password, name);
        return account.createEmailPasswordSession(email, password);
    },

    async logout() {
        try {
            await account.deleteSession('current');
        } catch {
            // Session might already be expired
        }
    },

    async getUser() {
        try {
            return await account.get();
        } catch {
            return null;
        }
    },

    async getSession() {
        try {
            return await account.getSession('current');
        } catch {
            return null;
        }
    },

    async updatePrefs(prefs: Partial<UserPrefs>) {
        const current = await account.getPrefs();
        return account.updatePrefs({ ...current, ...prefs });
    },

    async getPrefs(): Promise<UserPrefs> {
        const user = await account.get();
        return (user.prefs || {}) as UserPrefs;
    },

    async sendPasswordReset(email: string) {
        return account.createRecovery(email, 'https://avasplot.com/reset-password');
    },
};

// ============================================================================
// 🏠 PROPERTY OPERATIONS
// ============================================================================

function mapProperty(doc: any): Property {
    let lat: number | undefined;
    let lng: number | undefined;

    // Parse '19.4208897,72.8193' into respective float coordinates
    if (doc.PinLocation && typeof doc.PinLocation === 'string') {
        const parts = doc.PinLocation.split(',');
        if (parts.length >= 2) {
            lat = parseFloat(parts[0].trim());
            lng = parseFloat(parts[1].trim());
        }
    }

    return {
        ...doc,
        // Override with parsed PinLocation if valid, else fall back to explicit lat/lng or undefined
        latitude: lat !== undefined && !isNaN(lat) ? lat : doc.latitude,
        longitude: lng !== undefined && !isNaN(lng) ? lng : doc.longitude,
    } as Property;
}

export const properties = {
    async getAll(limit: number = 25, offset: number = 0) {
        const response = await databases.listDocuments(DB, COLL.plots, [
            Query.orderDesc('$createdAt'),
            Query.limit(limit),
            Query.offset(offset),
        ]);
        return {
            documents: response.documents.map(mapProperty),
            total: response.total,
        };
    },

    async getById(id: string) {
        const doc = await databases.getDocument(DB, COLL.plots, id);
        return mapProperty(doc);
    },

    async search(query: string, filters?: {
        type?: string;
        minPrice?: number;
        maxPrice?: number;
        vastu?: string;
        minArea?: number;
        maxArea?: number;
    }) {
        // Increase limit since we are filtering locally to bypass Appwrite missing index errors
        const queries = [Query.orderDesc('$createdAt'), Query.limit(100)];

        if (filters?.type) {
            queries.push(Query.equal('type', filters.type));
        }
        if (filters?.minPrice) {
            queries.push(Query.greaterThanEqual('price', filters.minPrice));
        }
        if (filters?.maxPrice) {
            queries.push(Query.lessThanEqual('price', filters.maxPrice));
        }

        const response = await databases.listDocuments(DB, COLL.plots, queries);
        let docs = response.documents.map(mapProperty);

        // Perform robust client-side multi-attribute search to bypass DB index requirements
        let filteredDocs = docs;
        if (query) {
            const lowerQuery = query.toLowerCase().trim();
            const keywords = lowerQuery.split(/\s+/);

            filteredDocs = filteredDocs.filter(doc => {
                const searchableText = `
                    ${doc.title || ''} 
                    ${doc.location || ''} 
                    ${doc.city || ''} 
                `.toLowerCase();
                return keywords.every(kw => searchableText.includes(kw));
            });
        }

        // Apply advanced numerical bounds and strict matching
        if (filters) {
            filteredDocs = filteredDocs.filter(doc => {
                let matchesVastu = !filters.vastu || doc.vastu === filters.vastu;
                let matchesArea = true;
                if (filters.minArea) matchesArea = matchesArea && doc.area >= filters.minArea;
                if (filters.maxArea) matchesArea = matchesArea && doc.area <= filters.maxArea;
                return matchesVastu && matchesArea;
            });
        }

        return {
            documents: filteredDocs,
            total: filteredDocs.length,
        };
    },

    async getByUser(userId: string) {
        const response = await databases.listDocuments(DB, COLL.plots, [
            Query.equal('userId', userId),
            Query.orderDesc('$createdAt')
        ]);
        return {
            documents: response.documents.map(mapProperty),
            total: response.total,
        };
    },

    async create(data: Partial<Property>) {
        return databases.createDocument(
            DB,
            COLL.plots,
            ID.unique(),
            data,
            [
                Permission.read(Role.any()),                  // Anyone can view
                Permission.update(Role.user(data.userId!)),   // Only owner can edit
                Permission.delete(Role.user(data.userId!)),   // Only owner can delete
            ]
        );
    },

    async update(id: string, data: Partial<Property>) {
        return databases.updateDocument(DB, COLL.plots, id, data);
    },

    async delete(id: string) {
        // Delete associated images first
        try {
            const doc = await databases.getDocument(DB, COLL.plots, id);
            const images = (doc as unknown as Property).images || [];
            for (const imgId of images) {
                try {
                    await storage.deleteFile(BUCKET.images, imgId);
                } catch { /* ignore */ }
            }
        } catch { /* ignore */ }
        return databases.deleteDocument(DB, COLL.plots, id);
    },

    /**
     * Extract actual file ID from a value that might be a full Appwrite URL
     * or a raw file ID. URLs look like:
     * https://sgp.cloud.appwrite.io/v1/storage/buckets/images/files/{fileId}/view?...
     */
    extractFileId(value: string): string {
        if (value.startsWith('http')) {
            const match = value.match(/\/files\/([^/]+)\//);
            return match ? match[1] : value;
        }
        return value;
    },

    getImageUrl(fileId: string) {
        const realId = this.extractFileId(fileId);
        return storage.getFilePreview(BUCKET.images, realId, 800, 600);
    },

    getImageThumbnail(fileId: string) {
        const realId = this.extractFileId(fileId);
        return storage.getFilePreview(BUCKET.images, realId, 400, 300);
    },
};

// ============================================================================
// 📸 IMAGE UPLOAD
// ============================================================================

export const images = {
    async upload(uri: string, name: string, type: string) {
        try {
            if (Platform.OS === 'web') {
                // The pure JS web SDK strictly requires a Blob/File object to construct form-data securely
                const response = await fetch(uri);
                const blob = await response.blob();
                const fileObj = new File([blob], name || `image_${Date.now()}.jpg`, {
                    type: type || 'image/jpeg'
                });
                return await storage.createFile(BUCKET.images, ID.unique(), fileObj);
            } else {
                // Native Mobile: Bypass the incompatible Appwrite JS SDK File validation constraint
                // We use pure React Native `fetch` with FormData directly to the Appwrite REST API
                const url = `${ENV.appwrite.endpoint}/storage/buckets/${BUCKET.images}/files`;
                const fileId = ID.unique();
                const nativeUri = Platform.OS === 'android' ? uri : uri.replace('file://', '');

                const formData = new FormData();
                formData.append('fileId', fileId);
                // @ts-ignore - React Native FormData accepts an object with uri, name, type
                formData.append('file', {
                    uri: nativeUri,
                    name: name || `image_${Date.now()}.jpg`,
                    type: type || 'image/jpeg',
                });
                // Adding global read permissions for public access
                formData.append('permissions[]', 'read("any")');

                // Get current session for authenticated upload
                let authHeaders = {};
                try {
                    const sessionParams = await account.getSession('current');
                    if (sessionParams && sessionParams.providerAccessToken) {
                        authHeaders = { 'X-Appwrite-JWT': sessionParams.providerAccessToken };
                    }
                } catch (e) {
                    // Ignore, we will rely on cookie fallback or standard anon if allowed
                }

                const response = await fetch(url, {
                    method: 'POST',
                    headers: {
                        'X-Appwrite-Project': ENV.appwrite.projectId,
                        ...authHeaders,
                        // Not setting 'Content-Type' manually allows React Native to calculate multipart boundary
                    },
                    body: formData,
                });

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.message || 'File upload failed');
                }

                return data;
            }
        } catch (error) {
            console.error('Appwrite Upload Error:', error);
            throw error;
        }
    },
};

// ============================================================================
// 👤 PROFILE MANAGEMENT
// ============================================================================

export const profiles = {
    async get(userId: string) {
        try {
            const response = await databases.listDocuments(DB, COLL.profiles, [
                Query.equal('userId', userId),
                Query.limit(1),
            ]);
            return response.documents[0] || null;
        } catch {
            return null;
        }
    },

    async createOrUpdate(userId: string, data: Record<string, unknown>) {
        const existing = await this.get(userId);
        if (existing) {
            return databases.updateDocument(DB, COLL.profiles, existing.$id, data);
        }
        return databases.createDocument(DB, COLL.profiles, ID.unique(), {
            userId,
            ...data,
        });
    },
};

// ============================================================================
// 📋 LEAD MANAGEMENT
// ============================================================================

export const leads = {
    async create(data: Partial<Lead>) {
        return databases.createDocument(DB, COLL.leads, ID.unique(), data);
    },

    async getReceived(userId: string) {
        const response = await databases.listDocuments(DB, COLL.leads, [
            Query.equal('toUserId', userId),
            Query.orderDesc('$createdAt'),
            Query.limit(50),
        ]);
        return response.documents as unknown as Lead[];
    },

    async getSent(userId: string) {
        const response = await databases.listDocuments(DB, COLL.leads, [
            Query.equal('fromUserId', userId),
            Query.orderDesc('$createdAt'),
            Query.limit(50),
        ]);
        return response.documents as unknown as Lead[];
    },

    async updateStatus(leadId: string, status: string) {
        return databases.updateDocument(DB, COLL.leads, leadId, { status });
    },
};

// ============================================================================
// 🎭 USER DISCOVERY
// ============================================================================

export const users = {
    async getByPincode(pincode: string, role?: UserRole) {
        const queries = [
            Query.search('pincodes', pincode),
            Query.limit(25),
        ];
        if (role) {
            queries.push(Query.equal('role', role));
        }
        const response = await databases.listDocuments(DB, COLL.profiles, queries);
        return response.documents;
    },

    async getByRole(role: UserRole) {
        const response = await databases.listDocuments(DB, COLL.profiles, [
            Query.equal('role', role),
            Query.limit(25),
        ]);
        return response.documents;
    },
};

// ============================================================================
// 💳 SUBSCRIPTIONS
// ============================================================================

export const subscriptions = {
    async get(userId: string) {
        try {
            const response = await databases.listDocuments(DB, COLL.subscriptions, [
                Query.equal('userId', userId),
                Query.orderDesc('$createdAt'),
                Query.limit(1),
            ]);
            return response.documents[0] || null;
        } catch {
            return null;
        }
    },
};

// ============================================================================
// 🛠️ UTILITIES
// ============================================================================

export function formatPrice(price: number): string {
    if (price >= 10000000) return `₹${(price / 10000000).toFixed(2)} Cr`;
    if (price >= 100000) return `₹${(price / 100000).toFixed(2)} L`;
    if (price >= 1000) return `₹${(price / 1000).toFixed(1)}K`;
    return `₹${price}`;
}

export function formatArea(area: number | string): string {
    const num = typeof area === 'string' ? parseFloat(area) : area;
    if (isNaN(num)) return String(area);
    return `${num.toLocaleString()} sq.ft`;
}

export function timeAgo(dateStr: string): string {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 30) return `${days}d ago`;
    return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
}

export function formatWhatsAppNumber(phone: string): string {
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length === 10) return `91${cleaned}`;
    return cleaned;
}
