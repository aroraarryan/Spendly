import React, { useState } from 'react';
import { View, Text, StyleSheet, Dimensions, TextInput, ScrollView, TouchableOpacity } from 'react-native';
import { useThemeColors } from '../../hooks/useThemeColors';
import { useSettingsStore } from '../../store/settingsStore';
import SettingsCurrencyModal from '../settings/SettingsCurrencyModal';

const { width } = Dimensions.get('window');

const COMMON_CURRENCIES = [
    { code: 'INR', symbol: '₹' },
    { code: 'USD', symbol: '$' },
    { code: 'EUR', symbol: '€' },
    { code: 'GBP', symbol: '£' },
    { code: 'AED', symbol: 'د.إ' },
    { code: 'SGD', symbol: 'S$' },
];

export default function OnboardingScreen2() {
    const colors = useThemeColors();
    const { monthlyBudget, setMonthlyBudget, currency, currencySymbol, setCurrency } = useSettingsStore();
    const [isCurrencyModalVisible, setIsCurrencyModalVisible] = useState(false);

    const handleBudgetChange = (text: string) => {
        const val = parseFloat(text.replace(/[^0-9.]/g, '')) || 0;
        setMonthlyBudget(val);
    };

    return (
        <View style={styles.container}>
            <View style={styles.topSection}>
                <View style={[styles.illustrationContainer, { backgroundColor: '#EEF0FF' }]}>
                    <Text style={styles.emoji}>💰</Text>
                    <View style={styles.barContainer}>
                        <View style={[styles.barBg, { backgroundColor: '#FFFFFF' }]}>
                            <View style={[styles.barFill, { backgroundColor: colors.accent, width: '70%' }]} />
                        </View>
                    </View>
                </View>
                <Text style={[styles.title, { color: colors.text }]}>Set Your Budget</Text>
                <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
                    Tell us how much you want to spend each month. You can always change this later.
                </Text>
            </View>

            <View style={styles.formSection}>
                <Text style={[styles.label, { color: colors.textSecondary }]}>MONTHLY BUDGET</Text>
                <View style={[styles.inputContainer, { borderBottomColor: colors.border }]}>
                    <Text style={[styles.currencySymbol, { color: colors.accent }]}>{currencySymbol}</Text>
                    <TextInput
                        style={[styles.input, { color: colors.text }]}
                        value={monthlyBudget === 0 ? '' : monthlyBudget.toString()}
                        onChangeText={handleBudgetChange}
                        placeholder="0"
                        placeholderTextColor={colors.textMuted}
                        keyboardType="numeric"
                    />
                </View>
                <Text style={[styles.hint, { color: colors.textMuted }]}>
                    e.g. 20,000 for {currencySymbol}20,000 monthly budget
                </Text>

                <View style={styles.currencySection}>
                    <View style={styles.currencyHeader}>
                        <Text style={[styles.label, { color: colors.textSecondary }]}>CURRENCY</Text>
                        <TouchableOpacity onPress={() => setIsCurrencyModalVisible(true)}>
                            <Text style={[styles.moreText, { color: colors.accent }]}>More currencies →</Text>
                        </TouchableOpacity>
                    </View>

                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.currencyList}>
                        {COMMON_CURRENCIES.map((curr) => {
                            const isSelected = curr.code === currency;
                            return (
                                <TouchableOpacity
                                    key={curr.code}
                                    onPress={() => setCurrency(curr.code, curr.symbol)}
                                    style={[
                                        styles.pill,
                                        { borderColor: colors.border },
                                        isSelected && { backgroundColor: colors.accent, borderColor: colors.accent }
                                    ]}
                                >
                                    <Text style={[
                                        styles.pillText,
                                        { color: colors.text },
                                        isSelected && { color: '#FFFFFF' }
                                    ]}>
                                        {curr.code} {curr.symbol}
                                    </Text>
                                </TouchableOpacity>
                            );
                        })}
                    </ScrollView>
                </View>
            </View>

            <SettingsCurrencyModal
                visible={isCurrencyModalVisible}
                onClose={() => setIsCurrencyModalVisible(false)}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        width,
        flex: 1,
        paddingHorizontal: 30,
    },
    topSection: {
        flex: 0.45,
        justifyContent: 'center',
        alignItems: 'center',
    },
    illustrationContainer: {
        width: 140,
        height: 140,
        borderRadius: 70,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 24,
    },
    emoji: {
        fontSize: 50,
        marginBottom: 10,
    },
    barContainer: {
        width: 80,
        height: 12,
    },
    barBg: {
        height: 6,
        width: '100%',
        borderRadius: 3,
        overflow: 'hidden',
    },
    barFill: {
        height: '100%',
        borderRadius: 3,
    },
    title: {
        fontSize: 28,
        fontWeight: '800',
        marginBottom: 12,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 14,
        lineHeight: 22,
        textAlign: 'center',
        paddingHorizontal: 20,
    },
    formSection: {
        flex: 0.55,
    },
    label: {
        fontSize: 12,
        fontWeight: '600',
        letterSpacing: 1,
        marginBottom: 16,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderBottomWidth: 1.5,
        paddingBottom: 8,
        marginBottom: 8,
    },
    currencySymbol: {
        fontSize: 32,
        fontWeight: '700',
        marginRight: 10,
    },
    input: {
        fontSize: 36,
        fontWeight: '800',
        flex: 1,
    },
    hint: {
        fontSize: 12,
        marginBottom: 32,
    },
    currencySection: {
        marginTop: 8,
    },
    currencyHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    currencyList: {
        paddingVertical: 4,
    },
    pill: {
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 99,
        borderWidth: 1,
        marginRight: 10,
    },
    pillText: {
        fontSize: 14,
        fontWeight: '600',
    },
    moreText: {
        fontSize: 13,
        fontWeight: '600',
        marginBottom: 16,
    },
});
