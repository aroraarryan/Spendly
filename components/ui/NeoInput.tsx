import React, { useState } from 'react';
import { View, Text, TextInput, TextInputProps, StyleSheet } from 'react-native';
import Animated, { useAnimatedStyle, withTiming } from 'react-native-reanimated';
import { useThemeColors } from '../../hooks/useThemeColors';
import { Theme } from '../../constants/theme';

interface NeoInputProps extends TextInputProps {
    label?: string;
    error?: boolean;
    leftElement?: React.ReactNode;
    fullBorder?: boolean;
    containerStyle?: any;
}

const NeoInput: React.FC<NeoInputProps> = ({
    label,
    error,
    leftElement,
    style,
    containerStyle,
    ...props
}) => {
    const [isFocused, setIsFocused] = useState(false);
    const colors = useThemeColors();

    const animatedStyle = useAnimatedStyle(() => {
        return {
            borderColor: withTiming(error ? colors.danger : (isFocused ? colors.accent : 'transparent'), { duration: 200 }),
            backgroundColor: withTiming(isFocused ? colors.white : colors.surface2, { duration: 200 }),
            shadowOpacity: withTiming(isFocused ? 0.08 : 0, { duration: 200 }),
        };
    });

    return (
        <View style={[{ marginBottom: 20 }, containerStyle]}>
            {label && (
                <Text style={[styles.label, { color: colors.textSecondary }]}>
                    {label}
                </Text>
            )}
            <Animated.View style={[styles.inputContainer, animatedStyle]}>
                {leftElement && (
                    <View style={{ paddingLeft: 12 }}>
                        {leftElement}
                    </View>
                )}
                <TextInput
                    {...props}
                    onFocus={(e) => {
                        setIsFocused(true);
                        props.onFocus?.(e);
                    }}
                    onBlur={(e) => {
                        setIsFocused(false);
                        props.onBlur?.(e);
                    }}
                    placeholderTextColor={colors.textMuted}
                    style={[
                        styles.input,
                        {
                            color: colors.text,
                        },
                        style,
                    ]}
                />
            </Animated.View>
        </View>
    );
};

const styles = StyleSheet.create({
    label: {
        fontSize: 12,
        fontWeight: '500',
        marginBottom: 6,
    },
    inputContainer: {
        borderWidth: 1,
        borderRadius: 12,
        flexDirection: 'row',
        alignItems: 'center',
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 4 },
        shadowRadius: 16,
        elevation: 4,
    },
    input: {
        flex: 1,
        padding: 14,
        fontSize: 15,
        fontWeight: '400',
    },
});

export default NeoInput;
