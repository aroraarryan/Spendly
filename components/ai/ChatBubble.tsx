import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { ChatMessage } from '../../types';
import { useThemeColors } from '../../hooks/useThemeColors';

export default function ChatBubble({ message }: { message: ChatMessage }) {
    const colors = useThemeColors();
    const isUser = message.isUser;

    const formattedTime = new Date(message.timestamp).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }).replace(' ', '');

    return (
        <View style={[styles.container, isUser ? styles.containerUser : styles.containerAI]}>
            <View style={[
                styles.bubble,
                {
                    backgroundColor: isUser ? (colors.isDark ? colors.accent : colors.accentLight) : colors.surface,
                    borderColor: colors.border,
                    borderWidth: 1
                },
            ]}>
                <Text style={[styles.text, { color: isUser ? (colors.isDark ? '#FFF' : colors.accentDark) : colors.text }]}>
                    {message.content}
                </Text>
            </View>
            <Text style={[styles.timestamp, { textAlign: isUser ? 'right' : 'left', color: colors.textMuted }]}>
                {formattedTime}
            </Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginBottom: 16,
        maxWidth: '85%',
    },
    containerUser: {
        alignSelf: 'flex-end',
    },
    containerAI: {
        alignSelf: 'flex-start',
    },
    bubble: {
        padding: 16,
        borderRadius: 20,
        backgroundColor: '#FFF',
    },
    shadowLeft: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    shadowRight: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    text: {
        fontSize: 15,
        fontWeight: '500',
        lineHeight: 22,
    },
    timestamp: {
        fontSize: 10,
        fontWeight: '600',
        marginTop: 6,
        marginHorizontal: 4,
    }
});
