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
import { registerForPushNotifications, clearBadge } from "../services/notificationService";
import { useToast } from "../hooks/useToast";
import InAppToast from "../components/shared/InAppToast";
import { Theme } from "../constants/theme";
import { useThemeColors } from "../hooks/useThemeColors";
import { useAppTheme } from "../hooks/useAppTheme";
import ErrorBoundary from "../components/shared/ErrorBoundary";
import * as SplashScreen from 'expo-splash-screen';

// Prevent the splash screen from auto-hiding
SplashScreen.preventAutoHideAsync();

/**
 * [FINAL FIX] 
 * The user's "startup popup" was actually the LogBox warning bar.
 * Disabling it globally in dev mode to keep the UI completely clean as requested.
 */
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
    const theme = useAppTheme();
    const colors = useThemeColors();

    // Sync Tailwind/NativeWind color scheme
    useEffect(() => {
        setColorScheme(theme as 'light' | 'dark');
    }, [theme]);

    useEffect(() => {
        const setup = async () => {
            try {
                await initDatabase();

                // Load all stores from SQLite and MMKV in parallel
                await Promise.all([
                    useCategoryStore.getState().loadCategories(),
                    useExpenseStore.getState().loadExpenses(),
                    useEventStore.getState().loadEvents(),
                    loadSettings()
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
    }, []);

    // Handle redirection once initialized
    useEffect(() => {
        if (!dbInitialized) return;

        const checkOnboarding = async () => {
            // Forcefully skip onboarding in development mode
            if (__DEV__) {
                await AsyncStorage.setItem('onboarding_complete', 'true');
                // If we're currently on the onboarding route, jump to home
                if (segments[0] === 'onboarding') {
                    router.replace('/(tabs)/');
                }
                return;
            }

            const onboardingComplete = await AsyncStorage.getItem('onboarding_complete');
            if (!onboardingComplete) {
                router.replace('/onboarding');
            }
        };

        checkOnboarding();
    }, [dbInitialized]);

    useEffect(() => {
        if (!dbInitialized) return;

        // Register for notifications on app start
        registerForPushNotifications();

        // Clear badge when app opens
        clearBadge();

        // Handle notification tap — navigate to correct screen
        const subscription = Notifications.addNotificationResponseReceivedListener(response => {
            const screen = response.notification.request.content.data?.screen;
            if (screen === 'analytics') router.push('/(tabs)/analytics');
            if (screen === 'home') router.push('/(tabs)/');
            if (screen === 'events') router.push('/(tabs)/events');
            if (screen === 'ai') router.push('/(tabs)/ai-insights');
        });

        // Handle notifications received while app is in foreground
        const foregroundSubscription = Notifications.addNotificationReceivedListener(notification => {
            // Show an in-app toast instead of the system notification when app is open
            showInAppToast(
                notification.request.content.title ?? '',
                notification.request.content.body ?? ''
            );
        });

        return () => {
            subscription.remove();
            foregroundSubscription.remove();
        }
    }, [dbInitialized]);

    if (!dbInitialized) return null;

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
                    {/* Only mount onboarding in production or manually enabled */}
                    <Stack.Screen name="onboarding" options={{ headerShown: false, animation: 'fade' }} />
                </Stack>
            </GestureHandlerRootView>
        </ErrorBoundary>
    );
}
