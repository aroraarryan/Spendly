import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useThemeColors } from '../../hooks/useThemeColors';

interface SettingsRowProps {
    icon: string;
    iconBgColor: string;
    label: string;
    sublabel?: string;
    rightElement?: React.ReactNode;
    onPress?: () => void;
    showChevron?: boolean;
    disabled?: boolean;
    isLast?: boolean;
}

const SettingsRow: React.FC<SettingsRowProps> = ({
    icon,
    iconBgColor,
    label,
    sublabel,
    rightElement,
    onPress,
    showChevron = false,
    disabled = false,
    isLast = false,
}) => {
    const colors = useThemeColors();

    const Content = (
        <View
            className={`flex-row items-center py-3.5 px-4 ${disabled ? 'opacity-40' : ''}`}
            style={!isLast ? { borderBottomWidth: 1, borderBottomColor: colors.border + '33' } : {}}
        >
            <View
                className="w-8 h-8 rounded-full items-center justify-center mr-3"
                style={{ backgroundColor: iconBgColor }}
            >
                <Text style={{ fontSize: 16 }}>{icon}</Text>
            </View>

            <View className="flex-1">
                <Text
                    className="text-base font-medium"
                    style={{ color: label === 'Clear All Data' ? '#EF4444' : colors.text }}
                >
                    {label}
                </Text>
                {sublabel && (
                    <Text
                        className="text-xs"
                        style={{ color: colors.textSecondary }}
                    >
                        {sublabel}
                    </Text>
                )}
            </View>

            <View className="flex-row items-center">
                {rightElement}
                {showChevron && (
                    <Ionicons
                        name="chevron-forward"
                        size={18}
                        color={colors.textSecondary}
                        style={{ marginLeft: 8 }}
                    />
                )}
            </View>
        </View>
    );

    if (onPress && !disabled) {
        return (
            <TouchableOpacity onPress={onPress}>
                {Content}
            </TouchableOpacity>
        );
    }

    return Content;
};

export default SettingsRow;
