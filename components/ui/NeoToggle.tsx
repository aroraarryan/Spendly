import React, { useEffect } from 'react';
import { TouchableOpacity, StyleSheet, View } from 'react-native';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withSpring,
    interpolateColor
} from 'react-native-reanimated';
import { haptic } from '../../utils/haptics';
import { useThemeColors } from '../../hooks/useThemeColors';

interface NeoToggleProps {
    value: boolean;
    onValueChange: (value: boolean) => void;
    disabled?: boolean;
}

const NeoToggle: React.FC<NeoToggleProps> = ({ value, onValueChange, disabled = false }) => {
    const colors = useThemeColors();
    const translateX = useSharedValue(value ? 20 : 2);

    useEffect(() => {
        translateX.value = withSpring(value ? 20 : 2, { damping: 20, stiffness: 250 });
    }, [value]);

    const handleToggle = () => {
        if (disabled) return;
        haptic.selection();
        onValueChange(!value);
    };

    const trackStyle = useAnimatedStyle(() => {
        return {
            backgroundColor: interpolateColor(
                translateX.value,
                [2, 20],
                [colors.border, colors.accent]
            ),
        };
    });

    const thumbStyle = useAnimatedStyle(() => {
        return {
            transform: [{ translateX: translateX.value }],
        };
    });

    return (
        <TouchableOpacity
            activeOpacity={0.8}
            onPress={handleToggle}
            disabled={disabled}
            style={{ opacity: disabled ? 0.5 : 1 }}
        >
            <Animated.View style={[styles.track, trackStyle]}>
                <Animated.View style={[styles.thumb, thumbStyle]} />
            </Animated.View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    track: {
        width: 44,
        height: 26,
        borderRadius: 13,
        justifyContent: 'center',
    },
    thumb: {
        width: 22,
        height: 22,
        borderRadius: 11,
        backgroundColor: '#FFFFFF',
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 4,
        elevation: 2,
    },
});

export default NeoToggle;
