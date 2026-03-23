import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Canvas, Path, Skia, vec } from '@shopify/react-native-skia';
import Animated, { 
    useDerivedValue, 
    useSharedValue, 
    withSpring 
} from 'react-native-reanimated';
import { useThemeColors } from '@/hooks/useThemeColors';
import { formatIndianNumber } from '@/utils/financialHelpers';
import { useSettingsStore } from '@/store/settingsStore';

interface GoalProgressCircleProps {
    percentage: number;
    savedAmount: number;
    color: string;
    size?: number;
    strokeWidth?: number;
}

const GoalProgressCircle: React.FC<GoalProgressCircleProps> = ({
    percentage,
    savedAmount,
    color,
    size = 120,
    strokeWidth = 10,
}) => {
    const colors = useThemeColors();
    const { currencySymbol } = useSettingsStore();
    const radius = (size - strokeWidth) / 2;
    const center = size / 2;
    
    const progress = useSharedValue(0);

    useEffect(() => {
        progress.value = withSpring(percentage / 100, { damping: 15 });
    }, [percentage]);

    const path = Skia.Path.Make();
    path.addCircle(center, center, radius);

    const progressPath = useDerivedValue(() => {
        const p = Skia.Path.Make();
        p.addArc(
            Skia.XYWHRect(strokeWidth / 2, strokeWidth / 2, size - strokeWidth, size - strokeWidth),
            -90,
            progress.value * 360
        );
        return p;
    }, [progress]);

    return (
        <View style={[styles.container, { width: size, height: size }]}>
            <Canvas style={{ width: size, height: size }}>
                <Path
                    path={path}
                    color={colors.surface2}
                    style="stroke"
                    strokeWidth={strokeWidth}
                />
                <Path
                    path={progressPath}
                    color={percentage >= 100 ? '#10B981' : color}
                    style="stroke"
                    strokeWidth={strokeWidth}
                    strokeCap="round"
                />
            </Canvas>
            <View style={styles.content}>
                <Text style={[styles.amount, { color: colors.text }]}>
                    {currencySymbol}{formatIndianNumber(savedAmount).replace('₹', '')}
                </Text>
                <Text style={[styles.percent, { color: colors.textSecondary }]}>
                    {percentage}%
                </Text>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    content: {
        position: 'absolute',
        alignItems: 'center',
        justifyContent: 'center',
    },
    amount: {
        fontSize: 16,
        fontWeight: '700',
    },
    percent: {
        fontSize: 12,
        fontWeight: '500',
        marginTop: 2,
    },
});

export default GoalProgressCircle;
