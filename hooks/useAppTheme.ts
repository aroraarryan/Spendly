import { useColorScheme } from 'react-native';
import { useSettingsStore } from '../store/settingsStore';

export function useAppTheme() {
    const systemColorScheme = useColorScheme();
    const { themePreference } = useSettingsStore();

    if (themePreference === 'system') {
        return systemColorScheme || 'light';
    }

    return themePreference;
}
