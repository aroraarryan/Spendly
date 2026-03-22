import { NativeModules, Platform } from 'react-native';

/**
 * Safely check if a native module exists before using it.
 * This prevents crashes when new modules aren't yet in the native build.
 */
const hasNativeModule = (name: string) => {
  try {
    // For many Expo modules, they are under NativeModules.NativeUnimoduleProxy
    // or directly in NativeModules
    return !!(NativeModules[name] || 
             (NativeModules.NativeUnimoduleProxy && 
              NativeModules.NativeUnimoduleProxy.viewManagersNames && 
              NativeModules.NativeUnimoduleProxy.viewManagersNames.includes(name)));
  } catch (e) {
    return false;
  }
};

export const pickImage = async (options: any) => {
  if (hasNativeModule('ExponentImagePicker')) {
    // Static require for Metro bundling compatibility
    const ImagePicker = require('expo-image-picker');
    return await ImagePicker.launchImageLibraryAsync(options);
  }
  throw new Error('Image selection is not available. Please rebuild your app with npx expo run:ios');
};

export const manipulateImage = async (uri: string, actions: any[], saveOptions: any) => {
  if (hasNativeModule('ExponentImageManipulator')) {
    // Static require for Metro bundling compatibility
    const ImageManipulator = require('expo-image-manipulator');
    return await ImageManipulator.manipulateAsync(uri, actions, saveOptions);
  }
  // If no native manipulator, return original URI (basic fallback)
  console.warn('Image manipulation not available. Using original image.');
  return { uri };
};
