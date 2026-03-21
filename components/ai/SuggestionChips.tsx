import React, { useState } from 'react';
import { ScrollView, TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import { useThemeColors } from '../../hooks/useThemeColors';

const CHIPS = [
    'Where am I overspending?',
    'Give me a savings plan',
    'Compare this vs last month',
    'Which expenses can I cut?',
    'Am I within my budget?'
];

export default function SuggestionChips({ onSelect }: { onSelect: (text: string) => void }) {
    const colors = useThemeColors();
    const [tapped, setTapped] = useState<string | null>(null);

    const handlePress = (text: string) => {
        setTapped(text);
        onSelect(text);
        setTimeout(() => setTapped(null), 300);
    };

    return (
        <View style={{ height: 60, marginBottom: 8 }}>
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.container}
                keyboardShouldPersistTaps="always"
            >
                {CHIPS.map((chip, idx) => (
                    <TouchableOpacity
                        key={idx}
                        activeOpacity={0.9}
                        onPress={() => handlePress(chip)}
                        style={[
                            styles.chip,
                            {
                                backgroundColor: tapped === chip ? colors.accent : colors.surface,
                                borderColor: tapped === chip ? colors.accent : colors.border,
                            }
                        ]}
                    >
                        <Text style={[
                            styles.text,
                            { color: tapped === chip ? '#FFF' : colors.text }
                        ]}>
                            {chip}
                        </Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: 16,
        paddingBottom: 8,
        alignItems: 'center',
    },
    chip: {
        borderWidth: 1,
        borderRadius: 16,
        paddingHorizontal: 16,
        paddingVertical: 10,
        marginRight: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
        justifyContent: 'center',
        alignItems: 'center',
    },
    text: {
        fontSize: 13,
        fontWeight: '700',
    }
});
