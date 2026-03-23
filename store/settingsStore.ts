import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { setMonthlyBudget as dbSetMonthlyBudget } from '../services/database';

interface SettingsState {
    currency: string;
    currencySymbol: string;
    monthlyBudget: number;
    notificationsEnabled: boolean;
    budgetAlertsEnabled: boolean;
    monthlySummaryEnabled: boolean;
    dailyReminderEnabled: boolean;
    dailyReminderHour: number;
    dailyReminderMinute: number;
    themePreference: 'light' | 'dark' | 'system';
    budgetResetDay: number;
    compactMode: boolean;
    incomeReminderEnabled: boolean;


    setCurrency: (currency: string, symbol: string) => Promise<void>;
    setCurrencySymbol: (symbol: string) => Promise<void>;
    setMonthlyBudget: (amount: number) => Promise<void>;
    setNotificationsEnabled: (enabled: boolean) => Promise<void>;
    setBudgetAlertsEnabled: (enabled: boolean) => Promise<void>;
    setMonthlySummaryEnabled: (enabled: boolean) => Promise<void>;
    setDailyReminderEnabled: (enabled: boolean) => Promise<void>;
    setDailyReminderTime: (hour: number, minute: number) => Promise<void>;
    setThemePreference: (theme: 'light' | 'dark' | 'system') => Promise<void>;
    setBudgetResetDay: (day: number) => Promise<void>;
    setCompactMode: (bool: boolean) => Promise<void>;
    setIncomeReminderEnabled: (enabled: boolean) => Promise<void>;

    loadSettings: () => Promise<void>;
    resetSettings: () => Promise<void>;
}

export const useSettingsStore = create<SettingsState>((set, get) => ({
    currency: 'INR',
    currencySymbol: '₹',
    monthlyBudget: 0,
    notificationsEnabled: true,
    budgetAlertsEnabled: true,
    monthlySummaryEnabled: true,
    dailyReminderEnabled: false,
    dailyReminderHour: 21,
    dailyReminderMinute: 0,
    themePreference: 'system',
    budgetResetDay: 1,
    compactMode: false,
    incomeReminderEnabled: true,


    setCurrency: async (currency, symbol) => {
        await AsyncStorage.setItem('currency', currency);
        await AsyncStorage.setItem('currencySymbol', symbol);
        set({ currency, currencySymbol: symbol });
    },
    setCurrencySymbol: async (symbol) => {
        await AsyncStorage.setItem('currencySymbol', symbol);
        set({ currencySymbol: symbol });
    },
    setMonthlyBudget: async (amount) => {
        await AsyncStorage.setItem('monthlyBudget', amount.toString());
        set({ monthlyBudget: amount });

        const now = new Date();
        await dbSetMonthlyBudget(now.getMonth() + 1, now.getFullYear(), amount);
    },
    setNotificationsEnabled: async (enabled) => {
        await AsyncStorage.setItem('notificationsEnabled', enabled.toString());
        set({ notificationsEnabled: enabled });
    },
    setBudgetAlertsEnabled: async (enabled) => {
        await AsyncStorage.setItem('budgetAlertsEnabled', enabled.toString());
        set({ budgetAlertsEnabled: enabled });
    },
    setMonthlySummaryEnabled: async (enabled) => {
        await AsyncStorage.setItem('monthlySummaryEnabled', enabled.toString());
        set({ monthlySummaryEnabled: enabled });
    },
    setDailyReminderEnabled: async (enabled) => {
        await AsyncStorage.setItem('dailyReminderEnabled', enabled.toString());
        set({ dailyReminderEnabled: enabled });
    },
    setDailyReminderTime: async (hour, minute) => {
        await AsyncStorage.setItem('dailyReminderHour', hour.toString());
        await AsyncStorage.setItem('dailyReminderMinute', minute.toString());
        set({ dailyReminderHour: hour, dailyReminderMinute: minute });
    },
    setThemePreference: async (theme) => {
        await AsyncStorage.setItem('themePreference', theme);
        set({ themePreference: theme });
    },
    setBudgetResetDay: async (day) => {
        await AsyncStorage.setItem('budgetResetDay', day.toString());
        set({ budgetResetDay: day });
    },
    setCompactMode: async (bool) => {
        await AsyncStorage.setItem('compactMode', bool.toString());
        set({ compactMode: bool });
    },
    setIncomeReminderEnabled: async (enabled) => {
        await AsyncStorage.setItem('incomeReminderEnabled', enabled.toString());
        set({ incomeReminderEnabled: enabled });
    },
    loadSettings: async () => {
        try {
            const [
                currency,
                currencySymbol,
                monthlyBudget,
                notificationsEnabled,
                budgetAlertsEnabled,
                monthlySummaryEnabled,
                dailyReminderEnabled,
                dailyReminderHour,
                dailyReminderMinute,
                themePreference,
                budgetResetDay,
                compactMode,
                incomeReminderEnabled
            ] = await Promise.all([
                AsyncStorage.getItem('currency'),
                AsyncStorage.getItem('currencySymbol'),
                AsyncStorage.getItem('monthlyBudget'),
                AsyncStorage.getItem('notificationsEnabled'),
                AsyncStorage.getItem('budgetAlertsEnabled'),
                AsyncStorage.getItem('monthlySummaryEnabled'),
                AsyncStorage.getItem('dailyReminderEnabled'),
                AsyncStorage.getItem('dailyReminderHour'),
                AsyncStorage.getItem('dailyReminderMinute'),
                AsyncStorage.getItem('themePreference'),
                AsyncStorage.getItem('budgetResetDay'),
                AsyncStorage.getItem('compactMode'),
                AsyncStorage.getItem('incomeReminderEnabled')
            ]);

            set({
                currency: currency ?? 'INR',
                currencySymbol: currencySymbol ?? '₹',
                monthlyBudget: monthlyBudget ? parseFloat(monthlyBudget) : 0,
                notificationsEnabled: notificationsEnabled === null ? true : notificationsEnabled === 'true',
                budgetAlertsEnabled: budgetAlertsEnabled === null ? true : budgetAlertsEnabled === 'true',
                monthlySummaryEnabled: monthlySummaryEnabled === null ? true : monthlySummaryEnabled === 'true',
                dailyReminderEnabled: dailyReminderEnabled === 'true',
                dailyReminderHour: dailyReminderHour ? parseInt(dailyReminderHour) : 21,
                dailyReminderMinute: dailyReminderMinute ? parseInt(dailyReminderMinute) : 0,
                themePreference: (themePreference as 'light' | 'dark' | 'system') ?? 'system',
                budgetResetDay: budgetResetDay ? parseInt(budgetResetDay) : 1,
                compactMode: compactMode === 'true',
                incomeReminderEnabled: incomeReminderEnabled === null ? true : incomeReminderEnabled === 'true',
            });
        } catch (e) {
            console.error("Failed to load settings from AsyncStorage", e);
        }
    },
    resetSettings: async () => {
        const keys = [
            'currency', 'currencySymbol', 'monthlyBudget',
            'notificationsEnabled', 'budgetAlertsEnabled',
            'monthlySummaryEnabled', 'dailyReminderEnabled',
            'dailyReminderHour', 'dailyReminderMinute',
            'themePreference', 'budgetResetDay', 'compactMode', 'incomeReminderEnabled'
        ];
        await AsyncStorage.multiRemove(keys);
        set({
            currency: 'INR',
            currencySymbol: '₹',
            monthlyBudget: 0,
            notificationsEnabled: true,
            budgetAlertsEnabled: true,
            monthlySummaryEnabled: true,
            dailyReminderEnabled: false,
            dailyReminderHour: 21,
            dailyReminderMinute: 0,
            themePreference: 'system',
            budgetResetDay: 1,
            compactMode: false,
            incomeReminderEnabled: true,
        });
    }
}));
