import { create } from 'zustand';
import { supabase } from '@/services/supabase';
import { Session, User } from '@supabase/supabase-js';
import { UserProfile } from '@/types';
import { useCategoryStore } from './categoryStore';
import { useExpenseStore } from './expenseStore';
import { useEventStore } from './eventStore';
import { useIncomeStore } from './incomeStore';
import { useSavingsStore } from './savingsStore';
import { useInvestmentStore } from './investmentStore';
import { useNetWorthStore } from './netWorthStore';
import { useSettingsStore } from './settingsStore';
import { initDatabase } from '@/services/database';
import { startRealtimeSync } from '@/services/realtimeService';

interface AuthState {
  session: Session | null;
  user: User | null;
  profile: UserProfile | null;
  isLoading: boolean;
  initialized: boolean;
  appInitialized: boolean;

  setSession: (session: Session | null) => Promise<void>;
  loadProfile: (userId: string) => Promise<void>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
  uploadAvatar: () => Promise<void>;
  signOut: () => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signInWithApple: () => Promise<void>;
  initialize: () => Promise<void>;
  initializeStores: (userId: string) => Promise<void>;
  resetLoading: () => void;
}

// Private flag to prevent concurrent store initializations
let _isInitializing = false;

export const useAuthStore = create<AuthState>((set, get) => ({
  session: null,
  user: null,
  profile: null,
  isLoading: false,
  initialized: false,
  appInitialized: false,

  resetLoading: () => set({ isLoading: false }),

  setSession: async (session) => {
    const user = session?.user ?? null;
    console.log('[Auth Store] setSession update:', user ? `User ${user.id}` : 'NULL');
    
    set({ session, user });
    
    if (user) {
      // Load profile (metadata first, then DB) - NON-BLOCKING
      get().loadProfile(user.id).catch(err => {
        console.error('[Auth Store] Background profile load error:', err);
      });
      
      // Secondary check after 2 seconds to ensure stability
      setTimeout(async () => {
        const check = get().profile;
        if (!check?.full_name || check.full_name === 'Explorer') {
          console.log('[Auth Store] Re-verifying profile consistency...');
          await get().loadProfile(user.id);
        }
      }, 2000);
    } else {
      set({ profile: null });
    }
    
    // Fail-safe: Always ensure loading is false after a session update
    set({ isLoading: false });
  },

  loadProfile: async (userId) => {
    console.log('[Auth Store] loadProfile for:', userId);
    // 1. Immediately set from current store state (metadata) to avoid nulls
    const { user, profile: currentProfile } = get();
    if (!currentProfile && user?.user_metadata) {
      const metadata = user.user_metadata;
      const fullName = metadata.full_name || metadata.name || metadata.displayName || 'Explorer';
      let avatarUrl = metadata.avatar_url || metadata.picture || metadata.avatarUrl || null;
      
      // Clean up empty strings
      if (typeof avatarUrl === 'string' && avatarUrl.trim() === '') {
        avatarUrl = null;
      }
      
      set({
        profile: {
          id: userId,
          full_name: fullName,
          avatar_url: avatarUrl,
          provider: user.app_metadata?.provider || null,
          updated_at: new Date().toISOString(),
        }
      });
    }

    try {
      // 2. Fetch from DB in background to get latest custom changes
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (data && data.full_name) {
        set({ profile: data as UserProfile });
      } else if (error) {
        console.warn('[Auth] Background profile fetch error:', error.message);
      }
    } catch (err) {
      console.error('[Auth] Profile load unexpected error:', err);
    }
  },

  updateProfile: async (updates) => {
    const { user, profile } = get();
    if (!user) return;

    try {
      console.log('[Auth Store] updateProfile starting...');
    set({ isLoading: true });
      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id);

      if (error) throw error;

      if (profile) {
        set({ profile: { ...profile, ...updates } });
      }
    } catch (err) {
      console.error('Error updating profile:', err);
      throw err;
    } finally {
      set({ isLoading: false });
    }
  },

  uploadAvatar: async () => {
    const { user } = get();
    if (!user) return;

    try {
      const { pickImage, manipulateImage } = require('@/services/nativeBridge');

      const result = await pickImage({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.5,
      });

      if (result.canceled) return;

      console.log('[Auth Store] updateProfile starting...');
    console.log('[Auth Store] signInWithGoogle starting...');
    set({ isLoading: true });
      const asset = result.assets[0];
      
      // Optimize image
      const manipResult = await manipulateImage(
        asset.uri,
        [{ resize: { width: 200, height: 200 } }],
        { compress: 0.7, format: 'jpeg' } // Format is handled differently in bridge
      );

      const filePath = `${user.id}/avatar.jpg`;
      const formData = new FormData();
      
      // Create readable stream for Supabase storage
      const response = await fetch(manipResult.uri);
      const blob = await response.blob();

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, blob, {
          upsert: true,
          contentType: 'image/jpeg',
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      // Add a cache breaker
      const urlWithCacheBreaker = `${publicUrl}?t=${Date.now()}`;

      await get().updateProfile({ avatar_url: urlWithCacheBreaker });
    } catch (err) {
      console.error('Error uploading avatar:', err);
      throw err;
    } finally {
      set({ isLoading: false });
    }
  },

  signOut: async () => {
    console.log('[Auth Store] signOut starting...');
    await supabase.auth.signOut();
    _isInitializing = false;
    set({ session: null, user: null, profile: null, isLoading: false, initialized: false, appInitialized: false });
  },

  signInWithGoogle: async () => {
    try {
      console.log('[Auth Store] signInWithGoogle starting...');
      set({ isLoading: true });
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
              if (error) throw error;
            }
          }
        }
      }
    } catch (error: any) {
      console.error('Google Login Error:', error.message);
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  signInWithApple: async () => {
    try {
      console.log('[Auth Store] signInWithApple starting...');
      set({ isLoading: true });
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
              const { error } = await supabase.auth.setSession({ access_token, refresh_token });
              if (error) throw error;
            }
          }
        }
      }
    } catch (error: any) {
      console.error('Apple Login Error:', error.message);
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  initialize: async () => {
    if (get().initialized) return;

    // 1. Setup Auth State Listener immediately
    supabase.auth.onAuthStateChange(async (_event, session) => {
      console.log('[Auth Store] onAuthStateChange:', _event);
      await get().setSession(session);
    });

    // 2. Set initialized to true early to unlock UI
    set({ initialized: true });

    // 3. Get initial session in background
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      await get().setSession(session);
    }
  },

  initializeStores: async (userId) => {
    if (_isInitializing || get().appInitialized) {
      console.log('[Auth Store] Already initialized or in progress, skipping');
      return;
    }

    _isInitializing = true;
    console.log('[Auth Store] Starting stable staged initialization for:', userId);
    console.log('[Auth Store Init] Starting stable staged initialization for:', userId);

    const startTime = Date.now();
    const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
    
    const loadStore = async (name: string, p: Promise<any>) => {
      try {
        await p;
        console.log(`[Auth Store Init] ${name} loaded`);
      } catch (e: any) {
        console.error(`[Auth Store Init] ${name} failed:`, e.message);
      }
    };

    try {
      // 1. Critical Profile 
      console.log('[Auth Store Init] loading profile asynchronously...');
      get().loadProfile(userId).catch(e => console.error(e));

      // 2. Core UI Data
      console.log('[Auth Store Init] Stage 2 (Core) starting asynchronous fetch...');
      
      // Set intermediate flag IMMEDIATELY to unlock UI
      set({ appInitialized: true });
      
      await Promise.allSettled([
        loadStore('DB Verify', initDatabase()),
        loadStore('Categories', useCategoryStore.getState().loadCategories()),
        loadStore('Settings', useSettingsStore.getState().loadSettings()),
        loadStore('IncomeSources', useIncomeStore.getState().loadIncomeSources())
      ]);

      console.log('[Auth Store Init] Stage 2 complete');
      await delay(100);

      // 3. Financials
      console.log('[Auth Store Init] Stage 3 (Financials)...');
      const now = new Date();
      await Promise.allSettled([
        loadStore('Expenses', useExpenseStore.getState().loadExpenses()),
        loadStore('Events', useEventStore.getState().loadEvents()),
        loadStore('Income', useIncomeStore.getState().loadIncome(now.getMonth() + 1, now.getFullYear())),
        loadStore('Goals', useSavingsStore.getState().loadGoals())
      ]);

      console.log('[Auth Store Init] Stage 3 complete');
      await delay(100);

      // 4. Wealth Data
      console.log('[Auth Store Init] Stage 4 (Wealth)...');
      await Promise.allSettled([
        loadStore('Investments', useInvestmentStore.getState().loadInvestments()),
        loadStore('InvTypes', useInvestmentStore.getState().loadInvestmentTypes()),
        loadStore('SIPs', useInvestmentStore.getState().loadSIPs()),
        loadStore('FDs', useInvestmentStore.getState().loadFixedDeposits()),
        loadStore('Assets', useNetWorthStore.getState().loadAssets()),
        loadStore('Liabilities', useNetWorthStore.getState().loadLiabilities()),
        loadStore('History', useNetWorthStore.getState().loadHistory())
      ]);

      console.log('[Auth Store Init] All stages done in', Date.now() - startTime, 'ms');
      startRealtimeSync(userId);
      _isInitializing = false;


    } catch (error) {
      console.error('[Auth Store Init] Critical Error:', error);
      set({ appInitialized: true }); // Failsafe
      _isInitializing = false;
    }
  },
}));

