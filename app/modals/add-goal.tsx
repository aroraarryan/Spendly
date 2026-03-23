import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Switch, Platform } from 'react-native';
import { Stack, useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useThemeColors } from '@/hooks/useThemeColors';
import { useSavingsStore } from '@/store/savingsStore';
import NeoCard from '../../components/ui/NeoCard';
import NeoButton from '../../components/ui/NeoButton';
import NeoInput from '../../components/ui/NeoInput';
import EmojiPicker from '../../components/shared/EmojiPicker';
import ColorPicker from '../../components/shared/ColorPicker';
import DateTimePicker from '@react-native-community/datetimepicker';
import SmartSuggestions from '../../components/savings/SmartSuggestions';
import { haptic } from '@/utils/haptics';
import { useToast } from '@/hooks/useToast';

export default function AddGoalModal() {
    const { editId } = useLocalSearchParams<{ editId?: string }>();
    const colors = useThemeColors();
    const router = useRouter();
    const toast = useToast();
    const { getGoalById, addGoal, updateGoal } = useSavingsStore();

    const [name, setName] = useState('');
    const [targetAmount, setTargetAmount] = useState('');
    const [icon, setIcon] = useState('🎯');
    const [color, setColor] = useState('#6366F1');
    const [targetDate, setTargetDate] = useState<Date | null>(null);
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (editId) {
            const goal = getGoalById(editId);
            if (goal) {
                setName(goal.name);
                setTargetAmount(goal.target_amount.toString());
                setIcon(goal.icon);
                setColor(goal.color);
                setTargetDate(goal.target_date ? new Date(goal.target_date) : null);
            }
        }
    }, [editId]);

    const handleSave = async () => {
        if (!name.trim() || !targetAmount || parseFloat(targetAmount) <= 0) {
            toast.showInAppToast('Error', 'Please enter name and valid target amount');
            return;
        }

        setIsSaving(true);
        try {
            const goalData: any = {
                name: name.trim(),
                target_amount: parseFloat(targetAmount),
                icon,
                color,
                target_date: targetDate ? targetDate.toISOString() : undefined,
            };

            if (editId) {
                await updateGoal(editId, goalData as any);
                toast.showInAppToast('Success', 'Goal updated!');
            } else {
                await addGoal(goalData as any);
                toast.showInAppToast('Success', 'Goal created!');
            }
            haptic.success();
            router.back();
        } catch (error) {
            toast.showInAppToast('Error', 'Failed to save goal');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <Stack.Screen 
                options={{
                    headerTitle: editId ? 'Edit Goal' : 'New Savings Goal',
                    headerLeft: () => (
                        <TouchableOpacity onPress={() => router.back()} style={styles.headerBtn}>
                            <Text style={[styles.cancelBtn, { color: colors.textSecondary }]}>Cancel</Text>
                        </TouchableOpacity>
                    ),
                    headerRight: () => (
                        <TouchableOpacity onPress={handleSave} disabled={isSaving}>
                            <Text style={[styles.saveBtn, { color: colors.accent, opacity: isSaving ? 0.5 : 1 }]}>
                                {editId ? 'Update' : 'Create'}
                            </Text>
                        </TouchableOpacity>
                    ),
                    headerShadowVisible: false,
                    headerStyle: { backgroundColor: colors.background }
                }} 
            />

            <ScrollView contentContainerStyle={styles.scroll}>
                {/* Preview Circle */}
                <View style={styles.previewContainer}>
                    <View style={[styles.previewCircle, { backgroundColor: `${color}20`, borderColor: color }]}>
                        <Text style={styles.previewEmoji}>{icon}</Text>
                    </View>
                </View>

                {/* Name Input */}
                <View style={styles.section}>
                    <Text style={[styles.label, { color: colors.textMuted }]}>GOAL NAME</Text>
                    <NeoInput
                        placeholder="e.g. Dream Vacation, New Car"
                        value={name}
                        onChangeText={setName}
                        autoFocus={!editId}
                    />
                </View>

                {/* Amount Input */}
                <View style={styles.section}>
                    <Text style={[styles.label, { color: colors.textMuted }]}>TARGET AMOUNT</Text>
                    <NeoInput
                        placeholder="0.00"
                        value={targetAmount}
                        onChangeText={setTargetAmount}
                        keyboardType="decimal-pad"
                        leftElement={<Text style={{ color: colors.textSecondary, fontWeight: '700' }}>₹</Text>}
                    />
                    <SmartSuggestions goalName={name} onSelect={(val) => setTargetAmount(val.toString())} />
                </View>

                {/* Appearance */}
                <View style={styles.section}>
                    <Text style={[styles.label, { color: colors.textMuted }]}>ICON & COLOR</Text>
                    <View style={styles.pickerRow}>
                        <EmojiPicker onSelect={setIcon} selectedEmoji={icon} />
                        <ColorPicker onSelect={setColor} selectedColor={color} />
                    </View>
                </View>

                {/* Deadline */}
                <View style={styles.section}>
                    <View style={styles.row}>
                        <View style={styles.labelCol}>
                            <Text style={[styles.label, { color: colors.textMuted }]}>TARGET DATE</Text>
                            <Text style={[styles.subLabel, { color: colors.textSecondary }]}>Optional</Text>
                        </View>
                        <TouchableOpacity 
                            style={[styles.dateSelector, { backgroundColor: colors.surface2 }]} 
                            onPress={() => setShowDatePicker(true)}
                        >
                            <Text style={{ color: targetDate ? colors.accent : colors.textMuted, fontWeight: '600' }}>
                                {targetDate ? targetDate.toLocaleDateString() : 'Set Date'}
                            </Text>
                        </TouchableOpacity>
                    </View>
                    {targetDate && (
                         <TouchableOpacity onPress={() => setTargetDate(null)} style={styles.clearDate}>
                            <Text style={{ color: '#FF6B6B', fontSize: 12, fontWeight: '600' }}>Clear deadline</Text>
                         </TouchableOpacity>
                    )}
                </View>

                {showDatePicker && (
                    <DateTimePicker
                        value={targetDate || new Date()}
                        mode="date"
                        display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                        onChange={(event, date) => {
                            setShowDatePicker(false);
                            if (date) setTargetDate(date);
                        }}
                        minimumDate={new Date()}
                    />
                )}

                <View style={{ height: 100 }} />
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
    saveBtn: {
        fontSize: 16,
        fontWeight: '700',
        paddingHorizontal: 8,
    },
    scroll: {
        padding: 20,
    },
    previewContainer: {
        alignItems: 'center',
        marginVertical: 32,
    },
    previewCircle: {
        width: 100,
        height: 100,
        borderRadius: 50,
        borderWidth: 2,
        alignItems: 'center',
        justifyContent: 'center',
    },
    previewEmoji: {
        fontSize: 48,
    },
    section: {
        marginBottom: 24,
    },
    label: {
        fontSize: 10,
        fontWeight: '700',
        letterSpacing: 1,
        marginBottom: 8,
    },
    subLabel: {
        fontSize: 13,
        fontWeight: '500',
    },
    pickerRow: {
        flexDirection: 'row',
        gap: 16,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    labelCol: {
        flex: 1,
    },
    dateSelector: {
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 12,
    },
    clearDate: {
        marginTop: 8,
        alignSelf: 'flex-end',
    }
});
