import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import NeoCard from '../ui/NeoCard';
import { ExpenseContext } from '../../types';
import { useThemeColors } from '../../hooks/useThemeColors';

export default function DataSnapshotCard({ context }: { context: ExpenseContext }) {
    const colors = useThemeColors();
    const topThree = context.categoryBreakdown.slice(0, 3);

    return (
        <NeoCard padding={20} style={{ marginBottom: 20 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
                <Text style={{ fontSize: 20, marginRight: 8 }}>📊</Text>
                <Text style={{ fontSize: 18, fontWeight: '700', color: colors.text }}>Your Data Snapshot</Text>
            </View>

            <View style={{ marginBottom: 12 }}>
                <Text style={{ fontSize: 13, color: colors.textSecondary, fontWeight: '600' }}>MONTH</Text>
                <Text style={{ fontSize: 16, fontWeight: '700', color: colors.text }}>{context.analysisMonth}</Text>
            </View>

            <View style={{ flexDirection: 'row', marginBottom: 16 }}>
                <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 13, color: colors.textSecondary, fontWeight: '600' }}>TOTAL SPENT</Text>
                    <Text style={{ fontSize: 20, fontWeight: '800', color: colors.text }}>
                        {context.currencySymbol}{context.totalSpent.toLocaleString()}
                    </Text>
                    {context.transactionCount > 0 ? (
                        <Text style={{ fontSize: 13, marginTop: 4, fontWeight: '600', color: context.comparedToLastMonth.direction === 'increase' ? colors.danger : colors.success }}>
                            {context.comparedToLastMonth.direction === 'increase' ? '↑' : '↓'} {context.comparedToLastMonth.changePercent}% vs last month
                        </Text>
                    ) : (
                        <Text style={{ fontSize: 13, marginTop: 4, fontWeight: '500', color: colors.textMuted }}>
                            No expenses found for this month
                        </Text>
                    )}
                </View>
                <View style={{ flex: 1, alignItems: 'flex-end' }}>
                    <Text style={{ fontSize: 13, color: colors.textSecondary, fontWeight: '600' }}>TRANSACTIONS</Text>
                    <Text style={{ fontSize: 20, fontWeight: '800', color: colors.text }}>{context.transactionCount}</Text>
                    <Text style={{ fontSize: 13, color: colors.textMuted, marginTop: 4, fontWeight: '500' }}>
                        {context.activeEvents.length} active event(s)
                    </Text>
                </View>
            </View>

            {topThree.length > 0 && (
                <View>
                    <Text style={{ fontSize: 13, color: colors.textSecondary, fontWeight: '600', marginBottom: 8 }}>TOP CATEGORIES</Text>
                    {topThree.map((cat, idx) => (
                        <View key={idx} style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
                            <Text style={{ fontSize: 14, color: colors.text, fontWeight: '500' }}>{cat.name}</Text>
                            <Text style={{ fontSize: 14, color: colors.text, fontWeight: '700' }}>
                                {context.currencySymbol}{cat.amount.toLocaleString()}
                            </Text>
                        </View>
                    ))}
                </View>
            )}
        </NeoCard>
    );
}
