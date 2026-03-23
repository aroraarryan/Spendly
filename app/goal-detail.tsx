import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, RefreshControl, Alert } from 'react-native';
import { Stack, useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useThemeColors } from '@/hooks/useThemeColors';
import { useSavingsStore } from '@/store/savingsStore';
import NeoCard from '@/components/ui/NeoCard';
import NeoButton from '@/components/ui/NeoButton';
import GoalProgressCircle from '@/components/savings/GoalProgressCircle';
import GoalTimeline from '@/components/savings/GoalTimeline';
import ContributionRow from '@/components/savings/ContributionRow';
import QuickContributionButtons from '@/components/savings/QuickContributionButtons';
import GoalCompletedCelebration from '@/components/savings/GoalCompletedCelebration';
import EmptyState from '@/components/shared/EmptyState';
import { haptic } from '@/utils/haptics';
import { formatIndianNumber, calculateMonthlyNeeded, formatGoalDeadline } from '@/utils/financialHelpers';
import { useSettingsStore } from '@/store/settingsStore';
import { generateGoalStrategy, buildExpenseContext, handleGeminiError } from '@/services/aiService';

export default function GoalDetailScreen() {
    const { goalId } = useLocalSearchParams<{ goalId: string }>();
    const colors = useThemeColors();
    const insets = useSafeAreaInsets();
    const router = useRouter();
    const { currencySymbol } = useSettingsStore();
    
    const { 
        getGoalById, 
        loadContributions, 
        getGoalContributions, 
        deleteGoal, 
        updateGoal,
        addContribution,
        loadGoals,
        deleteContribution
    } = useSavingsStore();
    
    const [refreshing, setRefreshing] = useState(false);
    const [showCelebration, setShowCelebration] = useState(false);
    const [aiAdvice, setAiAdvice] = useState<string | null>(null);
    const [isAiLoading, setIsAiLoading] = useState(false);

    const goal = getGoalById(goalId);
    const contributions = getGoalContributions(goalId);

    useEffect(() => {
        if (goalId) {
            loadContributions(goalId);
        }
    }, [goalId]);

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        if (goalId) {
            await Promise.all([loadGoals(), loadContributions(goalId)]);
        }
        setRefreshing(false);
    }, [goalId, loadGoals, loadContributions]);

    if (!goal) return null;

    const percentage = Math.min(100, (goal.saved_amount / goal.target_amount) * 100);
    const remaining = Math.max(0, goal.target_amount - goal.saved_amount);
    const isCompleted = goal.is_completed || percentage >= 100;
    const monthlyNeeded = calculateMonthlyNeeded(goal.target_amount, goal.saved_amount, goal.target_date || null);

    // Initial celebration check
    useEffect(() => {
        if (isCompleted && !goal.is_completed) {
            setShowCelebration(true);
        }
    }, [isCompleted, goal.is_completed]);

    const handleDelete = () => {
        Alert.alert(
            "Delete Goal",
            `Are you sure you want to delete "${goal.name}"? This will also delete all contribution history.`,
            [
                { text: "Cancel", style: "cancel" },
                { 
                    text: "Delete", 
                    style: "destructive", 
                    onPress: async () => {
                        await deleteGoal(goal.id);
                        router.back();
                    } 
                }
            ]
        );
    };

    const handleQuickAdd = async (amount: number) => {
        haptic.medium();
        await addContribution({
            goal_id: goal.id,
            amount,
            date: new Date().toISOString(),
            note: 'Quick add'
        });
        // Recalculate if it hit 100%
        if (goal.saved_amount + amount >= goal.target_amount) {
            setShowCelebration(true);
        }
    };

    const handleDeleteContribution = async (id: string) => {
        Alert.alert(
            "Delete Contribution",
            "Are you sure you want to remove this contribution?",
            [
                { text: "Cancel", style: "cancel" },
                { 
                    text: "Delete", 
                    style: "destructive", 
                    onPress: async () => {
                        await deleteContribution(id, goal.id);
                        haptic.light();
                    } 
                }
            ]
        );
    };

    const getAiStrategy = async () => {
        haptic.medium();
        setIsAiLoading(true);
        try {
            const context = buildExpenseContext(new Date().getMonth() + 1, new Date().getFullYear());
            const strategy = await generateGoalStrategy(goal, context);
            setAiAdvice(strategy);
            haptic.success();
        } catch (error) {
            const errorMessage = handleGeminiError(error);
            Alert.alert("Error", errorMessage);
        } finally {
            setIsAiLoading(false);
        }
    };

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <Stack.Screen 
                options={{
                    headerTitle: 'Goal Details',
                    headerLeft: () => (
                        <TouchableOpacity onPress={() => router.back()} style={styles.headerBtn}>
                            <Ionicons name="chevron-back" size={24} color={colors.text} />
                        </TouchableOpacity>
                    ),
                    headerRight: () => (
                        <TouchableOpacity onPress={handleDelete} style={styles.headerBtn}>
                            <Ionicons name="trash-outline" size={22} color="#FF6B6B" />
                        </TouchableOpacity>
                    ),
                    headerShadowVisible: false,
                    headerStyle: { backgroundColor: colors.background }
                }} 
            />

            <ScrollView 
                showsVerticalScrollIndicator={false}
                contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 40 }]}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.accent} />
                }
            >
                {/* Header Section */}
                <View style={styles.headerSection}>
                    <GoalProgressCircle 
                        percentage={percentage} 
                        savedAmount={goal.saved_amount} 
                        color={goal.color} 
                        size={180}
                        strokeWidth={14}
                    />
                    
                    <Text style={[styles.targetLabel, { color: colors.textSecondary }]}>
                        Target: {currencySymbol}{formatIndianNumber(goal.target_amount).replace('₹', '')}
                    </Text>
                    <Text style={[styles.goalName, { color: colors.text }]}>
                        {goal.icon} {goal.name}
                    </Text>
                </View>

                {/* Quick Add Row */}
                {!isCompleted && (
                    <QuickContributionButtons onSelect={handleQuickAdd} />
                )}

                {/* Stats Grid */}
                <View style={styles.statsGrid}>
                    <NeoCard style={styles.statBox}>
                        <Text style={[styles.statLabel, { color: colors.textMuted }]}>REMAINING</Text>
                        <Text style={[styles.statValue, { color: colors.text }]}>
                            {currencySymbol}{formatIndianNumber(remaining).replace('₹', '')}
                        </Text>
                    </NeoCard>
                    <NeoCard style={styles.statBox}>
                        <Text style={[styles.statLabel, { color: colors.textMuted }]}>DEADLINE</Text>
                        <Text style={[styles.statValue, { color: colors.text }]}>
                            {formatGoalDeadline(goal.target_date || null)}
                        </Text>
                    </NeoCard>
                </View>

                {/* AI Insight Box */}
                {monthlyNeeded && !isCompleted && (
                    <NeoCard style={[styles.aiCard, { backgroundColor: `${colors.accent}08`, borderColor: `${colors.accent}20` }]}>
                        <View style={styles.aiHeader}>
                            <Ionicons name="sparkles" size={18} color={colors.accent} />
                            <Text style={[styles.aiTitle, { color: colors.accent }]}>AI Insight</Text>
                        </View>
                        <Text style={[styles.aiText, { color: colors.textSecondary }]}>
                            To reach this goal by {formatGoalDeadline(goal.target_date || null)}, you should save 
                            <Text style={{ fontWeight: '700', color: colors.text }}> {currencySymbol}{formatIndianNumber(monthlyNeeded).replace('₹', '')} </Text> 
                            monthly.
                        </Text>
                    </NeoCard>
                )}

                {/* Timeline Component */}
                {goal.target_date && (
                    <GoalTimeline 
                        createdAt={goal.created_at || new Date().toISOString()}
                        targetDate={goal.target_date}
                        savedAmount={goal.saved_amount}
                        targetAmount={goal.target_amount}
                    />
                )}

                {/* History Section */}
                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: colors.text }]}>Contribution History</Text>
                    {contributions.length === 0 ? (
                        <EmptyState
                            type="analytics"
                            title="No contributions yet"
                            message="Add some money to this goal to see it grow!"
                            onAction={() => router.push({ pathname: '/modals/add-contribution', params: { goalId: goal.id } })}
                            actionLabel="Add Money"
                        />
                    ) : (
                        <NeoCard style={styles.historyCard}>
                            {contributions.map((c, index) => (
                                <ContributionRow 
                                    key={c.id} 
                                    contribution={c} 
                                    goalName={goal.name}
                                    isLast={index === contributions.length - 1}
                                    onDelete={handleDeleteContribution}
                                />
                            ))}
                        </NeoCard>
                    )}
                </View>

                {/* AI Advisor Button */}
                <View style={[styles.section, { alignItems: 'center' }]}>
                    {aiAdvice ? (
                        <NeoCard style={styles.aiAdviceCard}>
                            <View style={styles.aiAdviceHeader}>
                                <Ionicons name="sparkles" size={20} color="#7B61FF" />
                                <Text style={styles.aiAdviceTitle}>AI Smart Strategy</Text>
                            </View>
                            <Text style={styles.aiAdviceText}>{aiAdvice}</Text>
                            <TouchableOpacity onPress={() => setAiAdvice(null)} style={{ marginTop: 16 }}>
                                <Text style={{ color: 'rgba(255, 255, 255, 0.5)', fontSize: 12, textAlign: 'center' }}>Dismiss Strategy</Text>
                            </TouchableOpacity>
                        </NeoCard>
                    ) : (
                        <NeoButton 
                            label="✨ Get AI Goal Strategy" 
                            variant="secondary"
                            onPress={getAiStrategy}
                            loading={isAiLoading}
                            style={{ width: '100%' }}
                        />
                    )}
                </View>

                {/* Actions */}
                <View style={styles.footerActions}>
                    {!isCompleted && (
                        <NeoButton 
                            label="Add Contribution" 
                            onPress={() => router.push({ pathname: '/modals/add-contribution', params: { goalId: goal.id } })}
                            style={styles.fullBtn}
                        />
                    )}
                    <NeoButton 
                        label="Edit Goal" 
                        variant="secondary"
                        onPress={() => router.push({ pathname: '/modals/add-goal', params: { editId: goal.id } })}
                        style={styles.fullBtn}
                    />
                </View>
            </ScrollView>

            {/* Celebration Overlay */}
            <GoalCompletedCelebration
                goal={goal}
                isVisible={showCelebration}
                onComplete={async () => {
                    await updateGoal(goal.id, { is_completed: 1, completed_at: new Date().toISOString() });
                    setShowCelebration(false);
                    haptic.success();
                }}
                onDismiss={() => setShowCelebration(false)}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    headerBtn: {
        padding: 4,
        marginHorizontal: 8,
    },
    scrollContent: {
        paddingHorizontal: 20,
        paddingTop: 20,
    },
    headerSection: {
        alignItems: 'center',
        marginBottom: 32,
    },
    targetLabel: {
        fontSize: 14,
        fontWeight: '600',
        marginTop: 20,
    },
    goalName: {
        fontSize: 24,
        fontWeight: '800',
        marginTop: 8,
    },
    statsGrid: {
        flexDirection: 'row',
        gap: 12,
        marginVertical: 16,
    },
    statBox: {
        flex: 1,
        padding: 16,
    },
    statLabel: {
        fontSize: 10,
        fontWeight: '700',
        letterSpacing: 0.5,
        marginBottom: 8,
    },
    statValue: {
        fontSize: 16,
        fontWeight: '700',
    },
    aiCard: {
        padding: 16,
        marginBottom: 16,
        borderWidth: 1,
    },
    aiHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    aiTitle: {
        fontSize: 13,
        fontWeight: '700',
        marginLeft: 6,
    },
    aiText: {
        fontSize: 14,
        lineHeight: 20,
    },
    section: {
        marginTop: 32,
        marginBottom: 20,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '800',
        marginBottom: 16,
    },
    historyCard: {
        paddingHorizontal: 16,
    },
    footerActions: {
        marginTop: 16,
        gap: 12,
    },
    fullBtn: {
        width: '100%',
    },
    aiAdviceCard: {
        width: '100%',
        padding: 24,
        borderRadius: 20,
        backgroundColor: '#1E1B2E',
        borderWidth: 1.5,
        borderColor: '#7B61FF',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 5,
        marginTop: 10,
    },
    aiAdviceHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
        gap: 8,
    },
    aiAdviceTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#7B61FF',
        marginLeft: 8,
    },
    aiAdviceText: {
        fontSize: 15,
        lineHeight: 24,
        color: '#FFFFFF',
        fontWeight: '400',
    }
});
