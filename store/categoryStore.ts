import { create } from 'zustand';
import { getCategories, addCategory, updateCategory, deleteCategory } from '../services/database';

export interface CategoryRow {
    id: string;
    name: string;
    icon: string;
    color: string;
    monthly_budget: number;
    is_custom: number;
    created_at: string;
}

interface CategoryState {
    categories: CategoryRow[];
    isLoading: boolean;
    loadCategories: () => Promise<void>;
    addCategory: (category: { name: string, icon: string, color: string, monthly_budget?: number }) => Promise<void>;
    updateCategory: (id: string, updates: Partial<CategoryRow>) => Promise<void>;
    deleteCategory: (id: string) => Promise<void>;
    getCategoryById: (id: string) => CategoryRow | undefined;
    resetCategories: () => Promise<void>;
    refreshFromServer: () => Promise<void>;
    deleteCategoryAndReassign: (id: string) => Promise<void>;
    importCategories: (categories: CategoryRow[]) => Promise<void>;
}

export const useCategoryStore = create<CategoryState>((set, get) => ({
    categories: [],
    isLoading: false,
    loadCategories: async () => {
        set({ isLoading: true });
        try {
            const data = await getCategories() as CategoryRow[];
            set({ categories: data });
        } catch (error) {
            console.error(error);
        } finally {
            set({ isLoading: false });
        }
    },
    refreshFromServer: async () => {
        await get().loadCategories();
    },
    addCategory: async (category) => {
        const data = await addCategory(category);
        const newCat = data as CategoryRow;
        set(state => ({ categories: [...state.categories, newCat].sort((a, b) => a.name.localeCompare(b.name)) }));
    },
    updateCategory: async (id, updates) => {
        await updateCategory(id, updates);
        set(state => ({
            categories: state.categories.map(c => c.id === id ? { ...c, ...updates } : c)
        }));
    },
    deleteCategory: async (id) => {
        await deleteCategory(id);
        set(state => ({ categories: state.categories.filter(c => c.id !== id) }));
    },
    getCategoryById: (id) => {
        return get().categories.find(c => c.id === id);
    },
    resetCategories: async () => {
        const { clearAllUserData } = await import('../services/database');
        await clearAllUserData();
        await get().loadCategories();
    },
    deleteCategoryAndReassign: async (id) => {
        const categories = get().categories;
        const othersCategory = categories.find(c => c.name === 'Others');

        if (othersCategory && othersCategory.id !== id) {
            const { reassignExpensesCategory } = await import('../services/database');
            await reassignExpensesCategory(id, othersCategory.id);

            const { useExpenseStore } = await import('./expenseStore');
            await useExpenseStore.getState().reloadExpenses();
        }

        await get().deleteCategory(id);
    },
    importCategories: async (importedCategories) => {
        const currentCategories = get().categories;
        const toImport = importedCategories.filter(ic =>
            ic.is_custom === 1 &&
            !currentCategories.some(cc => cc.name.toLowerCase() === ic.name.toLowerCase())
        );

        if (toImport.length > 0) {
            const { bulkInsertCategories } = await import('../services/database');
            await bulkInsertCategories(toImport);
            await get().loadCategories();
        }
    }
}));
