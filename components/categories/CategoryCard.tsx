import React from 'react';
import { TouchableOpacity, View, Text, StyleSheet } from 'react-native';
import NeoCard from '../ui/NeoCard';
import NeoBadge from '../ui/NeoBadge';
import { useThemeColors } from '../../hooks/useThemeColors';
import { CategoryRow } from '../../store/categoryStore';
import { useSettingsStore } from '../../store/settingsStore';

interface CategoryCardProps {
    category: CategoryRow;
    onPress: () => void;
    onLongPress: () => void;
}

const CategoryCard: React.FC<CategoryCardProps> = ({ category, onPress, onLongPress }) => {
    const { currencySymbol } = useSettingsStore();
    const colors = useThemeColors();
    const isBudgetSet = category.monthly_budget > 0;

    return (
        <TouchableOpacity
            onPress={onPress}
            onLongPress={onLongPress}
            activeOpacity={0.7}
            style={styles.container}
        >
            <NeoCard padding={0} style={styles.card} backgroundColor={colors.surface}>
                <View style={styles.content}>
                    <View style={[styles.iconContainer, { backgroundColor: colors.surface2 }]}>
                        <Text style={styles.emoji}>{category.icon}</Text>
                    </View>

                    <Text
                        style={[styles.name, { color: colors.text }]}
                        numberOfLines={1}
                        ellipsizeMode="tail"
                    >
                        {category.name}
                    </Text>

                    {isBudgetSet ? (
                        <Text style={[styles.budgetText, { color: colors.accent }]}>
                            {currencySymbol}{category.monthly_budget.toLocaleString()}
                        </Text>
                    ) : (
                        <Text style={[styles.budgetText, { color: colors.textMuted }]}>
                            No Limit
                        </Text>
                    )}
                </View>

                {category.is_custom === 1 && (
                    <View style={styles.customTag}>
                        <View style={[styles.customDot, { backgroundColor: colors.accent }]} />
                    </View>
                )}
            </NeoCard>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1 / 3,
        padding: 6,
    },
    card: {
        height: 140,
        borderRadius: 16,
    },
    content: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 12,
    },
    iconContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 12,
    },
    emoji: {
        fontSize: 24,
    },
    name: {
        fontWeight: '600',
        fontSize: 13,
        textAlign: 'center',
        marginBottom: 4,
    },
    budgetText: {
        fontSize: 11,
        fontWeight: '500',
    },
    customTag: {
        position: 'absolute',
        top: 10,
        right: 10,
    },
    customDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
    }
});

export default CategoryCard;
