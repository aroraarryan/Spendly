import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useThemeColors } from '@/hooks/useThemeColors';
import { Canvas, Path, Skia } from '@shopify/react-native-skia';

interface SavingsRateCircleProps {
    rate: number;
    size?: number;
    strokeWidth?: number;
    income: number;
}

export default function SavingsRateCircle({ 
    rate, 
    size = 60, 
    strokeWidth = 6,
    income 
}: SavingsRateCircleProps) {
    const colors = useThemeColors();
    const center = size / 2;
    const radius = (size - strokeWidth) / 2;
    
    // Progress calculation (0 to 1)
    const progress = Math.min(100, Math.max(0, income > 0 ? rate : 0)) / 100;
    
    const getRingColor = () => {
        if (income === 0) return colors.border;
        if (rate < 10) return colors.danger;
        if (rate < 20) return '#F59E0B'; // Amber
        return colors.success;
    };

    // Create paths for Skia
    const backgroundPath = Skia.Path.Make();
    backgroundPath.addCircle(center, center, radius);

    const progressPath = Skia.Path.Make();
    if (progress > 0) {
        progressPath.addArc(
            { x: strokeWidth / 2, y: strokeWidth / 2, width: size - strokeWidth, height: size - strokeWidth },
            -90,
            progress * 360
        );
    }

    return (
        <View style={[styles.container, { width: size, height: size }]}>
            <Canvas style={{ flex: 1 }}>
                <Path
                    path={backgroundPath}
                    color={colors.border}
                    style="stroke"
                    strokeWidth={strokeWidth}
                />
                {income > 0 && progress > 0 && (
                    <Path
                        path={progressPath}
                        color={getRingColor()}
                        style="stroke"
                        strokeWidth={strokeWidth}
                        strokeCap="round"
                    />
                )}
            </Canvas>
            <View style={styles.textContainer}>
                <Text style={[styles.percentage, { color: colors.text }]}>
                    {income > 0 ? `${Math.round(rate)}%` : '—'}
                </Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    textContainer: {
        position: 'absolute',
        justifyContent: 'center',
        alignItems: 'center',
    },
    percentage: {
        fontSize: 12,
        fontWeight: 'bold',
    },
});
