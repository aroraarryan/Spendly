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
import OfflineBanner from "../components/shared/OfflineBanner";
import { startRealtimeSync, stopRealtimeSync } from "../services/realtimeService";
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
    const router = useRouter();
    const { showInAppToast } = useToast();
    const { setColorScheme } = useTailwindColorScheme();
    
    const { 
        session, 
        initialized, 
        appInitialized, 
        initialize: initAuth, 
        initializeStores 
    } = useAuthStore();

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
        let isMounted = true;
        
        if (session?.user?.id) {
            console.log('[Layout] Session available, starting stable store init');
            initializeStores(session.user.id);
            
            // Fail-safe: Always hide splash or loading after 5 seconds if we have a session
            const timer = setTimeout(async () => {
                const state = useAuthStore.getState();
                if (isMounted && (!state.appInitialized || !state.initialized)) {
                    console.warn('[Layout] Initialization taking too long, triggering failsafe to unlock UI');
                    useAuthStore.setState({ appInitialized: true, initialized: true });
                    await SplashScreen.hideAsync().catch(() => {});
                }
            }, 5000);

            return () => {
                isMounted = false;
                clearTimeout(timer);
            };
        } else {
            stopRealtimeSync();
        }
    }, [session?.user?.id]);

    // Handle Splash Screen Visibility based on appInitialized
    useEffect(() => {
        if (appInitialized) {
            SplashScreen.hideAsync().catch(() => {});
        }
    }, [appInitialized]);

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
        if (!appInitialized || !session) return;

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
    }, [appInitialized, session]);

    // Show nothing while auth is initializing or while loading db if logged in
    if (!initialized || (session && !appInitialized)) {
        return (
            <View style={{ flex: 1, backgroundColor: '#000000', justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" color="#00D1FF" />
            </View>
        );
    }

    return (
        <ErrorBoundary>
            <GestureHandlerRootView style={{ flex: 1 }}>
                <OfflineBanner />
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
