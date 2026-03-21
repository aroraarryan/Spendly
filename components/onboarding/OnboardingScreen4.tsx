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
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

const FEATURES_LIST = [
    { text: '⚡ Budget alerts when you hit 80% of your limit' },
    { text: '📅 Monthly summary on the 1st of each month' },
    { text: '💰 Daily reminders to log your expenses' },
];

export default function OnboardingScreen4() {
    const colors = useThemeColors();
    const bannerY = useSharedValue(-70);
    const bannerOpacity = useSharedValue(0);

    useEffect(() => {
        bannerY.value = withRepeat(
            withSequence(
                withTiming(0, { duration: 1000 }),
                withDelay(2500, withTiming(-70, { duration: 800 }))
            ),
            -1,
            false
        );
        bannerOpacity.value = withRepeat(
            withSequence(
                withTiming(1, { duration: 800 }),
                withDelay(2500, withTiming(0, { duration: 800 }))
            ),
            -1,
            false
        );
    }, []);

    const animatedBannerStyle = useAnimatedStyle(() => ({
        transform: [{ translateY: bannerY.value }],
        opacity: bannerOpacity.value,
    }));

    return (
        <View style={styles.container}>
            <View style={styles.topSection}>
                <View style={[styles.phoneContainer, { borderColor: colors.border, backgroundColor: colors.background }]}>
                    <View style={styles.phoneInner}>
                        {/* Mock Notch */}
                        <View style={[styles.notch, { backgroundColor: colors.border }]} />

                        <Animated.View style={[
                            styles.banner,
                            {
                                borderColor: colors.accent,
                                backgroundColor: colors.surface,
                                shadowColor: colors.accent,
                            },
                            animatedBannerStyle
                        ]}>
                            <View style={[styles.bellCircle, { backgroundColor: colors.accentLight }]}>
                                <Ionicons name="notifications" size={12} color={colors.accent} />
                            </View>
                            <View style={styles.bannerContent}>
                                <Text numberOfLines={1} style={[styles.bannerTitle, { color: colors.text }]}>Budget Alert</Text>
                                <Text numberOfLines={1} style={[styles.bannerText, { color: colors.textSecondary }]}>80% used</Text>
                            </View>
                        </Animated.View>

                        <View style={[styles.mockScreen, { backgroundColor: colors.surface2 }]} />

                        {/* Mock Home Indicator */}
                        <View style={[styles.homeIndicator, { backgroundColor: colors.border }]} />
                    </View>
                </View>
            </View>

            <View style={styles.contentSection}>
                <Text style={[styles.title, { color: colors.text }]}>Stay on track</Text>

                <View style={styles.list}>
                    {FEATURES_LIST.map((item, index) => (
                        <View key={index} style={styles.row}>
                            <View style={[styles.checkCircle, { backgroundColor: colors.accentLight }]}>
                                <Ionicons name="checkmark" size={14} color={colors.accent} />
                            </View>
                            <Text style={[styles.rowText, { color: colors.textSecondary }]}>{item.text}</Text>
                        </View>
                    ))}
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        width,
        flex: 1,
        paddingHorizontal: 30,
    },
    topSection: {
        flex: 0.5,
        justifyContent: 'center',
        alignItems: 'center',
    },
    phoneContainer: {
        width: 140,
        height: 240,
        borderWidth: 4,
        borderRadius: 24,
        padding: 6,
    },
    phoneInner: {
        flex: 1,
        borderRadius: 16,
        overflow: 'hidden',
        position: 'relative',
    },
    notch: {
        position: 'absolute',
        top: 0,
        alignSelf: 'center',
        width: 60,
        height: 18,
        borderBottomLeftRadius: 10,
        borderBottomRightRadius: 10,
        zIndex: 20,
    },
    homeIndicator: {
        position: 'absolute',
        bottom: 8,
        alignSelf: 'center',
        width: 40,
        height: 4,
        borderRadius: 2,
        opacity: 0.3,
    },
    mockScreen: {
        flex: 1,
    },
    banner: {
        position: 'absolute',
        top: 24, // Position below the notch
        left: 10,
        right: 10,
        padding: 8,
        borderRadius: 12,
        borderWidth: 1.5,
        flexDirection: 'row',
        alignItems: 'center',
        zIndex: 10,
        elevation: 2,
    },
    bellCircle: {
        width: 24,
        height: 24,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 8,
    },
    bannerContent: {
        flex: 1,
    },
    bannerTitle: {
        fontSize: 10,
        fontWeight: '700',
    },
    bannerText: {
        fontSize: 9,
    },
    contentSection: {
        flex: 0.5,
    },
    title: {
        fontSize: 28,
        fontWeight: '800',
        marginBottom: 32,
        textAlign: 'center',
    },
    list: {
        gap: 20,
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    checkCircle: {
        width: 28,
        height: 28,
        borderRadius: 14,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 16,
    },
    rowText: {
        fontSize: 14,
        fontWeight: '500',
        flex: 1,
    },
});
