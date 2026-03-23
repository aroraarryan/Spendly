import React, { useState, useMemo, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { useExpenseStore } from '@/store/expenseStore';
import { useCategoryStore } from '@/store/categoryStore';
import { useEventStore } from '@/store/eventStore';
import { useSettingsStore } from '@/store/settingsStore';
import { useThemeColors } from '@/hooks/useThemeColors';
import { useToast } from '@/hooks/useToast';

import NeoCard from '@/components/ui/NeoCard';
import NeoButton from '@/components/ui/NeoButton';
import ExportCard from '@/components/data/ExportCard';
import StatRow from '@/components/data/StatRow';
import ImportPreviewModal from '@/components/data/ImportPreviewModal';

import * as ExportUtils from '@/utils/exportHelpers';
import { haptic } from '@/utils/haptics';

export default function DataManagementScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const colors = useThemeColors();
    const { showInAppToast } = useToast();

    const { expenses, importExpenses } = useExpenseStore();
    const { categories, importCategories } = useCategoryStore();
    const { events, importEvents } = useEventStore();
    const { currencySymbol, monthlyBudget } = useSettingsStore();

    const [importModalVisible, setImportModalVisible] = useState(false);
    const [importData, setImportData] = useState<any>(null);
    const [importPreview, setImportPreview] = useState<any>(null);
    const [funFact, setFunFact] = useState('');
    const [lastBackupDate, setLastBackupDate] = useState<string | null>(null);

    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

    useEffect(() => {
        loadLastBackupDate();
    }, []);

    const loadLastBackupDate = async () => {
        const val = await AsyncStorage.getItem('last_backup_date');
        setLastBackupDate(val);
    };

    const stats = useMemo(() => {
        if (expenses.length === 0) return null;

        const totalSpent = expenses.reduce((sum, e) => sum + e.amount, 0);
        const sortedExpenses = [...expenses].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        const firstExpense = sortedExpenses[0]?.date ? new Date(sortedExpenses[0].date).toLocaleDateString() : 'N/A';
        const latestExpense = sortedExpenses[sortedExpenses.length - 1]?.date ? new Date(sortedExpenses[sortedExpenses.length - 1].date).toLocaleDateString() : 'N/A';

        const usedCategoryIds = new Set(expenses.map(e => e.category_id));
        const uniqueMonths = new Set(expenses.map(e => e.date.substring(0, 7)));

        const largestExpense = [...expenses].sort((a, b) => b.amount - a.amount)[0];
        const smallestExpense = [...expenses].sort((a, b) => a.amount - b.amount)[0];

        const catCounts: Record<string, number> = {};
        expenses.forEach(e => {
            catCounts[e.category_id] = (catCounts[e.category_id] || 0) + 1;
        });
        const mostUsedCatId = Object.entries(catCounts).sort((a, b) => b[1] - a[1])[0]?.[0];
        const mostUsedCat = categories.find(c => c.id === mostUsedCatId)?.name || 'N/A';

        return {
            totalCount: expenses.length,
            totalSpent: `${currencySymbol}${totalSpent.toLocaleString()}`,
            firstExpense,
            latestExpense,
            categoriesCount: usedCategoryIds.size,
            eventsCount: events.length,
            uniqueMonths: uniqueMonths.size,
            largestExpense: `${currencySymbol}${largestExpense?.amount || 0} (${categories.find(c => c.id === largestExpense?.category_id)?.name || 'Unknown'})`,
            smallestExpense: `${currencySymbol}${smallestExpense?.amount || 0} (${categories.find(c => c.id === smallestExpense?.category_id)?.name || 'Unknown'})`,
            mostUsedCat
        };
    }, [expenses, categories, events, currencySymbol]);

    useEffect(() => {
        const facts = [
            `You have logged expenses on ${new Set(expenses.map(e => e.date.split('T')[0])).size} different days.`,
            `Your average expense is ${currencySymbol}${expenses.length > 0 ? (expenses.reduce((s, e) => s + e.amount, 0) / expenses.length).toFixed(2) : 0}.`,
            `You have used Spendly for ${stats?.uniqueMonths || 0} months.`
        ];
        
        if (expenses.length > 0) {
            const dayCounts: Record<string, number> = {};
            expenses.forEach(e => {
                const day = new Date(e.date).toLocaleDateString('en-US', { weekday: 'long' });
                dayCounts[day] = (dayCounts[day] || 0) + 1;
            });
            const busiestDay = Object.entries(dayCounts).sort((a, b) => b[1] - a[1])[0]?.[0];
            facts.push(`Your busiest spending day was ${busiestDay}.`);
        }

        setFunFact(facts[Math.floor(Math.random() * facts.length)]);
    }, [expenses, currencySymbol, stats]);

    const handleFullBackup = async () => {
        haptic.medium();
        try {
            const { getAllBudgets } = await import('@/services/database');
            const budgets = await getAllBudgets();
            const settingsData = { currency: currencySymbol, monthlyBudget };
            
            await ExportUtils.exportFullBackup(expenses, categories, events, budgets, settingsData);
            showInAppToast("Success", "Backup exported successfully");
            loadLastBackupDate();
        } catch (error) {
            Alert.alert("Error", "Failed to export backup");
        }
    };

    const handleImport = async () => {
        haptic.light();
        const result = await ExportUtils.importFromBackup();
        if (result.valid && result.preview) {
            setImportPreview(result.preview);
            setImportData(result.data);
            setImportModalVisible(true);
        } else if (result.error) {
            Alert.alert("Import Error", result.error);
        }
    };

    const confirmImport = async () => {
        haptic.medium();
        setImportModalVisible(false);
        try {
            if (importData.categories) await importCategories(importData.categories);
            if (importData.events) await importEvents(importData.events);
            if (importData.expenses) await importExpenses(importData.expenses);
            
            showInAppToast("Success", "Import complete! Added items to your dashboard.");
            router.replace('/(tabs)');
        } catch (error) {
            Alert.alert("Error", "Failed to import data");
        }
    };

    const dbSize = useMemo(() => {
        const expSize = expenses.length * 500;
        const catSize = categories.length * 200;
        const eventSize = events.length * 300;
        const total = (expSize + catSize + eventSize) / 1024;
        return total.toFixed(1);
    }, [expenses, categories, events]);

    const changeMonth = (dir: number) => {
        let newMonth = selectedMonth + dir;
        let newYear = selectedYear;
        if (newMonth > 12) { newMonth = 1; newYear++; }
        if (newMonth < 1) { newMonth = 12; newYear--; }
        setSelectedMonth(newMonth);
        setSelectedYear(newYear);
    };

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <Stack.Screen options={{ headerShown: false }} />
            <View style={[styles.header, { paddingTop: insets.top, borderBottomColor: colors.border }]}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={colors.text} />
                </TouchableOpacity>
                <View>
                    <Text style={[styles.title, { color: colors.text }]}>Data Management</Text>
                    <Text style={[styles.subtitle, { color: colors.textSecondary }]}>Export, import and analyze your data</Text>
                </View>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>EXPORT DATA</Text>
                
                <ExportCard
                    icon="📦"
                    iconBgColor="#EEF0FF"
                    title="Complete Backup"
                    subtitle="Export all expenses, events, categories, and settings as a single JSON file"
                    badge="Recommended"
                >
                    <View style={{ flex: 1 }}>
                        <NeoButton label="Export Backup" variant="primary" onPress={handleFullBackup} />
                    </View>
                </ExportCard>

                <ExportCard
                    icon="📊"
                    iconBgColor="#D1FAE5"
                    title="Expenses CSV"
                    subtitle="Export all expenses as a spreadsheet for easy tracking"
                >
                    <View style={{ flex: 1 }}>
                        <NeoButton label="All Time" variant="primary" onPress={() => ExportUtils.exportDetailedExpensesCSV(expenses, categories, events, currencySymbol)} />
                    </View>
                    <View style={{ flex: 1 }}>
                        <NeoButton label="This Month" variant="ghost" onPress={() => ExportUtils.exportDetailedExpensesCSV(expenses, categories, events, currencySymbol, new Date().getMonth() + 1, new Date().getFullYear())} />
                    </View>
                </ExportCard>

                <ExportCard
                    icon="📈"
                    iconBgColor="#FFEDD5"
                    title="Monthly Analytics Report"
                    subtitle="Export a detailed spending report for any month"
                >
                    <View style={{ width: '100%' }}>
                        <View style={[styles.monthSelector, { backgroundColor: colors.surface2 }]}>
                            <TouchableOpacity onPress={() => changeMonth(-1)}>
                                <Ionicons name="chevron-back" size={20} color={colors.text} />
                            </TouchableOpacity>
                            <Text style={[styles.monthText, { color: colors.text }]}>
                                {new Date(selectedYear, selectedMonth - 1).toLocaleString('default', { month: 'short' })} {selectedYear}
                            </Text>
                            <TouchableOpacity onPress={() => changeMonth(1)}>
                                <Ionicons name="chevron-forward" size={20} color={colors.text} />
                            </TouchableOpacity>
                        </View>
                        <NeoButton
                            label="Export Report"
                            variant="primary"
                            onPress={() => ExportUtils.exportMonthlyReport(expenses, categories, currencySymbol, selectedMonth, selectedYear, monthlyBudget)}
                            style={{ marginTop: 12 }}
                        />
                    </View>
                </ExportCard>

                <ExportCard
                    icon="📁"
                    iconBgColor="#F3E8FF"
                    title="Events CSV"
                    subtitle="Get detailed insights for all your linked events"
                >
                    <View style={{ flex: 1 }}>
                        <NeoButton label="Export Events CSV" variant="primary" onPress={() => ExportUtils.exportDetailedEventsCSV(events, expenses, categories, currencySymbol)} />
                    </View>
                </ExportCard>

                <Text style={[styles.sectionTitle, { color: colors.textSecondary, marginTop: 12 }]}>IMPORT DATA</Text>
                <NeoCard padding={20} marginBottom={16}>
                    <View style={styles.importHeader}>
                        <View style={[styles.iconBox, { backgroundColor: '#E0F2FE' }]}>
                            <Text style={styles.icon}>📥</Text>
                        </View>
                        <View style={{ flex: 1 }}>
                            <Text style={[styles.cardTitle, { color: colors.text }]}>Restore from Backup</Text>
                            <Text style={[styles.cardSub, { color: colors.textSecondary }]}>Import a Spendly backup JSON file to restore your data</Text>
                        </View>
                    </View>
                    
                    <View style={[styles.infoBox, { backgroundColor: '#FEF3C7', marginBottom: 16 }]}>
                        <Text style={[styles.warningTextSmall, { color: '#92400E' }]}>
                            ⚠️ Backup files are local snapshots. Your main data is synced to cloud.
                        </Text>
                    </View>

                    <NeoButton label="Choose Backup File" variant="ghost" onPress={handleImport} />
                </NeoCard>

                <Text style={[styles.sectionTitle, { color: colors.textSecondary, marginTop: 12 }]}>YOUR DATA</Text>
                <NeoCard padding={20} marginBottom={16}>
                    {stats ? (
                        <>
                            <StatRow icon="🧾" label="Total Expenses" value={stats.totalCount} />
                            <StatRow icon="💰" label="Total Spent (All Time)" value={stats.totalSpent} />
                            <StatRow icon="📅" label="First Expense" value={stats.firstExpense} />
                            <StatRow icon="📍" label="Latest Expense" value={stats.latestExpense} />
                            <StatRow icon="🏷️" label="Categories Used" value={stats.categoriesCount} />
                            <StatRow icon="🏆" label="Total Events" value={stats.eventsCount} />
                            <StatRow icon="📆" label="Months Tracked" value={stats.uniqueMonths} />
                            <StatRow icon="🐋" label="Largest Expense" value={stats.largestExpense} />
                            <StatRow icon="🤏" label="Smallest Expense" value={stats.smallestExpense} />
                            <StatRow icon="🔥" label="Most Used Category" value={stats.mostUsedCat} isLast />
                        </>
                    ) : (
                        <Text style={{ textAlign: 'center', color: colors.textSecondary, padding: 20 }}>No data available yet</Text>
                    )}
                </NeoCard>

                {funFact && (
                    <View style={[styles.funFactCard, { backgroundColor: '#EEF0FF' }]}>
                        <Text style={[styles.funFactTitle, { color: colors.accent }]}>💡 Fun Fact</Text>
                        <Text style={[styles.funFactText, { color: colors.text }]}>{funFact}</Text>
                    </View>
                )}

                <Text style={[styles.sectionTitle, { color: colors.textSecondary, marginTop: 24 }]}>STORAGE</Text>
                <NeoCard padding={20} marginBottom={32}>
                    <StatRow icon="💾" label="Database Size" value={`Calculated in Cloud`} />
                    <StatRow icon="☁️" label="Last Backup" value={lastBackupDate ? new Date(lastBackupDate).toLocaleDateString() : 'Never'} />
                    <StatRow icon="🔒" label="Data stored on" value="Supabase Cloud 🔒" isLast />
                    
                    <View style={[styles.infoBox, { backgroundColor: '#D1FAE5', marginTop: 16 }]}>
                        <Text style={[styles.infoText, { color: '#065F46' }]}>
                            🔒 Your data is securely synced to Supabase Cloud, ensuring it's available across all your devices and backed up automatically.
                        </Text>
                    </View>
                </NeoCard>
            </ScrollView>

            <ImportPreviewModal
                visible={importModalVisible}
                onClose={() => setImportModalVisible(false)}
                onConfirm={confirmImport}
                preview={importPreview}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingBottom: 20,
        borderBottomWidth: 1,
    },
    backButton: {
        marginRight: 16,
    },
    title: {
        fontSize: 22,
        fontWeight: '700',
    },
    subtitle: {
        fontSize: 14,
        marginTop: 2,
    },
    scrollContent: {
        padding: 20,
    },
    sectionTitle: {
        fontSize: 12,
        fontWeight: '700',
        letterSpacing: 1,
        marginBottom: 12,
        marginLeft: 4,
    },
    monthSelector: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 10,
        borderRadius: 12,
        marginBottom: 4,
    },
    monthText: {
        fontSize: 15,
        fontWeight: '600',
    },
    importHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    iconBox: {
        width: 44,
        height: 44,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 14,
    },
    icon: {
        fontSize: 22,
    },
    cardTitle: {
        fontSize: 16,
        fontWeight: '700',
    },
    cardSub: {
        fontSize: 13,
        marginTop: 2,
    },
    warningContainer: {
        padding: 12,
        borderRadius: 8,
        marginBottom: 16,
    },
    warningTextSmall: {
        fontSize: 12,
        fontWeight: '500',
    },
    funFactCard: {
        padding: 16,
        borderRadius: 16,
        marginTop: 8,
    },
    funFactTitle: {
        fontSize: 14,
        fontWeight: '700',
        marginBottom: 4,
    },
    funFactText: {
        fontSize: 14,
        lineHeight: 20,
    },
    infoBox: {
        padding: 16,
        borderRadius: 12,
        marginTop: 16,
    },
    infoText: {
        fontSize: 12,
        lineHeight: 18,
        textAlign: 'center',
    }
});
