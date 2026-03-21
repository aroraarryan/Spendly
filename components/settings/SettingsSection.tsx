import React from 'react';
import { View, Text } from 'react-native';
import { useThemeColors } from '../../hooks/useThemeColors';
import NeoCard from '../ui/NeoCard';

interface SettingsSectionProps {
    title: string;
    children: React.ReactNode;
}

const SettingsSection: React.FC<SettingsSectionProps> = ({ title, children }) => {
    const colors = useThemeColors();

    return (
        <View className="mb-6 px-4">
            <Text
                className="text-[11px] font-bold uppercase mb-2 ml-1"
                style={{ color: colors.textSecondary, letterSpacing: 1.2 }}
            >
                {title}
            </Text>
            <NeoCard padding={0}>
                <View className="overflow-hidden rounded-2xl">
                    {children}
                </View>
            </NeoCard>
        </View>
    );
};

export default SettingsSection;
