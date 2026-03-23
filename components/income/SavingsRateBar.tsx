import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useThemeColors } from '@/hooks/useThemeColors';

interface SavingsRateBarProps {
    rate: number;
    income: number;
}

export default function SavingsRateBar({ rate, income }: SavingsRateBarProps) {
    const colors = useThemeColors();

    const getColors = () => {
        if (rate < 10) return colors.danger;
        if (rate < 20) return '#F59E0B'; // Amber
        return colors.success;
    };

    const getBenchmarkText = () => {
        if (rate < 10) return 'Below recommended savings rate';
        if (rate < 20) return 'Getting there — aim for 20%+';
        return 'Excellent savings rate! 🎉';
    };

    if (income === 0) {
        return (
            <View style={styles.container}>
                <Text style={[styles.emptyText, { color: colors.accent }]}>
                    Log your income to see savings rate
                </Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={[styles.label, { color: colors.textSecondary }]}>Savings Rate</Text>
                <Text style={[styles.value, { color: colors.text }]}>{rate.toFixed(1)}%</Text>
            </View>
            
            <View style={[styles.track, { backgroundColor: colors.border }]}>
                <View 
                    style={[
                        styles.fill, 
                        { 
                            backgroundColor: getColors(),
                            width: `${Math.min(100, Math.max(0, rate))}%` 
                        }
                    ]} 
                />
            </View>
            
            <Text style={[styles.benchmark, { color: colors.textMuted }]}>
                {getBenchmarkText()}
            </Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginTop: 16,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    label: {
        fontSize: 14,
        fontWeight: '500',
    },
    value: {
        fontSize: 14,
        fontWeight: 'bold',
    },
    track: {
        height: 8,
        borderRadius: 4,
        overflow: 'hidden',
    },
    fill: {
        height: '100%',
        borderRadius: 4,
    },
    benchmark: {
        fontSize: 12,
        marginTop: 6,
    },
    emptyText: {
        fontSize: 14,
        fontWeight: '500',
        textAlign: 'center',
        fontStyle: 'italic',
    }
});
