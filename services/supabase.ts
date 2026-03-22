import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';
import { MMKV } from 'react-native-mmkv';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Attempt to initialize MMKV, fallback to AsyncStorage if it fails
// This prevents crashes in environments where MMKV native module might not be linked yet
let storage: any;
try {
  // @ts-ignore - MMKV is both a class and a type, ignore incorrect type-only warning
  storage = new MMKV();
} catch (e) {
  console.warn('MMKV could not be initialized, using AsyncStorage as fallback');
}

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: storage ? {
      getItem: (key: string) => {
        return storage.getString(key) || null;
      },
      setItem: (key: string, value: string) => {
        storage.set(key, value);
      },
      removeItem: (key: string) => {
        storage.delete(key);
      },
    } : {
      // Fallback to AsyncStorage (Async storage is supported by Supabase)
      getItem: async (key: string) => {
        return await AsyncStorage.getItem(key);
      },
      setItem: async (key: string, value: string) => {
        await AsyncStorage.setItem(key, value);
      },
      removeItem: async (key: string) => {
        await AsyncStorage.removeItem(key);
      },
    },
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
