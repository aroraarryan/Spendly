import { Theme } from '../constants/theme';
import { useAppTheme } from './useAppTheme';

export function useThemeColors() {
    const theme = useAppTheme();
    const isDark = theme === 'dark';

    return {
        background: isDark ? Theme.colors.dark.background : Theme.colors.background,
        surface: isDark ? Theme.colors.dark.surface : Theme.colors.surface,
        surface2: isDark ? Theme.colors.dark.surface2 : Theme.colors.surface2,
        border: isDark ? Theme.colors.dark.border : Theme.colors.border,
        text: isDark ? Theme.colors.dark.text : Theme.colors.text,
        textSecondary: isDark ? Theme.colors.dark.textSecondary : Theme.colors.textSecondary,
        textMuted: isDark ? Theme.colors.dark.textMuted : Theme.colors.textMuted,
        accent: Theme.colors.accent,
        accentLight: Theme.colors.accentLight,
        accentDark: Theme.colors.accentDark,
        success: Theme.colors.success,
        successLight: Theme.colors.successLight,
        danger: Theme.colors.danger,
        dangerLight: Theme.colors.dangerLight,
        warning: Theme.colors.warning,
        warningLight: Theme.colors.warningLight,
        white: Theme.colors.white,
        black: Theme.colors.black,
        isDark,
    };
}
