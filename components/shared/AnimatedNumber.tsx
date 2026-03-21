import { StyleSheet, Text, TextStyle, StyleProp } from 'react-native';

interface AnimatedNumberProps {
    value: number;
    style?: StyleProp<TextStyle>;
    currencySymbol?: string;
    duration?: number;
    prefix?: string;
}

export const AnimatedNumber = ({
    value,
    style,
    currencySymbol = '',
    prefix = ''
}: AnimatedNumberProps) => {
    return (
        <Text style={[styles.text, style]}>
            {(currencySymbol || prefix) + value.toLocaleString(undefined, {
                minimumFractionDigits: 0,
                maximumFractionDigits: 2,
            })}
        </Text>
    );
};

const styles = StyleSheet.create({
    text: {
        color: 'black',
        padding: 0,
        margin: 0,
    },
});
