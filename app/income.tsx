import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, RefreshControl } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useThemeColors } from '@/hooks/useThemeColors';
import { useIncomeStore } from '@/store/incomeStore';
import { useExpenseStore } from '@/store/expenseStore';
import MonthlySummaryCard from '@/components/income/MonthlySummaryCard';
import IncomeRow from '@/components/income/IncomeRow';
import SourceCard from '@/components/income/SourceCard';
import EmptyState from '@/components/shared/EmptyState';
import { haptic } from '@/utils/haptics';

export default function IncomeScreen() {
    const colors = useThemeColors();
    const insets = useSafeAreaInsets();
    const router = useRouter();

    const [currentMonth, setCurrentMonth] = useState(new Date().getMonth() + 1);
    const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
    const [refreshing, setRefreshing] = useState(false);

    const { 
        income, 
        incomeSources, 
        loadIncome, 
        loadIncomeSources, 
        isLoading,
        getTotalIncomeByMonth,
        getSavingsRate,
        getNetCashFlow
    } = useIncomeStore();

    const { getTotalExpensesByMonth } = useExpenseStore();

    useEffect(() => {
        loadIncome(currentMonth, currentYear);
        loadIncomeSources();
    }, [currentMonth, currentYear]);

    const onRefresh = async () => {
        setRefreshing(true);
        await Promise.all([
            loadIncome(currentMonth, currentYear),
            loadIncomeSources()
        ]);
        setRefreshing(false);
    };

    const monthlyIncome = getTotalIncomeByMonth(currentMonth, currentYear);
    const monthlyExpenses = getTotalExpensesByMonth(currentMonth, currentYear);
    const savingsRate = getSavingsRate(currentMonth, currentYear);
    const netCashFlow = getNetCashFlow(currentMonth, currentYear);

    const sourceBreakdown = useMemo(() => {
        const breakdown: Record<string, number> = {};
        income.forEach(item => {
            breakdown[item.source_id] = (breakdown[item.source_id] || 0) + item.amount;
        });

        return Object.entries(breakdown)
            .map(([sourceId, amount]) => {
                const source = incomeSources.find(s => s.id === sourceId);
                return {
                    source,
                    amount,
                    percentage: monthlyIncome > 0 ? (amount / monthlyIncome) * 100 : 0
                };
            })
            .filter(item => item.source)
            .sort((a, b) => b.amount - a.amount);
    }, [income, incomeSources, monthlyIncome]);

    const changeMonth = (offset: number) => {
        haptic.light();
        let newMonth = currentMonth + offset;
        let newYear = currentYear;
        if (newMonth < 1) {
            newMonth = 12;
            newYear -= 1;
        } else if (newMonth > 12) {
            newMonth = 1;
            newYear += 1;
        }
        
        // Prevent future dates
        const now = new Date();
        if (newYear > now.getFullYear() || (newYear === now.getFullYear() && newMonth > now.getMonth() + 1)) {
            return;
        }

        setCurrentMonth(newMonth);
        setCurrentYear(newYear);
    };

    const monthName = new Date(currentYear, currentMonth - 1).toLocaleString('default', { month: 'long' });

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <Stack.Screen 
                options={{
                    headerTitle: 'Income Tracking',
                    headerLeft: () => (
                        <TouchableOpacity onPress={() => router.back()} style={styles.headerBtn}>
                            <Ionicons name="chevron-back" size={24} color={colors.text} />
                        </TouchableOpacity>
                    ),
                    headerRight: () => (
                        <TouchableOpacity 
                            onPress={() => router.push('/income-sources')} 
                            style={styles.headerBtn}
                        >
                            <Ionicons name="options-outline" size={24} color={colors.accent} />
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
                {/* Month Picker */}
                <View style={styles.monthPicker}>
                    <TouchableOpacity onPress={() => changeMonth(-1)} style={styles.arrowBtn}>
                        <Ionicons name="chevron-back" size={20} color={colors.textSecondary} />
                    </TouchableOpacity>
                    <Text style={[styles.monthText, { color: colors.text }]}>
                        {monthName} {currentYear}
                    </Text>
                    <TouchableOpacity onPress={() => changeMonth(1)} style={styles.arrowBtn}>
                        <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
                    </TouchableOpacity>
                </View>

                {/* Summary Card */}
                <MonthlySummaryCard 
                    income={monthlyIncome}
                    expenses={monthlyExpenses}
                    savingsRate={savingsRate}
                    netCashFlow={netCashFlow}
                />

                {/* Source Breakdown */}
                {sourceBreakdown.length > 0 && (
                    <View style={styles.section}>
                        <Text style={[styles.sectionTitle, { color: colors.text }]}>Breakdown by Source</Text>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.sourceScroll}>
                            {sourceBreakdown.map((item, index) => (
                                <SourceCard 
                                    key={item.source?.id || index}
                                    source={item.source!}
                                    amount={item.amount}
                                    percentage={item.percentage}
                                />
                            ))}
                        </ScrollView>
                    </View>
                )}

                {/* Entries List */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text style={[styles.sectionTitle, { color: colors.text }]}>Income Entries</Text>
                        <TouchableOpacity 
                            onPress={() => {
                                haptic.medium();
                                router.push('/modals/add-income');
                            }}
                        >
                            <Text style={[styles.addText, { color: colors.accent }]}>+ Add</Text>
                        </TouchableOpacity>
                    </View>

                    {income.length === 0 ? (
                        <EmptyState 
                            type="analytics"
                            title="No income logged"
                            message={`You haven't logged any income for ${monthName}.`}
                            onAction={() => router.push('/modals/add-income')}
                            actionLabel="Log Income"
                        />
                    ) : (
                        <View style={[styles.listContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                            {income.map((item, index) => (
                                <IncomeRow 
                                    key={item.id}
                                    income={item}
                                    source={incomeSources.find(s => s.id === item.source_id)}
                                    isLast={index === income.length - 1}
                                    onPress={() => {
                                        haptic.light();
                                        router.push({ pathname: '/modals/add-income', params: { incomeId: item.id } });
                                    }}
                                />
                            ))}
                        </View>
                    )}
                </View>
            </ScrollView>

            <TouchableOpacity 
                style={[styles.fab, { backgroundColor: colors.accent, bottom: insets.bottom + 20 }]}
                onPress={() => {
                    haptic.medium();
                    router.push('/modals/add-income');
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
    },
    monthPicker: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginVertical: 16,
        gap: 20,
    },
    arrowBtn: {
        padding: 8,
    },
    monthText: {
        fontSize: 16,
        fontWeight: '700',
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
        fontSize: 16,
        fontWeight: '700',
    },
    addText: {
        fontSize: 14,
        fontWeight: '600',
    },
    sourceScroll: {
        paddingBottom: 4,
    },
    listContainer: {
        borderRadius: 20,
        paddingHorizontal: 16,
        borderWidth: 1,
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
