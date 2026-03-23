import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '@/store/authStore';

interface AvatarProps {
  size?: number;
  showEdit?: boolean;
}

export const Avatar: React.FC<AvatarProps> = ({ size = 80, showEdit = false }) => {
  const { profile, uploadAvatar, isLoading: storeLoading } = useAuthStore();

  const getInitials = () => {
    if (!profile?.full_name) return '?';
    const parts = profile.full_name.trim().split(/\s+/).filter(Boolean);
    if (parts.length === 0) return '?';
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  const hasAvatar = profile?.avatar_url && profile.avatar_url.trim().length > 0;

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      {hasAvatar ? (
        <Image
          source={{ uri: profile.avatar_url as string }}
          style={[styles.image, { borderRadius: size / 2 }]}
          contentFit="cover"
          transition={300}
          cachePolicy="memory-disk"
        />
      ) : (
        <View style={[styles.placeholder, { borderRadius: size / 2, backgroundColor: '#1E1E1E' }]}>
          <Text style={[styles.initials, { fontSize: size * 0.4 }]}>{getInitials()}</Text>
        </View>
      )}

      {showEdit && (
        <Pressable 
          style={styles.editButton} 
          onPress={uploadAvatar}
          disabled={storeLoading}
        >
          {storeLoading ? (
             <View style={styles.miniSpinner} />
          ) : (
            <Ionicons name="camera" size={16} color="#FFFFFF" />
          )}
        </Pressable>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  placeholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  initials: {
    color: '#00D1FF',
    fontWeight: '700',
  },
  editButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#00D1FF',
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#000000',
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  miniSpinner: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 2,
    borderColor: '#FFFFFF',
    borderTopColor: 'transparent',
  }
});
