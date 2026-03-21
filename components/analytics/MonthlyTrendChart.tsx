import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { CartesianChart, Line, Area, Scatter } from 'victory-native';
import { useThemeColors } from '../../hooks/useThemeColors';
import { formatAmountShort, getPercentageChange } from '../../utils/analyticsHelpers';
import NeoCard from '../ui/NeoCard';

interface MonthlyTrendChartProps {
    monthlyTotals: { month: number, year: number, monthName: string, total: number }[];
}

const MonthlyTrendChart: React.FC<MonthlyTrendChartProps> = ({ monthlyTotals }) => {
    const colors = useThemeColors();

    const stats = useMemo(() => {
        if (monthlyTotals.length === 0) return null;

        const sorted = [...monthlyTotals].sort((a, b) => a.total - b.total);
        const bestMonth = sorted[0];
        const highestMonth = sorted[sorted.length - 1];

        const current = monthlyTotals[monthlyTotals.length - 1].total;
        const previous = monthlyTotals.length > 1 ? monthlyTotals[monthlyTotals.length - 2].total : 0;
        const percentChange = getPercentageChange(current, previous);

        return { bestMonth, highestMonth, percentChange };
    }, [monthlyTotals]);

    if (monthlyTotals.length === 0) return null;

    return (
        <View style={styles.container}>
            <View style={{ height: 200, width: '100%' }}>
                <CartesianChart
                    data={monthlyTotals}
                    xKey="monthName"
                    yKeys={["total"]}
                    axisOptions={{
                        labelColor: colors.textMuted,
                        formatYLabel: (val) => formatAmountShort(val),
                    }}
                >
                    {({ points, chartBounds }) => (
                        <>
                            <Area
                                points={points.total}
                                y0={chartBounds.bottom}
                                color={`${colors.accent}20`}
                            />
                            <Line
                                points={points.total}
                                color={colors.accent}
                                strokeWidth={3}
                            />
                            <Scatter
                                points={points.total}
                                color={colors.white}
                                radius={5}
                            />
                        </>
                    )}
                </CartesianChart>
            </View>

            <View style={styles.footer}>
                <View style={styles.statRow}>
                    <View style={styles.miniStat}>
                        <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Best Month</Text>
                        <Text style={[styles.statValue, { color: colors.success }]}>
                            {stats?.bestMonth.monthName} ({formatAmountShort(stats?.bestMonth.total || 0)})
                        </Text>
                    </View>
                    <View style={styles.miniStat}>
                        <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Highest Month</Text>
                        <Text style={[styles.statValue, { color: colors.danger }]}>
                            {stats?.highestMonth.monthName} ({formatAmountShort(stats?.highestMonth.total || 0)})
                        </Text>
                    </View>
                </View>

                {stats && (
                    <View style={[styles.compareBox, { backgroundColor: colors.surface2 }]}>
                        <Text style={[styles.compareText, { color: colors.textSecondary }]}>
                            {stats.percentChange >= 0 ? "↑" : "↓"} {Math.abs(stats.percentChange).toFixed(0)}% vs last month
                        </Text>
                    </View>
                )}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        width: '100%',
    },
    footer: {
        marginTop: 20,
    },
    statRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 16,
    },
    miniStat: {
        flex: 1,
    },
    statLabel: {
        fontSize: 10,
        fontWeight: '600',
        textTransform: 'uppercase',
        marginBottom: 2,
    },
    statValue: {
        fontSize: 13,
        fontWeight: '700',
    },
    compareBox: {
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderRadius: 12,
        alignItems: 'center',
    },
    compareText: {
        fontSize: 12,
        fontWeight: '600',
    },
});

export default React.memo(MonthlyTrendChart);
