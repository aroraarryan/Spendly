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
    deleteCategoryAndReassign: (id: string) => Promise<void>;
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
    addCategory: async (category) => {
        const id = await addCategory(category);
        const newCat: CategoryRow = {
            id,
            name: category.name,
            icon: category.icon,
            color: category.color,
            monthly_budget: category.monthly_budget || 0,
            is_custom: 1,
            created_at: new Date().toISOString()
        };
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
        const { resetCategoriesToDefault } = await import('../services/database');
        await resetCategoriesToDefault();
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
    }
}));
