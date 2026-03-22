import React, { useState, useRef } from 'react';
import { View, StyleSheet, ScrollView, Dimensions, TouchableOpacity, Text, Alert, Platform } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';

import { useThemeColors } from '@/hooks/useThemeColors';
import NeoButton from '@/components/ui/NeoButton';
import ProgressDots from '@/components/onboarding/ProgressDots';
import OnboardingScreen1 from '@/components/onboarding/OnboardingScreen1';
import OnboardingScreen2 from '@/components/onboarding/OnboardingScreen2';
import OnboardingScreen3 from '@/components/onboarding/OnboardingScreen3';
import OnboardingScreen4 from '@/components/onboarding/OnboardingScreen4';
import OnboardingScreen5 from '@/components/onboarding/OnboardingScreen5';
import { SocialButton } from '@/components/auth/SocialButton';
import { useAuthStore } from '@/store/authStore';
import { supabase } from '@/services/supabase';

import { registerForPushNotifications, scheduleMonthlySummaryNotification, scheduleDailyReminder } from '@/services/notificationService';
import { useSettingsStore } from '@/store/settingsStore';

const { width } = Dimensions.get('window');

export default function Onboarding() {
    const colors = useThemeColors();
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const scrollRef = useRef<ScrollView>(null);
    const [currentIndex, setCurrentIndex] = useState(0);
    const { setNotificationsEnabled, monthlyBudget, currency, dailyReminderHour, dailyReminderMinute, resetSettings } = useSettingsStore();

    const { isLoading } = useAuthStore();

    const handleGoogleLogin = async () => {
        try {
            await AsyncStorage.setItem('onboarding_complete', 'true');
            const AuthSession = require('expo-auth-session');
            const WebBrowser = require('expo-web-browser');
            
            const redirectUrl = AuthSession.makeRedirectUri({ path: 'auth/callback' });
            
            const { data, error } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    redirectTo: redirectUrl,
                    skipBrowserRedirect: true,
                },
            });

            if (error) throw error;
            if (data?.url) {
                const result = await WebBrowser.openAuthSessionAsync(data.url, redirectUrl);
                if (result.type === 'success') {
                    const { url } = result;
                    
                    // Supabase sends tokens in the hash (#) part of the URL
                    const responseParams = url.split('#')[1] || url.split('?')[1];
                    if (responseParams) {
                        const params = new URLSearchParams(responseParams);
                        const access_token = params.get('access_token');
                        const refresh_token = params.get('refresh_token');
                        
                        if (access_token && refresh_token) {
                            const { error } = await supabase.auth.setSession({ 
                                access_token, 
                                refresh_token 
                            });
                            if (error) console.error('Set Session Error:', error.message);
                            // On success, the _layout.tsx useEffect will see the session change 
                            // and redirect to (tabs)
                        }
                    }
                }
            }
        } catch (error: any) {
            console.error('Google Login Error:', error.message);
        }
    };

    const handleAppleLogin = async () => {
        try {
            await AsyncStorage.setItem('onboarding_complete', 'true');
            const AuthSession = require('expo-auth-session');
            const WebBrowser = require('expo-web-browser');
            
            const redirectUrl = AuthSession.makeRedirectUri({ path: 'auth/callback' });

            const { data, error } = await supabase.auth.signInWithOAuth({
                provider: 'apple',
                options: {
                    redirectTo: redirectUrl,
                    skipBrowserRedirect: true,
                },
            });

            if (error) throw error;
            if (data?.url) {
                const result = await WebBrowser.openAuthSessionAsync(data.url, redirectUrl);
                if (result.type === 'success') {
                    const { url } = result;
                    const responseParams = url.split('#')[1] || url.split('?')[1];
                    if (responseParams) {
                        const params = new URLSearchParams(responseParams);
                        const access_token = params.get('access_token');
                        const refresh_token = params.get('refresh_token');
                        if (access_token && refresh_token) {
                            await supabase.auth.setSession({ access_token, refresh_token });
                        }
                    }
                }
            }
        } catch (error: any) {
            console.error('Apple Login Error:', error.message);
        }
    };

    const handleNext = () => {
        if (currentIndex < 4) {
            const nextIndex = currentIndex + 1;
            scrollRef.current?.scrollTo({ x: nextIndex * width, animated: true });
            setCurrentIndex(nextIndex);
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        } else {
            completeOnboarding();
        }
    };

    const handleBack = () => {
        if (currentIndex > 0) {
            const prevIndex = currentIndex - 1;
            scrollRef.current?.scrollTo({ x: prevIndex * width, animated: true });
            setCurrentIndex(prevIndex);
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }
    };

    const handleSkip = async () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        await resetSettings();
        scrollRef.current?.scrollTo({ x: 4 * width, animated: true });
        setCurrentIndex(4);
    };

    const completeOnboarding = async () => {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        await AsyncStorage.setItem('onboarding_complete', 'true');
        router.push('/auth/signup');
    };

    const handleEnableNotifications = async () => {
        try {
            const granted = await registerForPushNotifications();
            if (granted) {
                setNotificationsEnabled(true);
                scheduleMonthlySummaryNotification();
                scheduleDailyReminder(true, dailyReminderHour, dailyReminderMinute);
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                handleNext();
            } else {
                Alert.alert(
                    'Notifications Disabled',
                    'You can enable notifications anytime in Settings to stay on track.',
                    [{ text: 'Continue', onPress: handleNext }]
                );
            }
        } catch (e) {
            handleNext();
        }
    };

    const handleScroll = (event: any) => {
        const x = event.nativeEvent.contentOffset.x;
        const index = Math.round(x / width);
        if (index !== currentIndex) {
            setCurrentIndex(index);
        }
    };

    const showSkip = currentIndex >= 1 && currentIndex <= 3;
    const showBack = currentIndex >= 1 && currentIndex <= 3;

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <Stack.Screen options={{ headerShown: false }} />

            {/* Top Bar */}
            <View style={[styles.topBar, { top: insets.top + 16 }]}>
                {showBack ? (
                    <TouchableOpacity onPress={handleBack} style={styles.backBtn}>
                        <Ionicons name="chevron-back" size={24} color={colors.textSecondary} />
                    </TouchableOpacity>
                ) : <View style={styles.backBtn} />}

                {showSkip && (
                    <TouchableOpacity onPress={handleSkip} style={styles.skipBtn}>
                        <Text style={[styles.skipText, { color: colors.textMuted }]}>Skip</Text>
                    </TouchableOpacity>
                )}
            </View>

            <ScrollView
                ref={scrollRef}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                onScroll={handleScroll}
                scrollEventThrottle={16}
                scrollEnabled={true}
            >
                <View style={[styles.page, { paddingTop: insets.top + 60 }]}>
                    <OnboardingScreen1 />
                </View>
                <View style={[styles.page, { paddingTop: insets.top + 60 }]}>
                    <OnboardingScreen2 />
                </View>
                <View style={[styles.page, { paddingTop: insets.top + 60 }]}>
                    <OnboardingScreen3 />
                </View>
                <View style={[styles.page, { paddingTop: insets.top + 60 }]}>
                    <OnboardingScreen4 />
                </View>
                <View style={[styles.page, { paddingTop: insets.top + 60 }]}>
                    <OnboardingScreen5 />
                </View>
            </ScrollView>

            {/* Bottom Controls */}
            <View style={[styles.bottomControls, { paddingBottom: insets.bottom + 20 }]}>
                <ProgressDots currentPage={currentIndex} totalPages={5} />

                <View style={styles.buttonContainer}>
                    {currentIndex === 3 ? (
                        <>
                            <NeoButton
                                label="Enable Notifications"
                                onPress={handleEnableNotifications}
                                style={styles.fullButton}
                            />
                            <TouchableOpacity onPress={handleNext} style={styles.maybeLater}>
                                <Text style={[styles.maybeLaterText, { color: colors.textSecondary }]}>Maybe Later</Text>
                            </TouchableOpacity>
                        </>
                    ) : currentIndex === 0 ? (
                        <>
                            <NeoButton
                                label="Get Started"
                                onPress={handleNext}
                                style={styles.fullButton}
                            />
                            <TouchableOpacity style={styles.maybeLater} onPress={() => {
                                AsyncStorage.setItem('onboarding_complete', 'true');
                                router.push('/auth/signin');
                            }}>
                                <Text style={[styles.maybeLaterText, { color: colors.textSecondary }]}>I already have an account</Text>
                            </TouchableOpacity>
                        </>
                    ) : currentIndex === 4 ? (
                        <>
                            <NeoButton
                                label="Create Account"
                                onPress={completeOnboarding}
                                style={styles.fullButton}
                                variant="primary"
                            />
                            <View style={{ marginTop: 12, width: '100%', gap: 8 }}>
                                <SocialButton provider="google" onPress={handleGoogleLogin} isLoading={isLoading} />
                                {Platform.OS === 'ios' && (
                                    <SocialButton provider="apple" onPress={handleAppleLogin} isLoading={isLoading} />
                                )}
                            </View>
                            <TouchableOpacity style={styles.maybeLater} onPress={() => {
                                AsyncStorage.setItem('onboarding_complete', 'true');
                                router.push('/auth/signin');
                            }}>
                                <Text style={[styles.maybeLaterText, { color: colors.textSecondary }]}>Already have an account? Sign In</Text>
                            </TouchableOpacity>
                        </>
                    ) : (
                        <NeoButton
                            label="Continue"
                            onPress={handleNext}
                            style={styles.fullButton}
                            variant="secondary"
                        />
                    )}
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    topBar: {
        position: 'absolute',
        left: 20,
        right: 20,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        zIndex: 100,
    },
    backBtn: {
        width: 44,
        height: 44,
        justifyContent: 'center',
        alignItems: 'center',
    },
    skipBtn: {
        height: 44,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 12,
    },
    skipText: {
        fontSize: 14,
        fontWeight: '600',
    },
    page: {
        width,
        flex: 1,
    },
    bottomControls: {
        paddingHorizontal: 40,
    },
    buttonContainer: {
        marginTop: 10,
    },
    fullButton: {
        width: '100%',
    },
    maybeLater: {
        marginTop: 16,
        alignSelf: 'center',
        paddingVertical: 10,
    },
    maybeLaterText: {
        fontSize: 14,
        fontWeight: '500',
    },
});
