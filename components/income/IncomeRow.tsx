import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useThemeColors } from '@/hooks/useThemeColors';
import { Income, IncomeSource } from '@/types';
import { useSettingsStore } from '@/store/settingsStore';
import { Ionicons } from '@expo/vector-icons';

interface IncomeRowProps {
    income: Income;
    source: IncomeSource | undefined;
    isLast?: boolean;
    onPress: () => void;
}

export default function IncomeRow({ income, source, isLast, onPress }: IncomeRowProps) {
    const colors = useThemeColors();
    const { currencySymbol } = useSettingsStore();

    const date = new Date(income.date);
    const day = date.getDate();
    const month = date.toLocaleString('default', { month: 'short' });

    return (
        <TouchableOpacity 
            style={[
                styles.container, 
                !isLast && { borderBottomWidth: 1, borderBottomColor: colors.border }
            ]}
            onPress={onPress}
        >
            <View style={[styles.iconContainer, { backgroundColor: source?.color || colors.surface2 }]}>
                <Text style={styles.icon}>{source?.icon || '💰'}</Text>
            </View>

            <View style={styles.content}>
                <View style={styles.left}>
                    <Text style={[styles.sourceName, { color: colors.text }]}>
                        {source?.name || 'Unknown Source'}
                    </Text>
                    {income.note && (
                        <Text style={[styles.note, { color: colors.textMuted }]} numberOfLines={1}>
                            {income.note}
                        </Text>
                    )}
                </View>

                <View style={styles.right}>
                    <Text style={[styles.amount, { color: colors.success }]}>
                        +{currencySymbol}{income.amount.toLocaleString()}
                    </Text>
                    <Text style={[styles.date, { color: colors.textMuted }]}>
                        {day} {month}
                    </Text>
                </View>
            </View>

            {income.is_recurring === 1 && (
                <View style={[styles.recurringBadge, { backgroundColor: colors.surface2 }]}>
                    <Ionicons name="repeat" size={10} color={colors.textSecondary} />
                </View>
            )}
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
    },
    iconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    icon: {
        fontSize: 20,
    },
    content: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    left: {
        flex: 1,
        marginRight: 8,
    },
    sourceName: {
        fontSize: 15,
        fontWeight: '600',
    },
    note: {
        fontSize: 12,
        marginTop: 2,
    },
    right: {
        alignItems: 'flex-end',
    },
    amount: {
        fontSize: 15,
        fontWeight: 'bold',
    },
    date: {
        fontSize: 12,
        marginTop: 2,
    },
    recurringBadge: {
        position: 'absolute',
        top: 8,
        left: 30,
        width: 16,
        height: 16,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        borderColor: '#fff', // Should ideally be dynamic but surface usually white/dark
    }
});
