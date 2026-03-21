import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { PolarChart, Pie } from 'victory-native';
import { ExpenseRow } from '../../store/expenseStore';
import { CategoryRow } from '../../store/categoryStore';
import { formatAmount } from '../../utils/analyticsHelpers';
import EmptyState from '../shared/EmptyState';
import { useRouter } from 'expo-router';
import { useThemeColors } from '../../hooks/useThemeColors';

interface DonutChartProps {
    expenses: ExpenseRow[];
    categories: CategoryRow[];
    currencySymbol: string;
    month: number;
    year: number;
}

const DonutChart: React.FC<DonutChartProps> = ({
    expenses,
    categories,
    currencySymbol,
    month,
    year
}) => {
    const router = useRouter();
    const colors = useThemeColors();

    const chartData = useMemo(() => {
        const categoryTotals: { [key: string]: number } = {};
        expenses.forEach(e => {
            categoryTotals[e.category_id] = (categoryTotals[e.category_id] || 0) + e.amount;
        });

        return Object.entries(categoryTotals)
            .map(([categoryId, total]) => {
                const category = categories.find(c => c.id === categoryId);
                return {
                    label: category?.name || 'Unknown',
                    value: total,
                    color: category?.color || '#CBD5E1',
                    id: categoryId
                };
            })
            .filter(item => item.value > 0)
            .sort((a, b) => b.value - a.value);
    }, [expenses, categories]);

    const totalSpent = useMemo(() =>
        expenses.reduce((sum, e) => sum + e.amount, 0),
        [expenses]);

    if (expenses.length === 0) {
        return (
            <EmptyState
                emoji="📊"
                title="No spending data"
                message="Add expenses to see your breakdown"
            />
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.chartWrapper}>
                <PolarChart
                    data={chartData}
                    colorKey="color"
                    valueKey="value"
                    labelKey="label"
                >
                    <Pie.Chart innerRadius={80} />
                </PolarChart>

                <View style={styles.centerLabel}>
                    <Text style={[styles.totalAmount, { color: colors.text }]}>
                        {formatAmount(totalSpent, currencySymbol)}
                    </Text>
                    <Text style={[styles.totalLabel, { color: colors.textMuted }]}>Total</Text>
                </View>
            </View>

            <View style={styles.legendContainer}>
                {chartData.map((item) => (
                    <TouchableOpacity
                        key={item.id}
                        onPress={() => router.push({
                            pathname: '/category-detail',
                            params: { categoryId: item.id, month: month.toString(), year: year.toString() }
                        })}
                        style={[styles.legendItem, { borderBottomColor: colors.border }]}
                    >
                        <View style={styles.legendLeft}>
                            <View style={[styles.dot, { backgroundColor: item.color }]} />
                            <Text style={[styles.categoryName, { color: colors.text }]}>{item.label}</Text>
                        </View>
                        <View style={styles.legendRight}>
                            <Text style={[styles.categoryAmount, { color: colors.text }]}>
                                {formatAmount(item.value, currencySymbol)}
                            </Text>
                            <Text style={[styles.percentage, { color: colors.textMuted }]}>
                                {((item.value / totalSpent) * 100).toFixed(0)}%
                            </Text>
                        </View>
                    </TouchableOpacity>
                ))}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
    },
    chartWrapper: {
        height: 250,
        width: '100%',
        alignItems: 'center',
        justifyContent: 'center',
    },
    centerLabel: {
        position: 'absolute',
        alignItems: 'center',
    },
    totalAmount: {
        fontSize: 24,
        fontWeight: '700',
    },
    totalLabel: {
        fontSize: 13,
    },
    legendContainer: {
        width: '100%',
        marginTop: 24,
    },
    legendItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 12,
        borderBottomWidth: 1,
    },
    legendLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    dot: {
        width: 10,
        height: 10,
        borderRadius: 5,
        marginRight: 10,
    },
    categoryName: {
        fontSize: 14,
        fontWeight: '500',
    },
    legendRight: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    categoryAmount: {
        fontSize: 14,
        fontWeight: '600',
        marginRight: 12,
    },
    percentage: {
        fontSize: 12,
        width: 35,
        textAlign: 'right',
    },
});

export default React.memo(DonutChart);
