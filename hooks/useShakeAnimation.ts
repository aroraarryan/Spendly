import { useCallback } from 'react';
import { useSharedValue, withSequence, withTiming, withRepeat, useAnimatedStyle } from 'react-native-reanimated';

export function useShakeAnimation() {
    const shakeValue = useSharedValue(0);

    const triggerShake = useCallback(() => {
        shakeValue.value = withSequence(
            withTiming(0, { duration: 0 }),
            withRepeat(withTiming(12, { duration: 40 }), 4, true),
            withTiming(0, { duration: 40 })
        );
    }, []);

    const shakeStyle = useAnimatedStyle(() => {
        return {
            transform: [{ translateX: shakeValue.value }],
        };
    });

    return { shakeStyle, triggerShake };
}
