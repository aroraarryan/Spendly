import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useExpenseStore } from '@/store/expenseStore';
import { useSettingsStore } from '@/store/settingsStore';
import { useThemeColors } from '@/hooks/useThemeColors';
import NeoCard from '../ui/NeoCard';
import { Theme } from '@/constants/theme';
import { AnimatedNumber } from '../shared/AnimatedNumber';

interface BudgetCardProps {
    currentMonth: number;
    currentYear: number;
    onPrevMonth: () => void;
    onNextMonth: () => void;
}

const BudgetCard: React.FC<BudgetCardProps> = ({
    currentMonth,
    currentYear,
    onPrevMonth,
    onNextMonth
}) => {
    const colors = useThemeColors();
    const { getTotalByMonth, expenses } = useExpenseStore();
    const { currencySymbol, monthlyBudget } = useSettingsStore();

    const totalSpent = useMemo(() => {
        return getTotalByMonth(currentMonth + 1, currentYear);
    }, [currentMonth, currentYear, getTotalByMonth, expenses]);

    const progress = Math.min(totalSpent / (monthlyBudget || 1), 1.2);
    const isOverBudget = totalSpent > (monthlyBudget || Infinity);
    const monthName = new Date(currentYear, currentMonth).toLocaleString('default', { month: 'short' });

    const isCurrentMonth = currentMonth === new Date().getMonth() && currentYear === new Date().getFullYear();

    return (
        <NeoCard style={styles.container} padding={24} backgroundColor={colors.surface}>
            <View style={styles.header}>
                <View>
                    <Text style={[styles.label, { color: colors.textSecondary }]}>Total Spent</Text>
                    <View style={styles.amountContainer}>
                        <AnimatedNumber
                            value={totalSpent}
                            style={[styles.amount, { color: colors.text }]}
                            currencySymbol={currencySymbol}
                        />
                        <Text style={[styles.budgetTotal, { color: colors.textMuted }]}>
                            of {currencySymbol}{monthlyBudget.toLocaleString()}
                        </Text>
                    </View>
                </View>

                <View style={styles.monthNav}>
                    <TouchableOpacity onPress={onPrevMonth} style={[styles.navBtn, { backgroundColor: colors.surface2 }]}>
                        <Ionicons name="chevron-back" size={16} color={colors.textSecondary} />
                    </TouchableOpacity>
                    <Text style={[styles.monthText, { color: colors.text, backgroundColor: colors.surface2 }]}>
                        {monthName.toUpperCase()}
                    </Text>
                    <TouchableOpacity
                        onPress={onNextMonth}
                        disabled={isCurrentMonth}
                        style={[styles.navBtn, { backgroundColor: colors.surface2, opacity: isCurrentMonth ? 0.3 : 1 }]}
                    >
                        <Ionicons name="chevron-forward" size={16} color={colors.textSecondary} />
                    </TouchableOpacity>
                </View>
            </View>

            <View style={[styles.progressTrack, { backgroundColor: colors.surface2 }]}>
                <View
                    style={[
                        styles.progressFill,
                        {
                            width: `${Math.min(progress * 100, 100)}%`,
                            backgroundColor: isOverBudget ? colors.danger : colors.accent
                        }
                    ]}
                />
            </View>

            <View style={styles.footer}>
                <View style={styles.stat}>
                    <Text style={[styles.statLabel, { color: colors.textSecondary }]}>DAILY AVG</Text>
                    <AnimatedNumber
                        value={totalSpent / 30}
                        style={[styles.statValue, { color: colors.text }]}
                        currencySymbol={currencySymbol}
                        duration={800}
                    />
                </View>
                <View style={styles.statIndicator}>
                    <View style={[styles.dot, { backgroundColor: isOverBudget ? colors.danger : colors.success }]} />
                    <Text style={[styles.indicatorText, { color: isOverBudget ? colors.danger : colors.success }]}>
                        {isOverBudget ? 'LIMIT EXCEEDED' : 'ON TRACK'}
                    </Text>
                </View>
                <View style={[styles.stat, { alignItems: 'flex-end' }]}>
                    <Text style={[styles.statLabel, { color: colors.textSecondary }]}>REMAINING</Text>
                    <AnimatedNumber
                        value={Math.max(0, monthlyBudget - totalSpent)}
                        style={[styles.statValue, { color: isOverBudget ? colors.danger : colors.text }]}
                        currencySymbol={currencySymbol}
                        duration={800}
                    />
                </View>
            </View>
        </NeoCard>
    );
};

const styles = StyleSheet.create({
    container: {
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 16,
        elevation: 4,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 24,
    },
    label: {
        fontSize: 12,
        fontWeight: '500',
        marginBottom: 4,
    },
    amountContainer: {
        flexDirection: 'row',
        alignItems: 'baseline',
    },
    currency: {
        fontSize: 20,
        fontWeight: '700',
        marginRight: 2,
    },
    amount: {
        fontSize: 42,
        fontWeight: '700',
    },
    budgetTotal: {
        fontSize: 14,
        fontWeight: '400',
        marginLeft: 8,
    },
    monthNav: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    navBtn: {
        width: 32,
        height: 32,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
    },
    monthText: {
        fontSize: 11,
        fontWeight: '700',
        marginHorizontal: 8,
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 99,
        minWidth: 44,
        textAlign: 'center',
    },
    progressTrack: {
        height: 6,
        borderRadius: 3,
        width: '100%',
        marginBottom: 24,
        overflow: 'hidden',
    },
    progressFill: {
        height: '100%',
        borderRadius: 3,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    stat: {
        flex: 1,
    },
    statLabel: {
        fontSize: 9,
        fontWeight: '600',
        marginBottom: 2,
    },
    statValue: {
        fontSize: 15,
        fontWeight: '600',
    },
    statIndicator: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'transparent',
    },
    dot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        marginRight: 6,
    },
    indicatorText: {
        fontSize: 10,
        fontWeight: '700',
    },
});

export default BudgetCard;
