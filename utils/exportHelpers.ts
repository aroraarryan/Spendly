import * as FileSystem from 'expo-file-system/legacy';
import * as DocumentPicker from 'expo-document-picker';
import * as Sharing from 'expo-sharing';
import { Share, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Constants for file system to avoid property access errors if types are tricky in SDK 52
const fs: any = FileSystem;
const DOC_DIR = fs.documentDirectory;
const UTF8 = fs.EncodingType?.UTF8 || 'utf8';

export async function exportFullBackup(expenses: any[], categories: any[], events: any[], budgets: any[], settings: any) {
    try {
        const backup = {
            version: "1.0.0",
            exportedAt: new Date().toISOString(),
            app: "Spendly",
            data: {
                expenses,
                categories,
                events,
                budgets,
                settings
            }
        };

        const json = JSON.stringify(backup, null, 2);
        const today = new Date().toISOString().split('T')[0];
        const fileName = `spendly-backup-${today}.json`;
        const filePath = `${DOC_DIR}${fileName}`;

        await FileSystem.writeAsStringAsync(filePath, json, {
            encoding: UTF8 as any
        });

        if (await Sharing.isAvailableAsync()) {
            await Sharing.shareAsync(filePath, {
                mimeType: 'application/json',
                dialogTitle: 'Export Spendly Backup',
                UTI: 'public.json'
            });
        } else {
            await Share.share({
                message: json,
                title: 'Spendly Backup'
            });
        }

        await AsyncStorage.setItem('last_backup_date', new Date().toISOString());
    } catch (error) {
        console.error("Backup failed", error);
        throw error;
    }
}

export async function exportDetailedExpensesCSV(
    expenses: any[],
    categories: any[],
    events: any[],
    currencySymbol: string,
    filterMonth?: number,
    filterYear?: number
) {
    try {
        let data = expenses;
        if (filterMonth !== undefined && filterYear !== undefined) {
            const prefix = `${filterYear}-${String(filterMonth).padStart(2, '0')}`;
            data = expenses.filter(e => e.date.startsWith(prefix));
        }

        const header = 'Date,Day,Month,Year,Amount,Currency,Category,Note,Event,Recurring,Recurring Interval,Created At\n';

        const rows = data.map(expense => {
            const dateObj = new Date(expense.date);
            const category = categories.find(c => c.id === expense.category_id)?.name ?? 'Unknown';
            const event = events.find(e => e.id === expense.event_id)?.name ?? '';
            const note = (expense.note ?? '').replace(/,/g, ';').replace(/\n/g, ' ');
            const recurring = expense.is_recurring ? 'Yes' : 'No';
            const recurringInterval = expense.recurring_interval ?? '';

            return [
                expense.date.split('T')[0],
                dateObj.getDate(),
                dateObj.getMonth() + 1,
                dateObj.getFullYear(),
                expense.amount.toFixed(2),
                currencySymbol,
                `"${category}"`,
                `"${note}"`,
                `"${event}"`,
                recurring,
                recurringInterval,
                expense.created_at
            ].join(',');
        }).join('\n');

        const csv = header + rows;
        const today = new Date().toISOString().split('T')[0];
        const fileName = filterMonth !== undefined ? `spendly-expenses-${filterYear}-${filterMonth}.csv` : `spendly-expenses-all-${today}.csv`;
        const filePath = `${DOC_DIR}${fileName}`;

        await FileSystem.writeAsStringAsync(filePath, csv, { encoding: UTF8 as any });

        if (await Sharing.isAvailableAsync()) {
            await Sharing.shareAsync(filePath, { mimeType: 'text/csv', dialogTitle: 'Export Expenses CSV' });
        } else {
            await Share.share({ message: csv, title: 'Expenses CSV' });
        }
    } catch (error) {
        console.error("CSV Export failed", error);
        throw error;
    }
}

export async function exportMonthlyReport(
    expenses: any[],
    categories: any[],
    currencySymbol: string,
    month: number,
    year: number,
    monthlyBudget: number
) {
    try {
        const prefix = `${year}-${String(month).padStart(2, '0')}`;
        const monthExpenses = expenses.filter(e => e.date.startsWith(prefix));
        const totalSpent = monthExpenses.reduce((sum, e) => sum + e.amount, 0);
        const transactionCount = monthExpenses.length;
        const budgetUsed = monthlyBudget > 0 ? Math.round((totalSpent / monthlyBudget) * 100) : 0;
        const daysInMonth = new Date(year, month, 0).getDate();
        const dailyAverage = totalSpent / daysInMonth;

        const monthName = new Date(year, month - 1).toLocaleString('default', { month: 'long' });

        let csv = `SPENDLY MONTHLY REPORT\n`;
        csv += `Month, ${monthName} ${year}\n`;
        csv += `Generated, ${new Date().toLocaleDateString()}\n\n`;

        csv += `SUMMARY\n`;
        csv += `Total Spent, ${currencySymbol}${totalSpent.toFixed(2)}\n`;
        csv += `Total Transactions, ${transactionCount}\n`;
        csv += `Monthly Budget, ${currencySymbol}${monthlyBudget.toFixed(2)}\n`;
        csv += `Budget Used, ${budgetUsed}%\n`;
        csv += `Daily Average, ${currencySymbol}${dailyAverage.toFixed(2)}\n\n`;

        csv += `SPENDING BY CATEGORY\n`;
        csv += `Category, Amount, Transactions, % of Total\n`;

        const catStats = categories.map(cat => {
            const catExpenses = monthExpenses.filter(e => e.category_id === cat.id);
            const amount = catExpenses.reduce((sum, e) => sum + e.amount, 0);
            return {
                name: cat.name,
                amount,
                count: catExpenses.length,
                percent: totalSpent > 0 ? Math.round((amount / totalSpent) * 100) : 0
            };
        }).filter(c => c.count > 0).sort((a, b) => b.amount - a.amount);

        catStats.forEach(s => {
            csv += `"${s.name}", ${s.amount.toFixed(2)}, ${s.count}, ${s.percent}%\n`;
        });

        csv += `\nALL TRANSACTIONS\n`;
        csv += `Date, Amount, Category, Note, Event\n`;

        monthExpenses.sort((a, b) => b.date.localeCompare(a.date)).forEach(e => {
            const cat = categories.find(c => c.id === e.category_id)?.name ?? 'Unknown';
            const note = (e.note ?? '').replace(/,/g, ';').replace(/\n/g, ' ');
            csv += `${e.date.split('T')[0]}, ${e.amount.toFixed(2)}, "${cat}", "${note}", -\n`;
        });

        const fileName = `spendly-report-${year}-${month}.csv`;
        const filePath = `${DOC_DIR}${fileName}`;

        await FileSystem.writeAsStringAsync(filePath, csv, { encoding: UTF8 as any });

        if (await Sharing.isAvailableAsync()) {
            await Sharing.shareAsync(filePath, { mimeType: 'text/csv', dialogTitle: 'Export Monthly Report' });
        } else {
            await Share.share({ message: csv, title: 'Monthly Report' });
        }
    } catch (error) {
        console.error("Report Export failed", error);
        throw error;
    }
}

export async function exportDetailedEventsCSV(events: any[], expenses: any[], categories: any[], currencySymbol: string) {
    try {
        const header = 'Event Name,Status,Start Date,End Date,Duration (days),Budget,Total Spent,Budget Used %,Transaction Count,Categories Used\n';

        const rows = events.map(event => {
            const eventExpenses = expenses.filter(e => e.event_id === event.id);
            const totalSpent = eventExpenses.reduce((sum, e) => sum + e.amount, 0);
            const start = new Date(event.start_date);
            const end = new Date(event.end_date);
            const duration = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
            const budgetUsed = event.total_budget > 0 ? Math.round((totalSpent / event.total_budget) * 100) : 0;
            const status = new Date().toISOString().split('T')[0] > event.end_date ? 'Completed' : 'Active';

            const usedCatIds = [...new Set(eventExpenses.map(e => e.category_id))];
            const categoriesUsed = usedCatIds.map(id => categories.find(c => c.id === id)?.name ?? 'Unknown').join('; ');

            return [
                `"${event.name}"`,
                status,
                event.start_date,
                event.end_date,
                duration,
                event.total_budget,
                totalSpent.toFixed(2),
                `${budgetUsed}%`,
                eventExpenses.length,
                `"${categoriesUsed}"`
            ].join(',');
        }).join('\n');

        const csv = header + rows;
        const fileName = `spendly-events-detailed.csv`;
        const filePath = `${DOC_DIR}${fileName}`;

        await FileSystem.writeAsStringAsync(filePath, csv, { encoding: UTF8 as any });

        if (await Sharing.isAvailableAsync()) {
            await Sharing.shareAsync(filePath, { mimeType: 'text/csv', dialogTitle: 'Export Events CSV' });
        } else {
            await Share.share({ message: csv, title: 'Events CSV' });
        }
    } catch (error) {
        console.error("Events Export failed", error);
        throw error;
    }
}

export async function importFromBackup(): Promise<{
    valid: boolean;
    preview?: { expenseCount: number, categoryCount: number, eventCount: number, backupDate: string };
    data?: any;
    error?: string;
}> {
    try {
        const result = await DocumentPicker.getDocumentAsync({
            type: 'application/json',
            copyToCacheDirectory: true
        });

        if (result.canceled) return { valid: false };

        const fileUri = result.assets[0].uri;
        const content = await FileSystem.readAsStringAsync(fileUri);
        const backup = JSON.parse(content);

        // Validation
        if (!backup.app || backup.app !== 'Spendly' || !backup.version) {
            return { valid: false, error: 'This file is not a valid Spendly backup' };
        }

        if (backup.version !== '1.0.0') {
            return { valid: false, error: 'This backup was created with an incompatible version of Spendly' };
        }

        if (!backup.data || !backup.data.expenses) {
            return { valid: false, error: 'The backup file appears to be corrupted' };
        }

        return {
            valid: true,
            preview: {
                expenseCount: backup.data.expenses.length,
                categoryCount: backup.data.categories?.length || 0,
                eventCount: backup.data.events?.length || 0,
                backupDate: new Date(backup.exportedAt).toLocaleDateString()
            },
            data: backup.data
        };
    } catch (error) {
        return { valid: false, error: 'Failed to read backup file' };
    }
}
