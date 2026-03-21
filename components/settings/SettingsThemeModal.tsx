import React from 'react';
import { View, Text, Modal, TouchableOpacity } from 'react-native';
import { useThemeColors } from '../../hooks/useThemeColors';
import NeoButton from '../ui/NeoButton';
import { useSettingsStore } from '../../store/settingsStore';
import { Ionicons } from '@expo/vector-icons';
import NeoCard from '../ui/NeoCard';

interface SettingsThemeModalProps {
    visible: boolean;
    onClose: () => void;
}

const THEMES: { id: 'light' | 'dark' | 'system', label: string, icon: any }[] = [
    { id: 'light', label: 'Light', icon: 'sunny-outline' },
    { id: 'dark', label: 'Dark', icon: 'moon-outline' },
    { id: 'system', label: 'System', icon: 'phone-portrait-outline' },
];

const SettingsThemeModal: React.FC<SettingsThemeModalProps> = ({ visible, onClose }) => {
    const colors = useThemeColors();
    const { themePreference, setThemePreference } = useSettingsStore();

    const handleSelect = async (id: 'light' | 'dark' | 'system') => {
        await setThemePreference(id);
        onClose();
    };

    return (
        <Modal
            visible={visible}
            transparent
            animationType="slide"
            onRequestClose={onClose}
        >
            <View className="flex-1 justify-end bg-black/40">
                <View
                    className="bg-white rounded-t-[32px] p-6 pb-10"
                    style={{ backgroundColor: colors.background }}
                >
                    <View className="w-12 h-1.5 bg-gray-200 rounded-full self-center mb-6" />

                    <Text className="text-xl font-bold mb-6 text-center" style={{ color: colors.text }}>
                        App Theme
                    </Text>

                    <View className="flex-row gap-4 mb-8">
                        {THEMES.map((theme) => {
                            const isSelected = theme.id === themePreference;
                            return (
                                <TouchableOpacity
                                    key={theme.id}
                                    onPress={() => handleSelect(theme.id)}
                                    className="flex-1"
                                >
                                    <NeoCard
                                        padding={16}
                                        borderColor={isSelected ? colors.accent : 'transparent'}
                                    >
                                        <View className="items-center justify-center">
                                            <Ionicons
                                                name={theme.icon}
                                                size={32}
                                                color={isSelected ? colors.accent : colors.textSecondary}
                                            />
                                            <Text
                                                className="mt-2 font-bold text-sm"
                                                style={{ color: isSelected ? colors.accent : colors.text }}
                                            >
                                                {theme.label}
                                            </Text>
                                            {isSelected && (
                                                <View className="absolute -top-2 -right-2 bg-white rounded-full">
                                                    <Ionicons name="checkmark-circle" size={20} color={colors.accent} />
                                                </View>
                                            )}
                                        </View>
                                    </NeoCard>
                                </TouchableOpacity>
                            );
                        })}
                    </View>

                    <NeoButton
                        label="Close"
                        variant="ghost"
                        onPress={onClose}
                    />
                </View>
            </View>
        </Modal>
    );
};

export default SettingsThemeModal;
