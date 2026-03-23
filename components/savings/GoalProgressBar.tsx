import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, { 
    useAnimatedStyle, 
    useSharedValue, 
    withSpring,
    interpolateColor
} from 'react-native-reanimated';
import { useThemeColors } from '@/hooks/useThemeColors';

interface GoalProgressBarProps {
    percentage: number;
    color: string;
    height?: number;
    showText?: boolean;
}

const GoalProgressBar: React.FC<GoalProgressBarProps> = ({ 
    percentage, 
    color, 
    height = 10,
    showText = true 
}) => {
    const colors = useThemeColors();
    const progress = useSharedValue(0);

    useEffect(() => {
        progress.value = withSpring(percentage / 100, { damping: 15 });
    }, [percentage]);

    const animatedStyle = useAnimatedStyle(() => {
        return {
            width: `${progress.value * 100}%`,
            backgroundColor: percentage >= 100 ? '#10B981' : color,
        };
    });

    return (
        <View style={styles.container}>
            <View style={[styles.track, { height, backgroundColor: colors.surface2 }]}>
                <Animated.View style={[styles.fill, animatedStyle]} />
            </View>
            {showText && (
                <Text style={[styles.percentText, { color: percentage >= 100 ? '#10B981' : colors.textSecondary }]}>
                    {Math.round(percentage)}%
                </Text>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        width: '100%',
    },
    track: {
        flex: 1,
        borderRadius: 999,
        overflow: 'hidden',
    },
    fill: {
        height: '100%',
        borderRadius: 999,
    },
    percentText: {
        fontSize: 12,
        fontWeight: '700',
        marginLeft: 8,
        minWidth: 35,
        textAlign: 'right',
    },
});

export default GoalProgressBar;
