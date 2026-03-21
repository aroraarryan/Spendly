import React from 'react';
import { Text, Pressable, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming, withSpring } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { useThemeColors } from '../../hooks/useThemeColors';

interface NumpadButtonProps {
    value: string;
    onPress: (value: string) => void;
    isWide?: boolean;
}

export default function NumpadButton({ value, onPress, isWide = false }: NumpadButtonProps) {
    const colors = useThemeColors();
    const pressed = useSharedValue(0);

    const animatedStyle = useAnimatedStyle(() => {
        return {
            backgroundColor: withTiming(pressed.value ? colors.surface2 : colors.surface, { duration: 100 }),
            transform: [{ scale: withSpring(pressed.value ? 0.92 : 1) }],
        };
    });

    const handlePressIn = () => {
        pressed.value = 1;
    };

    const handlePressOut = () => {
        pressed.value = 0;
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        onPress(value);
    };

    return (
        <View style={{ flex: isWide ? 2 : 1, margin: 6 }}>
            <Animated.View
                style={[
                    animatedStyle,
                    {
                        height: 56,
                        borderRadius: 12,
                        alignItems: 'center',
                        justifyContent: 'center',
                    }
                ]}
            >
                <Pressable
                    onPressIn={handlePressIn}
                    onPressOut={handlePressOut}
                    style={{ width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center' }}
                >
                    {value === 'del' ? (
                        <Ionicons
                            name="backspace-outline"
                            size={22}
                            color={colors.textSecondary}
                        />
                    ) : (
                        <Text
                            style={{
                                fontSize: 20,
                                fontWeight: '600',
                                color: colors.text,
                            }}
                        >
                            {value}
                        </Text>
                    )}
                </Pressable>
            </Animated.View>
        </View>
    );
}
