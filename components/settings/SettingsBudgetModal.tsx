import React, { useState } from 'react';
import { View, Text, Modal, KeyboardAvoidingView, Platform, TouchableWithoutFeedback, Keyboard } from 'react-native';
import { useThemeColors } from '../../hooks/useThemeColors';
import NeoButton from '../ui/NeoButton';
import NeoInput from '../ui/NeoInput';
import { useSettingsStore } from '../../store/settingsStore';
import * as Haptics from 'expo-haptics';

interface SettingsBudgetModalProps {
    visible: boolean;
    onClose: () => void;
}

const SettingsBudgetModal: React.FC<SettingsBudgetModalProps> = ({ visible, onClose }) => {
    const colors = useThemeColors();
    const { monthlyBudget, setMonthlyBudget, currencySymbol } = useSettingsStore();
    const [amount, setAmount] = useState(monthlyBudget.toString());

    const handleSave = async () => {
        const numAmount = parseFloat(amount);
        if (!isNaN(numAmount)) {
            await setMonthlyBudget(numAmount);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            onClose();
        }
    };

    return (
        <Modal
            visible={visible}
            transparent
            animationType="slide"
            onRequestClose={onClose}
        >
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <View className="flex-1 justify-end bg-black/40">
                    <KeyboardAvoidingView
                        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    >
                        <View
                            className="bg-white rounded-t-[32px] p-6 pb-10"
                            style={{ backgroundColor: colors.background }}
                        >
                            <View className="w-12 h-1.5 bg-gray-200 rounded-full self-center mb-6" />

                            <Text className="text-xl font-bold mb-6 text-center" style={{ color: colors.text }}>
                                Set Monthly Budget
                            </Text>

                            <NeoInput
                                label="Budget Amount"
                                placeholder="0.00"
                                value={amount}
                                onChangeText={setAmount}
                                keyboardType="numeric"
                                leftElement={
                                    <View className="pl-4">
                                        <Text className="text-lg font-bold" style={{ color: colors.accent }}>
                                            {currencySymbol}
                                        </Text>
                                    </View>
                                }
                            />

                            <View className="flex-row gap-4 mt-8">
                                <View className="flex-1">
                                    <NeoButton
                                        label="Cancel"
                                        variant="ghost"
                                        onPress={onClose}
                                    />
                                </View>
                                <View className="flex-1">
                                    <NeoButton
                                        label="Save Budget"
                                        onPress={handleSave}
                                    />
                                </View>
                            </View>
                        </View>
                    </KeyboardAvoidingView>
                </View>
            </TouchableWithoutFeedback>
        </Modal>
    );
};

export default SettingsBudgetModal;
