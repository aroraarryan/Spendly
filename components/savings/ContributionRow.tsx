import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useThemeColors } from '@/hooks/useThemeColors';
import { SavingsContribution } from '@/types';
import { formatIndianNumber } from '@/utils/financialHelpers';
import { useSettingsStore } from '@/store/settingsStore';

interface ContributionRowProps {
    contribution: SavingsContribution;
    goalName: string;
    isLast?: boolean;
    onDelete?: (id: string) => void;
}

const ContributionRow: React.FC<ContributionRowProps> = ({ contribution, goalName, isLast, onDelete }) => {
    const colors = useThemeColors();
    const { currencySymbol } = useSettingsStore();

    return (
        <View style={[styles.container, !isLast && { borderBottomWidth: 1, borderBottomColor: colors.surface2 }]}>
            <View style={[styles.iconContainer, { backgroundColor: `${colors.success}15` }]}>
                <Text style={[styles.iconText, { color: colors.success }]}>₹</Text>
            </View>
            
            <View style={styles.details}>
                <Text style={[styles.title, { color: colors.text }]}>Added to {goalName}</Text>
                {contribution.note ? (
                    <Text style={[styles.note, { color: colors.textSecondary }]} numberOfLines={1}>
                        {contribution.note}
                    </Text>
                ) : null}
                <Text style={[styles.date, { color: colors.textMuted }]}>
                    {new Date(contribution.date).toLocaleDateString(undefined, {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric'
                    })}
                </Text>
            </View>
            
            <View style={styles.amountContainer}>
                <Text style={[styles.amount, { color: colors.success }]}>
                    +{currencySymbol}{formatIndianNumber(contribution.amount).replace('₹', '')}
                </Text>
            </View>

            {onDelete && (
                <TouchableOpacity 
                    onPress={() => onDelete(contribution.id)}
                    style={styles.deleteBtn}
                >
                    <Ionicons name="trash-outline" size={18} color={colors.textMuted} />
                </TouchableOpacity>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 16,
    },
    iconContainer: {
        width: 44,
        height: 44,
        borderRadius: 22,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    iconText: {
        fontSize: 20,
        fontWeight: '700',
    },
    details: {
        flex: 1,
    },
    title: {
        fontSize: 15,
        fontWeight: '600',
    },
    note: {
        fontSize: 13,
        marginTop: 2,
    },
    date: {
        fontSize: 11,
        marginTop: 4,
        fontWeight: '500',
    },
    amountContainer: {
        paddingLeft: 12,
    },
    amount: {
        fontSize: 16,
        fontWeight: '700',
    },
    deleteBtn: {
        padding: 8,
        marginLeft: 8,
    }
});

export default ContributionRow;
