import { create } from 'zustand';
import { supabase } from '@/services/supabase';
import { Session, User } from '@supabase/supabase-js';
import { UserProfile } from '@/types';


interface AuthState {
  session: Session | null;
  user: User | null;
  profile: UserProfile | null;
  isLoading: boolean;
  initialized: boolean;

  setSession: (session: Session | null) => Promise<void>;
  loadProfile: (userId: string) => Promise<void>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
  uploadAvatar: () => Promise<void>;
  signOut: () => Promise<void>;
  initialize: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  session: null,
  user: null,
  profile: null,
  isLoading: false,
  initialized: false,

  setSession: async (session) => {
    set({ session, user: session?.user ?? null, isLoading: true });
    if (session?.user) {
      await get().loadProfile(session.user.id);
    } else {
      set({ profile: null });
    }
    set({ isLoading: false });
  },

  loadProfile: async (userId) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (data) {
        set({ profile: data as UserProfile });
        return;
      }

      // Fallback: Use user metadata from the session if profile doesn't exist in DB
      const { user } = get();
      if (user?.user_metadata) {
        set({
          profile: {
            id: userId,
            full_name: user.user_metadata.full_name || user.user_metadata.name || null,
            avatar_url: user.user_metadata.avatar_url || user.user_metadata.picture || null,
            provider: user.app_metadata?.provider || null,
            updated_at: new Date().toISOString(),
          }
        });
      }
    } catch (err) {
      console.error('Unexpected error loading profile:', err);
    }
  },

  updateProfile: async (updates) => {
    const { user, profile } = get();
    if (!user) return;

    try {
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
    await supabase.auth.signOut();
    set({ session: null, user: null, profile: null });
  },

  initialize: async () => {
    if (get().initialized) return;

    // Get initial session
    const { data: { session } } = await supabase.auth.getSession();
    await get().setSession(session);

    // Listen for auth changes
    supabase.auth.onAuthStateChange(async (_event, session) => {
      await get().setSession(session);
    });

    set({ initialized: true });
  },
}));
