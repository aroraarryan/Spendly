import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withSpring,
    withTiming,
    withDelay
} from 'react-native-reanimated';
import { useThemeColors } from '../../hooks/useThemeColors';
import NeoButton from '../ui/NeoButton';
import { Ionicons } from '@expo/vector-icons';

type EmptyStateType = 'expenses' | 'events' | 'analytics' | 'ai' | 'categories' | 'search' | 'generic';

interface EmptyStateProps {
    type?: EmptyStateType;
    title?: string;
    message?: string;
    emoji?: string;
    onAction?: () => void;
    actionLabel?: string;
}

const EmptyState: React.FC<EmptyStateProps> = ({
    type = 'generic',
    title,
    message,
    emoji = '🔍',
    onAction,
    actionLabel = 'Try Again'
}) => {
    const colors = useThemeColors();
    const scale = useSharedValue(0.9);
    const opacity = useSharedValue(0);

    useEffect(() => {
        scale.value = withSpring(1, { damping: 12 });
        opacity.value = withTiming(1, { duration: 400 });
    }, []);

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }],
        opacity: opacity.value,
    }));

    const renderIllustration = () => {
        switch (type) {
            case 'expenses':
                return (
                    <View style={styles.illustrationContainer}>
                        <View style={[styles.receipt, { borderColor: colors.border, backgroundColor: colors.surface }]}>
                            <View style={[styles.receiptLine, { width: '80%', backgroundColor: colors.border }]} />
                            <View style={[styles.receiptLine, { width: '60%', backgroundColor: colors.border }]} />
                            <View style={[styles.receiptLine, { width: '70%', backgroundColor: colors.border }]} />
                        </View>
                        <View style={[styles.plusBadge, { backgroundColor: colors.accent }]}>
                            <Ionicons name="add" size={20} color="#FFFFFF" />
                        </View>
                    </View>
                );
            case 'events':
                return (
                    <View style={styles.illustrationContainer}>
                        <View style={[styles.calendar, { borderColor: colors.border, backgroundColor: colors.surface }]}>
                            <View style={[styles.calendarTop, { backgroundColor: colors.accent }]} />
                            <View style={styles.calendarGrid}>
                                {[1, 2, 3, 4].map(i => (
                                    <View key={i} style={[styles.calendarDot, { backgroundColor: colors.border }]} />
                                ))}
                            </View>
                        </View>
                    </View>
                );
            case 'analytics':
                return (
                    <View style={styles.illustrationContainer}>
                        <View style={styles.barChart}>
                            <View style={[styles.bar, { height: 30, backgroundColor: colors.border }]} />
                            <View style={[styles.bar, { height: 50, backgroundColor: colors.accent + '80' }]} />
                            <View style={[styles.bar, { height: 80, backgroundColor: colors.accent }]} />
                        </View>
                    </View>
                );
            case 'ai':
                return (
                    <View style={styles.illustrationContainer}>
                        <View style={[styles.bubble, { backgroundColor: colors.accentLight, borderColor: colors.accent, borderWidth: 1 }]}>
                            <Text style={styles.bubbleEmoji}>✨</Text>
                            <View style={{ position: 'absolute', top: -10, right: -10, backgroundColor: colors.white, borderRadius: 12, padding: 4, borderWidth: 1, borderColor: colors.border }}>
                                <Text style={{ fontSize: 16 }}>🎯</Text>
                            </View>
                        </View>
                    </View>
                );
            default:
                return (
                    <View style={styles.illustrationContainer}>
                        <Text style={styles.mainEmoji}>{emoji}</Text>
                    </View>
                );
        }
    };

    const config = {
        expenses: {
            title: title || 'No expenses yet',
            message: message || 'Tap the + button to log your first expense',
            actionLabel: actionLabel || 'Add Expense'
        },
        events: {
            title: title || 'No events yet',
            message: message || 'Create an event to track spending for trips or special occasions',
            actionLabel: actionLabel || 'Create Event'
        },
        analytics: {
            title: title || 'No data to show',
            message: message || 'Add some expenses to see your spending charts',
            actionLabel: actionLabel || 'Add Expense'
        },
        ai: {
            title: title || 'No insights yet',
            message: message || 'Add at least 5 expenses then generate your first AI analysis',
            actionLabel: actionLabel || 'Go to Home'
        },
        generic: {
            title: title || 'Nothing found',
            message: message || 'Try adjusting your filters or adding new items',
            actionLabel: actionLabel || 'Refresh'
        },
        categories: {
            title: title || 'No categories',
            message: message || 'Create your first custom category to start tracking',
            actionLabel: actionLabel || 'Add Category'
        },
        search: {
            title: title || 'No results',
            message: message || 'We couldn\'t find what you were looking for',
            actionLabel: actionLabel || 'Clear Search'
        }
    };

    const current = config[type === 'ai' ? 'ai' : type === 'expenses' ? 'expenses' : type === 'events' ? 'events' : type === 'analytics' ? 'analytics' : type === 'categories' ? 'categories' : type === 'search' ? 'search' : 'generic'];

    return (
        <Animated.View style={[styles.container, animatedStyle]}>
            {renderIllustration()}
            <Text style={[styles.titleText, { color: colors.text }]}>{current.title}</Text>
            <Text style={[styles.messageText, { color: colors.textSecondary }]}>{current.message}</Text>

            {onAction && (
                <View style={styles.actionContainer}>
                    <NeoButton
                        label={current.actionLabel}
                        onPress={onAction}
                        variant="secondary"
                        size="sm"
                    />
                </View>
            )}
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 40,
        paddingHorizontal: 20,
        maxWidth: 280,
        alignSelf: 'center',
    },
    illustrationContainer: {
        width: 120,
        height: 120,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 24,
    },
    receipt: {
        width: 60,
        height: 80,
        borderWidth: 2,
        borderRadius: 4,
        padding: 8,
        transform: [{ rotate: '3deg' }],
        justifyContent: 'center',
        gap: 6,
    },
    receiptLine: {
        height: 4,
        borderRadius: 2,
    },
    plusBadge: {
        position: 'absolute',
        bottom: 10,
        right: 20,
        width: 32,
        height: 32,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 3,
        borderColor: '#FFFFFF',
    },
    calendar: {
        width: 70,
        height: 70,
        borderWidth: 2,
        borderRadius: 8,
        overflow: 'hidden',
    },
    calendarTop: {
        height: 15,
        width: '100%',
    },
    calendarGrid: {
        flex: 1,
        flexDirection: 'row',
        flexWrap: 'wrap',
        padding: 5,
        gap: 5,
    },
    calendarDot: {
        width: 10,
        height: 10,
        borderRadius: 2,
    },
    barChart: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        gap: 10,
    },
    bar: {
        width: 15,
        borderRadius: 4,
    },
    bubble: {
        width: 80,
        height: 60,
        borderRadius: 20,
        borderBottomLeftRadius: 4,
        justifyContent: 'center',
        alignItems: 'center',
    },
    bubbleEmoji: {
        fontSize: 30,
    },
    mainEmoji: {
        fontSize: 64,
    },
    titleText: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 10,
        textAlign: 'center',
    },
    messageText: {
        fontSize: 14,
        textAlign: 'center',
        lineHeight: 22,
    },
    actionContainer: {
        marginTop: 24,
        width: '100%',
    },
});

export default EmptyState;
