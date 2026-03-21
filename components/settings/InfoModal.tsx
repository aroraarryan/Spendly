import React from 'react';
import { View, Text, Modal, ScrollView } from 'react-native';
import { useThemeColors } from '../../hooks/useThemeColors';
import NeoButton from '../ui/NeoButton';

interface InfoModalProps {
    visible: boolean;
    onClose: () => void;
    title: string;
    content: string;
}

const InfoModal: React.FC<InfoModalProps> = ({ visible, onClose, title, content }) => {
    const colors = useThemeColors();

    return (
        <Modal
            visible={visible}
            transparent
            animationType="slide"
            onRequestClose={onClose}
        >
            <View className="flex-1 justify-end bg-black/40">
                <View
                    className="h-[60%] bg-white rounded-t-[32px] p-6 pb-10"
                    style={{ backgroundColor: colors.background }}
                >
                    <View className="w-12 h-1.5 bg-gray-200 rounded-full self-center mb-6" />

                    <Text className="text-xl font-bold mb-6 text-center" style={{ color: colors.text }}>
                        {title}
                    </Text>

                    <ScrollView showsVerticalScrollIndicator={false} className="flex-1 mb-6">
                        <Text
                            className="text-base leading-6"
                            style={{ color: colors.textSecondary }}
                        >
                            {content}
                        </Text>
                    </ScrollView>

                    <NeoButton
                        label="Close"
                        variant="primary"
                        onPress={onClose}
                    />
                </View>
            </View>
        </Modal>
    );
};

export default InfoModal;
