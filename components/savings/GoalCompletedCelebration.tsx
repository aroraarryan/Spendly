import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Modal } from 'react-native';
import Animated, { 
    useSharedValue, 
    useAnimatedStyle, 
    withSpring, 
    withDelay,
    withRepeat,
    withSequence,
    withTiming,
    Easing
} from 'react-native-reanimated';
import { useThemeColors } from '@/hooks/useThemeColors';
import NeoCard from '@/components/ui/NeoCard';
import NeoButton from '@/components/ui/NeoButton';
import { SavingsGoal } from '@/types';
import { formatIndianNumber } from '@/utils/financialHelpers';
import { useSettingsStore } from '@/store/settingsStore';

interface GoalCompletedCelebrationProps {
    goal: SavingsGoal;
    isVisible: boolean;
    onComplete: () => void;
    onDismiss: () => void;
}

const Confetti = ({ index }: { index: number }) => {
    const colors = ['#FFD700', '#FF6B6B', '#4DABF7', '#51CF66', '#FCC419', '#94D82D', '#FF922B'];
    const color = colors[index % colors.length];
    
    const translateY = useSharedValue(-20);
    const translateX = useSharedValue(Math.random() * 40 - 20);
    const rotate = useSharedValue(0);
    const opacity = useSharedValue(1);

    useEffect(() => {
        translateY.value = withDelay(
            Math.random() * 1000,
            withTiming(500, { duration: 2500, easing: Easing.linear })
        );
        translateX.value = withDelay(
            Math.random() * 1000,
            withRepeat(withSequence(
                withTiming(translateX.value + 50, { duration: 1000 }),
                withTiming(translateX.value - 50, { duration: 1000 })
            ), -1, true)
        );
        rotate.value = withRepeat(withTiming(360, { duration: 2000 }), -1);
        opacity.value = withDelay(2500, withTiming(0, { duration: 500 }));
    }, []);

    const style = useAnimatedStyle(() => ({
        transform: [
            { translateY: translateY.value },
            { translateX: translateX.value },
            { rotate: `${rotate.value}deg` }
        ],
        opacity: opacity.value,
        backgroundColor: color,
        left: `${Math.random() * 100}%`,
    }));

    return <Animated.View style={[styles.confetti, style]} />;
};

const GoalCompletedCelebration: React.FC<GoalCompletedCelebrationProps> = ({
    goal,
    isVisible,
    onComplete,
    onDismiss
}) => {
    const colors = useThemeColors();
    const { currencySymbol } = useSettingsStore();
    const scale = useSharedValue(0);

    useEffect(() => {
        if (isVisible) {
            scale.value = withSpring(1, { damping: 12 });
        } else {
            scale.value = 0;
        }
    }, [isVisible]);

    const cardStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }],
    }));

    return (
        <Modal transparent visible={isVisible} animationType="fade">
            <View style={styles.overlay}>
                {/* Confetti Rain */}
                {Array.from({ length: 40 }).map((_, i) => (
                    <Confetti key={i} index={i} />
                ))}

                <Animated.View style={[styles.cardContainer, cardStyle]}>
                    <NeoCard style={styles.card}>
                        <View style={[styles.iconContainer, { backgroundColor: `${goal.color}20` }]}>
                            <Text style={styles.icon}>{goal.icon}</Text>
                        </View>
                        
                        <Text style={[styles.title, { color: colors.text }]}>
                            🎉 Goal Reached!
                        </Text>
                        
                        <Text style={[styles.message, { color: colors.textSecondary }]}>
                            Congratulations! You've successfully saved for
                        </Text>
                        
                        <Text style={[styles.goalName, { color: goal.color }]}>
                            {goal.name}
                        </Text>
                        
                        <Text style={[styles.amount, { color: colors.text }]}>
                            {currencySymbol}{formatIndianNumber(goal.target_amount).replace('₹', '')}
                        </Text>
                        
                        <View style={styles.footer}>
                            <NeoButton
                                label="Mark as Complete ✓"
                                onPress={onComplete}
                                style={styles.btn}
                            />
                            <NeoButton
                                label="Keep Saving"
                                onPress={onDismiss}
                                variant="ghost"
                                style={styles.btn}
                            />
                        </View>
                    </NeoCard>
                </Animated.View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.7)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
    },
    confetti: {
        position: 'absolute',
        width: 10,
        height: 10,
        borderRadius: 2,
        top: 0,
    },
    cardContainer: {
        width: '100%',
        maxWidth: 400,
    },
    card: {
        padding: 32,
        alignItems: 'center',
    },
    iconContainer: {
        width: 100,
        height: 100,
        borderRadius: 50,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 24,
    },
    icon: {
        fontSize: 50,
    },
    title: {
        fontSize: 28,
        fontWeight: '800',
        marginBottom: 12,
        textAlign: 'center',
    },
    message: {
        fontSize: 15,
        textAlign: 'center',
        marginBottom: 8,
        lineHeight: 22,
    },
    goalName: {
        fontSize: 22,
        fontWeight: '700',
        marginBottom: 16,
        textAlign: 'center',
    },
    amount: {
        fontSize: 32,
        fontWeight: '800',
        marginBottom: 32,
    },
    footer: {
        width: '100%',
        gap: 12,
    },
    btn: {
        width: '100%',
    },
});

export default GoalCompletedCelebration;
