import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import NeoCard from '../ui/NeoCard';
import { useThemeColors } from '../../hooks/useThemeColors';
import { useSettingsStore } from '../../store/settingsStore';

interface CategoryPreviewCardProps {
    name: string;
    emoji: string;
    color: string;
    budget: number;
}

const CategoryPreviewCard: React.FC<CategoryPreviewCardProps> = ({ name, emoji, color, budget }) => {
    const { currencySymbol } = useSettingsStore();
    const colors = useThemeColors();
    const isBudgetSet = budget > 0;

    return (
        <View style={styles.container}>
            <NeoCard padding={0} style={styles.card} backgroundColor={colors.surface}>
                <View style={[styles.accent, { backgroundColor: color || colors.accent }]} />

                <View style={styles.content}>
                    <View style={[styles.iconContainer, { backgroundColor: colors.surface2 }]}>
                        <Text style={styles.emoji}>{emoji || '⚡️'}</Text>
                    </View>

                    <Text
                        style={[styles.name, { color: colors.text }]}
                        numberOfLines={1}
                        ellipsizeMode="tail"
                    >
                        {name || 'Category'}
                    </Text>

                    <Text style={[styles.budgetText, { color: isBudgetSet ? colors.accent : colors.textMuted }]}>
                        {isBudgetSet ? `${currencySymbol}${budget.toLocaleString()}` : 'No Limit'}
                    </Text>
                </View>
            </NeoCard>
            <Text style={[styles.previewLabel, { color: colors.textMuted }]}>PREVIEW</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        width: 140,
        alignItems: 'center',
    },
    card: {
        width: 140,
        height: 150,
        borderRadius: 24,
        overflow: 'hidden',
    },
    accent: {
        height: 4,
        width: '100%',
    },
    content: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
    },
    iconContainer: {
        width: 56,
        height: 56,
        borderRadius: 28,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 12,
    },
    emoji: {
        fontSize: 28,
    },
    name: {
        fontWeight: '600',
        fontSize: 15,
        textAlign: 'center',
        marginBottom: 4,
    },
    budgetText: {
        fontSize: 12,
        fontWeight: '500',
    },
    previewLabel: {
        fontSize: 10,
        fontWeight: '700',
        marginTop: 12,
        letterSpacing: 2,
    }
});

export default CategoryPreviewCard;
