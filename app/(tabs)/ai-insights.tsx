import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    StyleSheet,
    KeyboardAvoidingView,
    Platform,
    Alert
} from 'react-native';
import { Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { useThemeColors } from '@/hooks/useThemeColors';
import { haptic } from '@/utils/haptics';
import NeoCard from '@/components/ui/NeoCard';
import NeoButton from '@/components/ui/NeoButton';
import NeoInput from '@/components/ui/NeoInput';
import NeoBadge from '@/components/ui/NeoBadge';

import DataSnapshotCard from '@/components/ai/DataSnapshotCard';
import InsightCard from '@/components/ai/InsightCard';
import LoadingInsights from '@/components/ai/LoadingInsights';
import ChatBubble from '@/components/ai/ChatBubble';
import TypingIndicator from '@/components/ai/TypingIndicator';
import SuggestionChips from '@/components/ai/SuggestionChips';
import { Skeleton } from '@/components/shared/Skeleton';
import ErrorBoundary from '@/components/shared/ErrorBoundary';
import EmptyState from '@/components/shared/EmptyState';

import { InsightReport, ChatMessage, ExpenseContext } from '@/types';
import { buildExpenseContext, generateMonthlyInsights, chatWithAdvisor, handleGeminiError } from '@/services/aiService';

export default function AIInsightsScreen() {
    const colors = useThemeColors();
    const insets = useSafeAreaInsets();
    const scrollViewRef = useRef<ScrollView>(null);

    // State
    const [isLoading, setIsLoading] = useState(true);
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const [context, setContext] = useState<ExpenseContext | null>(null);

    const [reportStatus, setReportStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [report, setReport] = useState<InsightReport | null>(null);
    const [reportError, setReportError] = useState<string | null>(null);
    const [generatedAt, setGeneratedAt] = useState<Date | null>(null);
    const [regenerateCooldown, setRegenerateCooldown] = useState(0);

    const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
    const [chatInput, setChatInput] = useState('');
    const [isChatLoading, setIsChatLoading] = useState(false);

    // Initial load
    useEffect(() => {
        loadSavedData();
        updateContext(selectedMonth, selectedYear);

        // Remove artificial delay for a faster initial load
        setIsLoading(false);

        const interval = setInterval(() => {
            setRegenerateCooldown((prev) => Math.max(0, prev - 1));
        }, 1000);

        return () => {
            clearInterval(interval);
        };
    }, []);

    const updateContext = (month: number, year: number) => {
        const newContext = buildExpenseContext(month, year);
        setContext(newContext);
    };

    const loadSavedData = async () => {
        const savedReportStr = await AsyncStorage.getItem('ai_last_report');
        if (savedReportStr) {
            try {
                const data = JSON.parse(savedReportStr);
                setReport(data.report);
                setGeneratedAt(new Date(data.generatedAt));
                setReportStatus('success');
            } catch (e) { }
        }

        const savedChatStr = await AsyncStorage.getItem('ai_chat_messages');
        if (savedChatStr) {
            try {
                const parsed = JSON.parse(savedChatStr);
                const messages = parsed.map((m: any) => ({ ...m, timestamp: new Date(m.timestamp) }));
                setChatMessages(messages);
            } catch (e) { }
        } else {
            setChatMessages([
                {
                    id: 'welcome',
                    content: 'Hi! 👋 I am Spendly AI, your personal finance advisor. I can see your spending data and help you understand your finances. Try asking:\n• Where am I spending the most?\n• How can I save money next month?\n• Is my food spending too high?',
                    isUser: false,
                    timestamp: new Date(),
                    role: 'welcome'
                }
            ]);
        }
    };

    const saveChatData = async (newMessages: ChatMessage[]) => {
        setChatMessages(newMessages);
        await AsyncStorage.setItem('ai_chat_messages', JSON.stringify(newMessages.slice(-50)));
    };

    const changeMonth = (offset: number) => {
        haptic.light();
        let m = selectedMonth + offset;
        let y = selectedYear;

        if (m < 1) {
            m = 12;
            y -= 1;
        } else if (m > 12) {
            m = 1;
            y += 1;
        }

        const now = new Date();
        const selectedDate = new Date(y, m - 1);
        const earliest = new Date(now.getFullYear(), now.getMonth() - 12);

        if (selectedDate > now) return;
        if (selectedDate < earliest) return;

        setSelectedMonth(m);
        setSelectedYear(y);
        updateContext(m, y);
        setReportStatus('idle'); // Clear report when switching
    };

    const isCurrentMonth = selectedMonth === new Date().getMonth() + 1 && selectedYear === new Date().getFullYear();

    const generateReport = async () => {
        if (!context) return;
        haptic.medium();
        setReportStatus('loading');
        try {
            const result = await generateMonthlyInsights(context);
            setReport(result);
            setReportStatus('success');
            const now = new Date();
            setGeneratedAt(now);
            setRegenerateCooldown(30);

            await AsyncStorage.setItem('ai_last_report', JSON.stringify({ report: result, generatedAt: now.toISOString() }));
            haptic.success();
        } catch (error) {
            haptic.error();
            setReportError(handleGeminiError(error));
            setReportStatus('error');
        }
    };

    const cancelGeneration = () => {
        haptic.light();
        setReportStatus('idle');
    };

    const sendChatMessage = async (text: string) => {
        if (!text.trim() || !context || isChatLoading) return;
        haptic.light();

        const userMsg: ChatMessage = {
            id: Date.now().toString(),
            content: text.trim(),
            isUser: true,
            timestamp: new Date()
        };

        const newHistory = [...chatMessages, userMsg];
        saveChatData(newHistory);
        setChatInput('');
        setIsChatLoading(true);
        setTimeout(() => scrollViewRef.current?.scrollToEnd({ animated: true }), 100);

        try {
            const responseText = await chatWithAdvisor(newHistory, text.trim(), context);
            const aiMsg: ChatMessage = {
                id: (Date.now() + 1).toString(),
                content: responseText,
                isUser: false,
                timestamp: new Date()
            };
            saveChatData([...newHistory, aiMsg]);
        } catch (error) {
            const errText = handleGeminiError(error);
            saveChatData([...newHistory, {
                id: (Date.now() + 1).toString(),
                content: `Error: ${errText}`,
                isUser: false,
                timestamp: new Date()
            }]);
        } finally {
            setIsChatLoading(false);
            setTimeout(() => scrollViewRef.current?.scrollToEnd({ animated: true }), 100);
        }
    };

    const clearChat = () => {
        haptic.medium();
        Alert.alert('Clear Chat', 'Are you sure you want to clear your conversation history?', [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Clear',
                style: 'destructive',
                onPress: () => {
                    saveChatData([{
                        id: 'welcome',
                        content: 'Hi! 👋 I am Spendly AI, your personal finance advisor. I can see your spending data and help you understand your finances. Try asking:\n• Where am I spending the most?\n• How can I save money next month?\n• Is my food spending too high?',
                        isUser: false,
                        timestamp: new Date(),
                        role: 'welcome'
                    }]);
                }
            }
        ]);
    };

    const renderLoadingState = () => (
        <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
        >
            <Skeleton width="100%" height={120} borderRadius={24} style={{ marginBottom: 24 }} />
            <Skeleton width="100%" height={240} borderRadius={24} style={{ marginBottom: 24 }} />
            <Skeleton width="100%" height={100} borderRadius={24} />
        </ScrollView>
    );

    return (
        <KeyboardAvoidingView
            style={{ flex: 1, backgroundColor: colors.background }}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
        >
            <Stack.Screen options={{ headerShown: false }} />

            {/* Header */}
            <View style={[styles.header, { paddingTop: insets.top + 16, backgroundColor: colors.background, borderBottomColor: colors.border }]}>
                <View>
                    <Text style={{ fontSize: 28, fontWeight: '800', color: colors.text }}>AI Insights</Text>
                    <Text style={{ fontSize: 13, fontWeight: '500', color: colors.textMuted, marginTop: 2, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                        {new Date(selectedYear, selectedMonth - 1).toLocaleString('default', { month: 'long' })} {selectedYear}
                    </Text>
                </View>

                <View style={{ flexDirection: 'row', gap: 10 }}>
                    <TouchableOpacity
                        onPress={() => changeMonth(-1)}
                        style={{
                            width: 42,
                            height: 42,
                            borderRadius: 21,
                            backgroundColor: colors.surface2,
                            alignItems: 'center',
                            justifyContent: 'center',
                            borderWidth: 1,
                            borderColor: colors.border
                        }}
                    >
                        <Ionicons name="chevron-back" size={22} color={colors.accent} />
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={() => changeMonth(1)}
                        disabled={isCurrentMonth}
                        style={{
                            width: 42,
                            height: 42,
                            borderRadius: 21,
                            backgroundColor: colors.surface2,
                            alignItems: 'center',
                            justifyContent: 'center',
                            borderWidth: 1,
                            borderColor: colors.border,
                            opacity: isCurrentMonth ? 0.3 : 1
                        }}
                    >
                        <Ionicons name="chevron-forward" size={22} color={colors.accent} />
                    </TouchableOpacity>
                </View>
            </View>

            {isLoading ? renderLoadingState() : (
                <ScrollView
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
                    ref={scrollViewRef}
                    keyboardShouldPersistTaps="handled"
                >
                    {/* Data Snapshot */}
                    {context && <DataSnapshotCard context={context} />}

                    {/* Analysis Report Section */}
                    <View style={styles.section}>
                        {reportStatus === 'idle' && (
                            <View style={{ marginTop: 20, alignItems: 'center' }}>
                                <EmptyState
                                    type="ai"
                                    title="Get Your Analysis"
                                    message="Gemini will analyze your spending patterns and give you personalized advice"
                                    onAction={generateReport}
                                    actionLabel="✨ Generate Insights"
                                />
                                {(context?.transactionCount ?? 0) < 5 && (
                                    <View style={{ marginTop: 8 }}>
                                        <NeoBadge
                                            label="AI works best with at least 5 expenses"
                                            variant="warning"
                                            icon="warning"
                                        />
                                    </View>
                                )}
                            </View>
                        )}

                        {reportStatus === 'loading' && (
                            <LoadingInsights onCancel={cancelGeneration} />
                        )}

                        {reportStatus === 'error' && (
                            <NeoCard padding={24} style={{ borderColor: colors.danger, marginBottom: 20 }}>
                                <View style={{ alignItems: 'center', marginBottom: 16 }}>
                                    <Text style={{ fontSize: 40, marginBottom: 12 }}>⚠️</Text>
                                    <Text style={{ fontSize: 18, fontWeight: '800' }}>Could not generate insights</Text>
                                </View>
                                <Text style={{ fontSize: 14, color: colors.textSecondary, textAlign: 'center', marginBottom: 24, fontWeight: '500' }}>
                                    {reportError}
                                </Text>
                                <NeoButton
                                    label="Try Again"
                                    onPress={generateReport}
                                    style={{ width: '100%' }}
                                />
                            </NeoCard>
                        )}

                        {reportStatus === 'success' && report && (
                            <View style={{ marginBottom: 20 }}>
                                <InsightCard
                                    title="Summary"
                                    emoji="📋"
                                    content={report.summary}
                                    backgroundColor="#FFD93D"
                                    accentColor="#FFC107"
                                />

                                {report.warningAreas && (
                                    <InsightCard
                                        title="Warning Areas"
                                        emoji="⚠️"
                                        content={report.warningAreas}
                                        backgroundColor="#FFE5E5"
                                        accentColor="#FFCDD2"
                                        isWarning
                                    />
                                )}

                                {report.actionableTips && (
                                    <InsightCard
                                        title="Actionable Tips"
                                        emoji="💡"
                                        content={report.actionableTips}
                                        backgroundColor="#E8F5E9"
                                        accentColor="#C8E6C9"
                                    />
                                )}

                                {report.savingsGoalAdvice && (
                                    <InsightCard
                                        title="Savings Goal"
                                        emoji="🎯"
                                        content={report.savingsGoalAdvice}
                                        backgroundColor="#F3E8FF"
                                        accentColor="#D1C4E9"
                                        isSavingsGoal
                                    />
                                )}

                                <View style={{ marginTop: 8 }}>
                                    <Text style={{ fontSize: 12, color: colors.textMuted, textAlign: 'center', marginBottom: 16, fontWeight: '500' }}>
                                        Generated on {generatedAt?.toLocaleString()}
                                    </Text>
                                    <NeoButton
                                        label={regenerateCooldown > 0 ? `🔄 Regenerate (${regenerateCooldown}s)` : "🔄 Regenerate Analysis"}
                                        onPress={regenerateCooldown === 0 ? generateReport : () => haptic.warning()}
                                        variant="secondary"
                                        size="sm"
                                        style={{ alignSelf: 'center', opacity: regenerateCooldown > 0 ? 0.5 : 1 }}
                                    />
                                </View>
                            </View>
                        )}
                    </View>

                    {/* AI Chat Interface */}
                    <View style={styles.section}>
                        <NeoCard padding={16} style={{ marginBottom: 16 }}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                    <View style={styles.chatAvatar}>
                                        <Text style={{ fontSize: 20 }}>🤖</Text>
                                    </View>
                                    <View style={{ marginLeft: 12 }}>
                                        <Text style={{ fontSize: 16, fontWeight: '800', color: colors.text }}>Spendly AI</Text>
                                        <Text style={{ fontSize: 12, fontWeight: '500', color: colors.textSecondary }}>Your personal finance advisor</Text>
                                    </View>
                                </View>
                                <TouchableOpacity
                                    onPress={clearChat}
                                    style={{
                                        flexDirection: 'row',
                                        alignItems: 'center',
                                        backgroundColor: colors.surface2,
                                        paddingHorizontal: 10,
                                        paddingVertical: 6,
                                        borderRadius: 8,
                                        borderWidth: 1,
                                        borderColor: colors.border
                                    }}
                                >
                                    <Ionicons name="trash-outline" size={14} color={colors.danger} style={{ marginRight: 4 }} />
                                    <Text style={{ fontSize: 12, fontWeight: '700', color: colors.danger }}>Clear</Text>
                                </TouchableOpacity>
                            </View>
                        </NeoCard>

                        <View style={styles.chatArea}>
                            {chatMessages.map(msg => (
                                <ChatBubble key={msg.id} message={msg} />
                            ))}
                            {isChatLoading && <TypingIndicator />}
                        </View>

                        <View style={{ marginTop: 20 }}>
                            <SuggestionChips onSelect={sendChatMessage} />
                        </View>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 8 }}>
                            <View style={{ flex: 1, justifyContent: 'center' }}>
                                <NeoInput
                                    placeholder="Ask about your finances..."
                                    value={chatInput}
                                    onChangeText={setChatInput}
                                    maxLength={200}
                                    containerStyle={{ marginBottom: 0 }}
                                    returnKeyType="send"
                                    onSubmitEditing={() => sendChatMessage(chatInput)}
                                />
                            </View>
                            <TouchableOpacity
                                onPress={() => sendChatMessage(chatInput)}
                                disabled={!chatInput.trim() || isChatLoading}
                                style={[
                                    styles.sendBtn,
                                    {
                                        backgroundColor: (!chatInput.trim() || isChatLoading) ? colors.surface2 : colors.accent,
                                    }
                                ]}
                            >
                                <Ionicons name="send" size={20} color={(!chatInput.trim() || isChatLoading) ? colors.textMuted : '#FFF'} />
                            </TouchableOpacity>
                        </View>
                    </View>
                </ScrollView>
            )}
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingBottom: 16,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(0,0,0,0.05)',
    },
    section: {
        marginBottom: 32,
    },
    chatAvatar: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: '#F3E8FF',
        alignItems: 'center',
        justifyContent: 'center',
    },
    chatArea: {
        minHeight: 200,
        paddingTop: 8,
    },
    sendBtn: {
        width: 48,
        height: 48,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
    }
});
