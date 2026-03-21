import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    KeyboardAvoidingView,
    Platform,
    Alert,
    TouchableOpacity,
    Pressable,
    Dimensions
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import Animated, { useSharedValue, useAnimatedStyle, withSpring, withTiming, runOnJS } from 'react-native-reanimated';

import { useCategoryStore } from '../../store/categoryStore';
import { useSettingsStore } from '../../store/settingsStore';
import { useThemeColors } from '@/hooks/useThemeColors';
import { Theme } from '../../constants/theme';
import NeoButton from '../../components/ui/NeoButton';
import NeoInput from '../../components/ui/NeoInput';
import CategoryPreviewCard from '../../components/categories/CategoryPreviewCard';
import EmojiPicker from '../../components/categories/EmojiPicker';
import ColorPicker from '../../components/categories/ColorPicker';
import { useShakeAnimation } from '../../hooks/useShakeAnimation';

const EditCategoryModal = () => {
    const router = useRouter();
    const colors = useThemeColors();
    const insets = useSafeAreaInsets();
    const { categoryId } = useLocalSearchParams<{ categoryId?: string }>();
    const { currencySymbol } = useSettingsStore();
    const { categories, addCategory, updateCategory, deleteCategoryAndReassign, getCategoryById } = useCategoryStore();

    const isEditMode = !!categoryId;
    const existingCategory = categoryId ? getCategoryById(categoryId) : null;

    // Animation values
    const opacity = useSharedValue(0);
    const translateY = useSharedValue(1000);

    // Form State
    const [name, setName] = useState(existingCategory?.name || '');
    const [icon, setIcon] = useState(existingCategory?.icon || '🍕');
    const [color, setColor] = useState(existingCategory?.color || colors.accent);
    const [budget, setBudget] = useState(existingCategory?.monthly_budget?.toString() || '');

    const [errors, setErrors] = useState<{ name?: string, icon?: string, color?: string }>({});
    const { shakeStyle: nameShake, triggerShake: triggerNameShake } = useShakeAnimation();
    const { shakeStyle: iconShake, triggerShake: triggerIconShake } = useShakeAnimation();
    const { shakeStyle: colorShake, triggerShake: triggerColorShake } = useShakeAnimation();

    useEffect(() => {
        opacity.value = withTiming(1, { duration: 250 });
        translateY.value = withSpring(0, { damping: 25, stiffness: 200 });
    }, []);

    const handleClose = useCallback(() => {
        opacity.value = withTiming(0, { duration: 150 });
        translateY.value = withTiming(1000, { duration: 200 }, (finished) => {
            if (finished) {
                runOnJS(router.back)();
            }
        });
    }, [router, opacity, translateY]);

    const handleSave = async () => {
        let hasError = false;

        if (!name.trim()) {
            triggerNameShake();
            setErrors(prev => ({ ...prev, name: 'Category name cannot be empty' }));
            hasError = true;
        }

        const isDuplicate = categories.some(c =>
            c.name.toLowerCase() === name.trim().toLowerCase() && c.id !== categoryId
        );

        if (isDuplicate) {
            triggerNameShake();
            setErrors(prev => ({ ...prev, name: 'A category with this name already exists' }));
            hasError = true;
        }

        if (!icon) {
            triggerIconShake();
            setErrors(prev => ({ ...prev, icon: 'Please select an icon' }));
            hasError = true;
        }

        if (!color) {
            triggerColorShake();
            setErrors(prev => ({ ...prev, color: 'Please select a color' }));
            hasError = true;
        }

        if (hasError) {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
            return;
        }

        try {
            const budgetNum = parseFloat(budget) || 0;

            if (isEditMode && categoryId) {
                await updateCategory(categoryId, {
                    name: name.trim(),
                    icon,
                    color,
                    monthly_budget: budgetNum
                });
            } else {
                await addCategory({
                    name: name.trim(),
                    icon,
                    color,
                    monthly_budget: budgetNum
                });
            }

            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            handleClose();
        } catch (error) {
            console.error('Save failed:', error);
            Alert.alert('Error', 'Failed to save category');
        }
    };

    const handleDelete = () => {
        if (!categoryId || !existingCategory) return;

        Alert.alert(
            'Delete Category',
            `Are you sure you want to delete ${existingCategory.name}? All expenses in this category will be moved to 'Others'.`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        await deleteCategoryAndReassign(categoryId);
                        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                        handleClose();
                    }
                },
            ]
        );
    };

    return (
        <View style={styles.container}>
            <Animated.View style={[styles.overlay, { opacity }]}>
                <Pressable style={StyleSheet.absoluteFill} onPress={handleClose} />
            </Animated.View>

            <Animated.View
                style={[
                    styles.sheet,
                    {
                        backgroundColor: colors.background,
                        paddingBottom: Math.max(insets.bottom, 24),
                        transform: [{ translateY }]
                    }
                ]}
            >
                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    style={{ flex: 1 }}
                >
                    {/* Drag Handle */}
                    <View style={styles.handleWrapper}>
                        <View style={[styles.handle, { backgroundColor: colors.border }]} />
                    </View>

                    {/* Header */}
                    <View style={styles.header}>
                        <TouchableOpacity onPress={handleClose}>
                            <Text style={[styles.cancelText, { color: colors.textSecondary }]}>Cancel</Text>
                        </TouchableOpacity>
                        <Text style={[styles.title, { color: colors.text }]}>
                            {isEditMode ? 'Edit Category' : 'New Category'}
                        </Text>
                        <TouchableOpacity onPress={handleSave}>
                            <Text style={[styles.saveText, { color: colors.accent }]}>Save</Text>
                        </TouchableOpacity>
                    </View>

                    <ScrollView
                        contentContainerStyle={styles.scrollContent}
                        showsVerticalScrollIndicator={false}
                    >
                        {/* Live Preview */}
                        <View style={styles.previewContainer}>
                            <CategoryPreviewCard
                                name={name}
                                emoji={icon}
                                color={color}
                                budget={parseFloat(budget) || 0}
                            />
                        </View>

                        <Animated.View style={nameShake}>
                            <NeoInput
                                label="Category Name"
                                value={name}
                                onChangeText={(text) => {
                                    setName(text);
                                    setErrors(prev => ({ ...prev, name: undefined }));
                                }}
                                placeholder="Groceries, Gym, Rent..."
                                maxLength={20}
                                style={errors.name ? { borderColor: colors.danger, borderWidth: 1 } : undefined}
                            />
                            {errors.name && (
                                <Text style={[styles.errorText, { color: colors.danger }]}>{errors.name}</Text>
                            )}
                        </Animated.View>

                        <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>Icon</Text>
                        <Animated.View style={iconShake}>
                            <EmojiPicker
                                selectedEmoji={icon}
                                onEmojiSelect={(e) => {
                                    setIcon(e);
                                    setErrors(prev => ({ ...prev, icon: undefined }));
                                }}
                            />
                        </Animated.View>

                        <Text style={[styles.sectionLabel, { color: colors.textSecondary, marginTop: 24 }]}>Color</Text>
                        <Animated.View style={colorShake}>
                            <ColorPicker
                                selectedColor={color}
                                onColorSelect={(c) => {
                                    setColor(c);
                                    setErrors(prev => ({ ...prev, color: undefined }));
                                }}
                            />
                        </Animated.View>

                        <NeoInput
                            label="Monthly Budget (Optional)"
                            value={budget}
                            onChangeText={setBudget}
                            placeholder="0 = No limit"
                            keyboardType="numeric"
                            leftElement={<Text style={{ fontSize: 18, color: colors.text, marginRight: 4 }}>{currencySymbol}</Text>}
                        />

                        <View style={styles.actions}>
                            <NeoButton
                                label={isEditMode ? 'Save Changes' : 'Add Category'}
                                onPress={handleSave}
                                variant="primary"
                            />

                            {isEditMode && existingCategory?.is_custom === 1 && (
                                <NeoButton
                                    variant="danger"
                                    label="Delete Category"
                                    onPress={handleDelete}
                                    style={{ marginTop: 12 }}
                                />
                            )}
                        </View>
                    </ScrollView>
                </KeyboardAvoidingView>
            </Animated.View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'flex-end',
    },
    overlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    sheet: {
        height: '92%',
        borderTopLeftRadius: 32,
        borderTopRightRadius: 32,
        overflow: 'hidden',
    },
    handleWrapper: {
        alignItems: 'center',
        paddingVertical: 12,
    },
    handle: {
        width: 40,
        height: 4,
        borderRadius: 2,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 24,
        marginBottom: 24,
    },
    cancelText: {
        fontSize: 16,
        fontWeight: '500',
    },
    saveText: {
        fontSize: 16,
        fontWeight: '600',
    },
    title: {
        fontSize: 17,
        fontWeight: '600',
    },
    scrollContent: {
        paddingHorizontal: 24,
        paddingBottom: 40,
    },
    previewContainer: {
        alignItems: 'center',
        marginBottom: 32,
    },
    sectionLabel: {
        fontSize: 13,
        fontWeight: '500',
        marginBottom: 12,
    },
    errorText: {
        fontSize: 13,
        fontWeight: '500',
        marginTop: 8,
    },
    actions: {
        marginTop: 40,
    },
});

export default EditCategoryModal;
