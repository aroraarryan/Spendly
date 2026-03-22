import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useAuthStore } from '@/store/authStore';
import { Avatar } from './Avatar';
import { useRouter } from 'expo-router';

export const GreetingHeader: React.FC = () => {
  const { profile } = useAuthStore();
  const router = useRouter();

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  const firstName = profile?.full_name?.split(' ')[0] || 'there';

  return (
    <View style={styles.container}>
      <View style={styles.textContainer}>
        <Text style={styles.greeting}>{getGreeting()},</Text>
        <Text style={styles.name}>{firstName}</Text>
      </View>
      <Pressable onPress={() => router.push('/profile')}>
        <Avatar size={44} />
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  textContainer: {
    flex: 1,
  },
  greeting: {
    color: '#888888',
    fontSize: 14,
    fontWeight: '500',
  },
  name: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '700',
    marginTop: 2,
  },
});
