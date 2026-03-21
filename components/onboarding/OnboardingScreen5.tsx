import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withSpring,
    withDelay,
    withTiming,
    SharedValue,
} from 'react-native-reanimated';
import { useThemeColors } from '../../hooks/useThemeColors';
import { useSettingsStore } from '../../store/settingsStore';
import NeoCard from '../ui/NeoCard';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

const CONFETTI_COUNT = 12;

export default function OnboardingScreen5() {
    const colors = useThemeColors();
    const { monthlyBudget, currency, currencySymbol, notificationsEnabled } = useSettingsStore();

    const scale = useSharedValue(0);
    const titleOpacity = useSharedValue(0);
    const summaryOpacity = useSharedValue(0);

    useEffect(() => {
        scale.value = withSpring(1, { damping: 12, stiffness: 100 });
        titleOpacity.value = withDelay(400, withTiming(1, { duration: 500 }));
        summaryOpacity.value = withDelay(800, withTiming(1, { duration: 500 }));
    }, []);

    const animatedScaleStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }],
    }));

    const animatedTitleStyle = useAnimatedStyle(() => ({
        opacity: titleOpacity.value,
        transform: [{ translateY: withTiming(titleOpacity.value === 1 ? 0 : 20) }],
    }));

    const animatedSummaryStyle = useAnimatedStyle(() => ({
        opacity: summaryOpacity.value,
    }));

    return (
        <View style={styles.container}>
            <View style={styles.topSection}>
                <View style={styles.animationContainer}>
                    {/* Confetti Elements */}
                    {Array.from({ length: CONFETTI_COUNT }).map((_, i) => (
                        <ConfettiPiece key={i} index={i} scale={scale} colors={colors} />
                    ))}

                    <Animated.View style={[styles.successCircle, { backgroundColor: colors.accent }, animatedScaleStyle]}>
                        <Ionicons name="checkmark" size={64} color="#FFFFFF" />
                    </Animated.View>
                </View>

                <Animated.View style={[styles.textContainer, animatedTitleStyle]}>
                    <Text style={[styles.title, { color: colors.text }]}>You're all set! 🎉</Text>
                    <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
                        Start tracking your expenses and let Spendly help you reach your financial goals.
                    </Text>
                </Animated.View>
            </View>

            <Animated.View style={[styles.bottomSection, animatedSummaryStyle]}>
                <NeoCard padding={24}>
                    <View style={styles.summaryRow}>
                        <View style={styles.summaryLabelGroup}>
                            <Text style={styles.summaryIcon}>💰</Text>
                            <Text style={[styles.summaryLabel, { color: colors.text }]}>Monthly Budget</Text>
                        </View>
                        <Text style={[styles.summaryValue, { color: colors.accent }]}>
                            {monthlyBudget > 0 ? `${currencySymbol}${monthlyBudget.toLocaleString()}` : 'No limit'}
                        </Text>
                    </View>

                    <View style={[styles.divider, { backgroundColor: colors.border }]} />

                    <View style={styles.summaryRow}>
                        <View style={styles.summaryLabelGroup}>
                            <Text style={styles.summaryIcon}>💱</Text>
                            <Text style={[styles.summaryLabel, { color: colors.text }]}>Currency</Text>
                        </View>
                        <Text style={[styles.summaryValue, { color: colors.accent }]}>
                            {currency} ({currencySymbol})
                        </Text>
                    </View>

                    <View style={[styles.divider, { backgroundColor: colors.border }]} />

                    <View style={styles.summaryRow}>
                        <View style={styles.summaryLabelGroup}>
                            <Text style={styles.summaryIcon}>🔔</Text>
                            <Text style={[styles.summaryLabel, { color: colors.text }]}>Notifications</Text>
                        </View>
                        <Text style={[styles.summaryValue, { color: colors.accent }]}>
                            {notificationsEnabled ? 'Enabled' : 'Not enabled'}
                        </Text>
                    </View>
                </NeoCard>
            </Animated.View>
        </View>
    );
}

function ConfettiPiece({ index, scale, colors }: { index: number, scale: SharedValue<number>, colors: any }) {
    const angle = (index / CONFETTI_COUNT) * Math.PI * 2;
    const distance = 80 + Math.random() * 40;

    // Confetti colors
    const confettiColors = [colors.accent, colors.success, colors.warning, '#FF6B6B', '#4DABF7'];
    const color = confettiColors[index % confettiColors.length];

    const animatedStyle = useAnimatedStyle(() => {
        const x = Math.cos(angle) * distance * scale.value;
        const y = Math.sin(angle) * distance * scale.value;
        const opacity = scale.value > 0.5 ? withTiming(0, { duration: 1000 }) : 1;

        return {
            transform: [
                { translateX: x },
                { translateY: y },
                { rotate: `${scale.value * 360}deg` },
                { scale: withTiming(scale.value === 1 ? 0 : 1) }
            ],
            opacity: opacity,
        };
    });

    return (
        <Animated.View
            style={[
                styles.confetti,
                {
                    backgroundColor: color,
                    borderRadius: index % 2 === 0 ? 2 : 99
                },
                animatedStyle
            ]}
        />
    );
}

const styles = StyleSheet.create({
    container: {
        width,
        flex: 1,
        paddingHorizontal: 30,
    },
    topSection: {
        flex: 0.55,
        justifyContent: 'center',
        alignItems: 'center',
    },
    animationContainer: {
        width: 160,
        height: 160,
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
        marginBottom: 40,
    },
    successCircle: {
        width: 160,
        height: 160,
        borderRadius: 80,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 5,
    },
    confetti: {
        position: 'absolute',
        width: 8,
        height: 8,
    },
    textContainer: {
        alignItems: 'center',
    },
    title: {
        fontSize: 32,
        fontWeight: '800',
        marginBottom: 16,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 15,
        lineHeight: 24,
        textAlign: 'center',
        paddingHorizontal: 20,
    },
    bottomSection: {
        flex: 0.45,
    },
    summaryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12,
    },
    summaryLabelGroup: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    summaryIcon: {
        fontSize: 18,
        marginRight: 12,
    },
    summaryLabel: {
        fontSize: 15,
        fontWeight: '600',
    },
    summaryValue: {
        fontSize: 15,
        fontWeight: '700',
    },
    divider: {
        height: 1,
        width: '100%',
    },
});
