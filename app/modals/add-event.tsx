import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Pressable,
    KeyboardAvoidingView,
    Platform,
    Alert
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import DateTimePicker from '@react-native-community/datetimepicker';
import Animated, { useSharedValue, useAnimatedStyle, withSpring, withTiming, runOnJS } from 'react-native-reanimated';
import { useEventStore } from '../../store/eventStore';
import { useThemeColors } from '@/hooks/useThemeColors';
import { Theme } from '../../constants/theme';
import NeoCard from '../../components/ui/NeoCard';
import NeoButton from '../../components/ui/NeoButton';
import NeoInput from '../../components/ui/NeoInput';
import ColorPicker from '../../components/categories/ColorPicker';
import { Ionicons } from '@expo/vector-icons';

const AddEventModal = () => {
    const router = useRouter();
    const colors = useThemeColors();
    const insets = useSafeAreaInsets();
    const { addEvent } = useEventStore();

    // Animation values
    const opacity = useSharedValue(0);
    const translateY = useSharedValue(1000);

    // Form State
    const [name, setName] = useState('');
    const [startDate, setStartDate] = useState(new Date());
    const [endDate, setEndDate] = useState(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000));
    const [budget, setBudget] = useState('');
    const [color, setColor] = useState(colors.accent);

    // UI state
    const [showDatePicker, setShowDatePicker] = useState<'start' | 'end' | null>(null);

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

    const handleSave = async () => {
        if (!name.trim()) {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
            Alert.alert('Error', 'Please enter an event name');
            return;
        }

        if (endDate < startDate) {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
            Alert.alert('Error', 'End date cannot be before start date');
            return;
        }

        try {
            await addEvent({
                name: name.trim(),
                start_date: startDate.toISOString(),
                end_date: endDate.toISOString(),
                total_budget: parseFloat(budget) || 0,
                cover_color: color,
            });

            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            handleClose();
        } catch (error) {
            console.error('Failed to create event:', error);
            Alert.alert('Error', 'Failed to create event');
        }
    };

    const formatDateShort = (date: Date) => {
        return date.toLocaleDateString('en-GB', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        });
    };

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
                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    style={{ flex: 1 }}
                >
                    {/* Drag Handle */}
                    <View style={styles.handleWrapper}>
                        <View style={[styles.handle, { backgroundColor: colors.border }]} />
                    </View>

                    {/* Header */}
                    <View style={styles.header}>
                        <TouchableOpacity onPress={handleClose}>
                            <Text style={[styles.cancelText, { color: colors.textSecondary }]}>Cancel</Text>
                        </TouchableOpacity>
                        <Text style={[styles.title, { color: colors.text }]}>New Event</Text>
                        <View style={{ width: 60 }} />
                    </View>

                    <ScrollView
                        contentContainerStyle={styles.scrollContent}
                        showsVerticalScrollIndicator={false}
                    >
                        {/* Live Preview */}
                        <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>Preview</Text>
                        <View style={[styles.previewBanner, { backgroundColor: color }]}>
                            <Text style={styles.previewName}>
                                {name || 'Event Name'}
                            </Text>
                        </View>

                        <NeoInput
                            label="Event Name"
                            value={name}
                            onChangeText={setName}
                            placeholder="Goa Trip, Office Party..."
                            maxLength={30}
                        />

                        <Text style={[styles.sectionLabel, { color: colors.textSecondary, marginBottom: 8 }]}>Duration</Text>
                        <View style={styles.dateRangeRow}>
                            <TouchableOpacity
                                style={styles.dateBtn}
                                onPress={() => setShowDatePicker('start')}
                            >
                                <Text style={[styles.dateLabel, { color: colors.textMuted }]}>START</Text>
                                <NeoCard padding={12} backgroundColor={colors.surface2} style={styles.dateCard}>
                                    <Text style={[styles.dateText, { color: colors.text }]}>
                                        {formatDateShort(startDate)}
                                    </Text>
                                </NeoCard>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={styles.dateBtn}
                                onPress={() => setShowDatePicker('end')}
                            >
                                <Text style={[styles.dateLabel, { color: colors.textMuted }]}>END</Text>
                                <NeoCard padding={12} backgroundColor={colors.surface2} style={styles.dateCard}>
                                    <Text style={[styles.dateText, { color: colors.text }]}>
                                        {formatDateShort(endDate)}
                                    </Text>
                                </NeoCard>
                            </TouchableOpacity>
                        </View>

                        <NeoInput
                            label="Allocated Budget (Optional)"
                            value={budget}
                            onChangeText={setBudget}
                            placeholder="0 = No limit"
                            keyboardType="numeric"
                        />

                        <Text style={[styles.sectionLabel, { color: colors.textSecondary, marginBottom: 12 }]}>Brand Color</Text>
                        <ColorPicker selectedColor={color} onColorSelect={setColor} />

                        <View style={styles.footer}>
                            <NeoButton
                                label="Initialize Event"
                                onPress={handleSave}
                                variant="primary"
                            />
                        </View>
                    </ScrollView>
                </KeyboardAvoidingView>
            </Animated.View>

            {showDatePicker && (
                Platform.OS === 'ios' ? (
                    <View style={[StyleSheet.absoluteFill, { zIndex: 999 }]}>
                        <Pressable style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.3)' }} onPress={() => setShowDatePicker(null)} />
                        <Animated.View style={{ backgroundColor: colors.background, paddingBottom: insets.bottom, position: 'absolute', bottom: 0, width: '100%', borderTopLeftRadius: 24, borderTopRightRadius: 24 }}>
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', padding: 20, borderBottomWidth: 1, borderBottomColor: colors.border }}>
                                <Text style={{ fontSize: 16, fontWeight: '600', color: colors.text }}>
                                    {showDatePicker === 'start' ? 'Select Start Date' : 'Select End Date'}
                                </Text>
                                <TouchableOpacity onPress={() => setShowDatePicker(null)}>
                                    <Text style={{ color: colors.accent, fontWeight: '700', fontSize: 16 }}>Done</Text>
                                </TouchableOpacity>
                            </View>
                            <DateTimePicker
                                value={showDatePicker === 'start' ? startDate : endDate}
                                mode="date"
                                display="spinner"
                                textColor={colors.text}
                                onChange={(event, selectedDate) => {
                                    if (selectedDate) {
                                        if (showDatePicker === 'start') setStartDate(selectedDate);
                                        else setEndDate(selectedDate);
                                    }
                                }}
                            />
                        </Animated.View>
                    </View>
                ) : (
                    <DateTimePicker
                        value={showDatePicker === 'start' ? startDate : endDate}
                        mode="date"
                        display="default"
                        onChange={(event, selectedDate) => {
                            setShowDatePicker(null);
                            if (selectedDate) {
                                if (showDatePicker === 'start') setStartDate(selectedDate);
                                else setEndDate(selectedDate);
                            }
                        }}
                    />
                )
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    overlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    sheet: {
        height: '90%',
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
    scrollContent: {
        paddingHorizontal: 24,
        paddingBottom: 40,
    },
    sectionLabel: {
        fontSize: 13,
        fontWeight: '500',
        marginBottom: 12,
    },
    previewBanner: {
        height: 100,
        borderRadius: 16,
        justifyContent: 'center',
        paddingHorizontal: 24,
        marginBottom: 32,
    },
    previewName: {
        fontSize: 24,
        fontWeight: '700',
        color: '#FFFFFF',
    },
    dateRangeRow: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 24,
    },
    dateBtn: {
        flex: 1,
    },
    dateLabel: {
        fontSize: 11,
        fontWeight: '600',
        marginBottom: 6,
    },
    dateCard: {
        borderRadius: 12,
        borderWidth: 0,
    },
    dateText: {
        fontSize: 14,
        fontWeight: '500',
    },
    footer: {
        marginTop: 40,
    }
});

export default AddEventModal;
