import { ExpenseRow } from '../store/expenseStore';

export const groupExpensesByDay = (expenses: ExpenseRow[]) => {
    return expenses.reduce((acc: { [key: number]: number }, expense) => {
        const day = new Date(expense.date).getDate();
        acc[day] = (acc[day] || 0) + expense.amount;
        return acc;
    }, {});
};

export const groupExpensesByCategory = (expenses: ExpenseRow[]) => {
    return expenses.reduce((acc: { [key: string]: { total: number, count: number } }, expense) => {
        if (!acc[expense.category_id]) {
            acc[expense.category_id] = { total: 0, count: 0 };
        }
        acc[expense.category_id].total += expense.amount;
        acc[expense.category_id].count += 1;
        return acc;
    }, {});
};

export const getLast6MonthsTotals = (allExpenses: ExpenseRow[]) => {
    const result = [];
    const now = new Date();

    for (let i = 5; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const month = d.getMonth() + 1;
        const year = d.getFullYear();
        const monthName = getMonthName(month);

        const prefix = `${year}-${String(month).padStart(2, '0')}`;
        const total = allExpenses
            .filter(e => e.date.startsWith(prefix))
            .reduce((sum, e) => sum + e.amount, 0);

        result.push({ month, year, monthName, total });
    }

    return result;
};

export const getDaysInMonth = (month: number, year: number) => {
    return new Date(year, month, 0).getDate();
};

export const getDaysElapsed = (month: number, year: number) => {
    const now = new Date();
    // If it's a past month, full month is elapsed
    if (year < now.getFullYear() || (year === now.getFullYear() && month < now.getMonth() + 1)) {
        return getDaysInMonth(month, year);
    }
    // If it's the current month, return today's date
    if (year === now.getFullYear() && month === now.getMonth() + 1) {
        return now.getDate();
    }
    // Future month (shouldn't happen per rules)
    return 1;
};

export const formatAmount = (amount: number, currencySymbol: string = '$') => {
    return `${currencySymbol}${amount.toLocaleString(undefined, {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    })}`;
};

export const formatAmountShort = (amount: number) => {
    if (amount >= 1000000) {
        return (amount / 1000000).toFixed(1) + 'M';
    }
    if (amount >= 1000) {
        return (amount / 1000).toFixed(0) + 'k';
    }
    return amount.toString();
};

export const getMonthName = (month: number) => {
    const months = [
        'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
        'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
    ];
    return months[month - 1];
};

export const getPercentageChange = (current: number, previous: number) => {
    if (previous === 0) return current > 0 ? 100 : 0;
    return ((current - previous) / previous) * 100;
};

// Internal helper for date filtering
export const getMonthlyExpenses = (expenses: ExpenseRow[], month: number, year: number) => {
    const prefix = `${year}-${String(month).padStart(2, '0')}`;
    return expenses.filter(e => e.date.startsWith(prefix));
};

export const getEventStatus = (startDate: string, endDate: string): 'upcoming' | 'active' | 'completed' => {
    const today = new Date().toISOString().split('T')[0];
    if (today < startDate) return 'upcoming';
    if (today > endDate) return 'completed';
    return 'active';
};

export const getDaysRemaining = (endDate: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const end = new Date(endDate);
    end.setHours(0, 0, 0, 0);
    const diffTime = end.getTime() - today.getTime();
    if (diffTime < 0) return 0;
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

export const getCurrentMonthYear = () => {
    const now = new Date();
    return { month: now.getMonth() + 1, year: now.getFullYear() };
};

export const getPreviousMonthName = () => {
    const now = new Date();
    now.setMonth(now.getMonth() - 1);
    return getMonthName(now.getMonth() + 1);
};
