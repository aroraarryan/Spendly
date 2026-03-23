import { create } from 'zustand';
import * as db from '@/services/database';
import { Income, IncomeSource } from '@/types';

interface IncomeState {
    incomeSources: IncomeSource[];
    income: Income[];
    isLoading: boolean;
    loadIncomeSources: () => Promise<void>;
    loadIncome: (month: number, year: number) => Promise<void>;
    addIncomeSource: (source: { name: string, icon: string, color: string }) => Promise<string>;
    addIncome: (income: Omit<Income, 'id' | 'created_at'>) => Promise<string>;
    updateIncome: (id: string, updates: Partial<Income>) => Promise<void>;
    deleteIncome: (id: string) => Promise<void>;
    getIncomeByMonth: (month: number, year: number) => Income[];
    getTotalIncomeByMonth: (month: number, year: number) => number;
    getIncomeSourceById: (id: string) => IncomeSource | undefined;
    refreshFromServer: () => Promise<void>;
}

export const useIncomeStore = create<IncomeState>((set, get) => ({
    incomeSources: [],
    income: [],
    isLoading: false,

    loadIncomeSources: async () => {
        set({ isLoading: true });
        try {
            const sources = await db.getIncomeSources();
            set({ incomeSources: sources as IncomeSource[] });
        } catch (error) {
            console.error('Error loading income sources:', error);
        } finally {
            set({ isLoading: false });
        }
    },

    loadIncome: async (month: number, year: number) => {
        set({ isLoading: true });
        try {
            const data = await db.getIncome(month, year);
            set({ income: data as Income[] });
        } catch (error) {
            console.error('Error loading income:', error);
        } finally {
            set({ isLoading: false });
        }
    },

    refreshFromServer: async () => {
        const now = new Date();
        await Promise.all([
            get().loadIncomeSources(),
            get().loadIncome(now.getMonth() + 1, now.getFullYear())
        ]);
    },

    addIncomeSource: async (source) => {
        const data = await db.addIncomeSource(source);
        const newSource = data as IncomeSource;
        await get().loadIncomeSources();
        return newSource.id;
    },

    addIncome: async (incomeData) => {
        const data = await db.addIncome(incomeData);
        const newIncome = data as Income;
        // Refresh local state for the month of the income
        const date = new Date(newIncome.date);
        await get().loadIncome(date.getMonth() + 1, date.getFullYear());
        return newIncome.id;
    },

    updateIncome: async (id, updates) => {
        await db.updateIncome(id, updates);
        // Refresh correctly
        const entry = get().income.find(i => i.id === id);
        if (entry) {
            const date = new Date(entry.date);
            await get().loadIncome(date.getMonth() + 1, date.getFullYear());
        }
    },

    deleteIncome: async (id) => {
        const entry = get().income.find(i => i.id === id);
        await db.deleteIncome(id);
        if (entry) {
            const date = new Date(entry.date);
            await get().loadIncome(date.getMonth() + 1, date.getFullYear());
        }
    },

    getIncomeByMonth: (month, year) => {
        const monthStr = String(month).padStart(2, '0');
        const pattern = `${year}-${monthStr}`;
        return get().income.filter(i => i.date.startsWith(pattern));
    },

    getTotalIncomeByMonth: (month, year) => {
        return get().getIncomeByMonth(month, year).reduce((sum, item) => sum + item.amount, 0);
    },

    getIncomeSourceById: (id) => {
        return get().incomeSources.find(s => s.id === id);
    }
}));
