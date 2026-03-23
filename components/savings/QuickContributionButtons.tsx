import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useThemeColors } from '@/hooks/useThemeColors';
import NeoButton from '@/components/ui/NeoButton';

interface QuickContributionButtonsProps {
    onSelect: (amount: number) => void;
}

const QuickContributionButtons: React.FC<QuickContributionButtonsProps> = ({ onSelect }) => {
    const colors = useThemeColors();
    const amounts = [500, 1000, 5000, 10000];

    return (
        <View style={styles.container}>
            <Text style={[styles.label, { color: colors.textMuted }]}>ADD MONEY QUICKLY</Text>
            <View style={styles.row}>
                {amounts.map(amount => (
                    <NeoButton
                        key={amount}
                        label={`+₹${amount.toLocaleString()}`}
                        onPress={() => onSelect(amount)}
                        variant="secondary"
                        size="sm"
                        style={styles.btn}
                    />
                ))}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginVertical: 12,
    },
    label: {
        fontSize: 10,
        fontWeight: '700',
        marginBottom: 12,
        letterSpacing: 0.5,
    },
    row: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    btn: {
        flex: 1,
        minWidth: '22%',
    },
});

export default QuickContributionButtons;
