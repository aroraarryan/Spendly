import React, { useEffect } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withRepeat, withSequence, withTiming, withDelay } from 'react-native-reanimated';
import { useThemeColors } from '../../hooks/useThemeColors';

const Dot = ({ delay }: { delay: number }) => {
    const scale = useSharedValue(1);

    useEffect(() => {
        scale.value = withDelay(
            delay,
            withRepeat(
                withSequence(
                    withTiming(1.5, { duration: 300 }),
                    withTiming(1, { duration: 300 })
                ),
                -1,
                true
            )
        );
    }, []);

    const style = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }]
    }));

    return <Animated.View style={[styles.dot, style]} />;
};

export default function TypingIndicator() {
    const colors = useThemeColors();

    return (
        <View style={styles.container}>
            <View style={[styles.bubble, { backgroundColor: colors.surface }]}>
                <Dot delay={0} />
                <Dot delay={150} />
                <Dot delay={300} />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        alignSelf: 'flex-start',
        marginBottom: 16,
    },
    bubble: {
        flexDirection: 'row',
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderRadius: 20,
        backgroundColor: '#FFF',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    dot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#000',
        marginHorizontal: 3,
    }
});
