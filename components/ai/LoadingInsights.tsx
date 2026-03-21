import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withRepeat, withTiming, withSequence } from 'react-native-reanimated';
import { useThemeColors } from '../../hooks/useThemeColors';

const MESSAGES = [
    'Analyzing your spending patterns...',
    'Identifying where you can save...',
    'Calculating your financial health...',
    'Preparing personalized recommendations...'
];

export default function LoadingInsights({ onCancel }: { onCancel: () => void }) {
    const colors = useThemeColors();
    const [msgIndex, setMsgIndex] = useState(0);

    const borderColorVal = useSharedValue(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setMsgIndex(prev => (prev + 1) % MESSAGES.length);
        }, 2000);

        borderColorVal.value = withRepeat(
            withSequence(
                withTiming(1, { duration: 1000 }),
                withTiming(0, { duration: 1000 })
            ),
            -1,
            true
        );

        return () => clearInterval(interval);
    }, []);

    const animatedStyle = useAnimatedStyle(() => {
        return {
            borderColor: borderColorVal.value === 1 ? colors.accent : colors.border
        };
    });

    return (
        <Animated.View style={[styles.card, animatedStyle, { backgroundColor: colors.surface }]}>
            <View style={{ alignItems: 'center', marginBottom: 16 }}>
                <Text style={{ fontSize: 40, marginBottom: 12 }}>🤖</Text>
            </View>

            <View style={{ height: 40, justifyContent: 'center', alignItems: 'center', marginBottom: 16 }}>
                <Text style={{ fontSize: 16, fontWeight: '700', color: colors.text, textAlign: 'center' }}>
                    {MESSAGES[msgIndex]}
                </Text>
            </View>

            <Text style={{ fontSize: 13, color: colors.textMuted, textAlign: 'center', marginBottom: 24, fontWeight: '500' }}>
                This usually takes 5-10 seconds
            </Text>

            <TouchableOpacity onPress={onCancel} style={{ alignSelf: 'center', padding: 8 }}>
                <Text style={{ fontSize: 15, fontWeight: '600', color: colors.textSecondary }}>Cancel</Text>
            </TouchableOpacity>
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    card: {
        padding: 24,
        borderRadius: 24,
        borderWidth: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
        marginBottom: 20,
    }
});
