import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import NeoCard from '../ui/NeoCard';
import { useThemeColors } from '../../hooks/useThemeColors';

interface EmojiPickerProps {
    selectedEmoji: string;
    onEmojiSelect: (emoji: string) => void;
}

const EMOJIS = [
    '🍔', '🍕', '🍜', '🍣', '🥗', '🍺', '☕', '🧁', '🛒', '🚗',
    '🚕', '🚌', '🚂', '✈️', '🚢', '🛵', '🎬', '🎮', '🎵', '🎭',
    '🎪', '🎯', '🏋️', '⚽', '🏊', '🧘', '💊', '🏥', '💉', '🦷',
    '👕', '👟', '💍', '💄', '🛍️', '💻', '📱', '🖥️', '⌚', '📷',
    '🏠', '💡', '🔧', '🛋️', '🌿', '📚', '🎓', '📝', '✏️', '🐶',
    '🐱', '🌴', '🎁', '💝', '🎊', '💰', '💳', '🏦', '📈', '🔑', '🎨'
];

const EmojiPicker: React.FC<EmojiPickerProps> = ({ selectedEmoji, onEmojiSelect }) => {
    const colors = useThemeColors();

    return (
        <View style={[styles.outerContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <ScrollView
                contentContainerStyle={styles.grid}
                showsVerticalScrollIndicator={false}
            >
                {EMOJIS.map((emoji) => {
                    const isSelected = selectedEmoji === emoji;
                    return (
                        <TouchableOpacity
                            key={emoji}
                            onPress={() => onEmojiSelect(emoji)}
                            style={styles.emojiWrapper}
                        >
                            <View
                                style={[
                                    styles.emojiCircle,
                                    {
                                        backgroundColor: isSelected ? colors.accentLight : 'transparent',
                                        borderColor: isSelected ? colors.accent : 'transparent',
                                        borderWidth: isSelected ? 1 : 0
                                    }
                                ]}
                            >
                                <Text style={styles.emojiText}>{emoji}</Text>
                            </View>
                        </TouchableOpacity>
                    );
                })}
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    outerContainer: {
        height: 220,
        borderWidth: 1,
        borderRadius: 16,
        overflow: 'hidden',
    },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        padding: 12,
    },
    emojiWrapper: {
        width: '20%',
        aspectRatio: 1,
        padding: 4,
    },
    emojiCircle: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 20,
    },
    emojiText: {
        fontSize: 24,
    }
});

export default EmojiPicker;
