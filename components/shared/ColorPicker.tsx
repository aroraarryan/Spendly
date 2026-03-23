import React from 'react';
import { View, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useThemeColors } from '@/hooks/useThemeColors';

const COLORS = [
    '#6366F1', // Indigo
    '#10B981', // Emerald
    '#F59E0B', // Amber
    '#EF4444', // Red
    '#EC4899', // Pink
    '#8B5CF6', // Violet
    '#06B6D4', // Cyan
    '#F97316', // Orange
    '#14B8A6', // Teal
    '#4ADE80', // Light Green
];

interface ColorPickerProps {
    selectedColor: string;
    onSelect: (color: string) => void;
}

export default function ColorPicker({ selectedColor, onSelect }: ColorPickerProps) {
    const colors = useThemeColors();

    return (
        <View style={styles.container}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scroll}>
                {COLORS.map(color => (
                    <TouchableOpacity
                        key={color}
                        onPress={() => onSelect(color)}
                        style={[
                            styles.colorBtn,
                            { backgroundColor: color },
                            selectedColor === color && { borderColor: colors.white, borderWidth: 2, transform: [{ scale: 1.1 }] }
                        ]}
                    />
                ))}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginBottom: 8,
    },
    scroll: {
        paddingVertical: 4,
        gap: 12,
    },
    colorBtn: {
        width: 32,
        height: 32,
        borderRadius: 16,
    }
});
