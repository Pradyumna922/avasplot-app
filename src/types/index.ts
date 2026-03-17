// ============================================================================
// 📦 AVASPLOT TYPE DEFINITIONS
// ============================================================================

export interface Property {
    $id: string;
    title: string;
    price: number;
    area: number;
    type: string;
    location: string;
    city?: string;
    description?: string;
    vastu?: string;
    verified?: boolean;
    images?: string[];

    // Mapped from DB images to match exact schema
    landmark?: string;
    PinLocation?: string;
    userId?: string;
    documents?: string[];
    AadharCard?: string[];
    ai_summary?: string;
    ai_forecast?: string;
    state?: string;
    pincode?: string;
    status?: string;
    views?: number;
    favorites?: number;
    propertyType?: string;
    amenities?: string[];
    propertyId?: string;
    Extract?: string[];
    owner_id?: string[];
    owner_name?: string;

    // Document Verification UI URLs
    aadhaar_url?: string;
    sev_twelve_url?: string;

    latitude?: number;
    longitude?: number;
    $collectionId?: string;
    $databaseId?: string;
    $createdAt?: string;
    $updatedAt?: string;
    $permissions?: string[];
    mobile?: string;
    sellerName?: string;
    email?: string;
}

// ============================================================================
// 🎭 ROLE SYSTEM
// ============================================================================

export type UserRole =
    | 'broker'
    | 'developer'
    | 'architect'
    | 'mentor'
    | 'lawyer'
    | 'surveyor'
    | 'vastu'
    | 'buyer'
    | 'investor'
    | 'admin';

export const ROLE_LABELS: Record<UserRole, string> = {
    broker: 'Real Estate Broker',
    developer: 'Developer',
    architect: 'Architect & Designer',
    mentor: 'Wealth & Income Mentor',
    lawyer: 'Legal Advisor (Lawyer)',
    surveyor: 'Land Surveyor',
    vastu: 'Vastu Consultant',
    buyer: 'Property Buyer',
    investor: 'Real Estate Investor',
    admin: 'Administrator',
};

export const ROLE_ICONS: Record<UserRole, string> = {
    broker: '🏠',
    developer: '🏗️',
    architect: '📐',
    mentor: '💰',
    lawyer: '⚖️',
    surveyor: '📏',
    vastu: '🧭',
    buyer: '🏠',
    investor: '📈',
    admin: '👑',
};

export const ROLE_COLORS: Record<UserRole, string> = {
    broker: '#10B981',
    developer: '#3B82F6',
    architect: '#8B5CF6',
    mentor: '#F59E0B',
    lawyer: '#64748B',
    surveyor: '#F97316',
    vastu: '#14B8A6',
    buyer: '#6366F1',
    investor: '#06B6D4',
    admin: '#EF4444',
};

// ============================================================================
// 📋 LEAD MANAGEMENT
// ============================================================================

export type LeadStatus = 'pending' | 'accepted' | 'rejected' | 'completed';

export interface Lead {
    $id: string;
    fromUserId: string;
    fromUserName: string;
    fromUserRole: UserRole;
    toUserId: string;
    toUserName: string;
    toUserRole: UserRole;
    clientName: string;
    clientPhone: string;
    pincode: string;
    propertyType?: string;
    budget?: string;
    message: string;
    status: LeadStatus;
    $createdAt?: string;
    $updatedAt?: string;
}

export const LEAD_STATUS_COLORS: Record<LeadStatus, { bg: string; text: string }> = {
    pending: { bg: '#FEF3C7', text: '#B45309' },
    accepted: { bg: '#D1FAE5', text: '#047857' },
    rejected: { bg: '#FEE2E2', text: '#B91C1C' },
    completed: { bg: '#DBEAFE', text: '#1D4ED8' },
};

// ============================================================================
// 👤 USER & PROFILE
// ============================================================================

export interface UserPrefs {
    plan?: string;
    isScout?: boolean;
    isPartner?: boolean;
    phone?: string;
    phone_verified?: boolean;
    email_verified?: boolean;
    role?: UserRole;
    onboarded?: boolean;
    pincodes?: string;
    avatarUrl?: string;
    [key: string]: unknown;
}

export interface DashboardProfile {
    $id?: string;
    userId: string;
    name: string;
    role: UserRole;
    phone: string;
    email: string;
    pincodes: string[];
    company?: string;
    rera?: string;
    address?: string;
    specialization?: string;
    $createdAt?: string;
    $updatedAt?: string;
}

// ============================================================================
// 🏷️ PROPERTY TYPES & FILTERS
// ============================================================================

export const PROPERTY_TYPES = [
    'residential',
    'commercial',
    'agricultural',
    'industrial',
    'farm house',
    'flat / apartment',
    'villa',
    'office space',
    'shop / showroom',
    'warehouse',
] as const;

export interface SearchFilters {
    query: string;
    type: string;
    minPrice: number;
    maxPrice: number;
    sortBy: 'newest' | 'price_low' | 'price_high' | 'area';
}
