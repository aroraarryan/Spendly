import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, LayoutAnimation } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import Animated, { useSharedValue, useAnimatedStyle, withTiming } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { useEventStore } from '@/store/eventStore';
import { useExpenseStore } from '@/store/expenseStore';
import { useThemeColors } from '@/hooks/useThemeColors';
import { useSettingsStore } from '@/store/settingsStore';
import { haptic } from '@/utils/haptics';
import FAB from '@/components/shared/FAB';
import EmptyState from '@/components/shared/EmptyState';
import { Skeleton } from '@/components/shared/Skeleton';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import EventCardComponent from '@/components/events/EventCard';

export default function EventsScreen() {
    const colors = useThemeColors();
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { currencySymbol } = useSettingsStore();

    // Selectors - grab raw arrays
    const events = useEventStore(state => state.events);
    const expenses = useExpenseStore(state => state.expenses);

    const [isLoading, setIsLoading] = useState(true);
    const [isPastExpanded, setIsPastExpanded] = useState(false);
    const rotation = useSharedValue(0);

    // Filter events locally with useMemo to ensure stable references
    const activeEventsList = useMemo(() => {
        const today = new Date().toISOString().split('T')[0];
        return events.filter(e => e.end_date >= today).map(event => {
            const eventExpenses = expenses.filter(ex => ex.event_id === event.id);
            const totalSpent = eventExpenses.reduce((sum, ex) => sum + ex.amount, 0);
            return {
                ...event,
                totalSpent,
                expenseCount: eventExpenses.length
            };
        });
    }, [events, expenses]);

    const pastEventsList = useMemo(() => {
        const today = new Date().toISOString().split('T')[0];
        return events.filter(e => e.end_date < today).map(event => {
            const eventExpenses = expenses.filter(ex => ex.event_id === event.id);
            const totalSpent = eventExpenses.reduce((sum, ex) => sum + ex.amount, 0);
            return {
                ...event,
                totalSpent,
                expenseCount: eventExpenses.length
            };
        });
    }, [events, expenses]);

    useEffect(() => {
        // Remove artificial delay for a faster initial load
        setIsLoading(false);
    }, []);

    const togglePastEvents = () => {
        haptic.light();
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        const nextState = !isPastExpanded;
        setIsPastExpanded(nextState);
        rotation.value = withTiming(nextState ? 180 : 0, { duration: 300 });
    };

    const chevronStyle = useAnimatedStyle(() => ({
        transform: [{ rotate: `${rotation.value}deg` }]
    }));

    const renderHeader = () => (
        <View style={[styles.header, { paddingTop: insets.top + 16, backgroundColor: colors.background }]}>
            <View>
                <Text style={{ fontSize: 28, fontWeight: '800', color: colors.text }}>Dreaming Big</Text>
                <Text style={{ fontSize: 13, fontWeight: '500', color: colors.textMuted, marginTop: 2, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                    Your active goals
                </Text>
            </View>

            <TouchableOpacity
                onPress={() => { haptic.medium(); router.push('/modals/add-event'); }}
                style={[styles.addBtn, { backgroundColor: colors.surface2 }]}
            >
                <Ionicons name="add" size={24} color={colors.accent} />
            </TouchableOpacity>
        </View>
    );

    const renderLoadingState = () => (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
            <View style={styles.section}>
                <Skeleton width={120} height={20} style={{ marginBottom: 16 }} />
                {[1, 2].map(i => (
                    <Skeleton key={i} width="100%" height={160} borderRadius={24} style={{ marginBottom: 16 }} />
                ))}
            </View>
        </ScrollView>
    );

    return (
        <View style={{ flex: 1, backgroundColor: colors.background }}>
            <Stack.Screen options={{ headerShown: false }} />

            {renderHeader()}

            {isLoading ? renderLoadingState() : (
                <ScrollView
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.scrollContent}
                >
                    <View style={styles.section}>
                        {activeEventsList.length > 0 && (
                            <View style={[styles.smartSuggestCard, { backgroundColor: colors.accentLight }]}>
                                <View style={styles.smartSuggestHeader}>
                                    <Ionicons name="sparkles" size={16} color={colors.accent} />
                                    <Text style={[styles.smartSuggestTitle, { color: colors.accent }]}>Smart Suggest</Text>
                                </View>
                                <Text style={[styles.smartSuggestText, { color: colors.text }]}>
                                    Add {currencySymbol}2,400 to hit your next goal early.
                                </Text>
                            </View>
                        )}
                        <Text style={[styles.sectionTitle, { color: colors.text }]}>Active Events</Text>
                        {activeEventsList.length === 0 ? (
                            <EmptyState
                                type="events"
                                title="No active events"
                                message="Create an event to track budgets for trips, parties, or projects."
                                onAction={() => { haptic.medium(); router.push('/modals/add-event'); }}
                                actionLabel="Create Event"
                            />
                        ) : (
                            activeEventsList.map(event => (
                                <EventCardComponent
                                    key={event.id}
                                    event={event}
                                    totalSpent={event.totalSpent}
                                    expenseCount={event.expenseCount}
                                    onPress={() => { haptic.light(); router.push({ pathname: '/event-detail', params: { id: event.id } }); }}
                                />
                            ))
                        )}
                    </View>

                    <View style={[styles.section, { marginTop: 32 }]}>
                        <TouchableOpacity
                            style={styles.collapsibleHeader}
                            onPress={togglePastEvents}
                            activeOpacity={0.7}
                        >
                            <Text style={[styles.sectionTitle, { color: colors.text, marginBottom: 0 }]}>Past Events</Text>
                            <Animated.View style={chevronStyle}>
                                <Ionicons name="chevron-down" size={24} color={colors.textSecondary} />
                            </Animated.View>
                        </TouchableOpacity>

                        {isPastExpanded && (
                            <View style={{ marginTop: 16 }}>
                                {pastEventsList.length === 0 ? (
                                    <EmptyState
                                        type="generic"
                                        title="No past events yet"
                                        message="Completed events will appear here."
                                        emoji="📦"
                                    />
                                ) : (
                                    pastEventsList.map(event => (
                                        <EventCardComponent
                                            key={event.id}
                                            event={event}
                                            totalSpent={event.totalSpent}
                                            expenseCount={event.expenseCount}
                                            onPress={() => { haptic.light(); router.push({ pathname: '/event-detail', params: { id: event.id } }); }}
                                        />
                                    ))
                                )}
                            </View>
                        )}
                    </View>
                </ScrollView>
            )}

            <FAB onPress={() => { haptic.medium(); router.push('/modals/add-event'); }} icon="calendar-outline" />
        </View>
    );
}

const styles = StyleSheet.create({
    header: {
        paddingHorizontal: 20,
        paddingBottom: 16,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between'
    },
    addBtn: {
        width: 44,
        height: 44,
        borderRadius: 22,
        alignItems: 'center',
        justifyContent: 'center'
    },
    scrollContent: {
        padding: 20,
        paddingBottom: 100
    },
    section: {
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 16,
    },
    collapsibleHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 16,
        paddingVertical: 8,
    },
    smartSuggestCard: {
        borderRadius: 16,
        padding: 16,
        marginBottom: 24,
    },
    smartSuggestHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    smartSuggestTitle: {
        fontSize: 12,
        fontWeight: '700',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
        marginLeft: 6,
    },
    smartSuggestText: {
        fontSize: 15,
        fontWeight: '500',
        lineHeight: 22,
    }
});
