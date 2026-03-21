import React, { useMemo } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, SafeAreaView, Platform, Alert } from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useCategoryStore } from '../store/categoryStore';
import { useThemeColors } from '../hooks/useThemeColors';
import NeoCard from '../components/ui/NeoCard';
import NeoButton from '../components/ui/NeoButton';
import NeoBadge from '../components/ui/NeoBadge';
import CategoryCard from '../components/categories/CategoryCard';
import { useToast } from '../hooks/useToast';

const CategoriesScreen = () => {
    const router = useRouter();
    const colors = useThemeColors();
    const { categories, deleteCategoryAndReassign } = useCategoryStore();
    const { showInAppToast } = useToast();

    const handleLongPress = (category: any) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

        if (category.is_custom === 0) {
            showInAppToast('Default Category', 'Default categories cannot be deleted, but you can edit them.');
        } else {
            Alert.alert(
                'Category Options',
                category.name,
                [
                    { text: 'Edit', onPress: () => router.push({ pathname: '/modals/edit-category', params: { categoryId: category.id } }) },
                    {
                        text: 'Delete',
                        style: 'destructive',
                        onPress: () => {
                            Alert.alert(
                                'Delete Category',
                                `Are you sure you want to delete ${category.name}? All expenses in this category will be moved to 'Others'.`,
                                [
                                    { text: 'Cancel', style: 'cancel' },
                                    {
                                        text: 'Delete',
                                        style: 'destructive',
                                        onPress: async () => {
                                            await deleteCategoryAndReassign(category.id);
                                            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                                        }
                                    }
                                ]
                            );
                        }
                    },
                    { text: 'Cancel', style: 'cancel' }
                ]
            );
        }
    };

    const sortedCategories = useMemo(() => {
        const defaults = categories.filter(c => c.is_custom === 0);
        const customs = categories.filter(c => c.is_custom === 1)
            .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
        return [...defaults, ...customs];
    }, [categories]);

    const stats = useMemo(() => {
        const total = categories.length;
        const defaults = categories.filter(c => c.is_custom === 0).length;
        const customs = categories.filter(c => c.is_custom === 1).length;
        return { total, defaults, customs };
    }, [categories]);

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <Stack.Screen
                options={{
                    headerShown: true,
                    headerTitle: 'Manage Categories',
                    headerShadowVisible: false,
                    headerStyle: { backgroundColor: colors.background },
                    headerTitleStyle: { color: colors.text, fontWeight: '600', fontSize: 17 },
                    headerTintColor: colors.accent,
                }}
            />

            <FlatList
                data={sortedCategories}
                keyExtractor={(item) => item.id}
                numColumns={3}
                ListHeaderComponent={() => (
                    <NeoCard padding={24} style={styles.summaryCard} backgroundColor={colors.surface}>
                        <View style={styles.statBox}>
                            <Text style={[styles.statLabel, { color: colors.textMuted }]}>TOTAL</Text>
                            <Text style={[styles.statValue, { color: colors.text }]}>{stats.total}</Text>
                        </View>
                        <View style={[styles.divider, { backgroundColor: colors.border }]} />
                        <View style={styles.statBox}>
                            <Text style={[styles.statLabel, { color: colors.textMuted }]}>DEFAULT</Text>
                            <Text style={[styles.statValue, { color: colors.text }]}>{stats.defaults}</Text>
                        </View>
                        <View style={[styles.divider, { backgroundColor: colors.border }]} />
                        <View style={styles.statBox}>
                            <Text style={[styles.statLabel, { color: colors.textMuted }]}>CUSTOM</Text>
                            <Text style={[styles.statValue, { color: colors.text }]}>{stats.customs}</Text>
                        </View>
                    </NeoCard>
                )}
                renderItem={({ item }) => (
                    <CategoryCard
                        category={item}
                        onPress={() => router.push({ pathname: '/modals/edit-category', params: { categoryId: item.id } })}
                        onLongPress={() => handleLongPress(item)}
                    />
                )}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
            />

            <View style={[styles.footer, { backgroundColor: colors.background }]}>
                <NeoButton
                    label="Add New Category"
                    onPress={() => {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                        router.push('/modals/edit-category');
                    }}
                    variant="primary"
                />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    summaryCard: {
        flexDirection: 'row',
        marginHorizontal: 0,
        marginVertical: 24,
        alignItems: 'center',
        justifyContent: 'space-around',
    },
    statBox: {
        alignItems: 'center',
        flex: 1,
    },
    statValue: {
        fontSize: 24,
        fontWeight: '700',
    },
    statLabel: {
        fontSize: 10,
        fontWeight: '600',
        marginBottom: 8,
        letterSpacing: 1,
    },
    divider: {
        width: 1,
        height: 24,
    },
    listContent: {
        paddingHorizontal: 20,
        paddingBottom: 100,
    },
    footer: {
        paddingHorizontal: 20,
        paddingTop: 16,
        paddingBottom: Platform.OS === 'ios' ? 34 : 20,
        borderTopWidth: 1,
        borderTopColor: 'rgba(0,0,0,0.05)',
    }
});

export default CategoriesScreen;
