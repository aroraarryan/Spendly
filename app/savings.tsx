import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, RefreshControl, LayoutAnimation } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useThemeColors } from '@/hooks/useThemeColors';
import { useSavingsStore } from '@/store/savingsStore';
import NeoCard from '@/components/ui/NeoCard';
import NeoButton from '@/components/ui/NeoButton';
import NeoBadge from '@/components/ui/NeoBadge';
import GoalCard from '@/components/savings/GoalCard';
import EmptyState from '@/components/shared/EmptyState';
import { haptic } from '@/utils/haptics';
import { formatIndianNumber } from '@/utils/financialHelpers';
import { useSettingsStore } from '@/store/settingsStore';

export default function SavingsScreen() {
    const colors = useThemeColors();
    const insets = useSafeAreaInsets();
    const router = useRouter();
    const { currencySymbol } = useSettingsStore();
    
    const { goals, loadGoals, isLoading, getTotalSavedAllGoals } = useSavingsStore();
    const [refreshing, setRefreshing] = useState(false);
    const [completedExpanded, setCompletedExpanded] = useState(false);

    useEffect(() => {
        loadGoals();
    }, []);

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        await loadGoals();
        setRefreshing(false);
    }, [loadGoals]);

    const activeGoals = goals.filter(g => !g.is_completed).sort((a, b) => {
        if (!a.target_date) return 1;
        if (!b.target_date) return -1;
        return new Date(a.target_date).getTime() - new Date(b.target_date).getTime();
    });

    const completedGoals = goals.filter(g => g.is_completed).sort((a, b) => 
        new Date(b.completed_at || 0).getTime() - new Date(a.completed_at || 0).getTime()
    );

    const toggleCompleted = () => {
        haptic.light();
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setCompletedExpanded(!completedExpanded);
    };

    const totalSaved = getTotalSavedAllGoals();

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <Stack.Screen 
                options={{
                    headerTitle: 'Savings Goals',
                    headerLeft: () => (
                        <TouchableOpacity onPress={() => router.back()} style={styles.headerBtn}>
                            <Ionicons name="chevron-back" size={24} color={colors.text} />
                        </TouchableOpacity>
                    ),
                    headerRight: () => (
                        <NeoButton 
                            label="+ New Goal" 
                            variant="secondary" 
                            size="sm" 
                            onPress={() => router.push('/modals/add-goal')}
                        />
                    ),
                    headerShadowVisible: false,
                    headerStyle: { backgroundColor: colors.background }
                }} 
            />

            <ScrollView 
                showsVerticalScrollIndicator={false}
                contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 100 }]}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.accent} />
                }
            >
                {/* Summary Stats Row */}
                <View style={styles.statsRow}>
                    <NeoCard style={[styles.statCard, { backgroundColor: '#F3F0FF' }]}>
                        <View style={[styles.iconCircle, { backgroundColor: '#7C3AED' }]}>
                            <Text style={styles.icon}>💰</Text>
                        </View>
                        <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Total Saved</Text>
                        <Text style={[styles.statValue, { color: colors.text }]}>
                            {currencySymbol}{formatIndianNumber(totalSaved).replace('₹', '')}
                        </Text>
                    </NeoCard>
                    
                    <NeoCard style={[styles.statCard, { backgroundColor: '#EBFBEE' }]}>
                        <View style={[styles.iconCircle, { backgroundColor: '#2B8A3E' }]}>
                            <Text style={styles.icon}>🎯</Text>
                        </View>
                        <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Active Goals</Text>
                        <Text style={[styles.statValue, { color: colors.text }]}>{activeGoals.length}</Text>
                    </NeoCard>
                    
                    <NeoCard style={[styles.statCard, { backgroundColor: '#FFF9DB' }]}>
                        <View style={[styles.iconCircle, { backgroundColor: '#F08C00' }]}>
                            <Text style={styles.icon}>✅</Text>
                        </View>
                        <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Completed</Text>
                        <Text style={[styles.statValue, { color: colors.text }]}>{completedGoals.length}</Text>
                    </NeoCard>
                </View>

                {/* Active Goals Section */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text style={[styles.sectionTitle, { color: colors.text }]}>Active Goals</Text>
                        <NeoBadge label={activeGoals.length.toString()} variant="primary" />
                    </View>

                    {activeGoals.length === 0 ? (
                        <EmptyState
                            type="analytics"
                            title="No savings goals yet"
                            message="Create your first goal to start saving for what matters."
                            onAction={() => router.push('/modals/add-goal')}
                            actionLabel="Create Goal"
                        />
                    ) : (
                        activeGoals.map(goal => (
                            <GoalCard 
                                key={goal.id}
                                goal={goal}
                                onPress={() => router.push({ pathname: '/goal-detail', params: { goalId: goal.id } })}
                                onAddMoney={() => router.push({ pathname: '/modals/add-contribution', params: { goalId: goal.id } })}
                                onViewDetails={() => router.push({ pathname: '/goal-detail', params: { goalId: goal.id } })}
                            />
                        ))
                    )}
                </View>

                {/* Completed Goals Section */}
                {completedGoals.length > 0 && (
                    <View style={styles.section}>
                        <TouchableOpacity style={styles.sectionHeader} onPress={toggleCompleted}>
                            <View style={styles.row}>
                                <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>Completed</Text>
                                <Ionicons 
                                    name={completedExpanded ? "chevron-up" : "chevron-down"} 
                                    size={16} 
                                    color={colors.textMuted} 
                                    style={{ marginLeft: 8 }}
                                />
                            </View>
                        </TouchableOpacity>

                        {completedExpanded && (
                            <View style={styles.completedList}>
                                {completedGoals.map(goal => (
                                    <GoalCard 
                                        key={goal.id}
                                        goal={goal}
                                        onPress={() => router.push({ pathname: '/goal-detail', params: { goalId: goal.id } })}
                                        onAddMoney={() => haptic.warning()}
                                        onViewDetails={() => router.push({ pathname: '/goal-detail', params: { goalId: goal.id } })}
                                    />
                                ))}
                            </View>
                        )}
                    </View>
                )}
            </ScrollView>

            <TouchableOpacity 
                style={[styles.fab, { backgroundColor: colors.accent, bottom: insets.bottom + 20 }]}
                onPress={() => {
                    haptic.medium();
                    router.push('/modals/add-goal');
                }}
            >
                <Ionicons name="add" size={32} color="white" />
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    headerBtn: {
        padding: 4,
    },
    scrollContent: {
        paddingHorizontal: 20,
        paddingTop: 16,
    },
    statsRow: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 32,
    },
    statCard: {
        flex: 1,
        padding: 12,
        alignItems: 'center',
    },
    iconCircle: {
        width: 32,
        height: 32,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 8,
    },
    icon: {
        fontSize: 16,
    },
    statLabel: {
        fontSize: 10,
        fontWeight: '600',
        textTransform: 'uppercase',
        marginBottom: 4,
        textAlign: 'center',
    },
    statValue: {
        fontSize: 15,
        fontWeight: '800',
    },
    section: {
        marginBottom: 32,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '800',
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    completedList: {
        opacity: 0.85,
    },
    fab: {
        position: 'absolute',
        right: 20,
        width: 56,
        height: 56,
        borderRadius: 28,
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
    }
});
