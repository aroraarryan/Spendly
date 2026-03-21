import React from 'react';
import { ScrollView, TouchableOpacity, View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useThemeColors } from '../../hooks/useThemeColors';

interface ColorPickerProps {
    selectedColor: string;
    onColorSelect: (color: string) => void;
}

const COLORS = [
    '#6C63FF', '#FF6B6B', '#4ECDC4', '#45B7D1',
    '#FFA07A', '#98D8C8', '#F7D794', '#778BEB',
    '#E77F67', '#CF6A87', '#546DE5', '#F19066',
    '#3DC1D3', '#F3A683', '#574B90', '#F5CD79'
];

const ColorPicker: React.FC<ColorPickerProps> = ({ selectedColor, onColorSelect }) => {
    const colors = useThemeColors();

    return (
        <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.container}
        >
            {COLORS.map((color) => {
                const isSelected = selectedColor === color;
                return (
                    <TouchableOpacity
                        key={color}
                        onPress={() => onColorSelect(color)}
                        style={[
                            styles.colorCircle,
                            {
                                backgroundColor: color,
                                borderColor: isSelected ? colors.text : 'transparent',
                                borderWidth: isSelected ? 2 : 0,
                                transform: [{ scale: isSelected ? 1.1 : 1 }]
                            }
                        ]}
                    >
                        {isSelected && (
                            <Ionicons name="checkmark" size={16} color="#FFFFFF" style={styles.check} />
                        )}
                    </TouchableOpacity>
                );
            })}
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        paddingVertical: 12,
        paddingRight: 20,
    },
    colorCircle: {
        width: 36,
        height: 36,
        borderRadius: 18,
        marginRight: 14,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    check: {
        textShadowColor: 'rgba(0,0,0,0.2)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 2,
    }
});

export default ColorPicker;
