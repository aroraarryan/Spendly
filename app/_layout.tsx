import "../global.css";
import { Stack, useRouter, useSegments } from "expo-router";
import { useEffect, useState } from "react";
import { View, ActivityIndicator, Text, useColorScheme as useNativeColorScheme, LogBox } from "react-native";
import { useColorScheme as useTailwindColorScheme } from "nativewind";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import * as Notifications from 'expo-notifications';
import { initDatabase } from "../services/database";
import { useCategoryStore } from "../store/categoryStore";
import { useExpenseStore } from "../store/expenseStore";
import { useEventStore } from "../store/eventStore";
import { useSettingsStore } from "../store/settingsStore";
import { useIncomeStore } from "../store/incomeStore";
import { useSavingsStore } from "../store/savingsStore";
import { useInvestmentStore } from "../store/investmentStore";
import { useNetWorthStore } from "../store/netWorthStore";
import { registerForPushNotifications, clearBadge } from "../services/notificationService";
import { useAuthStore } from "../store/authStore";
import { useToast } from "../hooks/useToast";
import InAppToast from "../components/shared/InAppToast";
import { Theme } from "../constants/theme";
import { useThemeColors } from "../hooks/useThemeColors";
import { useAppTheme } from "../hooks/useAppTheme";
import ErrorBoundary from "../components/shared/ErrorBoundary";
import * as SplashScreen from 'expo-splash-screen';

// Prevent the splash screen from auto-hiding
SplashScreen.preventAutoHideAsync();

if (__DEV__) {
    LogBox.ignoreAllLogs();
}

export default function RootLayout() {
    const segments = useSegments();
    const [dbInitialized, setDbInitialized] = useState(false);
    const router = useRouter();
    const { showInAppToast } = useToast();
    const { setColorScheme } = useTailwindColorScheme();
    const { loadSettings } = useSettingsStore();

    const { session, initialized, initialize: initAuth } = useAuthStore();

    const { loadIncomeSources, loadIncome } = useIncomeStore.getState();
    const { loadGoals } = useSavingsStore.getState();
    const { loadInvestments, loadInvestmentTypes, loadSIPs, loadFixedDeposits } = useInvestmentStore.getState();
    const { loadAssets, loadLiabilities, loadHistory } = useNetWorthStore.getState();

    const theme = useAppTheme();
    const colors = useThemeColors();

    // Sync Tailwind/NativeWind color scheme
    useEffect(() => {
        setColorScheme(theme as 'light' | 'dark');
    }, [theme]);

    useEffect(() => {
        initAuth();
    }, []);

    // Database Initialization & Data Loading
    useEffect(() => {
        const setup = async () => {
            if (!session) return;
            
            try {
                await initDatabase();

                const now = new Date();
                const currentMonth = now.getMonth() + 1;
                const currentYear = now.getFullYear();

                await Promise.all([
                    useCategoryStore.getState().loadCategories(),
                    useExpenseStore.getState().loadExpenses(),
                    useEventStore.getState().loadEvents(),
                    loadSettings(),
                    loadIncomeSources(),
                    loadIncome(currentMonth, currentYear),
                    loadGoals(),
                    loadInvestments(),
                    loadInvestmentTypes(),
                    loadSIPs(),
                    loadFixedDeposits(),
                    loadAssets(),
                    loadLiabilities(),
                    loadHistory()
                ]);

                setDbInitialized(true);
                await SplashScreen.hideAsync();
            } catch (e) {
                console.error("Failed to initialize database", e);
                setDbInitialized(true);
                await SplashScreen.hideAsync();
            }
        };
        setup();
    }, [session]);

    // Handle Auth Redirection & Splash Hiding
    useEffect(() => {
        if (!initialized) return;

        const inAuthGroup = segments[0] === 'auth';
        const inOnboarding = segments[0] === 'onboarding';

        if (!session) {
            // Hide splash screen if no session (setup didn't run)
            SplashScreen.hideAsync().catch(() => {});
            
            if (!inAuthGroup && !inOnboarding) {
                router.replace('/onboarding');
            }
        } else {
            if (inAuthGroup || inOnboarding) {
                router.replace('/(tabs)');
            }
            // setup() handles hideAsync for the session case
        }
    }, [session, initialized, segments]);

    // Post-Initialization Setup (Notifications)
    useEffect(() => {
        if (!dbInitialized || !session) return;

        registerForPushNotifications();
        clearBadge();

        const subscription = Notifications.addNotificationResponseReceivedListener(response => {
            const screen = response.notification.request.content.data?.screen;
            if (screen === 'analytics') router.push('/(tabs)/analytics');
            if (screen === 'home') router.push('/(tabs)/');
            if (screen === 'events') router.push('/(tabs)/events');
            if (screen === 'ai') router.push('/(tabs)/ai-insights');
        });

        const foregroundSubscription = Notifications.addNotificationReceivedListener(notification => {
            showInAppToast(
                notification.request.content.title ?? '',
                notification.request.content.body ?? ''
            );
        });

        return () => {
            subscription.remove();
            foregroundSubscription.remove();
        }
    }, [dbInitialized, session]);

    // Show nothing while auth is initializing or while loading db if logged in
    if (!initialized || (session && !dbInitialized)) {
        return (
            <View style={{ flex: 1, backgroundColor: '#000000', justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" color="#00D1FF" />
            </View>
        );
    }

    return (
        <ErrorBoundary>
            <GestureHandlerRootView style={{ flex: 1 }}>
                <InAppToast />
                <Stack screenOptions={{
                    headerStyle: { backgroundColor: colors.background },
                    headerTitleStyle: { fontWeight: '600', color: colors.text, fontSize: 17 },
                    headerTintColor: colors.accent,
                    headerShadowVisible: false,
                    contentStyle: { backgroundColor: colors.background }
                }}>
                    <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                    <Stack.Screen name="settings" options={{ title: 'Settings', presentation: 'card', headerShown: false }} />
                    <Stack.Screen name="categories" options={{ title: 'Categories', headerShown: false }} />
                    <Stack.Screen name="category-detail" options={{ title: 'Details', presentation: 'card' }} />
                    <Stack.Screen name="modals/add-expense" options={{ headerShown: false, presentation: 'transparentModal', contentStyle: { backgroundColor: 'transparent' } }} />
                    <Stack.Screen name="modals/add-event" options={{ headerShown: false, presentation: 'transparentModal', contentStyle: { backgroundColor: 'transparent' } }} />
                    <Stack.Screen name="event-detail" options={{ headerShown: true, title: 'Event' }} />
                    <Stack.Screen name="modals/edit-category" options={{ headerShown: false, presentation: 'transparentModal', contentStyle: { backgroundColor: 'transparent' } }} />
                    <Stack.Screen name="onboarding" options={{ headerShown: false, animation: 'fade' }} />
                    <Stack.Screen name="auth/signup" options={{ title: 'Sign Up', headerShown: false }} />
                    <Stack.Screen name="auth/signin" options={{ title: 'Sign In', headerShown: false }} />
                    <Stack.Screen name="auth/forgot-password" options={{ title: 'Forgot Password', headerShown: false }} />
                    <Stack.Screen name="profile" options={{ title: 'Profile', headerShown: false }} />
                </Stack>
            </GestureHandlerRootView>
        </ErrorBoundary>
    );
}
