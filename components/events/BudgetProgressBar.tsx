import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useThemeColors } from '../../hooks/useThemeColors';
import NeoBadge from '../ui/NeoBadge';

interface BudgetProgressBarProps {
    spent: number;
    budget: number;
    currencySymbol: string;
    height?: number;
    accentColor?: string;
}

const BudgetProgressBar: React.FC<BudgetProgressBarProps> = ({
    spent,
    budget,
    currencySymbol = '$',
    height = 6,
    accentColor
}) => {
    const colors = useThemeColors();
    if (budget <= 0) return null;

    const percentage = Math.round((spent / budget) * 100);
    const cappedPercentage = Math.min(percentage, 100);
    const isOverBudget = spent > budget;
    const progressColor = isOverBudget ? colors.danger : (accentColor || colors.accent);
    const remaining = budget - spent;

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={[styles.percentageText, { color: isOverBudget ? colors.danger : colors.textSecondary }]}>
                    {percentage}% Used
                </Text>
                {isOverBudget && (
                    <Text style={[styles.overBudgetText, { color: colors.danger }]}>
                        Over by {currencySymbol}{Math.abs(remaining).toLocaleString()}
                    </Text>
                )}
            </View>

            <View style={[styles.track, { height, backgroundColor: colors.surface2 }]}>
                <View
                    style={[
                        styles.fill,
                        {
                            width: `${cappedPercentage}%`,
                            backgroundColor: progressColor,
                        }
                    ]}
                />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        width: '100%',
        marginVertical: 4,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    percentageText: {
        fontSize: 12,
        fontWeight: '500',
    },
    overBudgetText: {
        fontSize: 12,
        fontWeight: '600',
    },
    track: {
        width: '100%',
        borderRadius: 3,
        overflow: 'hidden',
    },
    fill: {
        height: '100%',
        borderRadius: 3,
    }
});

export default BudgetProgressBar;
