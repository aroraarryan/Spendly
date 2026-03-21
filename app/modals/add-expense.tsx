import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Pressable, Platform, KeyboardAvoidingView } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { useSharedValue, useAnimatedStyle, withSpring, withTiming, runOnJS } from 'react-native-reanimated';
import { haptic } from '@/utils/haptics';
import ErrorBoundary from '@/components/shared/ErrorBoundary';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';

import { useExpenseStore } from '@/store/expenseStore';
import { useCategoryStore } from '@/store/categoryStore';
import { useEventStore } from '@/store/eventStore';
import { useSettingsStore } from '@/store/settingsStore';
import { useThemeColors } from '@/hooks/useThemeColors';
import NumpadButton from '@/components/shared/NumpadButton';
import { Theme } from '@/constants/theme';
import NeoButton from '@/components/ui/NeoButton';
import NeoInput from '@/components/ui/NeoInput';
import NeoToggle from '@/components/ui/NeoToggle';
import NeoTag from '@/components/ui/NeoTag';
import NeoCard from '@/components/ui/NeoCard';

import { useShakeAnimation } from '@/hooks/useShakeAnimation';

export default function AddExpenseModal() {
    const router = useRouter();
    const params = useLocalSearchParams();
    const colors = useThemeColors();
    const insets = useSafeAreaInsets();

    const opacity = useSharedValue(0);
    const translateY = useSharedValue(1000);

    useEffect(() => {
        opacity.value = withTiming(1, { duration: 250 });
        translateY.value = withSpring(0, { damping: 25, stiffness: 250 });
    }, []);

    const handleClose = useCallback(() => {
        opacity.value = withTiming(0, { duration: 150 });
        translateY.value = withTiming(1000, { duration: 200 }, (finished) => {
            if (finished) {
                runOnJS(router.back)();
            }
        });
    }, [router, opacity, translateY]);

    return (
        <View style={{ flex: 1, justifyContent: 'flex-end' }}>
            <Animated.View style={[styles.overlay, { opacity: opacity }]}>
                <Pressable onPress={handleClose} style={StyleSheet.absoluteFill} />
            </Animated.View>

            <Animated.View
                style={[
                    styles.sheet,
                    {
                        backgroundColor: colors.background,
                        paddingBottom: Math.max(insets.bottom, 24),
                        transform: [{ translateY: translateY }]
                    }
                ]}
            >
                <AddExpenseContent
                    expenseId={params.expenseId as string | undefined}
                    preselectedEventId={params.preselectedEventId as string | undefined}
                    onClose={handleClose}
                />
            </Animated.View>
        </View>
    );
}

function AddExpenseContent({ expenseId, preselectedEventId, onClose }: { expenseId?: string; preselectedEventId?: string; onClose: () => void }) {
    const colors = useThemeColors();
    const insets = useSafeAreaInsets();
    const { addExpense, updateExpense, expenses } = useExpenseStore();
    const { categories } = useCategoryStore();
    const { getActiveEvents } = useEventStore();
    const { currencySymbol } = useSettingsStore();

    const [amountStr, setAmountStr] = useState('');
    const [categoryId, setCategoryId] = useState<string | null>(null);
    const [date, setDate] = useState(new Date());
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [showTimePicker, setShowTimePicker] = useState(false);
    const [note, setNote] = useState('');
    const [eventId, setEventId] = useState<string | null>(null);
    const [isRecurring, setIsRecurring] = useState(false);
    const [recurringInterval, setRecurringInterval] = useState<'Weekly' | 'Monthly'>('Monthly');

    const [showEventPicker, setShowEventPicker] = useState(false);
    const [errors, setErrors] = useState<{ amount?: string; category?: string }>({});

    const { shakeStyle: amountShake, triggerShake: triggerAmountShake } = useShakeAnimation();
    const { shakeStyle: categoryShake, triggerShake: triggerCategoryShake } = useShakeAnimation();

    useEffect(() => {
        if (expenseId) {
            const expense = expenses.find(e => e.id === expenseId);
            if (expense) {
                setAmountStr(expense.amount.toString());
                setCategoryId(expense.category_id);
                setDate(new Date(expense.date));
                setNote(expense.note || '');
                setEventId(expense.event_id);
                setIsRecurring(expense.is_recurring === 1);
                setRecurringInterval((expense.recurring_interval as any) || 'Monthly');
            }
        } else if (preselectedEventId && eventId !== preselectedEventId) {
            setEventId(preselectedEventId);
        }
    }, [expenseId, expenses, preselectedEventId]);

    const activeEvents = useMemo(() => getActiveEvents(), [getActiveEvents]);

    const handleNumpadPress = (val: string) => {
        setErrors(prev => ({ ...prev, amount: undefined }));
        if (val === 'del') {
            setAmountStr(prev => prev.slice(0, -1));
        } else if (val === '.') {
            if (!amountStr.includes('.')) {
                setAmountStr(prev => prev + (prev === '' ? '0.' : '.'));
            }
        } else {
            setAmountStr(prev => {
                const parts = prev.split('.');
                if (parts.length > 1 && parts[1].length >= 2) return prev;
                if (parseFloat(prev + val) > 9999999) return prev;
                return prev + val;
            });
        }
    };

    const handleSave = async () => {
        const amount = parseFloat(amountStr);
        let hasError = false;

        if (isNaN(amount) || amount <= 0) {
            triggerAmountShake();
            setErrors(prev => ({ ...prev, amount: 'Please enter an amount' }));
            hasError = true;
        }

        if (!categoryId) {
            triggerCategoryShake();
            setErrors(prev => ({ ...prev, category: 'Please select a category' }));
            hasError = true;
        }

        if (hasError) {
            haptic.error();
            return;
        }

        const expenseData = {
            amount,
            category_id: categoryId!,
            date: date.toISOString(),
            note: note.trim() || null,
            event_id: eventId,
            is_recurring: isRecurring ? 1 : 0,
            recurring_interval: isRecurring ? recurringInterval : null,
            photo_uri: null,
        } as any;

        if (expenseId) {
            await updateExpense(expenseId, expenseData);
        } else {
            await addExpense(expenseData);
        }

        haptic.success();
        onClose();
    };

    const isEdit = !!expenseId;
    const titleText = isEdit ? 'Edit Expense' : 'Add Expense';

    const numpadRows = [
        ['1', '2', '3'],
        ['4', '5', '6'],
        ['7', '8', '9'],
        ['.', '0', 'del']
    ];

    return (
        <View style={{ flex: 1 }}>
            {/* Drag Handle */}
            <View style={styles.handleWrapper}>
                <View style={[styles.handle, { backgroundColor: colors.border }]} />
            </View>

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={onClose}>
                    <Text style={[styles.cancelText, { color: colors.textSecondary }]}>Cancel</Text>
                </TouchableOpacity>
                <Text style={[styles.title, { color: colors.text }]}>{titleText}</Text>
                <View style={{ width: 60 }} />
            </View>

            <ScrollView showsVerticalScrollIndicator={false} style={{ flex: 1 }}>
                {/* Amount Display */}
                <Animated.View style={[styles.amountDisplay, amountShake]}>
                    <Text style={[styles.amountValue, { color: errors.amount ? colors.danger : colors.accent }]}>
                        {amountStr ? `${currencySymbol}${amountStr}` : 'Enter amount'}
                    </Text>
                    {errors.amount && (
                        <Text style={[styles.errorText, { color: colors.danger }]}>{errors.amount}</Text>
                    )}
                </Animated.View>

                {/* Numpad Grid */}
                <View style={styles.numpadContainer}>
                    {numpadRows.map((row, i) => (
                        <View key={i} style={styles.numpadRow}>
                            {row.map((btn) => (
                                <NumpadButton key={btn} value={btn} onPress={handleNumpadPress} />
                            ))}
                        </View>
                    ))}
                </View>

                {/* Category Selector */}
                <View style={styles.section}>
                    <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>Category</Text>
                    <Animated.View style={categoryShake}>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 24 }}>
                            {categories.map(cat => (
                                <NeoTag
                                    key={cat.id}
                                    emoji={cat.icon}
                                    label={cat.name}
                                    style={errors.category && !categoryId ? { borderColor: colors.danger, borderWidth: 1 } : {}}
                                    selected={categoryId === cat.id}
                                    onPress={() => {
                                        setCategoryId(cat.id);
                                        setErrors(prev => ({ ...prev, category: undefined }));
                                    }}
                                />
                            ))}
                        </ScrollView>
                    </Animated.View>
                </View>

                <View style={styles.formSection}>
                    <View style={{ position: 'relative' }}>
                        <NeoInput
                            label="Description"
                            value={note}
                            onChangeText={(text) => text.length <= 100 && setNote(text)}
                            placeholder="What was this for?"
                        />
                        <Text style={[styles.charCount, { color: colors.textMuted }]}>
                            {note.length}/100
                        </Text>
                    </View>

                    <Text style={[styles.sectionLabel, { color: colors.textSecondary, marginBottom: 8 }]}>Date</Text>
                    <View style={{ flexDirection: 'row', gap: 12 }}>
                        <TouchableOpacity onPress={() => setShowDatePicker(true)} activeOpacity={0.7} style={{ flex: 1 }}>
                            <NeoCard padding={14} backgroundColor={colors.surface2} style={styles.pickerCard}>
                                <Text style={[styles.pickerText, { color: colors.text }]}>
                                    {date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                                </Text>
                                <Ionicons name="calendar-outline" size={18} color={colors.accent} />
                            </NeoCard>
                        </TouchableOpacity>

                        <TouchableOpacity onPress={() => setShowTimePicker(true)} activeOpacity={0.7} style={{ flex: 1 }}>
                            <NeoCard padding={14} backgroundColor={colors.surface2} style={styles.pickerCard}>
                                <Text style={[styles.pickerText, { color: colors.text }]}>
                                    {date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </Text>
                                <Ionicons name="time-outline" size={18} color={colors.accent} />
                            </NeoCard>
                        </TouchableOpacity>
                    </View>

                    <Text style={[styles.sectionLabel, { color: colors.textSecondary, marginTop: 24, marginBottom: 8 }]}>Link to Event (Optional)</Text>
                    <TouchableOpacity
                        onPress={() => !preselectedEventId && setShowEventPicker(true)}
                        activeOpacity={preselectedEventId ? 1 : 0.7}
                    >
                        <NeoCard
                            padding={14}
                            backgroundColor={preselectedEventId ? colors.surface : colors.surface2}
                            style={[
                                styles.pickerCard,
                                preselectedEventId && { opacity: 0.7, borderColor: colors.border }
                            ]}
                        >
                            <Text style={[styles.pickerText, { color: eventId ? colors.text : colors.textMuted }]}>
                                {eventId ? activeEvents.find(e => e.id === eventId)?.name : 'None selected'}
                            </Text>
                            {preselectedEventId ? (
                                <Ionicons name="lock-closed" size={18} color={colors.textMuted} />
                            ) : (
                                <Ionicons name="pricetag-outline" size={18} color={colors.accent} />
                            )}
                        </NeoCard>
                    </TouchableOpacity>
                </View>

                {/* Recurring */}
                <View style={styles.recurringCardWrapper}>
                    <NeoCard padding={20} style={styles.recurringCard}>
                        <View style={styles.recurringHeader}>
                            <View>
                                <Text style={[styles.recurringTitle, { color: colors.text }]}>Recurring Transaction</Text>
                                <Text style={[styles.recurringSub, { color: colors.textSecondary }]}>Repeat automatically</Text>
                            </View>
                            <NeoToggle value={isRecurring} onValueChange={setIsRecurring} />
                        </View>

                        {isRecurring && (
                            <View style={[styles.intervalPicker, { backgroundColor: colors.surface2 }]}>
                                {['Weekly', 'Monthly'].map((opt) => (
                                    <TouchableOpacity
                                        key={opt}
                                        onPress={() => setRecurringInterval(opt as any)}
                                        style={[
                                            styles.intervalBtn,
                                            recurringInterval === opt && { backgroundColor: colors.white, ...Theme.shadow.xs }
                                        ]}
                                    >
                                        <Text style={[
                                            styles.intervalText,
                                            { color: recurringInterval === opt ? colors.text : colors.textSecondary }
                                        ]}>
                                            {opt}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        )}
                    </NeoCard>
                </View>

                <View style={styles.footer}>
                    <NeoButton
                        label={isEdit ? 'Update Transaction' : 'Confirm Transaction'}
                        onPress={handleSave}
                        variant="primary"
                    />
                </View>
            </ScrollView>

            {showDatePicker && (
                Platform.OS === 'ios' ? (
                    <View style={[StyleSheet.absoluteFill, { zIndex: 999 }]}>
                        <Pressable style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.3)' }} onPress={() => setShowDatePicker(false)} />
                        <Animated.View style={{ backgroundColor: colors.background, paddingBottom: insets.bottom, position: 'absolute', bottom: 0, width: '100%', borderTopLeftRadius: 24, borderTopRightRadius: 24 }}>
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', padding: 20, borderBottomWidth: 1, borderBottomColor: colors.border }}>
                                <Text style={{ fontSize: 16, fontWeight: '600', color: colors.text }}>Select Date</Text>
                                <TouchableOpacity onPress={() => setShowDatePicker(false)}>
                                    <Text style={{ color: colors.accent, fontWeight: '700', fontSize: 16 }}>Done</Text>
                                </TouchableOpacity>
                            </View>
                            <DateTimePicker
                                value={date}
                                mode="date"
                                display="spinner"
                                textColor={colors.text}
                                onChange={(event, selectedDate) => {
                                    if (selectedDate) {
                                        const newDate = new Date(date);
                                        newDate.setFullYear(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate());
                                        setDate(newDate);
                                    }
                                }}
                            />
                        </Animated.View>
                    </View>
                ) : (
                    <DateTimePicker
                        value={date}
                        mode="date"
                        display="default"
                        onChange={(event, selectedDate) => {
                            setShowDatePicker(false);
                            if (selectedDate) {
                                const newDate = new Date(date);
                                newDate.setFullYear(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate());
                                setDate(newDate);
                            }
                        }}
                    />
                )
            )}

            {showTimePicker && (
                Platform.OS === 'ios' ? (
                    <View style={[StyleSheet.absoluteFill, { zIndex: 999 }]}>
                        <Pressable style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.3)' }} onPress={() => setShowTimePicker(false)} />
                        <Animated.View style={{ backgroundColor: colors.background, paddingBottom: insets.bottom, position: 'absolute', bottom: 0, width: '100%', borderTopLeftRadius: 24, borderTopRightRadius: 24 }}>
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', padding: 20, borderBottomWidth: 1, borderBottomColor: colors.border }}>
                                <Text style={{ fontSize: 16, fontWeight: '600', color: colors.text }}>Select Time</Text>
                                <TouchableOpacity onPress={() => setShowTimePicker(false)}>
                                    <Text style={{ color: colors.accent, fontWeight: '700', fontSize: 16 }}>Done</Text>
                                </TouchableOpacity>
                            </View>
                            <DateTimePicker
                                value={date}
                                mode="time"
                                display="spinner"
                                textColor={colors.text}
                                onChange={(event, selectedTime) => {
                                    if (selectedTime) setDate(selectedTime);
                                }}
                            />
                        </Animated.View>
                    </View>
                ) : (
                    <DateTimePicker
                        value={date}
                        mode="time"
                        display="default"
                        onChange={(event, selectedTime) => {
                            setShowTimePicker(false);
                            if (selectedTime) setDate(selectedTime);
                        }}
                    />
                )
            )}

            {/* Event Picker Modal (Simplified) */}
            {showEventPicker && (
                <View style={StyleSheet.absoluteFill}>
                    <Pressable style={styles.modalBackdrop} onPress={() => setShowEventPicker(false)} />
                    <View style={styles.modalContent}>
                        <NeoCard style={{ maxHeight: 400 }}>
                            <ScrollView>
                                <TouchableOpacity
                                    onPress={() => { setEventId(null); setShowEventPicker(false); }}
                                    style={styles.eventItem}
                                >
                                    <Text style={[styles.eventText, { color: colors.textSecondary }]}>No Event</Text>
                                </TouchableOpacity>
                                {activeEvents.map(event => (
                                    <TouchableOpacity
                                        key={event.id}
                                        onPress={() => { setEventId(event.id); setShowEventPicker(false); }}
                                        style={styles.eventItem}
                                    >
                                        <View style={[styles.eventDot, { backgroundColor: event.cover_color }]} />
                                        <Text style={[styles.eventText, { color: colors.text }]}>{event.name}</Text>
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>
                        </NeoCard>
                    </View>
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    overlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    sheet: {
        height: '92%',
        borderTopLeftRadius: 32,
        borderTopRightRadius: 32,
        overflow: 'hidden',
    },
    handleWrapper: {
        alignItems: 'center',
        paddingVertical: 12,
    },
    handle: {
        width: 40,
        height: 4,
        borderRadius: 2,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 24,
        marginBottom: 24,
    },
    cancelText: {
        fontSize: 16,
        fontWeight: '500',
    },
    title: {
        fontSize: 17,
        fontWeight: '600',
    },
    amountDisplay: {
        alignItems: 'center',
        paddingVertical: 24,
    },
    amountValue: {
        fontSize: 48,
        fontWeight: '700',
    },
    errorText: {
        fontSize: 13,
        fontWeight: '500',
        marginTop: 8,
    },
    numpadContainer: {
        paddingHorizontal: 32,
        marginBottom: 32,
    },
    numpadRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    section: {
        marginBottom: 32,
    },
    sectionLabel: {
        fontSize: 13,
        fontWeight: '500',
        marginBottom: 12,
        marginLeft: 24,
    },
    formSection: {
        paddingHorizontal: 24,
        marginBottom: 32,
    },
    charCount: {
        position: 'absolute',
        right: 0,
        top: 0,
        fontSize: 11,
        fontWeight: '500',
    },
    pickerCard: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderRadius: 12,
        borderWidth: 0,
    },
    pickerText: {
        fontSize: 15,
        fontWeight: '400',
    },
    recurringCardWrapper: {
        paddingHorizontal: 24,
        marginBottom: 40,
    },
    recurringCard: {
        borderRadius: 20,
    },
    recurringHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    recurringTitle: {
        fontSize: 15,
        fontWeight: '600',
    },
    recurringSub: {
        fontSize: 13,
        marginTop: 2,
    },
    intervalPicker: {
        flexDirection: 'row',
        marginTop: 20,
        padding: 4,
        borderRadius: 12,
    },
    intervalBtn: {
        flex: 1,
        paddingVertical: 8,
        alignItems: 'center',
        borderRadius: 8,
    },
    intervalText: {
        fontSize: 13,
        fontWeight: '500',
    },
    footer: {
        paddingHorizontal: 24,
        marginTop: 12,
    },
    modalBackdrop: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.3)',
    },
    modalContent: {
        padding: 40,
        justifyContent: 'center',
        flex: 1,
    },
    eventItem: {
        paddingVertical: 16,
        paddingHorizontal: 20,
        flexDirection: 'row',
        alignItems: 'center',
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    eventDot: {
        width: 10,
        height: 10,
        borderRadius: 5,
        marginRight: 12,
    },
    eventText: {
        fontSize: 15,
        fontWeight: '500',
    }
});
