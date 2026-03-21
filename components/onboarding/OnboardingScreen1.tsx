import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withRepeat,
    withSequence,
    withTiming,
    withDelay
} from 'react-native-reanimated';
import { useThemeColors } from '../../hooks/useThemeColors';
import NeoCard from '../ui/NeoCard';

const { width } = Dimensions.get('window');

export default function OnboardingScreen1() {
    const colors = useThemeColors();

    const float1 = useSharedValue(0);
    const float2 = useSharedValue(0);
    const float3 = useSharedValue(0);

    useEffect(() => {
        float1.value = withRepeat(
            withSequence(
                withTiming(-10, { duration: 2000 }),
                withTiming(10, { duration: 2000 })
            ),
            -1,
            true
        );
        float2.value = withDelay(500, withRepeat(
            withSequence(
                withTiming(-15, { duration: 2500 }),
                withTiming(15, { duration: 2500 })
            ),
            -1,
            true
        ));
        float3.value = withDelay(1000, withRepeat(
            withSequence(
                withTiming(-12, { duration: 2200 }),
                withTiming(12, { duration: 2200 })
            ),
            -1,
            true
        ));
    }, []);

    const animatedStyle1 = useAnimatedStyle(() => ({
        transform: [{ translateY: float1.value }],
    }));
    const animatedStyle2 = useAnimatedStyle(() => ({
        transform: [{ translateY: float2.value }],
    }));
    const animatedStyle3 = useAnimatedStyle(() => ({
        transform: [{ translateY: float3.value }],
    }));

    return (
        <View style={styles.container}>
            <View style={styles.topSection}>
                <View style={[styles.illustrationContainer, { backgroundColor: '#EEF0FF' }]}>
                    <Text style={styles.emoji}>💰</Text>

                    {/* Floating Cards */}
                    <Animated.View style={[styles.floatingCard, styles.card1, animatedStyle1]}>
                        <NeoCard padding={8} style={styles.miniCard}>
                            <Text style={styles.miniText}>🍔 Food ₹250</Text>
                        </NeoCard>
                    </Animated.View>

                    <Animated.View style={[styles.floatingCard, styles.card2, animatedStyle2]}>
                        <NeoCard padding={8} style={styles.miniCard}>
                            <Text style={styles.miniText}>🚗 Transport ₹150</Text>
                        </NeoCard>
                    </Animated.View>

                    <Animated.View style={[styles.floatingCard, styles.card3, animatedStyle3]}>
                        <NeoCard padding={8} style={styles.miniCard}>
                            <Text style={styles.miniText}>🎬 Media ₹500</Text>
                        </NeoCard>
                    </Animated.View>
                </View>
            </View>

            <View style={styles.bottomSection}>
                <Text style={[styles.welcomeText, { color: colors.textSecondary }]}>Welcome to</Text>
                <Text style={[styles.title, { color: colors.text }]}>Spendly</Text>
                <Text style={[styles.tagline, { color: colors.textSecondary }]}>
                    Your personal finance companion.{'\n'}Track smarter, save better.
                </Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        width,
        flex: 1,
        paddingHorizontal: 40,
    },
    topSection: {
        flex: 0.6,
        justifyContent: 'center',
        alignItems: 'center',
    },
    illustrationContainer: {
        width: 200,
        height: 200,
        borderRadius: 100,
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
    },
    emoji: {
        fontSize: 80,
    },
    floatingCard: {
        position: 'absolute',
        zIndex: 10,
    },
    card1: {
        top: -10,
        right: -60,
    },
    card2: {
        bottom: 20,
        left: -70,
    },
    card3: {
        top: 60,
        left: -60,
    },
    miniCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    miniText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#1A1A2E',
    },
    bottomSection: {
        flex: 0.4,
        alignItems: 'center',
    },
    welcomeText: {
        fontSize: 16,
        fontWeight: '400',
        marginBottom: 4,
    },
    title: {
        fontSize: 40,
        fontWeight: '800',
        marginBottom: 16,
    },
    tagline: {
        fontSize: 15,
        lineHeight: 24,
        textAlign: 'center',
    },
});
