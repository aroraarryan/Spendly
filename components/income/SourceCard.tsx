import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useThemeColors } from '@/hooks/useThemeColors';
import { IncomeSource } from '@/types';
import { useSettingsStore } from '@/store/settingsStore';
import NeoCard from '@/components/ui/NeoCard';

interface SourceCardProps {
    source: IncomeSource;
    amount: number;
    percentage: number;
}

export default function SourceCard({ source, amount, percentage }: SourceCardProps) {
    const colors = useThemeColors();
    const { currencySymbol } = useSettingsStore();

    return (
        <NeoCard style={styles.container}>
            <View style={styles.header}>
                <View style={[styles.iconBackground, { backgroundColor: source.color }]}>
                    <Text style={styles.icon}>{source.icon}</Text>
                </View>
                <View style={styles.titleContainer}>
                    <Text style={[styles.name, { color: colors.text }]} numberOfLines={1}>
                        {source.name}
                    </Text>
                    <Text style={[styles.percentage, { color: colors.textMuted }]}>
                        {percentage.toFixed(1)}% of total
                    </Text>
                </View>
            </View>

            <View style={styles.footer}>
                <Text style={[styles.amount, { color: colors.success }]}>
                    {currencySymbol}{amount.toLocaleString()}
                </Text>
            </View>
            
            <View style={[styles.progressBarTrack, { backgroundColor: colors.border }]}>
                <View 
                    style={[
                        styles.progressBarFill, 
                        { backgroundColor: source.color, width: `${percentage}%` }
                    ]} 
                />
            </View>
        </NeoCard>
    );
}

const styles = StyleSheet.create({
    container: {
        width: 160,
        padding: 12,
        marginRight: 12,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    iconBackground: {
        width: 32,
        height: 32,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 8,
    },
    icon: {
        fontSize: 16,
    },
    titleContainer: {
        flex: 1,
    },
    name: {
        fontSize: 13,
        fontWeight: '600',
    },
    percentage: {
        fontSize: 10,
    },
    footer: {
        marginBottom: 8,
    },
    amount: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    progressBarTrack: {
        height: 4,
        borderRadius: 2,
        overflow: 'hidden',
    },
    progressBarFill: {
        height: '100%',
        borderRadius: 2,
    }
});
