// ============================================================================
// 🔌 APPWRITE SERVICE LAYER FOR REACT NATIVE
// ============================================================================

import { Account, Client, Databases, ID, Query, Storage } from 'appwrite';
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
        return account.createEmailPasswordSession(email, password);
    },

    async signup(email: string, password: string, name: string) {
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

export const properties = {
    async getAll(limit: number = 25, offset: number = 0) {
        const response = await databases.listDocuments(DB, COLL.plots, [
            Query.orderDesc('$createdAt'),
            Query.limit(limit),
            Query.offset(offset),
        ]);
        return {
            documents: response.documents as unknown as Property[],
            total: response.total,
        };
    },

    async getById(id: string) {
        const doc = await databases.getDocument(DB, COLL.plots, id);
        return doc as unknown as Property;
    },

    async search(query: string, filters?: {
        type?: string;
        minPrice?: number;
        maxPrice?: number;
    }) {
        const queries = [Query.orderDesc('$createdAt'), Query.limit(25)];

        if (query) {
            queries.push(Query.search('title', query));
        }
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
        return {
            documents: response.documents as unknown as Property[],
            total: response.total,
        };
    },

    async create(data: Partial<Property>) {
        return databases.createDocument(DB, COLL.plots, ID.unique(), data);
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
        // react-native-appwrite accepts objects with uri/name/type/size
        const file = {
            uri,
            name: name || `image_${Date.now()}.jpg`,
            type: type || 'image/jpeg',
            size: 0,
        };
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return storage.createFile(BUCKET.images, ID.unique(), file as any);
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
