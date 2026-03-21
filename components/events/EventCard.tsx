import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import NeoCard from '../ui/NeoCard';
import NeoBadge from '../ui/NeoBadge';
import EventBanner from './EventBanner';
import BudgetProgressBar from './BudgetProgressBar';
import { useThemeColors } from '../../hooks/useThemeColors';
import { EventRow } from '../../store/eventStore';
import { getEventStatus, getDaysRemaining } from '../../utils/analyticsHelpers';
import { useSettingsStore } from '../../store/settingsStore';

interface EventCardProps {
    event: EventRow;
    totalSpent: number;
    expenseCount: number;
    onPress: () => void;
}

const EventCard: React.FC<EventCardProps> = ({
    event,
    totalSpent,
    expenseCount,
    onPress,
}) => {
    const colors = useThemeColors();
    const { currencySymbol } = useSettingsStore();
    const status = getEventStatus(event.start_date, event.end_date);
    const daysRemaining = getDaysRemaining(event.end_date);

    const formatDate = (dateStr: string) => {
        const d = new Date(dateStr);
        return d.toLocaleDateString('en-GB', { month: 'short', day: 'numeric' });
    };

    const isOverBudget = event.total_budget > 0 && totalSpent > event.total_budget;

    return (
        <TouchableOpacity
            onPress={onPress}
            activeOpacity={0.7}
            style={styles.container}
        >
            <NeoCard padding={0} style={styles.card} backgroundColor={colors.surface}>
                <EventBanner
                    name={event.name}
                    color={event.cover_color}
                    status={status}
                    daysRemaining={daysRemaining}
                />

                <View style={styles.body}>
                    <View style={styles.dateRow}>
                        <Text style={[styles.infoText, { color: colors.textSecondary }]}>
                            {formatDate(event.start_date)} – {formatDate(event.end_date)}
                        </Text>
                        <NeoBadge
                            label={status.toUpperCase()}
                            variant={status === 'upcoming' ? 'neutral' : status === 'active' ? 'primary' : 'success'}
                        />
                    </View>

                    <View style={styles.statsRow}>
                        <View style={{ flexDirection: 'row', alignItems: 'baseline' }}>
                            <Text style={[styles.totalSpentLabel, { color: colors.textMuted }]}>Total Spent </Text>
                            <Text style={[styles.value, { color: isOverBudget ? colors.danger : colors.text }]}>
                                {currencySymbol}{totalSpent.toLocaleString()}
                            </Text>
                        </View>
                        {event.total_budget > 0 && (
                            <Text style={[styles.budgetGoalLabel, { color: colors.textSecondary }]}>
                                of {currencySymbol}{event.total_budget.toLocaleString()}
                            </Text>
                        )}
                    </View>

                    {event.total_budget > 0 && (
                        <BudgetProgressBar
                            spent={totalSpent}
                            budget={event.total_budget}
                            currencySymbol={currencySymbol}
                            accentColor={event.cover_color}
                        />
                    )}

                    <View style={styles.footer}>
                        <Text style={[styles.expenseCount, { color: colors.textSecondary }]}>
                            {expenseCount} transactions
                        </Text>
                        <Text style={[styles.viewDetails, { color: colors.accent }]}>View Details</Text>
                    </View>
                </View>
            </NeoCard>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        marginBottom: 20,
        marginHorizontal: 0,
    },
    card: {
        overflow: 'hidden',
        borderRadius: 24,
    },
    body: {
        padding: 20,
    },
    dateRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    statsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 20,
    },
    infoText: {
        fontSize: 12,
        fontWeight: '500',
    },
    totalSpentLabel: {
        fontSize: 14,
        fontWeight: '500',
    },
    budgetGoalLabel: {
        fontSize: 14,
        fontWeight: '500',
    },
    value: {
        fontSize: 18,
        fontWeight: '700',
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 16,
    },
    expenseCount: {
        fontSize: 13,
        fontWeight: '400',
    },
    viewDetails: {
        fontSize: 14,
        fontWeight: '600',
    }
});

export default EventCard;
