import React, { useEffect } from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withRepeat,
    withTiming,
    withSequence
} from 'react-native-reanimated';
import { useThemeColors } from '../../hooks/useThemeColors';

interface SkeletonProps {
    width?: number | string;
    height?: number | string;
    borderRadius?: number;
    style?: ViewStyle;
}

export const Skeleton = ({ width = '100%', height = 20, borderRadius = 8, style }: SkeletonProps) => {
    const colors = useThemeColors();
    const opacity = useSharedValue(0.3);

    useEffect(() => {
        opacity.value = withRepeat(
            withSequence(
                withTiming(1, { duration: 1000 }),
                withTiming(0.3, { duration: 1000 })
            ),
            -1,
            true
        );
    }, []);

    const animatedStyle = useAnimatedStyle(() => ({
        opacity: opacity.value,
    }));

    return (
        <Animated.View
            style={[
                styles.skeleton,
                {
                    width: width as any,
                    height: height as any,
                    borderRadius,
                    backgroundColor: !colors.isDark ? '#E9ECEF' : '#2D3142',
                },
                style,
                animatedStyle,
            ]}
        />
    );
};

const styles = StyleSheet.create({
    skeleton: {
        overflow: 'hidden',
    },
});
