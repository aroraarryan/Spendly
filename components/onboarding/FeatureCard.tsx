import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withDelay,
    withTiming,
    withSpring
} from 'react-native-reanimated';
import NeoCard from '../ui/NeoCard';
import { useThemeColors } from '../../hooks/useThemeColors';

interface FeatureCardProps {
    icon: string;
    title: string;
    description: string;
    delay: number;
    iconBg: string;
}

export default function FeatureCard({ icon, title, description, delay, iconBg }: FeatureCardProps) {
    const colors = useThemeColors();
    const opacity = useSharedValue(0);
    const translateY = useSharedValue(20);

    useEffect(() => {
        opacity.value = withDelay(delay, withTiming(1, { duration: 600 }));
        translateY.value = withDelay(delay, withSpring(0, { damping: 12 }));
    }, []);

    const animatedStyle = useAnimatedStyle(() => {
        return {
            opacity: opacity.value,
            transform: [{ translateY: translateY.value }],
        };
    });

    return (
        <Animated.View style={[styles.container, animatedStyle]}>
            <NeoCard padding={16} style={styles.card}>
                <View style={[styles.iconCircle, { backgroundColor: iconBg }]}>
                    <Text style={styles.icon}>{icon}</Text>
                </View>
                <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
                <Text style={[styles.description, { color: colors.textSecondary }]}>
                    {description}
                </Text>
            </NeoCard>
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    container: {
        width: '48%',
        marginBottom: 16,
    },
    card: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 160,
    },
    iconCircle: {
        width: 48,
        height: 48,
        borderRadius: 24,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 12,
    },
    icon: {
        fontSize: 24,
    },
    title: {
        fontSize: 15,
        fontWeight: '700',
        textAlign: 'center',
        marginBottom: 6,
    },
    description: {
        fontSize: 11,
        lineHeight: 15,
        textAlign: 'center',
    },
});
