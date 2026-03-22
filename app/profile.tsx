import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, Alert, Platform } from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '@/store/authStore';
import { Avatar } from '@/components/auth/Avatar';
import { AuthInput } from '@/components/auth/AuthInput';
import NeoButton from '@/components/ui/NeoButton';
import { useThemeColors } from '@/hooks/useThemeColors';
import { haptic } from '@/utils/haptics';

export default function ProfileScreen() {
  const router = useRouter();
  const colors = useThemeColors();
  const { profile, updateProfile, signOut, isLoading } = useAuthStore();
  
  const [fullName, setFullName] = useState(profile?.full_name || '');
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name || '');
    }
  }, [profile]);

  useEffect(() => {
    setHasChanges(fullName !== profile?.full_name);
  }, [fullName, profile]);

  const handleUpdate = async () => {
    if (!fullName.trim()) {
      Alert.alert('Error', 'Full name cannot be empty');
      return;
    }

    try {
      haptic.medium();
      await updateProfile({ full_name: fullName.trim() });
      Alert.alert('Success', 'Profile updated successfully');
      setHasChanges(false);
    } catch (error: any) {
      Alert.alert('Update Error', error.message);
    }
  };

  const handleSignOut = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Sign Out', 
          style: 'destructive', 
          onPress: async () => {
            haptic.success();
            await signOut();
            router.replace('/onboarding');
          } 
        }
      ]
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <Stack.Screen options={{ 
        headerTitle: 'Profile',
        headerTransparent: true,
        headerLeft: () => (
          <TouchableOpacity 
            onPress={() => router.back()}
            style={[styles.backButton, { backgroundColor: colors.surface2 }]}
          >
            <Ionicons name="chevron-back" size={24} color={colors.text} />
          </TouchableOpacity>
        )
      }} />

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.avatarSection}>
          <Avatar size={120} />
          <Text style={[styles.emailText, { color: colors.textMuted }]}>
            {profile?.id ? 'Authenticated User' : 'Guest'}
          </Text>
        </View>

        <View style={styles.formSection}>
          <AuthInput
            label="Full Name"
            placeholder="Your Name"
            value={fullName}
            onChangeText={setFullName}
            icon="person-outline"
          />

          <NeoButton
            label="Save Changes"
            onPress={handleUpdate}
            loading={isLoading}
            disabled={!hasChanges}
            style={styles.saveButton}
            glowing={hasChanges}
          />
        </View>

        <View style={styles.dangerSection}>
          <Text style={[styles.sectionTitle, { color: colors.danger }]}>Danger Zone</Text>
          <TouchableOpacity 
            style={[styles.signOutButton, { backgroundColor: colors.surface2 }]} 
            onPress={handleSignOut}
          >
            <Ionicons name="log-out-outline" size={24} color={colors.danger} />
            <Text style={[styles.signOutText, { color: colors.danger }]}>Sign Out</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 24,
    paddingTop: 80,
    paddingBottom: 40,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  avatarSection: {
    alignItems: 'center',
    marginBottom: 40,
  },
  emailText: {
    fontSize: 14,
    marginTop: 12,
    fontWeight: '500',
  },
  formSection: {
    width: '100%',
  },
  saveButton: {
    marginTop: 12,
  },
  dangerSection: {
    marginTop: 60,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 16,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  signOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    gap: 12,
  },
  signOutText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
