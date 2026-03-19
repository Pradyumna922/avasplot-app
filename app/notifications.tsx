// ============================================================================
// 🔔 NOTIFICATIONS SCREEN
// ============================================================================
'use no memo';

import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNotifications } from '../src/context/NotificationContext';
import { BorderRadius, Colors, Spacing, Typography } from '../src/theme';

export default function NotificationsScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { notifications, markAllRead, markAsRead } = useNotifications();
    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            {/* Header */}
            <View style={styles.headerRow}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} activeOpacity={0.7}>
                    <Ionicons name="arrow-back" size={24} color={Colors.text} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Notifications</Text>
                <TouchableOpacity onPress={markAllRead} style={styles.markReadBtn} activeOpacity={0.7}>
                    <Ionicons name="checkmark-done-outline" size={24} color={Colors.primary} />
                </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                {notifications.length === 0 ? (
                    <View style={styles.emptyState}>
                        <Ionicons name="notifications-off-outline" size={48} color={Colors.textMuted} />
                        <Text style={styles.emptyTitle}>No notifications yet</Text>
                        <Text style={styles.emptySub}>We'll notify you when something important happens.</Text>
                    </View>
                ) : (
                    notifications.map(note => (
                        <TouchableOpacity
                            key={note.id}
                            style={[styles.noteCard, !note.read && styles.noteCardUnread]}
                            activeOpacity={0.7}
                            onPress={() => markAsRead(note.id)}
                        >
                            <View style={[styles.iconWrap, { backgroundColor: `${note.color}15` }]}>
                                <Ionicons name={note.icon as any} size={20} color={note.color} />
                            </View>
                            <View style={styles.noteContent}>
                                <View style={styles.noteHeader}>
                                    <Text style={[styles.noteTitle, !note.read && styles.noteTitleUnread]}>{note.title}</Text>
                                    <Text style={styles.noteTime}>{note.time}</Text>
                                </View>
                                <Text style={styles.noteMsg} numberOfLines={2}>{note.message}</Text>
                            </View>
                            {!note.read && <View style={styles.unreadDot} />}
                        </TouchableOpacity>
                    ))
                )}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
    },
    headerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: Spacing.xl,
        paddingVertical: Spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: Colors.glassBorder,
        backgroundColor: Colors.surface,
    },
    backBtn: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'flex-start',
    },
    headerTitle: {
        ...Typography.h2,
        color: Colors.text,
    },
    markReadBtn: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'flex-end',
    },
    scrollContent: {
        padding: Spacing.xl,
        paddingBottom: 80,
    },
    emptyState: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 100,
        gap: Spacing.md,
    },
    emptyTitle: {
        ...Typography.h3,
        color: Colors.text,
    },
    emptySub: {
        ...Typography.body,
        color: Colors.textMuted,
        textAlign: 'center',
    },
    noteCard: {
        flexDirection: 'row',
        backgroundColor: Colors.surface,
        borderRadius: BorderRadius.lg,
        padding: Spacing.lg,
        marginBottom: Spacing.md,
        borderWidth: 1,
        borderColor: Colors.glassBorder,
        alignItems: 'flex-start',
    },
    noteCardUnread: {
        backgroundColor: 'rgba(16, 185, 129, 0.03)',
        borderColor: 'rgba(16, 185, 129, 0.3)',
    },
    iconWrap: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: Spacing.md,
    },
    noteContent: {
        flex: 1,
    },
    noteHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 4,
    },
    noteTitle: {
        ...Typography.bodyBold,
        color: Colors.textSecondary,
    },
    noteTitleUnread: {
        color: Colors.text,
    },
    noteTime: {
        ...Typography.tiny,
        color: Colors.textMuted,
    },
    noteMsg: {
        ...Typography.caption,
        color: Colors.textSecondary,
        lineHeight: 18,
    },
    unreadDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: Colors.primary,
        marginLeft: Spacing.sm,
        marginTop: 6,
    },
});
