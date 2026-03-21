import React from 'react';
import { Text, StyleSheet, View } from 'react-native';
import NeoCard from '../ui/NeoCard';
import { useThemeColors } from '../../hooks/useThemeColors';

interface EventStatTileProps {
    label: string;
    value: string | number;
}

const EventStatTile: React.FC<EventStatTileProps> = ({ label, value }) => {
    const colors = useThemeColors();

    return (
        <NeoCard
            padding={16}
            backgroundColor={colors.surface}
            style={styles.tile}
        >
            <Text style={[styles.label, { color: colors.textMuted }]}>{label}</Text>
            <Text style={[styles.value, { color: colors.text }]} numberOfLines={1}>{value}</Text>
        </NeoCard>
    );
};

const styles = StyleSheet.create({
    tile: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    value: {
        fontSize: 16,
        fontWeight: '700',
    },
    label: {
        fontSize: 10,
        fontWeight: '600',
        marginBottom: 6,
        letterSpacing: 0.5,
    }
});

export default EventStatTile;
