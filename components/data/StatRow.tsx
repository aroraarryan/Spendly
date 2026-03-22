import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useThemeColors } from '@/hooks/useThemeColors';

interface StatRowProps {
    icon: string;
    label: string;
    value: string | number;
    isLast?: boolean;
}

const StatRow: React.FC<StatRowProps> = ({ icon, label, value, isLast }) => {
    const colors = useThemeColors();

    return (
        <View style={[styles.container, !isLast && { borderBottomWidth: 1, borderBottomColor: colors.border }]}>
            <View style={styles.left}>
                <Text style={styles.icon}>{icon}</Text>
                <Text style={[styles.label, { color: colors.textSecondary }]}>{label}</Text>
            </View>
            <Text style={[styles.value, { color: colors.text }]}>{value}</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 14,
    },
    left: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    icon: {
        fontSize: 16,
        marginRight: 12,
    },
    label: {
        fontSize: 14,
        fontWeight: '500',
    },
    value: {
        fontSize: 14,
        fontWeight: '700',
    },
});

export default StatRow;
