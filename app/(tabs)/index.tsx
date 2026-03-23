import React, { useState, useMemo, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, useColorScheme, Platform } from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';

import { useExpenseStore } from '@/store/expenseStore';
import { useCategoryStore } from '@/store/categoryStore';
import { useSettingsStore } from '@/store/settingsStore';
import { useIncomeStore } from '@/store/incomeStore';
import { useSavingsStore } from '@/store/savingsStore';
import { useInvestmentStore } from '@/store/investmentStore';
import { useNetWorthStore } from '@/store/netWorthStore';
import { useThemeColors } from '@/hooks/useThemeColors';
import { haptic } from '@/utils/haptics';
import { formatIndianNumber } from '@/utils/financialHelpers';

import BudgetCard from '@/components/home/BudgetCard';
import TransactionRow from '@/components/home/TransactionRow';
import FAB from '@/components/shared/FAB';
import EmptyState from '@/components/shared/EmptyState';
import NeoTag from '@/components/ui/NeoTag';
import { Skeleton } from '@/components/shared/Skeleton';
import { useToast } from '@/hooks/useToast';
import { GreetingHeader } from '@/components/auth/GreetingHeader';
import IncomeSavingsCardHome from '@/components/home/IncomeSavingsCard';
import SavingsGoalsCardHome from '@/components/home/SavingsGoalsCard';






export default function HomeScreen() {
    const colors = useThemeColors();
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { showInAppToast } = useToast();

    // Zustand selectors for performance
    const expenses = useExpenseStore(state => state.expenses);
    const getExpensesByMonth = useExpenseStore(state => state.getExpensesByMonth);
    const deleteExpense = useExpenseStore(state => state.deleteExpense);
    const categories = useCategoryStore(state => state.categories);

    // 2.0 Stores
    const { incomeSources, addIncome } = useIncomeStore();
    const { addGoal } = useSavingsStore();
    const { investmentTypes, addInvestment, addSIP, addFixedDeposit } = useInvestmentStore();
    const { getNetWorth, addAsset, addLiability } = useNetWorthStore();

    const netWorth = getNetWorth();

    const [isLoading, setIsLoading] = useState(true);
    const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
    const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
    const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
    const [debugExpanded, setDebugExpanded] = useState(false);

    useEffect(() => {
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

        if (selectedDate > thisMonth) return;

        setCurrentMonth(newMonth);
        setCurrentYear(newYear);
    };

    const monthName = new Date(currentYear, currentMonth).toLocaleString('default', { month: 'long' });

    // --- Debug Helper Functions ---
    const seedIncome = async () => {
        const salarySource = incomeSources.find(s => s.name === 'Salary');
        if (!salarySource) return;
        await addIncome({
            amount: 50000,
            source_id: salarySource.id,
            date: new Date().toISOString().split('T')[0],
            is_recurring: 1,
            recurring_interval: 'monthly'
        });
        showInAppToast('Success', 'Added ₹50,000 Salary');
    };

    const seedGoal = async () => {
        await addGoal({
            name: 'Emergency Fund',
            icon: '🛡️',
            color: '#3B82F6',
            target_amount: 100000
        });
        showInAppToast('Success', 'Created Emergency Fund Goal');
    };

    const seedInvestment = async () => {
        const mfType = investmentTypes.find(t => t.name === 'Mutual Fund');
        if (!mfType) return;
        await addInvestment({
            name: 'Nifty 50 Index Fund',
            type_id: mfType.id,
            invested_amount: 10000,
            current_value: 10500,
            purchase_date: new Date().toISOString().split('T')[0],
            expected_return: 12,
            is_active: 1
        });
        showInAppToast('Success', 'Added Mutual Fund Investment');
    };

    const seedSIP = async () => {
        await addSIP({
            fund_name: 'Bluechip Equity SIP',
            monthly_amount: 5000,
            start_date: new Date().toISOString().split('T')[0],
            next_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            expected_return: 15,
            is_active: 1
        });
        showInAppToast('Success', 'Added ₹5,000/mo SIP');
    };

    const seedFD = async () => {
        await addFixedDeposit({
            bank_name: 'HDFC Bank',
            principal: 50000,
            interest_rate: 7.5,
            start_date: new Date().toISOString().split('T')[0],
            maturity_date: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            maturity_amount: 53750,
            interest_frequency: 'on_maturity',
            is_active: 1,
            is_renewed: 0
        });
        showInAppToast('Success', 'Added ₹50,000 FD');
    };

    const seedAsset = async () => {
        await addAsset({
            name: 'Family Home',
            type: 'Real Estate',
            current_value: 5000000,
            purchase_value: 4000000,
            purchase_date: '2020-01-01'
        });
        showInAppToast('Success', 'Added Property Asset');
    };

    const seedLiability = async () => {
        await addLiability({
            name: 'Home Loan',
            type: 'Loan',
            total_amount: 3000000,
            remaining_amount: 2500000,
            monthly_payment: 25000,
            interest_rate: 8.5
        });
        showInAppToast('Success', 'Added Home Loan Liability');
    };

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

            {isLoading ? renderLoadingState() : (
                <ScrollView
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{ paddingBottom: 100 }}
                >
                    {/* Header */}
                    <View style={{ paddingTop: insets.top }}>
                        <GreetingHeader />
                        <View
                            style={{
                                paddingHorizontal: 20,
                                paddingBottom: 16,
                                flexDirection: 'row',
                                alignItems: 'center',
                                justifyContent: 'space-between'
                            }}
                        >
                            <View>
                                <TouchableOpacity 
                                    onPress={() => router.push('/net-worth')}
                                    style={{ flexDirection: 'row', alignItems: 'center', marginTop: -8 }}
                                >
                                    <Text style={{ fontSize: 11, fontWeight: '500', color: colors.textMuted, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                                        Net Worth
                                    </Text>
                                    <Text style={{ 
                                        fontSize: 12, 
                                        fontWeight: '700', 
                                        color: colors.accent, 
                                        marginLeft: 8 
                                    }}>
                                        {netWorth === 0 ? 'Set up Net Worth →' : formatIndianNumber(netWorth)}
                                    </Text>
                                </TouchableOpacity>
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
                    </View>

                    <View style={{ paddingHorizontal: 20 }}>
                    {/* Budget Overview Section */}
                    <BudgetCard
                        currentMonth={currentMonth}
                        currentYear={currentYear}
                        onPrevMonth={() => changeMonth(-1)}
                        onNextMonth={() => changeMonth(1)}
                    />

                    <IncomeSavingsCardHome />
                    <SavingsGoalsCardHome />


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

                    {/* Debug Section */}
                    {__DEV__ && (
                        <View style={{ marginTop: 40, padding: 20, backgroundColor: colors.surface2, borderRadius: 24 }}>
                            <TouchableOpacity 
                                onPress={() => setDebugExpanded(!debugExpanded)}
                                style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}
                            >
                                <Text style={{ fontSize: 14, fontWeight: '700', color: colors.textSecondary }}>DEV DEBUG TOOLS</Text>
                                <Ionicons name={debugExpanded ? "chevron-up" : "chevron-down"} size={20} color={colors.textSecondary} />
                            </TouchableOpacity>
                            
                            {debugExpanded && (
                                <View style={{ marginTop: 16, gap: 12 }}>
                                    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                                        <DebugBtn label="+ Income" onPress={seedIncome} color={colors.success} />
                                        <DebugBtn label="+ Goal" onPress={seedGoal} color={colors.accent} />
                                        <DebugBtn label="+ Investment" onPress={seedInvestment} color={colors.warning} />
                                        <DebugBtn label="+ SIP" onPress={seedSIP} color="#8B5CF6" />
                                        <DebugBtn label="+ FD" onPress={seedFD} color="#EC4899" />
                                        <DebugBtn label="+ Asset" onPress={seedAsset} color="#10B981" />
                                        <DebugBtn label="+ Liability" onPress={seedLiability} color={colors.danger} />
                                    </View>
                                    
                                    <View style={{ padding: 12, backgroundColor: colors.surface, borderRadius: 12 }}>
                                        <Text style={{ fontSize: 12, color: colors.textMuted }}>
                                            Expected Net Worth: ₹2,10,000 (Investments) + ₹50,00,000 (Asset) - ₹25,00,000 (Liability) = ₹27,10,000 + Savings
                                        </Text>
                                    </View>
                                </View>
                            )}
                        </View>
                    )}
                </View>
            </ScrollView>
        )}

            <FAB onPress={() => { haptic.medium(); router.push('/modals/add-expense'); }} />
        </View>
    );
}

const DebugBtn = ({ label, onPress, color }: { label: string, onPress: () => void, color: string }) => {
    const colors = useThemeColors();
    return (
        <TouchableOpacity 
            onPress={onPress}
            style={{ 
                paddingHorizontal: 12, 
                paddingVertical: 8, 
                backgroundColor: colors.surface, 
                borderRadius: 10,
                borderLeftWidth: 3,
                borderLeftColor: color
            }}
        >
            <Text style={{ fontSize: 12, fontWeight: '600', color: colors.text }}>{label}</Text>
        </TouchableOpacity>
    );
};
