import { create } from 'zustand';
import { getAllExpenses, addExpense, updateExpense, deleteExpense } from '../services/database';
import { checkBudgetAlerts } from '../services/notificationService';
import { getCurrentMonthYear } from '../utils/analyticsHelpers';

export interface ExpenseRow {
    // ... existing ExpenseRow interface ...
    id: string;
    amount: number;
    category_id: string;
    event_id: string | null;
    note: string | null;
    date: string;
    is_recurring: number;
    recurring_interval: string | null;
    photo_uri: string | null;
    created_at: string;
}

interface ExpenseState {
    expenses: ExpenseRow[];
    isLoading: boolean;
    error: string | null;
    loadExpenses: () => Promise<void>;
    addExpense: (expense: Omit<ExpenseRow, 'id' | 'created_at'>) => Promise<string>;
    updateExpense: (id: string, updates: Partial<ExpenseRow>) => Promise<void>;
    deleteExpense: (id: string) => Promise<void>;
    getExpensesByMonth: (month: number, year: number) => ExpenseRow[];
    getExpensesByCategory: (categoryId: string, month: number, year: number) => ExpenseRow[];
    getExpensesByEvent: (eventId: string) => ExpenseRow[];
    getTotalByMonth: (month: number, year: number) => number;
    getTotalByCategory: (categoryId: string, month: number, year: number) => number;
    clearExpenses: () => Promise<void>;
    reloadExpenses: () => Promise<void>;
    refreshFromServer: () => Promise<void>;
    importExpenses: (expenses: ExpenseRow[]) => Promise<void>;
}

export const useExpenseStore = create<ExpenseState>((set, get) => ({
    expenses: [],
    isLoading: false,
    error: null,
    loadExpenses: async () => {
        set({ isLoading: true, error: null });
        try {
            const data = await getAllExpenses() as ExpenseRow[];
            set({ expenses: data });
        } catch (error: any) {
            set({ error: error.message });
        } finally {
            set({ isLoading: false });
        }
    },
    refreshFromServer: async () => {
        await get().loadExpenses();
    },
    addExpense: async (expense) => {
        const data = await addExpense(expense as any);
        const newExpense: ExpenseRow = data as ExpenseRow;
        
        set(state => ({ expenses: [newExpense, ...state.expenses] }));

        // Check for budget alerts after adding expense
        const { month, year } = getCurrentMonthYear();
        checkBudgetAlerts(month, year).catch(console.error);

        return newExpense.id;
    },
    updateExpense: async (id, updates) => {
        await updateExpense(id, updates);
        set(state => ({
            expenses: state.expenses.map(e => e.id === id ? { ...e, ...updates } : e)
        }));
    },
    deleteExpense: async (id) => {
        await deleteExpense(id);
        set(state => ({ expenses: state.expenses.filter(e => e.id !== id) }));
    },
    getExpensesByMonth: (month, year) => {
        const prefix = `${year}-${String(month).padStart(2, '0')}`;
        return get().expenses.filter(e => e.date.startsWith(prefix));
    },
    getExpensesByCategory: (categoryId, month, year) => {
        const prefix = `${year}-${String(month).padStart(2, '0')}`;
        return get().expenses.filter(e => e.category_id === categoryId && e.date.startsWith(prefix));
    },
    getExpensesByEvent: (eventId) => {
        return get().expenses.filter(e => e.event_id === eventId);
    },
    getTotalByMonth: (month, year) => {
        const prefix = `${year}-${String(month).padStart(2, '0')}`;
        return get().expenses
            .filter(e => e.date.startsWith(prefix))
            .reduce((sum, e) => sum + e.amount, 0);
    },
    getTotalByCategory: (categoryId, month, year) => {
        const prefix = `${year}-${String(month).padStart(2, '0')}`;
        return get().expenses
            .filter(e => e.category_id === categoryId && e.date.startsWith(prefix))
            .reduce((sum, e) => sum + e.amount, 0);
    },
    clearExpenses: async () => {
        const { clearAllUserData } = await import('../services/database');
        await clearAllUserData();
        set({ expenses: [] });
    },
    reloadExpenses: async () => {
        await get().loadExpenses();
    },
    importExpenses: async (expenses) => {
        const { bulkInsertExpenses } = await import('../services/database');
        await bulkInsertExpenses(expenses);
        await get().loadExpenses();
    }
}));
