import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, {
    useAnimatedStyle,
    withSpring,
    useSharedValue
} from 'react-native-reanimated';
import { useThemeColors } from '../../hooks/useThemeColors';

interface ProgressDotsProps {
    currentPage: number;
    totalPages: number;
}

export default function ProgressDots({ currentPage, totalPages }: ProgressDotsProps) {
    const colors = useThemeColors();

    return (
        <View style={styles.container}>
            {Array.from({ length: totalPages }).map((_, index) => (
                <Dot key={index} active={index === currentPage} color={colors.accent} />
            ))}
        </View>
    );
}

function Dot({ active, color }: { active: boolean, color: string }) {
    const width = useSharedValue(active ? 24 : 8);

    useEffect(() => {
        width.value = withSpring(active ? 24 : 8, {
            damping: 20,
            stiffness: 200,
        });
    }, [active]);

    const animatedStyle = useAnimatedStyle(() => {
        return {
            width: width.value,
            backgroundColor: active ? color : '#E9ECEF',
            opacity: active ? 1 : 0.5,
        };
    });

    return (
        <Animated.View
            style={[
                styles.dot,
                animatedStyle
            ]}
        />
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginVertical: 20,
    },
    dot: {
        height: 8,
        borderRadius: 99,
        marginHorizontal: 4,
    },
});
