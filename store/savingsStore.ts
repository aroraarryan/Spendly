import { create } from 'zustand';
import * as db from '@/services/database';
import { SavingsGoal, SavingsContribution } from '@/types';

interface SavingsState {
    goals: SavingsGoal[];
    contributions: Record<string, SavingsContribution[]>; // goalId -> contributions
    isLoading: boolean;
    loadGoals: () => Promise<void>;
    loadContributions: (goalId: string) => Promise<void>;
    addGoal: (goal: Omit<SavingsGoal, 'id' | 'saved_amount' | 'is_completed' | 'created_at'>) => Promise<string>;
    updateGoal: (id: string, updates: Partial<SavingsGoal>) => Promise<void>;
    deleteGoal: (id: string) => Promise<void>;
    addContribution: (contribution: Omit<SavingsContribution, 'id' | 'created_at'>) => Promise<string>;
    deleteContribution: (id: string, goalId: string) => Promise<void>;
    getGoalContributions: (goalId: string) => SavingsContribution[];
    checkAndCompleteGoal: (goalId: string) => Promise<void>;
}

export const useSavingsStore = create<SavingsState>((set, get) => ({
    goals: [],
    contributions: {},
    isLoading: false,

    loadGoals: async () => {
        set({ isLoading: true });
        try {
            const data = await db.getSavingsGoals();
            set({ goals: data as SavingsGoal[] });
        } catch (error) {
            console.error('Error loading savings goals:', error);
        } finally {
            set({ isLoading: false });
        }
    },

    loadContributions: async (goalId) => {
        try {
            const data = await db.getGoalContributions(goalId);
            set(state => ({
                contributions: {
                    ...state.contributions,
                    [goalId]: data as SavingsContribution[]
                }
            }));
        } catch (error) {
            console.error('Error loading contributions:', error);
        }
    },

    addGoal: async (goalData) => {
        const id = await db.addSavingsGoal(goalData);
        await get().loadGoals();
        return id;
    },

    updateGoal: async (id, updates) => {
        await db.updateSavingsGoal(id, updates);
        await get().loadGoals();
    },

    deleteGoal: async (id) => {
        await db.deleteSavingsGoal(id);
        await get().loadGoals();
        // Remove local contributions reference
        set(state => {
            const newContribs = { ...state.contributions };
            delete newContribs[id];
            return { contributions: newContribs };
        });
    },

    addContribution: async (contribData) => {
        const id = await db.addSavingsContribution(contribData);
        await get().loadGoals();
        await get().loadContributions(contribData.goal_id);
        await get().checkAndCompleteGoal(contribData.goal_id);
        return id;
    },

    deleteContribution: async (id, goalId) => {
        await db.deleteContribution(id);
        await get().loadGoals();
        await get().loadContributions(goalId);
    },

    getGoalContributions: (goalId) => {
        return get().contributions[goalId] || [];
    },

    checkAndCompleteGoal: async (goalId) => {
        const goal = get().goals.find(g => g.id === goalId);
        if (goal && goal.saved_amount >= goal.target_amount && !goal.is_completed) {
            const now = new Date().toISOString();
            await get().updateGoal(goalId, { 
                is_completed: 1, 
                completed_at: now 
            });
        }
    }
}));
