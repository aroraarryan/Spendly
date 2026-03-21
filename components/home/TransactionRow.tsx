import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useCategoryStore } from '@/store/categoryStore';
import { useSettingsStore } from '@/store/settingsStore';
import { useThemeColors } from '@/hooks/useThemeColors';
import { ExpenseRow } from '@/store/expenseStore';
import { Ionicons } from '@expo/vector-icons';
import { haptic } from '@/utils/haptics';
import { AnimatedNumber } from '../shared/AnimatedNumber';

interface TransactionRowProps {
    expense: ExpenseRow;
    isLast?: boolean;
    onDelete?: (id: string) => void;
    onEdit?: (id: string) => void;
}

const TransactionRow: React.FC<TransactionRowProps> = ({ expense, isLast, onDelete, onEdit }) => {
    const colors = useThemeColors();
    const { getCategoryById } = useCategoryStore();
    const { currencySymbol, compactMode } = useSettingsStore();

    const category = getCategoryById(expense.category_id);
    const date = new Date(expense.date);
    const formattedDate = date.toLocaleDateString(undefined, { day: 'numeric', month: 'short' });
    const formattedTime = date.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit', hour12: true });
    const fullDateDisplay = `${formattedDate} · ${formattedTime}`;

    const handleLongPress = () => {
        if (!onDelete) return;
        haptic.medium();
        Alert.alert(
            "Delete Transaction",
            "Are you sure you want to delete this transaction?",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Delete",
                    style: "destructive",
                    onPress: () => onDelete(expense.id)
                }
            ]
        );
    };

    return (
        <TouchableOpacity
            activeOpacity={0.7}
            style={[styles.container, compactMode && { paddingVertical: 8 }]}
            onPress={() => onEdit?.(expense.id)}
            onLongPress={handleLongPress}
        >
            <View style={[styles.iconWrapper, compactMode && { marginRight: 12 }]}>
                <View
                    style={[
                        styles.iconCircle,
                        compactMode && { width: 36, height: 36, borderRadius: 18 },
                        { backgroundColor: category ? `${category.color}15` : colors.surface2 }
                    ]}
                >
                    <Text style={[styles.emoji, compactMode && { fontSize: 16 }]}>{category?.icon || '💰'}</Text>
                </View>
            </View>

            <View style={[styles.content, !isLast && { borderBottomWidth: 1, borderBottomColor: colors.border }, compactMode && { paddingVertical: 2 }]}>
                <View style={styles.mainInfo}>
                    <Text style={[styles.categoryName, { color: colors.text, fontSize: compactMode ? 13 : 15 }]}>
                        {category?.name || 'Uncategorized'}
                        {compactMode && expense.note && (
                            <Text style={[styles.note, { color: colors.textSecondary }]}> · {expense.note}</Text>
                        )}
                    </Text>
                    {!compactMode && expense.note && (
                        <Text style={[styles.note, { color: colors.textSecondary }]} numberOfLines={1}>
                            {expense.note}
                        </Text>
                    )}
                    <Text style={[styles.date, { color: colors.textMuted, fontSize: compactMode ? 10 : 12 }]}>
                        {fullDateDisplay}
                    </Text>
                </View>

                <View style={styles.amountContainer}>
                    <AnimatedNumber
                        value={expense.amount}
                        style={[styles.amount, { color: colors.text, fontSize: compactMode ? 14 : 16 }]}
                        currencySymbol={currencySymbol}
                        duration={600}
                    />
                    {expense.is_recurring === 1 && (
                        <Ionicons name="repeat" size={compactMode ? 10 : 12} color={colors.accent} style={styles.recurringIcon} />
                    )}
                </View>
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 14,
    },
    iconWrapper: {
        marginRight: 16,
    },
    iconCircle: {
        width: 48,
        height: 48,
        borderRadius: 24,
        alignItems: 'center',
        justifyContent: 'center',
    },
    emoji: {
        fontSize: 22,
    },
    content: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 4,
    },
    mainInfo: {
        flex: 1,
        marginRight: 8,
    },
    categoryName: {
        fontSize: 15,
        fontWeight: '600',
    },
    note: {
        fontSize: 13,
        fontWeight: '400',
        marginTop: 2,
    },
    date: {
        fontSize: 12,
        fontWeight: '400',
        marginTop: 2,
    },
    amountContainer: {
        alignItems: 'flex-end',
    },
    amount: {
        fontSize: 16,
        fontWeight: '700',
    },
    recurringIcon: {
        marginTop: 4,
    }
});

export default TransactionRow;
