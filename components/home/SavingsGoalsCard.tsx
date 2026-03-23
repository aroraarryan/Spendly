import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useThemeColors } from '@/hooks/useThemeColors';
import NeoCard from '@/components/ui/NeoCard';
import NeoBadge from '@/components/ui/NeoBadge';
import { useSavingsStore } from '@/store/savingsStore';
import GoalProgressBar from '../savings/GoalProgressBar';

export default function SavingsGoalsCardHome() {
    const colors = useThemeColors();
    const router = useRouter();
    const { goals } = useSavingsStore();

    const activeGoals = goals.filter(g => !g.is_completed).sort((a, b) => {
        const percA = (a.saved_amount / a.target_amount);
        const percB = (b.saved_amount / b.target_amount);
        return percB - percA; // Sort by closest to completion
    });

    const displayGoals = activeGoals.slice(0, 3);

    return (
        <NeoCard style={styles.container}>
            <View style={styles.header}>
                <View style={styles.headerTitle}>
                    <Text style={[styles.label, { color: colors.textSecondary }]}>🎯 Savings Goals</Text>
                    {activeGoals.length > 0 && (
                        <NeoBadge label={`${activeGoals.length} active`} variant="primary" style={styles.badge} />
                    )}
                </View>
                <TouchableOpacity onPress={() => router.push('/savings')}>
                    <Text style={[styles.seeAll, { color: colors.accent }]}>See All</Text>
                </TouchableOpacity>
            </View>

            {displayGoals.length === 0 ? (
                <TouchableOpacity onPress={() => router.push('/modals/add-goal')}>
                    <Text style={[styles.emptyText, { color: colors.accent }]}>
                        + Create your first savings goal
                    </Text>
                </TouchableOpacity>
            ) : (
                <View style={styles.goalsList}>
                    {displayGoals.map((goal) => {
                        const percentage = (goal.saved_amount / goal.target_amount) * 100;
                        return (
                            <TouchableOpacity 
                                key={goal.id} 
                                style={styles.goalRow}
                                onPress={() => router.push({ pathname: '/goal-detail', params: { goalId: goal.id } })}
                            >
                                <View style={styles.goalMeta}>
                                    <View style={styles.goalNameRow}>
                                        <Text style={styles.emoji}>{goal.icon}</Text>
                                        <Text style={[styles.goalName, { color: colors.text }]} numberOfLines={1}>
                                            {goal.name}
                                        </Text>
                                    </View>
                                    <Text style={[styles.percentage, { color: colors.textSecondary }]}>
                                        {Math.round(percentage)}%
                                    </Text>
                                </View>
                                <GoalProgressBar 
                                    percentage={percentage} 
                                    color={goal.color} 
                                    height={6} 
                                    showText={false} 
                                />
                            </TouchableOpacity>
                        );
                    })}
                </View>
            )}
        </NeoCard>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: 16,
        marginBottom: 16,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    headerTitle: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    label: {
        fontSize: 13,
        fontWeight: '700',
    },
    badge: {
        marginLeft: 8,
    },
    seeAll: {
        fontSize: 13,
        fontWeight: '600',
    },
    emptyText: {
        fontSize: 14,
        fontWeight: '600',
        textAlign: 'center',
        paddingVertical: 12,
    },
    goalsList: {
        gap: 16,
    },
    goalRow: {
        width: '100%',
    },
    goalMeta: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 6,
    },
    goalNameRow: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    emoji: {
        fontSize: 14,
        marginRight: 8,
    },
    goalName: {
        fontSize: 14,
        fontWeight: '600',
    },
    percentage: {
        fontSize: 12,
        fontWeight: '700',
        marginLeft: 12,
    },
});
