import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { CartesianChart, Bar } from 'victory-native';
import { ExpenseRow } from '../../store/expenseStore';
import { useThemeColors } from '../../hooks/useThemeColors';
import { getDaysInMonth, groupExpensesByDay, formatAmountShort } from '../../utils/analyticsHelpers';
import { useFont } from '@shopify/react-native-skia';

interface DailyBarChartProps {
    expenses: ExpenseRow[];
    month: number;
    year: number;
}

const DailyBarChart: React.FC<DailyBarChartProps> = ({ expenses, month, year }) => {
    const colors = useThemeColors();
    const daysInMonth = getDaysInMonth(month, year);

    // Fallback for font if needed, but CartesianChart handle defaults usually
    // Using a simpler approach if font isn't loaded reliably in this environment

    const chartData = useMemo(() => {
        const dailyGrouped = groupExpensesByDay(expenses);
        const data = [];
        for (let i = 1; i <= daysInMonth; i++) {
            data.push({
                day: i,
                amount: dailyGrouped[i] || 0
            });
        }
        return data;
    }, [expenses, daysInMonth]);

    const stats = useMemo(() => {
        const dailyGrouped = groupExpensesByDay(expenses);
        let highestDay = { day: 0, amount: 0 };
        let mostActiveDay = { day: 0, count: 0 };

        const counts: { [key: number]: number } = {};
        expenses.forEach(e => {
            const d = new Date(e.date).getDate();
            counts[d] = (counts[d] || 0) + 1;
        });

        Object.entries(dailyGrouped).forEach(([day, amount]) => {
            if (amount > highestDay.amount) {
                highestDay = { day: parseInt(day), amount };
            }
        });

        Object.entries(counts).forEach(([day, count]) => {
            if (count > mostActiveDay.count) {
                mostActiveDay = { day: parseInt(day), count };
            }
        });

        return { highestDay, mostActiveDay };
    }, [expenses]);

    return (
        <View style={styles.container}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={{ width: Math.max(daysInMonth * 15, 300), height: 200 }}>
                    <CartesianChart
                        data={chartData}
                        xKey="day"
                        yKeys={["amount"]}
                        domain={{ x: [1, daysInMonth] }}
                        axisOptions={{
                            tickCount: 5,
                            labelColor: colors.textMuted,
                            formatYLabel: (val) => formatAmountShort(val),
                            formatXLabel: (val) => val === 1 || val === 15 || val === daysInMonth ? val.toString() : "",
                        }}
                    >
                        {({ points, chartBounds }) => (
                            <Bar
                                points={points.amount}
                                chartBounds={chartBounds}
                                color={colors.accent}
                                roundedCorners={{ topLeft: 4, topRight: 4 }}
                                barWidth={10}
                            />
                        )}
                    </CartesianChart>
                </View>
            </ScrollView>

            <View style={styles.footer}>
                <View style={[styles.statBox, { backgroundColor: colors.surface2 }]}>
                    <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Highest Day</Text>
                    <Text style={[styles.statValue, { color: colors.text }]}>
                        {stats.highestDay.day > 0 ? `${stats.highestDay.day} ${getMonthInitial(month)}: $${stats.highestDay.amount}` : "None"}
                    </Text>
                </View>
                <View style={[styles.statBox, { backgroundColor: colors.surface2 }]}>
                    <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Most Active</Text>
                    <Text style={[styles.statValue, { color: colors.text }]}>
                        {stats.mostActiveDay.day > 0 ? `${stats.mostActiveDay.day} ${getMonthInitial(month)}: ${stats.mostActiveDay.count} tx` : "None"}
                    </Text>
                </View>
            </View>
        </View>
    );
};

const getMonthInitial = (m: number) => {
    const names = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    return names[m - 1];
};

const styles = StyleSheet.create({
    container: {
        width: '100%',
    },
    footer: {
        flexDirection: 'row',
        marginTop: 20,
        gap: 12,
    },
    statBox: {
        flex: 1,
        padding: 12,
        borderRadius: 12,
    },
    statLabel: {
        fontSize: 10,
        fontWeight: '600',
        marginBottom: 4,
        textTransform: 'uppercase',
    },
    statValue: {
        fontSize: 13,
        fontWeight: '700',
    },
});

export default React.memo(DailyBarChart);
