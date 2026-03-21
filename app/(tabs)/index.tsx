import React, { useState, useMemo, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, useColorScheme, Platform } from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';

import { useExpenseStore } from '@/store/expenseStore';
import { useCategoryStore } from '@/store/categoryStore';
import { useSettingsStore } from '@/store/settingsStore';
import { useThemeColors } from '@/hooks/useThemeColors';
import { haptic } from '@/utils/haptics';

import BudgetCard from '@/components/home/BudgetCard';
import TransactionRow from '@/components/home/TransactionRow';
import FAB from '@/components/shared/FAB';
import EmptyState from '@/components/shared/EmptyState';
import NeoTag from '@/components/ui/NeoTag';
import { Skeleton } from '@/components/shared/Skeleton';
import ErrorBoundary from '@/components/shared/ErrorBoundary';

export default function HomeScreen() {
    const colors = useThemeColors();
    const router = useRouter();
    const insets = useSafeAreaInsets();

    // Zustand selectors for performance
    const expenses = useExpenseStore(state => state.expenses);
    const getExpensesByMonth = useExpenseStore(state => state.getExpensesByMonth);
    const deleteExpense = useExpenseStore(state => state.deleteExpense);
    const categories = useCategoryStore(state => state.categories);

    const [isLoading, setIsLoading] = useState(true);
    const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
    const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
    const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);

    useEffect(() => {
        // Remove artificial delay for a faster initial load
        setIsLoading(false);
    }, []);

    const monthExpenses = useMemo(() => {
        return getExpensesByMonth(currentMonth + 1, currentYear);
    }, [expenses, currentMonth, currentYear]);

    const filteredExpenses = useMemo(() => {
        if (!selectedCategoryId) return monthExpenses;
        return monthExpenses.filter(e => e.category_id === selectedCategoryId);
    }, [monthExpenses, selectedCategoryId]);

    const changeMonth = (offset: number) => {
        haptic.light();
        let newMonth = currentMonth + offset;
        let newYear = currentYear;
        if (newMonth < 0) {
            newMonth = 11;
            newYear -= 1;
        } else if (newMonth > 11) {
            newMonth = 0;
            newYear += 1;
        }
        const now = new Date();
        const selectedDate = new Date(newYear, newMonth);
        const thisMonth = new Date(now.getFullYear(), now.getMonth());

        if (selectedDate > thisMonth) return; // Prevent entering future months

        setCurrentMonth(newMonth);
        setCurrentYear(newYear);
    };

    const monthName = new Date(currentYear, currentMonth).toLocaleString('default', { month: 'long' });

    const renderLoadingState = () => (
        <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 100 }}
        >
            <Skeleton width="100%" height={160} borderRadius={24} style={{ marginTop: 8 }} />

            <View style={{ marginTop: 32 }}>
                <Skeleton width={100} height={20} style={{ marginBottom: 16 }} />
                <View style={{ flexDirection: 'row', gap: 12 }}>
                    {[1, 2, 3, 4].map(i => (
                        <Skeleton key={i} width={80} height={36} borderRadius={18} />
                    ))}
                </View>
            </View>

            <View style={{ marginTop: 32 }}>
                <Skeleton width={120} height={20} style={{ marginBottom: 16 }} />
                {[1, 2, 3, 4, 5].map(i => (
                    <View key={i} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 20 }}>
                        <Skeleton width={44} height={44} borderRadius={22} />
                        <View style={{ flex: 1, marginLeft: 12, gap: 8 }}>
                            <Skeleton width="60%" height={14} />
                            <Skeleton width="40%" height={10} />
                        </View>
                        <Skeleton width={60} height={20} />
                    </View>
                ))}
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
                    <Text style={{ fontSize: 28, fontWeight: '800', color: colors.text, letterSpacing: -0.5 }}>Spendly</Text>
                    <Text style={{ fontSize: 13, fontWeight: '500', color: colors.textMuted, marginTop: 2, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                        {new Date().toLocaleDateString('default', { weekday: 'long', day: 'numeric', month: 'short' })}
                    </Text>
                </View>

                <View style={{ flexDirection: 'row', gap: 12 }}>
                    <TouchableOpacity
                        onPress={() => {
                            haptic.light();
                            router.push('/categories');
                        }}
                        style={{
                            width: 44,
                            height: 44,
                            borderRadius: 22,
                            backgroundColor: colors.surface2,
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}
                    >
                        <Ionicons name="grid-outline" size={22} color={colors.textSecondary} />
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={() => {
                            haptic.light();
                            router.push('/settings');
                        }}
                        style={{
                            width: 44,
                            height: 44,
                            borderRadius: 22,
                            backgroundColor: colors.surface2,
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}
                    >
                        <Ionicons name="settings-outline" size={22} color={colors.textSecondary} />
                    </TouchableOpacity>
                </View>
            </View>

            {isLoading ? renderLoadingState() : (
                <ScrollView
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 100 }}
                >
                    {/* Budget Overview Section */}
                    <BudgetCard
                        currentMonth={currentMonth}
                        currentYear={currentYear}
                        onPrevMonth={() => changeMonth(-1)}
                        onNextMonth={() => changeMonth(1)}
                    />

                    {/* Categories Filter */}
                    <View style={{ marginTop: 32 }}>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                            <Text style={{ fontSize: 15, fontWeight: '600', color: colors.text }}>Categories</Text>
                            <TouchableOpacity onPress={() => { haptic.light(); router.push('/categories'); }}>
                                <Text style={{ fontSize: 13, fontWeight: '500', color: colors.accent }}>Manage</Text>
                            </TouchableOpacity>
                        </View>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingRight: 20 }}>
                            <NeoTag
                                label="All"
                                selected={selectedCategoryId === null}
                                onPress={() => {
                                    haptic.light();
                                    setSelectedCategoryId(null);
                                }}
                            />
                            {categories.map(cat => (
                                <NeoTag
                                    key={cat.id}
                                    emoji={cat.icon}
                                    label={cat.name}
                                    selected={selectedCategoryId === cat.id}
                                    onPress={() => {
                                        haptic.light();
                                        setSelectedCategoryId(cat.id);
                                    }}
                                />
                            ))}
                        </ScrollView>
                    </View>

                    {/* Transactions List */}
                    <View style={{ marginTop: 32 }}>
                        <Text style={{ fontSize: 15, fontWeight: '600', color: colors.text, marginBottom: 16 }}>Recent Activity</Text>

                        {filteredExpenses.length === 0 ? (
                            <EmptyState
                                type="expenses"
                                title="No transactions yet"
                                message={`You haven't added any expenses for ${monthName} ${currentYear}.`}
                                onAction={() => { haptic.medium(); router.push('/modals/add-expense'); }}
                                actionLabel="Add Expense"
                            />
                        ) : (
                            filteredExpenses.map((expense, index) => (
                                <TransactionRow
                                    key={expense.id}
                                    expense={expense}
                                    isLast={index === filteredExpenses.length - 1}
                                    onEdit={(id) => { haptic.light(); router.push({ pathname: '/modals/add-expense', params: { expenseId: id } }); }}
                                    onDelete={(id) => { haptic.light(); deleteExpense(id); }}
                                />
                            ))
                        )}
                    </View>
                </ScrollView>
            )}

            <FAB onPress={() => { haptic.medium(); router.push('/modals/add-expense'); }} />
        </View>
    );
}
