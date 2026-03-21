import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { useThemeColors } from '../../hooks/useThemeColors';
import FeatureCard from './FeatureCard';

const { width } = Dimensions.get('window');

const FEATURES = [
    {
        icon: '📊',
        title: 'Smart Tracking',
        description: 'Log expenses in seconds with categories, notes, and event tagging',
        iconBg: '#EEF0FF',
        delay: 300,
    },
    {
        icon: '🤖',
        title: 'AI Advisor',
        description: 'Get personalized spending analysis and savings tips powered by Gemini',
        iconBg: '#F0FDF4',
        delay: 500,
    },
    {
        icon: '📈',
        title: 'Visual Analytics',
        description: 'Beautiful charts showing where your money goes every month',
        iconBg: '#FFF7ED',
        delay: 700,
    },
    {
        icon: '🎯',
        title: 'Event Budgets',
        description: 'Track spending for trips, concerts, and special occasions separately',
        iconBg: '#FDF4FF',
        delay: 900,
    }
];

export default function OnboardingScreen3() {
    const colors = useThemeColors();

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={[styles.title, { color: colors.text }]}>Everything you need</Text>
                <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
                    Spendly is packed with powerful features to help you manage money.
                </Text>
            </View>

            <View style={styles.grid}>
                {FEATURES.map((feature, index) => (
                    <FeatureCard
                        key={index}
                        icon={feature.icon}
                        title={feature.title}
                        description={feature.description}
                        iconBg={feature.iconBg}
                        delay={feature.delay}
                    />
                ))}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        width,
        flex: 1,
        paddingHorizontal: 20,
    },
    header: {
        alignItems: 'center',
        marginTop: 20,
        marginBottom: 30,
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
        paddingHorizontal: 30,
    },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
});
