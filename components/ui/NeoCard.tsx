import React from 'react';
import { View, ViewStyle, StyleSheet, StyleProp } from 'react-native';
import { Theme } from '../../constants/theme';
import { useThemeColors } from '../../hooks/useThemeColors';

interface NeoCardProps {
    children: React.ReactNode;
    style?: StyleProp<ViewStyle>;
    padding?: number;
    backgroundColor?: string;
    borderRadius?: number;
    // Keep props for compatibility but adapt to Minimalist style
    neonAccent?: boolean;
    borderHeight?: number;
    borderColor?: string;
    marginBottom?: number;
    marginTop?: number;
}

const NeoCard: React.FC<NeoCardProps> = ({
    children,
    style,
    padding = 16,
    backgroundColor,
    borderRadius = 16,
    neonAccent = false,
    borderColor,
    marginBottom,
    marginTop,
}) => {
    const colors = useThemeColors();

    return (
        <View
            style={[
                styles.card,
                {
                    padding,
                    backgroundColor: backgroundColor || colors.surface,
                    borderColor: borderColor || colors.border,
                    borderRadius,
                    marginBottom,
                    marginTop,
                },
                neonAccent && { borderTopWidth: 3, borderTopColor: colors.accent },
                style,
            ]}
        >
            {children}
        </View>
    );
};

const styles = StyleSheet.create({
    card: {
        borderWidth: 1,
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
        elevation: 2,
    },
});

export default NeoCard;
