import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Animated, AppState } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const OfflineBanner = () => {
  const [isOffline, setIsOffline] = useState(false);
  const slideAnim = useState(new Animated.Value(-100))[0];

  useEffect(() => {
    let isMounted = true;

    const checkConnectivity = async () => {
      try {
        // Pure JS check: Try to fetch a small resource
        // We use a timeout to avoid hanging
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3000);

        const response = await fetch('https://www.google.com/generate_204', {
          method: 'HEAD',
          mode: 'no-cors',
          signal: controller.signal,
        });
        
        clearTimeout(timeoutId);
        
        if (isMounted) {
          const offline = !response.ok && response.status !== 0; // status 0 is often returned for no-cors success
          // Actually, if it throws or fails to fetch, it's offline.
          updateState(false);
        }
      } catch (error) {
        if (isMounted) {
          updateState(true);
        }
      }
    };

    const updateState = (offline: boolean) => {
      if (offline !== isOffline) {
        setIsOffline(offline);
        Animated.timing(slideAnim, {
          toValue: offline ? 0 : -100,
          duration: 300,
          useNativeDriver: true,
        }).start();
      }
    };

    // Initial check
    checkConnectivity();

    // Check on app state change
    const subscription = AppState.addEventListener('change', (nextAppState) => {
      if (nextAppState === 'active') {
        checkConnectivity();
      }
    });

    // Periodic check every 15 seconds
    const interval = setInterval(checkConnectivity, 15000);

    return () => {
      isMounted = false;
      subscription.remove();
      clearInterval(interval);
    };
  }, [isOffline, slideAnim]);

  if (!isOffline) return null;

  return (
    <Animated.View
      style={[
        styles.container,
        { transform: [{ translateY: slideAnim }] },
      ]}
    >
      <View style={styles.content}>
        <Ionicons name="cloud-offline" size={20} color="#FFFFFF" />
        <Text style={styles.text}>Connection lost. Some features may be limited.</Text>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 50,
    left: 16,
    right: 16,
    backgroundColor: '#EF4444',
    borderRadius: 12,
    zIndex: 9999,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 10,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    gap: 12,
  },
  text: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
  },
});

export default OfflineBanner;
