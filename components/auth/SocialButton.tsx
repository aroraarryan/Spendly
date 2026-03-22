import React from 'react';
import { Pressable, Text, StyleSheet, View, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useThemeColors } from '../../hooks/useThemeColors';
import NeoButton from '../ui/NeoButton';

interface SocialButtonProps {
  provider: 'google' | 'apple';
  onPress: () => void;
  isLoading?: boolean;
}

export const SocialButton: React.FC<SocialButtonProps> = ({ provider, onPress, isLoading }) => {
  const isGoogle = provider === 'google';
  
  return (
    <NeoButton
      variant="ghost"
      onPress={onPress}
      disabled={isLoading}
      style={styles.button}
      backgroundColor="rgba(255, 255, 255, 0.05)"
    >
      <View style={styles.content}>
        <Ionicons 
          name={isGoogle ? "logo-google" : "logo-apple"} 
          size={20} 
          color={isGoogle ? "#EA4335" : "#FFFFFF"} 
          style={styles.icon}
        />
        <Text style={[styles.text, { color: '#FFFFFF' }]}>
          Continue with {isGoogle ? 'Google' : 'Apple'}
        </Text>
      </View>
    </NeoButton>
  );
};

const styles = StyleSheet.create({
  button: {
    width: '100%',
    marginVertical: 6,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    marginRight: 10,
  },
  text: {
    fontSize: 16,
    fontWeight: '600',
  },
});
