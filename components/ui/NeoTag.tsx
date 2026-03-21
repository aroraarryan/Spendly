import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useThemeColors } from '../../hooks/useThemeColors';

interface NeoTagProps {
    emoji?: string;
    label: string;
    onPress?: () => void;
    selected?: boolean;
    color?: string;
    style?: any;
}

const NeoTag: React.FC<NeoTagProps> = ({
    emoji,
    label,
    onPress,
    selected = false,
    style,
}) => {
    const colors = useThemeColors();

    return (
        <TouchableOpacity
            onPress={onPress}
            activeOpacity={0.8}
        >
            <View
                style={[
                    styles.tag,
                    {
                        backgroundColor: selected ? `${colors.accent}26` : colors.surface2,
                        borderColor: selected ? colors.accent : 'transparent',
                        borderWidth: 1,
                    },
                    style
                ]}
            >
                {emoji && <Text style={{ fontSize: 14, marginRight: 6 }}>{emoji}</Text>}
                <Text
                    style={{
                        fontSize: 13,
                        fontWeight: selected ? '600' : '500',
                        color: selected ? colors.accent : colors.textSecondary,
                    }}
                >
                    {label}
                </Text>
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    tag: {
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 999,
        flexDirection: 'row',
        alignItems: 'center',
        marginRight: 10,
        marginBottom: 10,
    },
});

export default NeoTag;
