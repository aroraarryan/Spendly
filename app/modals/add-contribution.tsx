import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { Stack, useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useThemeColors } from '@/hooks/useThemeColors';
import { useSavingsStore } from '@/store/savingsStore';
import NeoCard from '../../components/ui/NeoCard';
import NeoButton from '../../components/ui/NeoButton';
import NeoInput from '../../components/ui/NeoInput';
import { haptic } from '@/utils/haptics';
import { useToast } from '@/hooks/useToast';
import { formatIndianNumber } from '@/utils/financialHelpers';
import { useSettingsStore } from '@/store/settingsStore';

export default function AddContributionModal() {
    const { goalId } = useLocalSearchParams<{ goalId: string }>();
    const colors = useThemeColors();
    const router = useRouter();
    const toast = useToast();
    const { currencySymbol } = useSettingsStore();
    const { getGoalById, addContribution } = useSavingsStore();

    const goal = getGoalById(goalId);
    const [amount, setAmount] = useState('');
    const [note, setNote] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    if (!goal) return null;

    const handleSave = async () => {
        if (!amount || parseFloat(amount) <= 0) {
            toast.showInAppToast('Error', 'Please enter a valid amount');
            return;
        }

        setIsSaving(true);
        try {
            await addContribution({
                goal_id: goal.id,
                amount: parseFloat(amount),
                date: new Date().toISOString(),
                note: note.trim() || undefined,
            });
            
            haptic.success();
            toast.showInAppToast('Success', 'Money added successfully!');
            router.back();
        } catch (error) {
            toast.showInAppToast('Error', 'Failed to add contribution');
        } finally {
            setIsSaving(false);
        }
    };

    const quickAmounts = [500, 1000, 2000, 5000, 10000];

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <Stack.Screen 
                options={{
                    headerTitle: `Contribute to ${goal.icon}`,
                    headerLeft: () => (
                        <TouchableOpacity onPress={() => router.back()} style={styles.headerBtn}>
                            <Text style={[styles.cancelBtn, { color: colors.textSecondary }]}>Cancel</Text>
                        </TouchableOpacity>
                    ),
                    headerShadowVisible: false,
                    headerStyle: { backgroundColor: colors.background }
                }} 
            />

            <ScrollView contentContainerStyle={styles.scroll}>
                <View style={styles.headerInfo}>
                    <Text style={[styles.goalName, { color: colors.text }]}>{goal.name}</Text>
                    <Text style={[styles.goalTarget, { color: colors.textSecondary }]}>
                        Target: {currencySymbol}{formatIndianNumber(goal.target_amount).replace('₹', '')}
                    </Text>
                </View>

                <View style={styles.section}>
                    <Text style={[styles.label, { color: colors.textMuted }]}>AMOUNT TO ADD</Text>
                    <NeoInput
                        placeholder="0.00"
                        value={amount}
                        onChangeText={setAmount}
                        keyboardType="decimal-pad"
                        leftElement={<Text style={{ color: colors.textSecondary, fontWeight: '700' }}>{currencySymbol}</Text>}
                        autoFocus
                    />
                    
                    <View style={styles.quickAddRow}>
                        {quickAmounts.map(val => (
                            <TouchableOpacity 
                                key={val} 
                                style={[styles.quickBtn, { backgroundColor: colors.surface2 }]}
                                onPress={() => {
                                    haptic.light();
                                    setAmount(val.toString());
                                }}
                            >
                                <Text style={[styles.quickBtnText, { color: colors.accent }]}>
                                    +{val.toLocaleString()}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                <View style={styles.section}>
                    <Text style={[styles.label, { color: colors.textMuted }]}>NOTE (OPTIONAL)</Text>
                    <NeoInput
                        placeholder="e.g. Monthly savings, Bonus"
                        value={note}
                        onChangeText={setNote}
                    />
                </View>

                <View style={[styles.noteBox, { backgroundColor: `${colors.accent}08` }]}>
                    <Ionicons name="information-circle" size={20} color={colors.accent} />
                    <Text style={[styles.infoText, { color: colors.textSecondary }]}>
                        This amount will be added to your current savings for this goal.
                    </Text>
                </View>

                <NeoButton
                    label="Confirm Contribution"
                    onPress={handleSave}
                    loading={isSaving}
                    style={styles.saveBtn}
                    glowing
                />
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    headerBtn: {
        padding: 8,
    },
    cancelBtn: {
        fontSize: 16,
    },
    scroll: {
        padding: 24,
    },
    headerInfo: {
        alignItems: 'center',
        marginBottom: 32,
    },
    goalName: {
        fontSize: 20,
        fontWeight: '800',
        marginBottom: 4,
    },
    goalTarget: {
        fontSize: 14,
        fontWeight: '500',
    },
    section: {
        marginBottom: 24,
    },
    label: {
        fontSize: 10,
        fontWeight: '700',
        letterSpacing: 1,
        marginBottom: 12,
    },
    quickAddRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        marginTop: 12,
    },
    quickBtn: {
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 99,
    },
    quickBtnText: {
        fontSize: 13,
        fontWeight: '700',
    },
    noteBox: {
        flexDirection: 'row',
        padding: 16,
        borderRadius: 12,
        marginBottom: 32,
        alignItems: 'center',
    },
    infoText: {
        fontSize: 12,
        marginLeft: 12,
        flex: 1,
        lineHeight: 18,
    },
    saveBtn: {
        width: '100%',
    }
});
