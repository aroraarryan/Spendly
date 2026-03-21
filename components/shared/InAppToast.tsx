import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withSpring,
    withTiming,
    runOnJS
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useToast } from '../../hooks/useToast';
import { Theme } from '../../constants/theme';
import { useThemeColors } from '../../hooks/useThemeColors';

const InAppToast = () => {
    const { visible, title, body, hideToast } = useToast();
    const insets = useSafeAreaInsets();
    const colors = useThemeColors();
    const translateY = useSharedValue(-200);

    useEffect(() => {
        if (visible) {
            translateY.value = withSpring(insets.top + 12, {
                damping: 18,
                stiffness: 200,
            });

            const timer = setTimeout(() => {
                dismiss();
            }, 5000);

            return () => clearTimeout(timer);
        } else {
            translateY.value = withTiming(-200);
        }
    }, [visible, insets.top]);

    const dismiss = () => {
        translateY.value = withTiming(-200, { duration: 250 }, (finished) => {
            if (finished) {
                runOnJS(hideToast)();
            }
        });
    };

    const animatedStyle = useAnimatedStyle(() => {
        return {
            transform: [{ translateY: translateY.value }],
        };
    });

    if (!visible && translateY.value === -200) return null;

    return (
        <Animated.View style={[styles.container, animatedStyle]}>
            <TouchableOpacity
                activeOpacity={0.9}
                onPress={dismiss}
                style={[styles.card, { backgroundColor: colors.accent, ...Theme.shadow.md }]}
            >
                <View style={styles.content}>
                    <View style={styles.header}>
                        <View style={[styles.iconDot, { backgroundColor: '#FFFFFF' }]} />
                        <Text style={[styles.title, { color: '#FFFFFF' }]} numberOfLines={1}>{title}</Text>
                    </View>
                    <Text style={[styles.body, { color: '#FFFFFF' }]} numberOfLines={2}>{body}</Text>
                </View>
            </TouchableOpacity>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        top: 0,
        left: 20,
        right: 20,
        zIndex: 99999,
    },
    card: {
        padding: 16,
        borderRadius: 16,
    },
    content: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 4,
    },
    iconDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        marginRight: 8,
    },
    title: {
        fontSize: 14,
        fontWeight: '700',
    },
    body: {
        fontSize: 13,
        fontWeight: '400',
        opacity: 0.9,
    },
});

export default InAppToast;
