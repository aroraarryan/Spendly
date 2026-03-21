import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withSpring, withTiming } from 'react-native-reanimated';
import { useThemeColors } from '../../hooks/useThemeColors';
import { formatAmount } from '../../utils/analyticsHelpers';
import { useRouter } from 'expo-router';

interface CategoryStat {
    id: string;
    name: string;
    icon: string;
    color: string;
    total: number;
    count: number;
    percentage: number;
}

interface TopCategoriesListProps {
    categories: CategoryStat[];
    total: number;
    currencySymbol: string;
    month: number;
    year: number;
}

const TopCategoriesList: React.FC<TopCategoriesListProps> = ({ categories, total, currencySymbol, month, year }) => {
    const router = useRouter();
    const colors = useThemeColors();

    if (categories.length === 0) return null;

    return (
        <View style={styles.container}>
            {categories.map((cat, index) => (
                <CategoryRow
                    key={cat.id}
                    category={cat}
                    total={total}
                    currencySymbol={currencySymbol}
                    onPress={() => router.push({
                        pathname: '/category-detail',
                        params: { categoryId: cat.id, month: month.toString(), year: year.toString() }
                    })}
                />
            ))}
        </View>
    );
};

const CategoryRow = ({ category, total, currencySymbol, onPress }: { category: CategoryStat, total: number, currencySymbol: string, onPress: () => void }) => {
    const colors = useThemeColors();
    const progress = useSharedValue(0);

    const percentage = (category.total / total);

    useEffect(() => {
        progress.value = withTiming(percentage, { duration: 1000 });
    }, [percentage]);

    const progressStyle = useAnimatedStyle(() => {
        return {
            width: `${progress.value * 100}%`,
            height: 6,
            borderRadius: 3,
            backgroundColor: category.color,
        };
    });

    return (
        <TouchableOpacity onPress={onPress} activeOpacity={0.8} style={styles.row}>
            <View style={styles.topRow}>
                <View style={styles.rowLeft}>
                    <View style={[styles.iconBox, { backgroundColor: `${category.color}15` }]}>
                        <Text style={styles.emoji}>{category.icon}</Text>
                    </View>
                    <View>
                        <Text style={[styles.catName, { color: colors.text }]}>{category.name}</Text>
                        <Text style={[styles.catCount, { color: colors.textMuted }]}>{category.count} transactions</Text>
                    </View>
                </View>

                <View style={styles.rowRight}>
                    <Text style={[styles.catAmount, { color: colors.text }]}>{formatAmount(category.total, currencySymbol)}</Text>
                    <Text style={[styles.catPerc, { color: colors.textMuted }]}>{(percentage * 100).toFixed(0)}%</Text>
                </View>
            </View>

            <View style={[styles.progressTrack, { backgroundColor: colors.surface2 }]}>
                <Animated.View style={progressStyle} />
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        width: '100%',
    },
    row: {
        marginBottom: 24,
    },
    topRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
    },
    rowLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    iconBox: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    emoji: {
        fontSize: 20,
    },
    catName: {
        fontSize: 14,
        fontWeight: '600',
    },
    catCount: {
        fontSize: 11,
        marginTop: 2,
    },
    rowRight: {
        alignItems: 'flex-end',
    },
    catAmount: {
        fontSize: 14,
        fontWeight: '700',
    },
    catPerc: {
        fontSize: 11,
        marginTop: 2,
    },
    progressTrack: {
        width: '100%',
        height: 6,
        borderRadius: 3,
        overflow: 'hidden',
    },
});

export default TopCategoriesList;
