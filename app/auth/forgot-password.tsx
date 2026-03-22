import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { AuthInput } from '@/components/auth/AuthInput';
import NeoButton from '@/components/ui/NeoButton';
import { supabase } from '@/services/supabase';

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);

  const handleReset = async () => {
    if (!email) return;

    try {
      setIsLoading(true);
      const AuthSession = require('expo-auth-session');
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: AuthSession.makeRedirectUri({ path: 'auth/callback' }),
      });

      if (error) throw error;
      
      setIsSent(true);
      Alert.alert(
        'Email Sent',
        'Check your inbox for the password reset link.',
        [{ text: 'OK', onPress: () => router.push('/auth/signin') }]
      );
    } catch (error: any) {
      Alert.alert('Reset Error', error.message);
    } finally {
      setIsLoading(false);
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
            <Text style={styles.title}>Reset Password</Text>
            <Text style={styles.subtitle}>Enter your email to receive a password recovery link.</Text>
          </View>

          {!isSent ? (
            <View style={styles.form}>
              <AuthInput
                label="Email Address"
                placeholder="john@example.com"
                value={email}
                onChangeText={setEmail}
                icon="mail-outline"
                keyboardType="email-address"
                autoCapitalize="none"
              />

              <NeoButton
                label="Send Reset Link"
                onPress={handleReset}
                loading={isLoading}
                style={styles.button}
                glowing
              />
            </View>
          ) : (
            <View style={styles.successContainer}>
              <View style={styles.successIcon}>
                <Ionicons name="checkmark-circle" size={80} color="#00D1FF" />
              </View>
              <Text style={styles.successText}>
                We've sent a password reset link to {email}.
              </Text>
              <NeoButton
                label="Back to Sign In"
                onPress={() => router.push('/auth/signin')}
                style={styles.button}
              />
            </View>
          )}
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
  button: {
    marginTop: 20,
  },
  successContainer: {
    alignItems: 'center',
    marginTop: 20,
  },
  successIcon: {
    marginBottom: 24,
    shadowColor: '#00D1FF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
  },
  successText: {
    color: '#CCCCCC',
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
});
