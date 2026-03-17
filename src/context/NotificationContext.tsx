// ============================================================================
// 🔔 NOTIFICATION CONTEXT
// ============================================================================
import React, { createContext, useContext, useState } from 'react';

export interface NotificationItem {
    id: string;
    type: string;
    title: string;
    message: string;
    time: string;
    read: boolean;
    icon: string;
    color: string;
}

const mockNotifications: NotificationItem[] = [
    {
        id: '1',
        type: 'alert',
        title: 'Price Drop Alert',
        message: 'A property you favorited in Sector 15 has dropped its price!',
        time: '2 hours ago',
        read: false,
        icon: 'trending-down-outline',
        color: '#10B981',
    },
    {
        id: '2',
        type: 'system',
        title: 'Welcome to Avasplot!',
        message: 'Complete your profile to unlock all citizen features.',
        time: 'Yesterday',
        read: true,
        icon: 'star-outline',
        color: '#F59E0B',
    },
    {
        id: '3',
        type: 'update',
        title: 'New AI Features',
        message: 'Try our new instant Vastu analysis tool for plots.',
        time: 'Oct 12',
        read: true,
        icon: 'sparkles-outline',
        color: '#3B82F6',
    }
];

export interface NotificationContextType {
    notifications: NotificationItem[];
    markAllRead: () => void;
    markAsRead: (id: string) => void;
    unreadCount: number;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: React.ReactNode }) {
    const [notifications, setNotifications] = useState<NotificationItem[]>(mockNotifications);

    const markAllRead = () => {
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    };

    const markAsRead = (id: string) => {
        setNotifications(prev => prev.map(n => (n.id === id ? { ...n, read: true } : n)));
    };

    const unreadCount = notifications.filter(n => !n.read).length;

    return (
        <NotificationContext.Provider value={{ notifications, markAllRead, markAsRead, unreadCount }}>
            {children}
        </NotificationContext.Provider>
    );
}

export function useNotifications() {
    const context = useContext(NotificationContext);
    if (context === undefined) {
        throw new Error('useNotifications must be used within a NotificationProvider');
    }
    return context;
}
