import React, { useMemo } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useExpenseStore } from '@/store/expenseStore';
import { useCategoryStore } from '@/store/categoryStore';
import { useSettingsStore } from '@/store/settingsStore';
import { useThemeColors } from '@/hooks/useThemeColors';
import TransactionRow from '@/components/home/TransactionRow';
import EmptyState from '@/components/shared/EmptyState';
import NeoCard from '@/components/ui/NeoCard';
import NeoBadge from '@/components/ui/NeoBadge';

export default function CategoryDetailScreen() {
    const { categoryId, month, year } = useLocalSearchParams<{ categoryId: string, month: string, year: string }>();
    const router = useRouter();
    const colors = useThemeColors();

    const parsedMonth = Number(month) || new Date().getMonth() + 1;
    const parsedYear = Number(year) || new Date().getFullYear();

    const { getExpensesByCategory, getTotalByCategory, deleteExpense, expenses: allExpenses } = useExpenseStore();
    const { getCategoryById } = useCategoryStore();
    const { currencySymbol } = useSettingsStore();

    const category = getCategoryById(categoryId!);

    const expenses = useMemo(() => {
        if (!category) return [];
        return getExpensesByCategory(category.id, parsedMonth, parsedYear)
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }, [categoryId, parsedMonth, parsedYear, getExpensesByCategory, category, allExpenses]);

    const totalSpent = useMemo(() => {
        if (!category) return 0;
        return getTotalByCategory(category.id, parsedMonth, parsedYear);
    }, [categoryId, parsedMonth, parsedYear, getTotalByCategory, category, allExpenses]);

    const monthName = new Date(parsedYear, parsedMonth - 1).toLocaleString('default', { month: 'short' });

    if (!category) {
        return (
            <View style={{ flex: 1, backgroundColor: colors.background, alignItems: 'center', justifyContent: 'center' }}>
                <Text style={{ color: colors.textSecondary, fontWeight: '600' }}>Category not found</Text>
            </View>
        );
    }

    return (
        <View style={{ flex: 1, backgroundColor: colors.background }}>
            <Stack.Screen
                options={{
                    headerShown: true,
                    headerTitle: category.name,
                    headerShadowVisible: false,
                    headerStyle: { backgroundColor: colors.background },
                    headerTitleStyle: { color: colors.text, fontWeight: '600', fontSize: 17 },
                    headerTintColor: colors.accent,
                }}
            />

            <FlatList
                data={expenses}
                keyExtractor={item => item.id}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.listContent}
                ListHeaderComponent={() => (
                    <View style={styles.headerSection}>
                        <NeoCard padding={32} backgroundColor={colors.surface} style={styles.summaryCard}>
                            <View style={styles.summaryHeader}>
                                <View style={[styles.iconContainer, { backgroundColor: colors.surface2 }]}>
                                    <Text style={styles.categoryEmoji}>{category.icon}</Text>
                                </View>
                                <View>
                                    <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>
                                        TOTAL SPENT ({monthName.toUpperCase()})
                                    </Text>
                                    <View style={styles.amountRow}>
                                        <Text style={[styles.currency, { color: colors.textMuted }]}>{currencySymbol}</Text>
                                        <Text style={[styles.amount, { color: colors.text }]}>
                                            {totalSpent.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                                        </Text>
                                    </View>
                                </View>
                            </View>

                            {category.monthly_budget > 0 && (
                                <View style={[styles.budgetSection, { borderTopColor: colors.border }]}>
                                    <View style={styles.budgetInfoHeader}>
                                        <Text style={[styles.budgetText, { color: colors.textSecondary }]}>
                                            Budget: {currencySymbol}{category.monthly_budget.toLocaleString()}
                                        </Text>
                                        <Text style={[styles.budgetPercent, { color: totalSpent > category.monthly_budget ? colors.danger : colors.textMuted }]}>
                                            {Math.round((totalSpent / category.monthly_budget) * 100)}%
                                        </Text>
                                    </View>
                                    <View style={[styles.progressTrack, { backgroundColor: colors.surface2 }]}>
                                        <View
                                            style={[
                                                styles.progressFill,
                                                {
                                                    width: `${Math.min((totalSpent / category.monthly_budget) * 100, 100)}%`,
                                                    backgroundColor: totalSpent > category.monthly_budget ? colors.danger : colors.accent
                                                }
                                            ]}
                                        />
                                    </View>
                                </View>
                            )}
                        </NeoCard>

                        <Text style={[styles.listTitle, { color: colors.text }]}>Transactions</Text>
                    </View>
                )}
                renderItem={({ item, index }) => (
                    <TransactionRow
                        expense={item}
                        isLast={index === expenses.length - 1}
                    />
                )}
                ListEmptyComponent={() => (
                    <EmptyState
                        emoji="🪴"
                        title="No transactions"
                        message={`You haven't spent anything on ${category.name} in ${monthName}.`}
                    />
                )}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    listContent: {
        paddingHorizontal: 20,
        paddingBottom: 40,
    },
    headerSection: {
        paddingTop: 16,
    },
    summaryCard: {
        marginBottom: 32,
    },
    summaryHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 20,
    },
    iconContainer: {
        width: 64,
        height: 64,
        borderRadius: 32,
        alignItems: 'center',
        justifyContent: 'center',
    },
    categoryEmoji: {
        fontSize: 32,
    },
    summaryLabel: {
        fontSize: 10,
        fontWeight: '700',
        letterSpacing: 1,
        marginBottom: 4,
    },
    amountRow: {
        flexDirection: 'row',
        alignItems: 'baseline',
    },
    currency: {
        fontSize: 18,
        fontWeight: '600',
        marginRight: 2,
    },
    amount: {
        fontSize: 36,
        fontWeight: '700',
    },
    budgetSection: {
        marginTop: 24,
        paddingTop: 20,
        borderTopWidth: 1,
    },
    budgetInfoHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    budgetText: {
        fontSize: 13,
        fontWeight: '500',
    },
    budgetPercent: {
        fontSize: 13,
        fontWeight: '600',
    },
    progressTrack: {
        height: 8,
        borderRadius: 4,
        overflow: 'hidden',
    },
    progressFill: {
        height: '100%',
        borderRadius: 4,
    },
    listTitle: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 16,
    }
});
