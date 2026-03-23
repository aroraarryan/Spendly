import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { AuthInput } from '@/components/auth/AuthInput';
import NeoButton from '@/components/ui/NeoButton';
import { SocialButton } from '@/components/auth/SocialButton';
import { supabase } from '@/services/supabase';
import { useAuthStore } from '@/store/authStore';

export default function SigninScreen() {
  const router = useRouter();
  const { isLoading, setSession, signInWithGoogle, signInWithApple } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!email) newErrors.email = 'Email is required';
    if (!password) newErrors.password = 'Password is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSignin = async () => {
    if (!validate()) return;

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      
      if (data.session) {
        await setSession(data.session);
        router.replace('/(tabs)');
      }
    } catch (error: any) {
      Alert.alert('Sign In Error', error.message);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      await signInWithGoogle();
      // On success, the _layout.tsx useEffect will handle redirection
    } catch (error: any) {
      Alert.alert('Google Login Error', error.message);
    }
  };

  const handleAppleLogin = async () => {
    try {
      await signInWithApple();
    } catch (error: any) {
      Alert.alert('Apple Login Error', error.message);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ 
        headerTitle: '',
        headerTransparent: true,
        headerLeft: () => (
          <Ionicons 
            name="chevron-back" 
            size={28} 
            color="#FFFFFF" 
            onPress={() => router.back()} 
            style={{ marginLeft: 8 }}
          />
        )
      }} />
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.header}>
            <Text style={styles.title}>Welcome Back</Text>
            <Text style={styles.subtitle}>Good to see you again. Let's manage those finances.</Text>
          </View>

          <View style={styles.form}>
            <AuthInput
              label="Email Address"
              placeholder="john@example.com"
              value={email}
              onChangeText={setEmail}
              icon="mail-outline"
              keyboardType="email-address"
              autoCapitalize="none"
              error={errors.email}
            />
            <AuthInput
              label="Password"
              placeholder="••••••••"
              value={password}
              onChangeText={setPassword}
              icon="lock-closed-outline"
              secureTextEntry
              error={errors.password}
            />

            <View style={styles.forgotPassContainer}>
              <Text 
                style={styles.forgotPassLink} 
                onPress={() => router.push('/auth/forgot-password')}
              >
                Forgot Password?
              </Text>
            </View>

            <NeoButton
              label="Sign In"
              onPress={handleSignin}
              loading={isLoading}
              style={styles.button}
              glowing
            />

            <View style={styles.separatorContainer}>
              <View style={styles.separator} />
              <Text style={styles.separatorText}>OR</Text>
              <View style={styles.separator} />
            </View>

            <View style={styles.socialContainer}>
              <SocialButton 
                provider="google" 
                onPress={handleGoogleLogin} 
                isLoading={isLoading} 
              />
              {Platform.OS === 'ios' && (
                <SocialButton 
                  provider="apple" 
                  onPress={handleAppleLogin} 
                  isLoading={isLoading} 
                />
              )}
            </View>
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Don't have an account? </Text>
            <Text 
              style={styles.footerLink} 
              onPress={() => router.push('/auth/signup')}
            >
              Sign Up
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  content: {
    paddingHorizontal: 24,
    paddingTop: 100,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 16,
    color: '#888888',
    marginTop: 8,
  },
  form: {
    width: '100%',
  },
  forgotPassContainer: {
    alignItems: 'flex-end',
    marginBottom: 20,
  },
  forgotPassLink: {
    color: '#00D1FF',
    fontSize: 14,
    fontWeight: '600',
  },
  button: {
    marginTop: 10,
  },
  separatorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 30,
  },
  separator: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  separatorText: {
    color: '#888888',
    paddingHorizontal: 15,
    fontSize: 12,
    fontWeight: '600',
  },
  socialContainer: {
    width: '100%',
    gap: 8,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 40,
  },
  footerText: {
    color: '#888888',
    fontSize: 14,
  },
  footerLink: {
    color: '#00D1FF',
    fontSize: 14,
    fontWeight: '700',
  },
});
