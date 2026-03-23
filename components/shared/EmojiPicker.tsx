import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useThemeColors } from '@/hooks/useThemeColors';
import NeoCard from '@/components/ui/NeoCard';

const EMOJIS = ['🎯', '💰', '🏠', '🚗', '🏔️', '📱', '💻', '🚲', '✈️', '🎁', '🎓', '🏥', '💎', '💍', '🎮', '🛠️', '👗', '👶', '🐶', '🍕'];

interface EmojiPickerProps {
    selectedEmoji: string;
    onSelect: (emoji: string) => void;
}

export default function EmojiPicker({ selectedEmoji, onSelect }: EmojiPickerProps) {
    const colors = useThemeColors();

    return (
        <View style={styles.container}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scroll}>
                {EMOJIS.map(emoji => (
                    <TouchableOpacity
                        key={emoji}
                        onPress={() => onSelect(emoji)}
                        style={[
                            styles.emojiBtn,
                            { backgroundColor: colors.surface2 },
                            selectedEmoji === emoji && { borderColor: colors.accent, borderWidth: 2 }
                        ]}
                    >
                        <Text style={styles.emojiText}>{emoji}</Text>
                    </TouchableOpacity>
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
        gap: 8,
    },
    emojiBtn: {
        width: 44,
        height: 44,
        borderRadius: 22,
        alignItems: 'center',
        justifyContent: 'center',
    },
    emojiText: {
        fontSize: 22,
    }
});
