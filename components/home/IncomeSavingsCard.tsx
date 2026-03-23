import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useThemeColors } from '@/hooks/useThemeColors';
import NeoCard from '@/components/ui/NeoCard';
import { useIncomeStore } from '@/store/incomeStore';
import { useExpenseStore } from '@/store/expenseStore';
import { useSettingsStore } from '@/store/settingsStore';
import SavingsRateCircle from '../income/SavingsRateCircle';

import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function IncomeSavingsCard() {
    const colors = useThemeColors();
    const router = useRouter();
    const now = new Date();
    const month = now.getMonth() + 1;
    const year = now.getFullYear();

    const { getTotalIncomeByMonth, getSavingsRate } = useIncomeStore();
    const { getTotalExpensesByMonth } = useExpenseStore();
    const { currencySymbol } = useSettingsStore();

    const incomeTotal = getTotalIncomeByMonth(month, year);
    const expenseTotal = getTotalExpensesByMonth(month, year);
    const savingsRate = getSavingsRate(month, year);

    if (incomeTotal === 0) {
        return (
            <TouchableOpacity onPress={() => router.push('/modals/add-income')}>
                <NeoCard style={styles.promptCard}>
                    <Ionicons name="add-circle-outline" size={20} color={colors.accent} />
                    <Text style={[styles.promptText, { color: colors.accent }]}>
                        Log income to track savings rate
                    </Text>
                </NeoCard>
            </TouchableOpacity>
        );
    }

    return (
        <TouchableOpacity onPress={() => router.push('/income')}>
            <NeoCard style={styles.container}>
                <View style={styles.leftSide}>
                    <Text style={[styles.timeLabel, { color: colors.textMuted }]}>THIS MONTH</Text>
                    <Text style={[styles.mainLabel, { color: colors.textSecondary }]}>Income vs Expenses</Text>
                    
                    <View style={styles.statsRow}>
                        <View style={styles.statItem}>
                            <Text style={[styles.amount, { color: colors.success }]}>
                                💰 {currencySymbol}{incomeTotal.toLocaleString()}
                            </Text>
                        </View>
                        <View style={styles.statItem}>
                            <Text style={[styles.amount, { color: colors.danger }]}>
                                💸 {currencySymbol}{expenseTotal.toLocaleString()}
                            </Text>
                        </View>
                    </View>
                </View>

                <View style={styles.rightSide}>
                    <SavingsRateCircle rate={savingsRate} income={incomeTotal} size={64} />
                    <Text style={[styles.rateLabel, { color: colors.textMuted }]}>Savings Rate</Text>
                </View>
            </NeoCard>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        padding: 16,
        marginBottom: 16,
        alignItems: 'center',
    },
    promptCard: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
        marginBottom: 16,
        gap: 8,
    },
    promptText: {
        fontSize: 14,
        fontWeight: '600',
    },
    leftSide: {
        flex: 1,
    },
    timeLabel: {
        fontSize: 10,
        fontWeight: 'bold',
        letterSpacing: 0.5,
    },
    mainLabel: {
        fontSize: 13,
        fontWeight: '500',
        marginTop: 2,
        marginBottom: 12,
    },
    statsRow: {
        gap: 8,
    },
    statItem: {},
    amount: {
        fontSize: 16,
        fontWeight: '600',
    },
    rightSide: {
        alignItems: 'center',
        paddingLeft: 16,
    },
    rateLabel: {
        fontSize: 11,
        marginTop: 6,
    }
});
