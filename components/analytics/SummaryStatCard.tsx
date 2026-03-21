import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useThemeColors } from '../../hooks/useThemeColors';
import NeoCard from '../ui/NeoCard';

interface SummaryStatCardProps {
    icon: keyof typeof Ionicons.glyphMap;
    label: string;
    value: string;
    iconBgColor: string;
}

const SummaryStatCard: React.FC<SummaryStatCardProps> = ({ icon, label, value, iconBgColor }) => {
    const colors = useThemeColors();

    return (
        <NeoCard
            padding={16}
            style={styles.card}
            backgroundColor={colors.surface}
        >
            <View style={[styles.iconContainer, { backgroundColor: iconBgColor }]}>
                <Ionicons name={icon} size={20} color={colors.accent} />
            </View>
            <Text style={[styles.label, { color: colors.textSecondary }]}>{label}</Text>
            <Text style={[styles.value, { color: colors.text }]} numberOfLines={1}>{value}</Text>
        </NeoCard>
    );
};

const styles = StyleSheet.create({
    card: {
        flex: 1,
        borderRadius: 16,
        marginHorizontal: 4,
    },
    iconContainer: {
        width: 36,
        height: 36,
        borderRadius: 18,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 8,
    },
    label: {
        fontSize: 11,
        fontWeight: '500',
        marginBottom: 4,
    },
    value: {
        fontSize: 16,
        fontWeight: '700',
    },
});

export default SummaryStatCard;
