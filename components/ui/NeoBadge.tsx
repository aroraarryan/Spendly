import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useThemeColors } from '../../hooks/useThemeColors';

interface NeoBadgeProps {
    label: string | number;
    variant?: 'primary' | 'success' | 'danger' | 'warning' | 'neutral';
    style?: any;
}

const NeoBadge: React.FC<NeoBadgeProps & { icon?: keyof typeof Ionicons.glyphMap }> = ({ label, variant = 'primary', icon, style }) => {
    const colors = useThemeColors();

    const getStyles = () => {
        switch (variant) {
            case 'success':
                return { bg: colors.successLight, text: colors.success };
            case 'danger':
                return { bg: colors.dangerLight, text: colors.danger };
            case 'warning':
                return { bg: colors.warningLight, text: colors.warning };
            case 'neutral':
                return { bg: colors.surface2, text: colors.textSecondary };
            default:
                return { bg: colors.accentLight, text: colors.accent };
        }
    };

    const { bg, text } = getStyles();

    return (
        <View style={[styles.badge, { backgroundColor: bg, flexDirection: 'row', alignItems: 'center' }, style]}>
            {icon && <Ionicons name={icon} size={14} color={text} style={{ marginRight: 6 }} />}
            <Text style={[styles.text, { color: text }]}>{label}</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    badge: {
        paddingVertical: 3,
        paddingHorizontal: 10,
        borderRadius: 999,
        alignSelf: 'flex-start',
    },
    text: {
        fontSize: 11,
        fontWeight: '600',
    },
});

export default NeoBadge;
