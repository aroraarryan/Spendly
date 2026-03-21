import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useEventStore } from '@/store/eventStore';
import { useExpenseStore } from '@/store/expenseStore';
import { useSettingsStore } from '@/store/settingsStore';
import { useThemeColors } from '@/hooks/useThemeColors';
import NeoCard from '@/components/ui/NeoCard';
import NeoButton from '@/components/ui/NeoButton';
import TransactionRow from '@/components/home/TransactionRow';
import EmptyState from '@/components/shared/EmptyState';

export default function EventDetailScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const colors = useThemeColors();
    const router = useRouter();
    const { getEventById, deleteEventAndUntag } = useEventStore();
    const { expenses } = useExpenseStore();
    const { currencySymbol } = useSettingsStore();

    const event = getEventById(id);
    if (!event) return null;

    const eventExpenses = expenses.filter(e => e.event_id === id);
    const totalSpent = eventExpenses.reduce((sum, e) => sum + e.amount, 0);
    const budget = event.total_budget || 0;
    const isOver = budget > 0 && totalSpent > budget;

    const handleDelete = () => {
        Alert.alert(
            'Delete Event',
            'This will delete the event but keep the expenses (they will be untagged).',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        await deleteEventAndUntag(id);
                        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                        router.back();
                    }
                }
            ]
        );
    };

    return (
        <View style={{ flex: 1, backgroundColor: colors.background }}>
            <Stack.Screen
                options={{
                    headerTitle: event.name.toUpperCase(),
                    headerShadowVisible: false,
                    headerStyle: { backgroundColor: colors.background },
                    headerTitleStyle: { color: colors.text, fontWeight: '700', fontSize: 16 }
                }}
            />

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 20 }}>
                {/* Summary Card */}
                <NeoCard padding={24} style={styles.summaryCard} backgroundColor={colors.surface}>
                    <View style={styles.headerRow}>
                        <View style={[styles.colorIndicator, { backgroundColor: event.cover_color }]} />
                        <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>EVENT SUMMARY</Text>
                    </View>

                    <View style={styles.amountRow}>
                        <Text style={[styles.amountValue, { color: colors.text }]}>{currencySymbol}{totalSpent.toLocaleString()}</Text>
                        <Text style={[styles.ofText, { color: colors.textMuted }]}> / {budget > 0 ? `${currencySymbol}${budget.toLocaleString()}` : '∞'}</Text>
                    </View>

                    {budget > 0 && (
                        <View style={styles.progressSection}>
                            <View style={[styles.progressTrack, { backgroundColor: colors.surface2 }]}>
                                <View
                                    style={[
                                        styles.progressFill,
                                        {
                                            width: `${Math.min(totalSpent / budget, 1) * 100}%`,
                                            backgroundColor: isOver ? colors.danger : event.cover_color
                                        }
                                    ]}
                                />
                            </View>
                        </View>
                    )}

                    <View style={styles.datesRow}>
                        <View style={styles.dateBlock}>
                            <Ionicons name="calendar-outline" size={14} color={colors.textMuted} />
                            <Text style={[styles.dateText, { color: colors.textSecondary }]}>
                                {new Date(event.start_date).toLocaleDateString()} — {new Date(event.end_date).toLocaleDateString()}
                            </Text>
                        </View>
                    </View>
                </NeoCard>

                {/* Expenses List */}
                <View style={styles.listSection}>
                    <Text style={[styles.sectionTitle, { color: colors.text }]}>Transaction Log</Text>
                    {eventExpenses.length === 0 ? (
                        <EmptyState
                            title="No expenses tagged"
                            message="Expenses tagged with this event will show up here."
                            emoji="📝"
                        />
                    ) : (
                        eventExpenses.map((expense, idx) => (
                            <TransactionRow key={expense.id} expense={expense} isLast={idx === eventExpenses.length - 1} />
                        ))
                    )}
                </View>

                <View style={styles.footer}>
                    <NeoButton
                        label="Add Transaction to Event"
                        onPress={() => router.push({ pathname: '/modals/add-expense', params: { preselectedEventId: id } })}
                        variant="secondary"
                    />
                    <NeoButton
                        label="Terminate Event"
                        onPress={handleDelete}
                        variant="ghost"
                        style={{ marginTop: 12 }}
                    />
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    summaryCard: {
        marginBottom: 32,
    },
    headerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    colorIndicator: {
        width: 12,
        height: 12,
        borderRadius: 6,
        marginRight: 8,
    },
    summaryLabel: {
        fontSize: 11,
        fontWeight: '700',
    },
    amountRow: {
        flexDirection: 'row',
        alignItems: 'baseline',
        marginBottom: 20,
    },
    amountValue: {
        fontSize: 32,
        fontWeight: '700',
    },
    ofText: {
        fontSize: 18,
        fontWeight: '500',
        marginLeft: 4,
    },
    progressSection: {
        marginBottom: 20,
    },
    progressTrack: {
        height: 8,
        borderRadius: 4,
    },
    progressFill: {
        height: '100%',
        borderRadius: 4,
    },
    datesRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    dateBlock: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    dateText: {
        fontSize: 13,
        fontWeight: '400',
    },
    listSection: {
        marginBottom: 40,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 16,
    },
    footer: {
        marginBottom: 40,
    }
});
