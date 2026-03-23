import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useThemeColors } from '@/hooks/useThemeColors';

interface SmartSuggestionsProps {
    goalName: string;
    onSelect: (amount: number) => void;
}

const SmartSuggestions: React.FC<SmartSuggestionsProps> = ({ goalName, onSelect }) => {
    const colors = useThemeColors();
    const name = goalName.toLowerCase();

    // Suggestion logic based on keywords
    const getSuggestions = () => {
        if (name.includes('emergency')) return [50000, 100000, 200000, 500000];
        if (name.includes('iphone') || name.includes('phone')) return [80000, 120000, 150000];
        if (name.includes('macbook') || name.includes('laptop')) return [100000, 150000, 200000];
        if (name.includes('trip') || name.includes('vacation')) return [25000, 50000, 100000];
        if (name.includes('car') || name.includes('bike')) return [100000, 500000, 1000000];
        return [];
    };

    const suggestions = getSuggestions();
    if (suggestions.length === 0) return null;

    return (
        <View style={styles.container}>
            <Text style={[styles.label, { color: colors.textMuted }]}>QUICK BUDGETS</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scroll}>
                {suggestions.map(amount => (
                    <TouchableOpacity
                        key={amount}
                        style={[styles.chip, { backgroundColor: colors.surface2 }]}
                        onPress={() => onSelect(amount)}
                    >
                        <Text style={[styles.chipText, { color: colors.accent }]}>
                            ₹{amount.toLocaleString()}
                        </Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginTop: 12,
    },
    label: {
        fontSize: 10,
        fontWeight: '700',
        marginBottom: 8,
        letterSpacing: 0.5,
    },
    scroll: {
        gap: 8,
    },
    chip: {
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 99,
    },
    chipText: {
        fontSize: 13,
        fontWeight: '600',
    },
});

export default SmartSuggestions;
