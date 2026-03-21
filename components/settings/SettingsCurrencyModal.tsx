import React, { useState } from 'react';
import { View, Text, Modal, FlatList, TouchableOpacity } from 'react-native';
import { useThemeColors } from '../../hooks/useThemeColors';
import NeoInput from '../ui/NeoInput';
import NeoButton from '../ui/NeoButton';
import { useSettingsStore } from '../../store/settingsStore';
import { Ionicons } from '@expo/vector-icons';

interface SettingsCurrencyModalProps {
    visible: boolean;
    onClose: () => void;
}

const CURRENCIES = [
    { code: 'INR', symbol: '₹', name: 'Indian Rupee' },
    { code: 'USD', symbol: '$', name: 'US Dollar' },
    { code: 'EUR', symbol: '€', name: 'Euro' },
    { code: 'GBP', symbol: '£', name: 'British Pound' },
    { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
    { code: 'AUD', symbol: 'A$', name: 'Australian Dollar' },
    { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar' },
    { code: 'CHF', symbol: 'Fr', name: 'Swiss Franc' },
    { code: 'CNY', symbol: '¥', name: 'Chinese Yuan' },
    { code: 'SGD', symbol: 'S$', name: 'Singapore Dollar' },
    { code: 'AED', symbol: 'د.إ', name: 'UAE Dirham' },
    { code: 'SAR', symbol: '﷼', name: 'Saudi Riyal' },
    { code: 'MYR', symbol: 'RM', name: 'Malaysian Ringgit' },
    { code: 'THB', symbol: '฿', name: 'Thai Baht' },
    { code: 'KRW', symbol: '₩', name: 'South Korean Won' },
    { code: 'BRL', symbol: 'R$', name: 'Brazilian Real' },
    { code: 'MXN', symbol: 'Mex$', name: 'Mexican Peso' },
    { code: 'ZAR', symbol: 'R', name: 'South African Rand' },
    { code: 'NGN', symbol: '₦', name: 'Nigerian Naira' },
    { code: 'PKR', symbol: '₨', name: 'Pakistani Rupee' },
];

const SettingsCurrencyModal: React.FC<SettingsCurrencyModalProps> = ({ visible, onClose }) => {
    const colors = useThemeColors();
    const { currency, setCurrency } = useSettingsStore();
    const [search, setSearch] = useState('');

    const filteredCurrencies = CURRENCIES.filter(c =>
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.code.toLowerCase().includes(search.toLowerCase())
    );

    const handleSelect = async (code: string, symbol: string) => {
        await setCurrency(code, symbol);
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
                    className="h-[80%] bg-white rounded-t-[32px] p-6 pb-10"
                    style={{ backgroundColor: colors.background }}
                >
                    <View className="w-12 h-1.5 bg-gray-200 rounded-full self-center mb-6" />

                    <Text className="text-xl font-bold mb-6 text-center" style={{ color: colors.text }}>
                        Select Currency
                    </Text>

                    <NeoInput
                        placeholder="Search currency..."
                        value={search}
                        onChangeText={setSearch}
                        leftElement={
                            <View className="pl-4">
                                <Ionicons name="search" size={20} color={colors.textSecondary} />
                            </View>
                        }
                    />

                    <FlatList
                        data={filteredCurrencies}
                        keyExtractor={(item) => item.code}
                        className="mt-4"
                        showsVerticalScrollIndicator={false}
                        renderItem={({ item }) => {
                            const isSelected = item.code === currency;
                            return (
                                <TouchableOpacity
                                    onPress={() => handleSelect(item.code, item.symbol)}
                                    className="flex-row items-center py-4 border-b"
                                    style={{ borderBottomColor: colors.border + '33' }}
                                >
                                    <View className="flex-1">
                                        <Text
                                            className={`text-base ${isSelected ? 'font-bold' : 'font-medium'}`}
                                            style={{ color: isSelected ? colors.accent : colors.text }}
                                        >
                                            {item.name}
                                        </Text>
                                    </View>
                                    <View className="flex-row items-center">
                                        <Text
                                            className="mr-3 text-sm font-bold"
                                            style={{ color: colors.textSecondary }}
                                        >
                                            {item.code} {item.symbol}
                                        </Text>
                                        {isSelected && (
                                            <Ionicons name="checkmark-circle" size={20} color={colors.accent} />
                                        )}
                                    </View>
                                </TouchableOpacity>
                            );
                        }}
                    />

                    <View className="mt-6">
                        <NeoButton
                            label="Cancel"
                            variant="ghost"
                            onPress={onClose}
                        />
                    </View>
                </View>
            </View>
        </Modal>
    );
};

export default SettingsCurrencyModal;
