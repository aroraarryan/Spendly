import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useThemeColors } from '@/hooks/useThemeColors';
import NeoCard from '@/components/ui/NeoCard';
import NeoBadge from '@/components/ui/NeoBadge';
import NeoButton from '@/components/ui/NeoButton';
import GoalProgressBar from './GoalProgressBar';
import { SavingsGoal } from '@/types';
import { formatIndianNumber, calculateMonthlyNeeded, getDaysUntil, formatGoalDeadline } from '@/utils/financialHelpers';
import { useSettingsStore } from '@/store/settingsStore';

interface GoalCardProps {
    goal: SavingsGoal;
    onPress: () => void;
    onAddMoney: () => void;
    onViewDetails: () => void;
    onLongPress?: () => void;
}

const GoalCard: React.FC<GoalCardProps> = ({
    goal,
    onPress,
    onAddMoney,
    onViewDetails,
    onLongPress
}) => {
    const colors = useThemeColors();
    const { currencySymbol } = useSettingsStore();

    const percentage = Math.min(100, (goal.saved_amount / goal.target_amount) * 100);
    const isCompleted = goal.is_completed || percentage >= 100;
    const daysLeft = goal.target_date ? getDaysUntil(goal.target_date) : null;
    const monthlyNeeded = calculateMonthlyNeeded(goal.target_amount, goal.saved_amount, goal.target_date || null);

    const renderBadge = () => {
        if (isCompleted) return <NeoBadge label="✓ Goal Reached!" variant="success" />;
        if (daysLeft === null) return null;

        if (daysLeft < 0) return <NeoBadge label="Overdue" variant="danger" />;
        if (daysLeft < 7) return <NeoBadge label={`${daysLeft} days left!`} variant="danger" />;
        if (daysLeft <= 30) return <NeoBadge label={`${daysLeft} days left`} variant="warning" />;
        return <NeoBadge label={`${daysLeft} days left`} variant="neutral" />;
    };

    return (
        <TouchableOpacity 
            onPress={onPress} 
            onLongPress={onLongPress} 
            activeOpacity={0.7}
            style={styles.touchable}
        >
            <NeoCard style={[styles.container, isCompleted ? { opacity: 0.9 } : undefined]}>
                {/* Top Row */}
                <View style={styles.topRow}>
                    <View style={styles.goalInfo}>
                        <View style={[styles.iconContainer, { backgroundColor: `${goal.color}20` }]}>
                            <Text style={styles.iconText}>{goal.icon}</Text>
                        </View>
                        <View style={styles.nameContainer}>
                            <Text style={[styles.name, { color: colors.text }]} numberOfLines={1}>
                                {goal.name}
                            </Text>
                        </View>
                    </View>
                    <View style={styles.badgeContainer}>
                        {renderBadge()}
                    </View>
                </View>

                {/* Amount Row */}
                <View style={styles.amountRow}>
                    <Text style={[styles.savedAmount, { color: isCompleted ? '#10B981' : colors.accent }]}>
                        {currencySymbol}{formatIndianNumber(goal.saved_amount).replace('₹', '')}
                    </Text>
                    <Text style={[styles.ofText, { color: colors.textMuted }]}>of</Text>
                    <Text style={[styles.targetAmount, { color: colors.textSecondary }]}>
                        {currencySymbol}{formatIndianNumber(goal.target_amount).replace('₹', '')}
                    </Text>
                </View>

                {/* Progress Bar */}
                <View style={styles.progressContainer}>
                    <GoalProgressBar percentage={percentage} color={goal.color} height={10} />
                </View>

                {/* Meta Stats Row */}
                <View style={styles.metaRow}>
                    <Text style={[styles.metaText, { color: colors.textMuted }]}>
                        📅 {formatGoalDeadline(goal.target_date || null)}
                    </Text>
                    <Text style={[styles.metaText, { color: isCompleted ? '#10B981' : colors.textMuted }]}>
                        {isCompleted ? '🎉 Goal reached!' : `Need ${currencySymbol}${formatIndianNumber(goal.target_amount - goal.saved_amount).replace('₹', '')} more`}
                    </Text>
                </View>

                {/* Monthly Target Suggestion */}
                {!isCompleted && monthlyNeeded && (
                    <View style={[styles.suggestionBox, { backgroundColor: `${colors.accent}10` }]}>
                        <Text style={[styles.suggestionText, { color: colors.textSecondary }]}>
                            💡 Save <Text style={{fontWeight: '700', color: colors.accent}}>{currencySymbol}{formatIndianNumber(monthlyNeeded).replace('₹', '')}</Text> per month to reach on time
                        </Text>
                    </View>
                )}

                {/* Actions Row */}
                <View style={styles.actionsRow}>
                    <NeoButton
                        label="+ Add Money"
                        onPress={onAddMoney}
                        variant="secondary"
                        size="sm"
                        style={styles.actionBtn}
                    />
                    <NeoButton
                        label="View Details"
                        onPress={onViewDetails}
                        variant="ghost"
                        size="sm"
                        style={styles.actionBtn}
                    />
                </View>
            </NeoCard>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    touchable: {
        marginBottom: 16,
    },
    container: {
        padding: 16,
    },
    topRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    goalInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    iconContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    iconText: {
        fontSize: 24,
    },
    nameContainer: {
        flex: 1,
    },
    name: {
        fontSize: 17,
        fontWeight: '700',
    },
    badgeContainer: {
        marginLeft: 8,
    },
    amountRow: {
        flexDirection: 'row',
        alignItems: 'baseline',
        marginBottom: 12,
    },
    savedAmount: {
        fontSize: 24,
        fontWeight: '700',
    },
    ofText: {
        fontSize: 14,
        marginHorizontal: 6,
    },
    targetAmount: {
        fontSize: 16,
        fontWeight: '500',
    },
    progressContainer: {
        marginBottom: 12,
    },
    metaRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 12,
    },
    metaText: {
        fontSize: 12,
        fontWeight: '500',
    },
    suggestionBox: {
        paddingVertical: 10,
        paddingHorizontal: 12,
        borderRadius: 12,
        marginBottom: 16,
    },
    suggestionText: {
        fontSize: 12,
        lineHeight: 18,
    },
    actionsRow: {
        flexDirection: 'row',
        gap: 12,
    },
    actionBtn: {
        flex: 1,
    },
});

export default GoalCard;
