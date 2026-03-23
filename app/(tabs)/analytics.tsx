import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { Stack, useFocusEffect, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useExpenseStore } from '@/store/expenseStore';
import { useSettingsStore } from '@/store/settingsStore';
import { useCategoryStore } from '@/store/categoryStore';
import { useThemeColors } from '@/hooks/useThemeColors';
import { haptic } from '@/utils/haptics';
import {
    getMonthlyExpenses,
    groupExpensesByCategory,
    getDaysElapsed,
    formatAmount,
    getLast6MonthsTotals
} from '@/utils/analyticsHelpers';

import SummaryStatCard from '@/components/analytics/SummaryStatCard';
import DonutChart from '@/components/analytics/DonutChart';
import DailyBarChart from '@/components/analytics/DailyBarChart';
import MonthlyTrendChart from '@/components/analytics/MonthlyTrendChart';
import TopCategoriesList from '@/components/analytics/TopCategoriesList';
import EmptyState from '@/components/shared/EmptyState';
import { Skeleton } from '@/components/shared/Skeleton';
import ErrorBoundary from '@/components/shared/ErrorBoundary';
import IncomeExpenseChart from '@/components/analytics/IncomeExpenseChart';

export default function AnalyticsScreen() {
    const colors = useThemeColors();
    const router = useRouter();
    const insets = useSafeAreaInsets();

    // Selectors
    const expenses = useExpenseStore(state => state.expenses);
    const categories = useCategoryStore(state => state.categories);
    const currencySymbol = useSettingsStore(state => state.currencySymbol);

    const [currentMonth, setCurrentMonth] = useState(new Date().getMonth() + 1);
    const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
    const [isLoading, setIsLoading] = useState(true);
    const [focusKey, setFocusKey] = useState(0);

    // Re-animate charts on tab focus
    useFocusEffect(
        useCallback(() => {
            setFocusKey(prev => prev + 1);
        }, [])
    );

    useEffect(() => {
        // Remove artificial delay for a faster initial load
        setIsLoading(false);
    }, []);

    const monthExpenses = useMemo(() => {
        return getMonthlyExpenses(expenses, currentMonth, currentYear);
    }, [expenses, currentMonth, currentYear]);

    const stats = useMemo(() => {
        const total = monthExpenses.reduce((sum, e) => sum + e.amount, 0);
        const count = monthExpenses.length;
        const daysElapsed = getDaysElapsed(currentMonth, currentYear);
        const dailyAvg = total / daysElapsed;
        return { total, count, dailyAvg };
    }, [monthExpenses, currentMonth, currentYear]);

    const categoryStats = useMemo(() => {
        const grouped = groupExpensesByCategory(monthExpenses);
        return Object.entries(grouped).map(([categoryId, data]) => {
            const cat = categories.find(c => c.id === categoryId);
            return {
                id: categoryId,
                name: cat?.name || 'Unknown',
                icon: cat?.icon || '💰',
                color: cat?.color || colors.accent,
                total: data.total,
                count: data.count,
                percentage: stats.total > 0 ? data.total / stats.total : 0
            };
        }).sort((a, b) => b.total - a.total);
    }, [monthExpenses, categories, stats.total]);

    const sixMonthTrend = useMemo(() => {
        return getLast6MonthsTotals(expenses);
    }, [expenses]);

    const changeMonth = (offset: number) => {
        haptic.light();
        let m = currentMonth + offset;
        let y = currentYear;

        if (m < 1) {
            m = 12;
            y -= 1;
        } else if (m > 12) {
            m = 1;
            y += 1;
        }

        const now = new Date();
        const selected = new Date(y, m - 1);
        const earliest = new Date(now.getFullYear(), now.getMonth() - 12);

        if (selected > now) return;
        if (selected < earliest) return;

        setCurrentMonth(m);
        setCurrentYear(y);
    };

    const isCurrentMonth = currentMonth === new Date().getMonth() + 1 && currentYear === new Date().getFullYear();

    const renderLoadingState = () => (
        <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 16, paddingBottom: 100 }}
        >
            <View style={styles.statsRow}>
                <Skeleton width="31%" height={100} borderRadius={16} />
                <Skeleton width="31%" height={100} borderRadius={16} style={{ marginHorizontal: '3.5%' }} />
                <Skeleton width="31%" height={100} borderRadius={16} />
            </View>
            <View style={styles.section}>
                <Skeleton width={150} height={20} style={{ marginBottom: 20 }} />
                <Skeleton width="100%" height={280} borderRadius={24} />
            </View>
            <View style={styles.section}>
                <Skeleton width={120} height={20} style={{ marginBottom: 20 }} />
                <View style={{ gap: 12 }}>
                    {[1, 2, 3, 4].map(i => (
                        <Skeleton key={i} width="100%" height={60} borderRadius={12} />
                    ))}
                </View>
            </View>
        </ScrollView>
    );

    return (
        <View style={{ flex: 1, backgroundColor: colors.background }}>
            <Stack.Screen options={{ headerShown: false }} />

            {/* Header */}
            <View
                style={{
                    paddingTop: insets.top + 16,
                    paddingHorizontal: 20,
                    paddingBottom: 16,
                    backgroundColor: colors.background,
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                }}
            >
                <View>
                    <Text style={{ fontSize: 28, fontWeight: '800', color: colors.text }}>Analytics</Text>
                    <Text style={{ fontSize: 13, fontWeight: '500', color: colors.textMuted, marginTop: 2, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                        {new Date(currentYear, currentMonth - 1).toLocaleString('default', { month: 'long', year: 'numeric' })}
                    </Text>
                </View>

                <View style={{ flexDirection: 'row', gap: 8 }}>
                    <TouchableOpacity
                        onPress={() => changeMonth(-1)}
                        style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: colors.surface2, alignItems: 'center', justifyContent: 'center' }}
                    >
                        <Ionicons name="chevron-back" size={20} color={colors.textSecondary} />
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={() => changeMonth(1)}
                        disabled={isCurrentMonth}
                        style={{
                            width: 40,
                            height: 40,
                            borderRadius: 20,
                            backgroundColor: colors.surface2,
                            alignItems: 'center',
                            justifyContent: 'center',
                            opacity: isCurrentMonth ? 0.3 : 1
                        }}
                    >
                        <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
                    </TouchableOpacity>
                </View>
            </View>

            {isLoading ? renderLoadingState() : (
                <ScrollView
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 16, paddingBottom: 100 }}
                >
                    {/* Stats Row */}
                    <View style={styles.statsRow}>
                        <SummaryStatCard
                            icon="wallet-outline"
                            label="Total Spent"
                            value={formatAmount(stats.total, currencySymbol)}
                            iconBgColor={`${colors.accent}15`}
                        />
                        <SummaryStatCard
                            icon="receipt-outline"
                            label="Transactions"
                            value={stats.count.toString()}
                            iconBgColor={`${colors.success}15`}
                        />
                        <SummaryStatCard
                            icon="calendar-outline"
                            label="Daily Avg"
                            value={formatAmount(stats.dailyAvg, currencySymbol)}
                            iconBgColor={`${colors.warning}15`}
                        />
                    </View>

                    {monthExpenses.length === 0 ? (
                        <View style={{ marginTop: 40 }}>
                            <EmptyState
                                type="analytics"
                                title="No spending data"
                                message="Add expenses to see your breakdown"
                                onAction={() => router.push('/(tabs)/')}
                                actionLabel="Go to Home"
                            />
                        </View>
                    ) : (
                        <View key={`analytics-data-${focusKey}`}>
                            <View style={styles.section}>
                                <Text style={[styles.sectionTitle, { color: colors.text }]}>Spending by Category</Text>
                                <DonutChart
                                    expenses={monthExpenses}
                                    categories={categories}
                                    currencySymbol={currencySymbol}
                                    month={currentMonth}
                                    year={currentYear}
                                />
                            </View>

                            <View style={styles.section}>
                                <Text style={[styles.sectionTitle, { color: colors.text }]}>Income vs Expenses</Text>
                                <IncomeExpenseChart />
                            </View>

                            <View style={styles.section}>
                                <Text style={[styles.sectionTitle, { color: colors.text }]}>Daily Spending</Text>
                                <DailyBarChart
                                    expenses={monthExpenses}
                                    month={currentMonth}
                                    year={currentYear}
                                />
                            </View>

                            <View style={styles.section}>
                                <Text style={[styles.sectionTitle, { color: colors.text }]}>6 Month Trend</Text>
                                <MonthlyTrendChart monthlyTotals={sixMonthTrend} />
                            </View>

                            <View style={styles.section}>
                                <Text style={[styles.sectionTitle, { color: colors.text }]}>Top Categories</Text>
                                <TopCategoriesList
                                    categories={categoryStats}
                                    total={stats.total}
                                    currencySymbol={currencySymbol}
                                    month={currentMonth}
                                    year={currentYear}
                                />
                            </View>
                        </View>
                    )}
                </ScrollView>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    statsRow: {
        flexDirection: 'row',
        marginHorizontal: -4,
        marginBottom: 32,
    },
    section: {
        marginBottom: 40,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 20,
    },
});
