import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    Alert,
    SafeAreaView,
    Platform,
    ActivityIndicator,
    Share
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Constants from 'expo-constants';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MMKV } from 'react-native-mmkv';
import { useSettingsStore } from '../store/settingsStore';
import { useExpenseStore } from '../store/expenseStore';
import { useCategoryStore } from '../store/categoryStore';
import { useEventStore } from '../store/eventStore';
import { useThemeColors } from '../hooks/useThemeColors';
import { useToast } from '../hooks/useToast';
import { haptic } from '../utils/haptics';

import NeoButton from '../components/ui/NeoButton';
import NeoToggle from '../components/ui/NeoToggle';
import NeoCard from '../components/ui/NeoCard';
import NeoBadge from '../components/ui/NeoBadge';

import SettingsSection from '../components/settings/SettingsSection';
import SettingsRow from '../components/settings/SettingsRow';
import SettingsBudgetModal from '../components/settings/SettingsBudgetModal';
import SettingsCurrencyModal from '../components/settings/SettingsCurrencyModal';
import SettingsThemeModal from '../components/settings/SettingsThemeModal';
import InfoModal from '../components/settings/InfoModal';
import ErrorBoundary from '../components/shared/ErrorBoundary';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StyleSheet } from 'react-native';

import { exportDetailedExpensesCSV, exportDetailedEventsCSV } from '../utils/exportHelpers';
import {
    cancelAllNotifications,
    registerForPushNotifications,
    scheduleMonthlySummaryNotification,
    scheduleDailyReminder,
    sendInstantNotification
} from '../services/notificationService';
import {
    deleteAllExpenses,
    deleteAllEvents,
    resetCategoriesToDefault,
    setMonthlyBudget as dbSetMonthlyBudget
} from '../services/database';

export default function SettingsScreen() {
    const colors = useThemeColors();
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { showInAppToast } = useToast();

    const settings = useSettingsStore();
    const { expenses, loadExpenses } = useExpenseStore();
    const { categories, loadCategories } = useCategoryStore();
    const { events, loadEvents } = useEventStore();
    const [lastBackupDate, setLastBackupDate] = useState<string | null>(null);

    useEffect(() => {
        const loadBackupDate = async () => {
            const val = await AsyncStorage.getItem('last_backup_date');
            setLastBackupDate(val);
        };
        loadBackupDate();
    }, []);

    // Modal States
    const [isBudgetVisible, setIsBudgetVisible] = useState(false);
    const [isCurrencyVisible, setIsCurrencyVisible] = useState(false);
    const [isThemeVisible, setIsThemeVisible] = useState(false);
    const [infoModal, setInfoModal] = useState<{ visible: boolean, title: string, content: string }>({
        visible: false,
        title: '',
        content: ''
    });

    // Loading States
    const [isExporting, setIsExporting] = useState(false);

    const appVersion = Constants.expoConfig?.version ?? '1.0.0';

    const handleToggleAllNotifications = async (enabled: boolean) => {
        await settings.setNotificationsEnabled(enabled);
        if (enabled) {
            const granted = await registerForPushNotifications();
            if (granted) {
                if (settings.monthlySummaryEnabled) await scheduleMonthlySummaryNotification();
                if (settings.dailyReminderEnabled) {
                    await scheduleDailyReminder(true, settings.dailyReminderHour, settings.dailyReminderMinute);
                }
            }
        } else {
            await cancelAllNotifications();
        }
    };

    const handleExportExpenses = async () => {
        setIsExporting(true);
        try {
            await exportDetailedExpensesCSV(expenses, categories, events, settings.currencySymbol);
            showInAppToast('Export Complete', 'Expenses exported successfully');
            const now = new Date().toISOString();
            await AsyncStorage.setItem('last_backup_date', now);
            setLastBackupDate(now);
        } catch (e) {
            Alert.alert('Export Failed', 'An error occurred while exporting data.');
        } finally {
            setIsExporting(false);
        }
    };

    const handleExportEvents = async () => {
        setIsExporting(true);
        try {
            await exportDetailedEventsCSV(events, expenses, categories, settings.currencySymbol);
            showInAppToast('Export Complete', 'Events exported successfully');
        } catch (e) {
            Alert.alert('Export Failed', 'An error occurred while exporting data.');
        } finally {
            setIsExporting(false);
        }
    };

    const handleClearAllData = () => {
        Alert.alert(
            'Are you sure?',
            'This will delete all your expenses, events, and categories. This cannot be undone.',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Yes, Delete Everything',
                    style: 'destructive',
                    onPress: async () => {
                        confirmClearAllData();
                    }
                }
            ]
        );
    };

    const confirmClearAllData = () => {
        Alert.alert(
            'Last chance',
            'Are you absolutely sure? All data will be permanently wiped.',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete Everything',
                    style: 'destructive',
                    onPress: async () => {
                        await performWholesaleWipe();
                    }
                }
            ]
        );
    };

    const performWholesaleWipe = async () => {
        try {
            haptic.warning();

            // Delete from DB
            await deleteAllExpenses();
            await deleteAllEvents();
            await resetCategoriesToDefault();

            // Reset budgets in DB for current month
            const now = new Date();
            await dbSetMonthlyBudget(now.getMonth() + 1, now.getFullYear(), 0);

            // Clear AI reporting data
            await AsyncStorage.removeItem('ai_last_report');
            await AsyncStorage.removeItem('ai_chat_messages');

            // Clear AsyncStorage
            await AsyncStorage.clear();

            // Reload Stores
            await loadExpenses();
            await loadEvents();
            await loadCategories();

            haptic.success();
            showInAppToast('Success', 'All data cleared successfully');
            router.replace('/(tabs)/');
        } catch (e) {
            haptic.error();
            console.error(e);
            Alert.alert('Error', 'Failed to clear data completely.');
        }
    };

    const handleShareApp = async () => {
        try {
            await Share.share({
                message: 'I have been tracking my expenses with Spendly! It has an AI advisor powered by Gemini. Check it out!',
            });
        } catch (error) {
            console.error(error);
        }
    };

    const openPrivacyPolicy = () => {
        setInfoModal({
            visible: true,
            title: 'Privacy Policy',
            content: 'Spendly stores all your data locally on your device. We do not collect, sell, or share any personal data. When you use AI Insights (optional), your anonymized spending totals are sent to Google Gemini API to generate advice. No personal information is transmitted.'
        });
    };

    const openAcknowledgements = () => {
        setInfoModal({
            visible: true,
            title: 'Acknowledgements',
            content: 'Spendly is built with modern technologies to provide a fast and secure experience:\n\n• React Native & Expo: Core framework\n• Zustand: State management\n• SQLite: Local database\n• Victory Native: Beautiful data visualization\n• Google Gemini AI: Smart financial insights\n• NativeWind: Styling system'
        });
    };

    const formatTime = (hour: number, minute: number) => {
        const ampm = hour >= 12 ? 'PM' : 'AM';
        const displayHour = hour % 12 || 12;
        const displayMinute = minute.toString().padStart(2, '0');
        return `${displayHour}:${displayMinute} ${ampm}`;
    };

    return (
        <ErrorBoundary>
            <View style={{ flex: 1, backgroundColor: colors.background }}>
                <Stack.Screen options={{ headerShown: false }} />

                {/* Header */}
                <View style={[styles.header, { paddingTop: insets.top + 16, borderBottomColor: colors.border }]}>
                    <TouchableOpacity
                        onPress={() => {
                            haptic.light();
                            router.back();
                        }}
                        style={styles.backButton}
                    >
                        <Ionicons name="chevron-back" size={24} color={colors.text} />
                    </TouchableOpacity>
                    <Text style={[styles.title, { color: colors.text }]}>Settings</Text>
                    <View style={{ width: 44 }} />
                </View>

                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingVertical: 24 }}>
                    {/* Profile Card */}
                    <View style={{ marginBottom: 32, paddingHorizontal: 16 }}>
                        <NeoCard padding={24}>
                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                <View
                                    style={{
                                        width: 64,
                                        height: 64,
                                        borderRadius: 32,
                                        backgroundColor: colors.accent,
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        marginRight: 16
                                    }}
                                >
                                    <Text style={{ color: 'white', fontSize: 24, fontWeight: '900' }}>S</Text>
                                </View>
                                <View style={{ flex: 1 }}>
                                    <Text style={{ fontSize: 22, fontWeight: '800', color: colors.text }}>Spendly</Text>
                                    <Text style={{ fontSize: 13, fontWeight: '500', color: colors.textSecondary }}>Personal Finance Advisor</Text>
                                </View>
                                <NeoBadge label={`v${appVersion}`} variant="neutral" />
                            </View>
                        </NeoCard>
                    </View>

                    {/* Budget & Currency */}
                    <SettingsSection title="Budget & Currency">
                        <SettingsRow
                            icon="💰"
                            iconBgColor="#EDE9FE"
                            label="Monthly Budget"
                            rightElement={<Text style={{ color: colors.textSecondary }}>{settings.currencySymbol}{settings.monthlyBudget.toLocaleString()}</Text>}
                            onPress={() => setIsBudgetVisible(true)}
                            showChevron
                        />
                        <SettingsRow
                            icon="💱"
                            iconBgColor="#DCFCE7"
                            label="Currency"
                            rightElement={<Text style={{ color: colors.textSecondary }}>{settings.currency} {settings.currencySymbol}</Text>}
                            onPress={() => setIsCurrencyVisible(true)}
                            showChevron
                        />
                        <SettingsRow
                            icon="📅"
                            iconBgColor="#FFEDD5"
                            label="Budget Resets On"
                            rightElement={<Text style={{ color: colors.textSecondary }}>{settings.budgetResetDay}{settings.budgetResetDay === 1 ? 'st' : settings.budgetResetDay === 2 ? 'nd' : settings.budgetResetDay === 3 ? 'rd' : 'th'} of month</Text>}
                            onPress={() => {
                                Alert.alert('Reset Day', 'Select the day of month your budget resets:',
                                    Array.from({ length: 28 }, (_, i) => i + 1).map(day => ({
                                        text: `${day}${day === 1 ? 'st' : day === 2 ? 'nd' : day === 3 ? 'rd' : 'th'}`,
                                        onPress: async () => { await settings.setBudgetResetDay(day); }
                                    })).slice(0, 5).concat([{ text: 'More...', onPress: async () => { } }])
                                );
                            }}
                            showChevron
                            isLast
                        />
                    </SettingsSection>

                    {/* Appearance */}
                    <SettingsSection title="Appearance">
                        <SettingsRow
                            icon="🎨"
                            iconBgColor="#F3E8FF"
                            label="App Theme"
                            rightElement={<Text style={{ color: colors.textSecondary }}>{settings.themePreference.charAt(0).toUpperCase() + settings.themePreference.slice(1)}</Text>}
                            onPress={() => setIsThemeVisible(true)}
                            showChevron
                        />
                        <SettingsRow
                            icon="📱"
                            iconBgColor="#DBEAFE"
                            label="App Icon"
                            rightElement={<Text style={{ color: colors.textSecondary }}>Default</Text>}
                            onPress={() => Alert.alert('App Icon', 'Custom app icons coming in a future update!')}
                            showChevron
                        />
                        <SettingsRow
                            icon="▦"
                            iconBgColor="#F3F4F6"
                            label="Compact Mode"
                            rightElement={
                                <NeoToggle
                                    value={settings.compactMode}
                                    onValueChange={(val) => settings.setCompactMode(val)}
                                />
                            }
                            isLast
                        />
                    </SettingsSection>

                    {/* Notifications */}
                    <SettingsSection title="Notifications">
                        <SettingsRow
                            icon="🔔"
                            iconBgColor="#F5F3FF"
                            label="All Notifications"
                            rightElement={
                                <NeoToggle
                                    value={settings.notificationsEnabled}
                                    onValueChange={handleToggleAllNotifications}
                                />
                            }
                        />
                        <SettingsRow
                            icon="⚠️"
                            iconBgColor="#FFEDD5"
                            label="Budget Alerts"
                            sublabel="Notify when reaching 80% of budget"
                            disabled={!settings.notificationsEnabled}
                            rightElement={
                                <NeoToggle
                                    value={settings.budgetAlertsEnabled}
                                    onValueChange={(val) => settings.setBudgetAlertsEnabled(val)}
                                    disabled={!settings.notificationsEnabled}
                                />
                            }
                        />
                        <SettingsRow
                            icon="📊"
                            iconBgColor="#DCFCE7"
                            label="Monthly Summary"
                            sublabel="Reminder on 1st of each month"
                            disabled={!settings.notificationsEnabled}
                            rightElement={
                                <NeoToggle
                                    value={settings.monthlySummaryEnabled}
                                    onValueChange={(val) => settings.setMonthlySummaryEnabled(val)}
                                    disabled={!settings.notificationsEnabled}
                                />
                            }
                        />
                        <SettingsRow
                            icon="⏰"
                            iconBgColor="#DBEAFE"
                            label="Daily Reminder"
                            sublabel={settings.dailyReminderEnabled ? formatTime(settings.dailyReminderHour, settings.dailyReminderMinute) : 'Off'}
                            disabled={!settings.notificationsEnabled}
                            rightElement={
                                <NeoToggle
                                    value={settings.dailyReminderEnabled}
                                    onValueChange={(val) => settings.setDailyReminderEnabled(val)}
                                    disabled={!settings.notificationsEnabled}
                                />
                            }
                        />
                        {settings.dailyReminderEnabled && settings.notificationsEnabled && (
                            <View className="px-4 py-4 bg-gray-50/50 flex-row justify-center gap-4 border-b border-gray-100">
                                {/* Simplified Time Picker as scrollable ones are complex for a single file implementation without dedicated library */}
                                <TouchableOpacity
                                    onPress={() => {
                                        const nextHour = (settings.dailyReminderHour + 1) % 24;
                                        settings.setDailyReminderTime(nextHour, settings.dailyReminderMinute);
                                        scheduleDailyReminder(true, nextHour, settings.dailyReminderMinute);
                                    }}
                                    className="px-4 py-2 bg-white rounded-xl border border-gray-200"
                                >
                                    <Text className="font-bold">{formatTime(settings.dailyReminderHour, settings.dailyReminderMinute)}</Text>
                                </TouchableOpacity>
                                <Text className="text-xs text-center text-gray-400 mt-2">Tap to cycle hour (simplified for demo)</Text>
                            </View>
                        )}
                        {__DEV__ && (
                            <SettingsRow
                                icon="🧪"
                                iconBgColor="#F3F4F6"
                                label="Send Test Notification"
                                rightElement={
                                    <TouchableOpacity onPress={() => sendInstantNotification('Test Notification 🧪', 'Spendly notifications are working!')}>
                                        <Text style={{ color: colors.accent, fontWeight: '700' }}>Send</Text>
                                    </TouchableOpacity>
                                }
                                isLast
                            />
                        )}
                    </SettingsSection>

                    {/* Data & Privacy */}
                    <SettingsSection title="Data & Privacy">
                        <SettingsRow
                            icon="📊"
                            iconBgColor="#EEF0FF"
                            label="Data Management"
                            sublabel="Export, import, and manage your data"
                            onPress={() => router.push('/data-management')}
                            showChevron
                        />
                        <SettingsRow
                            icon="📤"
                            iconBgColor="#DCFCE7"
                            label="Export as CSV"
                            sublabel={`Last backup: ${lastBackupDate ? new Date(lastBackupDate).toLocaleDateString() : 'Never'}`}
                            rightElement={isExporting ? <ActivityIndicator size="small" color={colors.accent} /> : null}
                            onPress={handleExportExpenses}
                            showChevron
                        />
                        <SettingsRow
                            icon="🎯"
                            iconBgColor="#F5F3FF"
                            label="Export Events as CSV"
                            sublabel="Download all event data"
                            onPress={handleExportEvents}
                            showChevron
                        />
                        <SettingsRow
                            icon="☁️"
                            iconBgColor="#DBEAFE"
                            label="iCloud Backup"
                            rightElement={<NeoBadge label="Coming Soon" variant="neutral" />}
                        />
                        <SettingsRow
                            icon="🗑️"
                            iconBgColor="#FEE2E2"
                            label="Clear All Data"
                            sublabel="Permanently delete all expenses and events"
                            onPress={handleClearAllData}
                            isLast
                        />
                    </SettingsSection>

                    {/* About */}
                    <SettingsSection title="About">
                        <SettingsRow
                            icon="ℹ️"
                            iconBgColor="#F3F4F6"
                            label="Version"
                            rightElement={<Text style={{ color: colors.textSecondary }}>{appVersion}</Text>}
                        />
                        <SettingsRow
                            icon="⭐"
                            iconBgColor="#FEF9C3"
                            label="Rate Spendly"
                            onPress={() => Alert.alert('Rate the App', 'Thank you for using Spendly! Rating coming when app is on the App Store.')}
                            showChevron
                        />
                        <SettingsRow
                            icon="📣"
                            iconBgColor="#DCFCE7"
                            label="Share with Friends"
                            onPress={handleShareApp}
                            showChevron
                        />
                        <SettingsRow
                            icon="🔒"
                            iconBgColor="#F3F4F6"
                            label="Privacy Policy"
                            onPress={openPrivacyPolicy}
                            showChevron
                        />
                        <SettingsRow
                            icon="💙"
                            iconBgColor="#F3F4F6"
                            label="Acknowledgements"
                            onPress={openAcknowledgements}
                            showChevron
                            isLast={!__DEV__}
                        />
                        {__DEV__ && (
                            <SettingsRow
                                icon="🔄"
                                iconBgColor="#F3F4F6"
                                label="Reset Onboarding (Dev)"
                                onPress={async () => {
                                    haptic.warning();
                                    await AsyncStorage.removeItem('onboarding_complete');
                                    await settings.resetSettings();
                                    router.replace('/onboarding');
                                    haptic.success();
                                }}
                                isLast
                            />
                        )}
                    </SettingsSection>

                    <View className="items-center mt-4">
                        <Text className="text-xs text-gray-400">Made with ❤️ for Better Finance</Text>
                    </View>
                </ScrollView>

                <SettingsBudgetModal
                    visible={isBudgetVisible}
                    onClose={() => setIsBudgetVisible(false)}
                />
                <SettingsCurrencyModal
                    visible={isCurrencyVisible}
                    onClose={() => setIsCurrencyVisible(false)}
                />
                <SettingsThemeModal
                    visible={isThemeVisible}
                    onClose={() => setIsThemeVisible(false)}
                />
                <InfoModal
                    visible={infoModal.visible}
                    title={infoModal.title}
                    content={infoModal.content}
                    onClose={() => setInfoModal({ ...infoModal, visible: false })}
                />
            </View>
        </ErrorBoundary>
    );
}

const styles = StyleSheet.create({
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingBottom: 16,
        borderBottomWidth: 1,
    },
    backButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        alignItems: 'center',
        justifyContent: 'center',
    },
    title: {
        fontSize: 18,
        fontWeight: '800',
    }
});
