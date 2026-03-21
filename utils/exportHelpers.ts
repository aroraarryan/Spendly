import * as FileSystem from 'expo-file-system/legacy'
import { Share, Platform } from 'react-native'

export async function exportExpensesAsCSV(expenses: any[], categories: any[], events: any[], currencySymbol: string) {
    try {
        // Build CSV header
        const header = 'Date,Amount,Currency,Category,Note,Event,Recurring\n'

        // Build CSV rows
        const rows = expenses.map(expense => {
            const category = categories.find(c => c.id === expense.category_id)?.name ?? 'Unknown'
            const event = events.find(e => e.id === expense.event_id)?.name ?? ''
            const date = new Date(expense.date).toLocaleDateString()
            const note = (expense.note ?? '').replace(/,/g, ';') // escape commas
            const recurring = expense.is_recurring ? expense.recurring_interval ?? 'yes' : 'no'
            return `${date},${expense.amount},${currencySymbol},${category},"${note}",${event},${recurring}`
        }).join('\n')

        const csv = header + rows
        const today = new Date().toISOString().split('T')[0]
        const fileName = `spendly-export-${today}.csv`
        const filePath = `${FileSystem.documentDirectory}${fileName}`

        await FileSystem.writeAsStringAsync(filePath, csv, {
            encoding: FileSystem.EncodingType.UTF8
        })

        if (Platform.OS === 'ios') {
            await Share.share({
                url: filePath,
                title: 'Spendly Export'
            });
        } else {
            // Android fallback - share as text if file URL sharing is tricky without a FileProvider
            await Share.share({
                message: csv,
                title: 'Spendly Export'
            });
        }
    } catch (error) {
        console.error("Export failed", error);
    }
}

export async function exportEventsAsCSV(events: any[], expenses: any[], currencySymbol: string) {
    try {
        const header = 'Event Name,Start Date,End Date,Budget,Total Spent,Transaction Count\n'

        const rows = events.map(event => {
            const eventExpenses = expenses.filter(e => e.event_id === event.id)
            const totalSpent = eventExpenses.reduce((sum, e) => sum + e.amount, 0)
            const startDate = new Date(event.start_date).toLocaleDateString()
            const endDate = new Date(event.end_date).toLocaleDateString()
            return `"${event.name}",${startDate},${endDate},${event.total_budget},${totalSpent.toFixed(2)},${eventExpenses.length}`
        }).join('\n')

        const csv = header + rows
        const today = new Date().toISOString().split('T')[0]
        const fileName = `spendly-events-${today}.csv`
        const filePath = `${FileSystem.documentDirectory}${fileName}`

        await FileSystem.writeAsStringAsync(filePath, csv, {
            encoding: FileSystem.EncodingType.UTF8
        })

        if (Platform.OS === 'ios') {
            await Share.share({
                url: filePath,
                title: 'Spendly Events Export'
            });
        } else {
            await Share.share({
                message: csv,
                title: 'Spendly Events Export'
            });
        }
    } catch (error) {
        console.error("Export failed", error);
    }
}
