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
    refreshFromServer: () => Promise<void>;
    // New selectors & helpers
    getGoalProgress: (goalId: string) => {
        percentage: number;
        remaining: number;
        monthlyNeeded: number | null;
        isOnTrack: boolean;
        projectedCompletionDate: string | null;
    };
    getTotalSavedAllGoals: () => number;
    getGoalById: (id: string) => SavingsGoal | undefined;
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

    refreshFromServer: async () => {
        await get().loadGoals();
    },

    addGoal: async (goalData) => {
        const data = await db.addSavingsGoal(goalData);
        const newGoal = data as SavingsGoal;
        await get().loadGoals();
        return newGoal.id;
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
        const data = await db.addSavingsContribution(contribData);
        const newContrib = data as SavingsContribution;
        
        // Update local state and check milestones/completion
        await get().loadGoals();
        await get().loadContributions(newContrib.goal_id);
        
        const goal = get().goals.find(g => g.id === newContrib.goal_id);
        if (goal) {
            const percentage = (goal.saved_amount / goal.target_amount) * 100;
            // Check for milestones
            const milestones = [25, 50, 75, 100];
            for (const milestone of milestones) {
                if (percentage >= milestone) {
                    // This logic will be handled by notificationService and UI celebration
                }
            }
            
            if (goal.saved_amount >= goal.target_amount && !goal.is_completed) {
                await get().checkAndCompleteGoal(newContrib.goal_id);
            }
        }
        
        return newContrib.id;
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
    },

    getGoalProgress: (goalId) => {
        const goal = get().goals.find(g => g.id === goalId);
        if (!goal) return { percentage: 0, remaining: 0, monthlyNeeded: null, isOnTrack: true, projectedCompletionDate: null };
        
        const percentage = Math.min(100, Math.round((goal.saved_amount / goal.target_amount) * 100));
        const remaining = Math.max(0, goal.target_amount - goal.saved_amount);
        
        let monthlyNeeded = null;
        if (goal.target_date && remaining > 0) {
            const target = new Date(goal.target_date);
            const now = new Date();
            const monthsRemaining = (target.getFullYear() - now.getFullYear()) * 12 + (target.getMonth() - now.getMonth());
            if (monthsRemaining > 0) {
                monthlyNeeded = remaining / monthsRemaining;
            } else {
                monthlyNeeded = remaining; // Goal due this month
            }
        }
        
        return {
            percentage,
            remaining,
            monthlyNeeded,
            isOnTrack: true, // Placeholder for now
            projectedCompletionDate: null
        };
    },

    getTotalSavedAllGoals: () => {
        return get().goals.reduce((sum, g) => sum + g.saved_amount, 0);
    },

    getGoalById: (id) => {
        return get().goals.find(g => g.id === id);
    }
}));
