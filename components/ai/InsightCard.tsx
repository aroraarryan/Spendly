import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import NeoCard from '../ui/NeoCard';
import { useThemeColors } from '../../hooks/useThemeColors';

interface InsightCardProps {
    title: string;
    emoji?: string;
    headerIcon?: string;
    content: string;
    backgroundColor: string;
    accentColor: string;
    isSavingsGoal?: boolean;
    isWarning?: boolean;
}

export default function InsightCard({ title, emoji, content, backgroundColor, accentColor, isSavingsGoal, isWarning }: InsightCardProps) {
    const colors = useThemeColors();

    const parseContent = () => {
        const textColor = '#1A1A2E'; // Force dark text for bright cards
        // If it looks like a numbered list (1. 2. 3.)
        if (content.match(/^\d+\./m)) {
            const lines = content.split('\n').filter(l => l.trim().length > 0);
            return (
                <View>
                    {lines.map((line, idx) => {
                        const cleanLine = line.replace(/^\d+\.\s*/, '').replace(/\*\*/g, '');
                        if (!cleanLine) return null;
                        return (
                            <View key={idx} style={{ flexDirection: 'row', marginBottom: 8, alignItems: 'flex-start' }}>
                                <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: textColor, marginTop: 8, marginRight: 10 }} />
                                <Text style={{ flex: 1, fontSize: 15, lineHeight: 22, color: textColor, fontWeight: '500' }}>
                                    {cleanLine}
                                </Text>
                            </View>
                        );
                    })}
                </View>
            );
        }

        // It's a paragraph
        // Handle bolding amounts if savings goal or warning
        let cleanText = content.replace(/\*\*/g, '');
        if (isSavingsGoal) {
            // Regex to wrap currency amounts in large bold text
            const parts = cleanText.split(/(\$[\d,]+[.\d]{0,2}|₹[\d,]+[.\d]{0,2}|€[\d,]+[.\d]{0,2}|£[\d,]+[.\d]{0,2})/g);
            return (
                <Text style={{ fontSize: 15, lineHeight: 22, color: textColor, fontWeight: '500' }}>
                    {parts.map((part, i) => {
                        if (part.match(/(\$[\d,]+|₹[\d,]+|€[\d,]+|£[\d,]+)/)) {
                            return <Text key={i} style={{ fontSize: 18, fontWeight: '800', color: accentColor }}>{part}</Text>;
                        }
                        return part;
                    })}
                </Text>
            );
        }

        if (isWarning) {
            return (
                <Text style={{ fontSize: 15, lineHeight: 22, color: textColor, fontWeight: '600' }}>
                    {cleanText}
                </Text>
            );
        }

        return <Text style={{ fontSize: 15, lineHeight: 22, color: textColor, fontWeight: '500' }}>{cleanText}</Text>;
    };

    return (
        <NeoCard padding={20} backgroundColor={backgroundColor} style={{ marginBottom: 16 }}>
            <View style={{ alignSelf: 'flex-start', backgroundColor: accentColor, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12, marginBottom: 12, flexDirection: 'row', alignItems: 'center' }}>
                {emoji && <Text style={{ marginRight: 6 }}>{emoji}</Text>}
                <Text style={{ fontWeight: '800', color: '#1A1A2E', fontSize: 13 }}>{title}</Text>
            </View>
            {parseContent()}
        </NeoCard>
    );
}
