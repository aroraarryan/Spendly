import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useThemeColors } from '@/hooks/useThemeColors';
import NeoCard from '@/components/ui/NeoCard';
import { useSettingsStore } from '@/store/settingsStore';
import SavingsRateBar from './SavingsRateBar';

interface MonthlySummaryCardProps {
    income: number;
    expenses: number;
    savingsRate: number;
    netCashFlow: number;
}

export default function MonthlySummaryCard({ 
    income, 
    expenses, 
    savingsRate, 
    netCashFlow 
}: MonthlySummaryCardProps) {
    const colors = useThemeColors();
    const { currencySymbol } = useSettingsStore();

    return (
        <NeoCard style={styles.container}>
            <View style={styles.row}>
                <View style={styles.item}>
                    <Text style={[styles.label, { color: colors.textMuted }]}>Total Income</Text>
                    <Text style={[styles.amount, { color: colors.success }]}>
                        {currencySymbol}{income.toLocaleString()}
                    </Text>
                </View>
                <View style={[styles.divider, { backgroundColor: colors.border }]} />
                <View style={styles.item}>
                    <Text style={[styles.label, { color: colors.textMuted }]}>Total Expenses</Text>
                    <Text style={[styles.amount, { color: colors.danger }]}>
                        {currencySymbol}{expenses.toLocaleString()}
                    </Text>
                </View>
            </View>

            <View style={[styles.cashFlowRow, { borderTopColor: colors.border }]}>
                <Text style={[styles.cashFlowLabel, { color: colors.textSecondary }]}>Net Cash Flow</Text>
                <Text style={[
                    styles.cashFlowValue, 
                    { color: netCashFlow >= 0 ? colors.accent : colors.danger }
                ]}>
                    {netCashFlow >= 0 ? '+' : ''}{currencySymbol}{netCashFlow.toLocaleString()}
                </Text>
            </View>

            <SavingsRateBar rate={savingsRate} income={income} />
        </NeoCard>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: 20,
        marginBottom: 24,
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 20,
    },
    item: {
        flex: 1,
    },
    divider: {
        width: 1,
        height: 30,
        marginHorizontal: 15,
    },
    label: {
        fontSize: 12,
        fontWeight: '500',
        marginBottom: 4,
    },
    amount: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    cashFlowRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: 16,
        borderTopWidth: 1,
        marginBottom: 0,
    },
    cashFlowLabel: {
        fontSize: 14,
        fontWeight: '500',
    },
    cashFlowValue: {
        fontSize: 16,
        fontWeight: '700',
    }
});
