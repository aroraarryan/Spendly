import React from 'react';
import {
    TouchableOpacity,
    Text,
    TextStyle,
    ViewStyle,
    ActivityIndicator,
    StyleSheet
} from 'react-native';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withSpring,
} from 'react-native-reanimated';
import { useThemeColors } from '../../hooks/useThemeColors';
import { Theme } from '../../constants/theme';

interface NeoButtonProps {
    label?: string;
    onPress: () => void;
    variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
    backgroundColor?: string;
    textColor?: string;
    size?: 'sm' | 'md' | 'lg';
    disabled?: boolean;
    loading?: boolean;
    style?: ViewStyle;
    glowing?: boolean;
    children?: React.ReactNode;
}

const NeoButton: React.FC<NeoButtonProps> = ({
    label,
    onPress,
    variant = 'primary',
    backgroundColor,
    textColor,
    size = 'md',
    disabled = false,
    loading = false,
    style,
    children,
}) => {
    const colors = useThemeColors();
    const pressed = useSharedValue(0);

    const animatedStyle = useAnimatedStyle(() => {
        return {
            transform: [{ scale: withSpring(pressed.value ? 0.97 : 1, { damping: 15, stiffness: 200 }) }],
        };
    });

    const getStyles = () => {
        let bg = backgroundColor;
        let text = textColor;
        let borderWidth = 0;
        let borderColor = 'transparent';
        let shadow = {};

        switch (variant) {
            case 'secondary':
                bg = bg || colors.accentLight;
                text = text || colors.accent;
                borderWidth = 1;
                borderColor = colors.isDark ? 'rgba(255,255,255,0.1)' : 'rgba(108, 99, 255, 0.2)';
                break;
            case 'ghost':
                bg = 'transparent';
                text = text || colors.textSecondary;
                borderWidth = 1;
                borderColor = colors.border;
                break;
            case 'danger':
                bg = bg || colors.dangerLight;
                text = text || colors.danger;
                borderWidth = 1;
                borderColor = colors.isDark ? 'rgba(239, 68, 68, 0.2)' : 'rgba(239, 68, 68, 0.2)';
                break;
            default: // primary
                bg = bg || colors.accent;
                text = text || colors.white;
                shadow = {
                    shadowColor: colors.accent,
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.15,
                    shadowRadius: 12,
                    elevation: 4,
                };
        }

        return { bg, text, borderWidth, borderColor, shadow };
    };

    const { bg, text, borderWidth, borderColor, shadow } = getStyles();

    const getPadding = () => {
        switch (size) {
            case 'sm': return { py: 8, px: 16, fontSize: Theme.typography.sizes.xs };
            case 'lg': return { py: 18, px: 32, fontSize: Theme.typography.sizes.lg };
            default: return { py: 14, px: 24, fontSize: Theme.typography.sizes.md };
        }
    };

    const { py, px, fontSize } = getPadding();

    return (
        <TouchableOpacity
            activeOpacity={1}
            onPressIn={() => (pressed.value = 1)}
            onPressOut={() => (pressed.value = 0)}
            onPress={onPress}
            disabled={disabled || loading}
            style={style}
        >
            <Animated.View
                style={[
                    {
                        backgroundColor: bg,
                        borderWidth: borderWidth,
                        borderColor: borderColor,
                        borderRadius: 12,
                        paddingVertical: py,
                        paddingHorizontal: px,
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexDirection: 'row',
                    },
                    shadow,
                    animatedStyle,
                    disabled && { opacity: 0.5 },
                ]}
            >
                {loading ? (
                    <ActivityIndicator color={text} size="small" />
                ) : (
                    children || (
                        <Text
                            style={{
                                color: text,
                                fontSize: fontSize,
                                fontWeight: '600',
                                textAlign: 'center',
                            }}
                        >
                            {label}
                        </Text>
                    )
                )}
            </Animated.View>
        </TouchableOpacity>
    );
};

export default NeoButton;
