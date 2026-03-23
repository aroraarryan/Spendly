import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { CartesianChart, Bar } from 'victory-native';
import { useThemeColors } from '@/hooks/useThemeColors';
import { useIncomeStore } from '@/store/incomeStore';
import { useExpenseStore } from '@/store/expenseStore';
import { formatAmountShort } from '@/utils/analyticsHelpers';

export default function IncomeExpenseChart() {
    const colors = useThemeColors();
    const { getLast6MonthsIncome } = useIncomeStore();
    const { getTotalExpensesByMonth } = useExpenseStore();

    const chartData = useMemo(() => {
        const incomeTrend = getLast6MonthsIncome();
        return incomeTrend.map((item, index) => {
            const expenses = getTotalExpensesByMonth(item.month, item.year);
            return {
                index, // Use index for x-axis to allow for grouping
                monthName: item.monthName,
                income: item.total,
                expense: expenses,
            };
        });
    }, [getLast6MonthsIncome, getTotalExpensesByMonth]);

    if (chartData.length === 0) return null;

    return (
        <View style={styles.container}>
            <View style={{ height: 220, width: '100%' }}>
                <CartesianChart
                    data={chartData}
                    xKey="index"
                    yKeys={["income", "expense"]}
                    axisOptions={{
                        labelColor: colors.textMuted,
                        formatXLabel: (val) => chartData[val]?.monthName || "",
                        formatYLabel: (val) => formatAmountShort(val),
                        tickCount: 5,
                    }}
                >
                    {({ points, chartBounds }) => (
                        <>
                            {/* Income Bars */}
                            <Bar
                                points={points.income}
                                chartBounds={chartBounds}
                                color={colors.success}
                                barWidth={12}
                                roundedCorners={{ topLeft: 4, topRight: 4 }}
                            />
                            {/* Expense Bars - using semi-transparent overlay to avoid grouping complexity */}
                            <Bar
                                points={points.expense}
                                chartBounds={chartBounds}
                                color={`${colors.danger}80`}
                                barWidth={8}
                                roundedCorners={{ topLeft: 4, topRight: 4 }}
                            />
                        </>
                    )}
                </CartesianChart>
            </View>

            <View style={styles.legend}>
                <View style={styles.legendItem}>
                    <View style={[styles.dot, { backgroundColor: colors.success }]} />
                    <Text style={[styles.legendText, { color: colors.textSecondary }]}>Income</Text>
                </View>
                <View style={styles.legendItem}>
                    <View style={[styles.dot, { backgroundColor: colors.danger }]} />
                    <Text style={[styles.legendText, { color: colors.textSecondary }]}>Expenses</Text>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        width: '100%',
        marginTop: 10,
    },
    legend: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 16,
        gap: 20,
    },
    legendItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    dot: {
        width: 10,
        height: 10,
        borderRadius: 5,
    },
    legendText: {
        fontSize: 12,
        fontWeight: '500',
    }
});
