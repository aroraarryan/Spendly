import { create } from 'zustand';
import * as db from '@/services/database';
import { Asset, Liability, NetWorthSnapshot } from '@/types';
import { useInvestmentStore } from './investmentStore';
import { useSavingsStore } from './savingsStore';

interface NetWorthState {
    assets: Asset[];
    liabilities: Liability[];
    history: NetWorthSnapshot[];
    isLoading: boolean;
    loadAssets: () => Promise<void>;
    loadLiabilities: () => Promise<void>;
    loadHistory: () => Promise<void>;
    addAsset: (asset: Omit<Asset, 'id' | 'created_at'>) => Promise<string>;
    updateAsset: (id: string, updates: Partial<Asset>) => Promise<void>;
    deleteAsset: (id: string) => Promise<void>;
    addLiability: (lia: Omit<Liability, 'id' | 'created_at'>) => Promise<string>;
    updateLiability: (id: string, updates: Partial<Liability>) => Promise<void>;
    deleteLiability: (id: string) => Promise<void>;
    getTotalAssets: () => number;
    getTotalLiabilities: () => number;
    getNetWorth: () => number;
    saveMonthlySnapshot: () => Promise<void>;
    refreshFromServer: () => Promise<void>;
}

export const useNetWorthStore = create<NetWorthState>((set, get) => ({
    assets: [],
    liabilities: [],
    history: [],
    isLoading: false,

    loadAssets: async () => {
        set({ isLoading: true });
        try {
            const data = await db.getAssets();
            set({ assets: data as Asset[] });
        } catch (error) {
            console.error('Error loading assets:', error);
        } finally {
            set({ isLoading: false });
        }
    },

    loadLiabilities: async () => {
        try {
            const data = await db.getLiabilities();
            set({ liabilities: data as Liability[] });
        } catch (error) {
            console.error('Error loading liabilities:', error);
        }
    },

    loadHistory: async () => {
        try {
            const data = await db.getNetWorthHistory();
            set({ history: data as NetWorthSnapshot[] });
        } catch (error) {
            console.error('Error loading net worth history:', error);
        }
    },

    refreshFromServer: async () => {
        await Promise.all([
            get().loadAssets(),
            get().loadLiabilities(),
            get().loadHistory()
        ]);
    },

    addAsset: async (asset) => {
        const data = await db.addAsset(asset as any);
        const newAsset = data as Asset;
        await get().loadAssets();
        return newAsset.id;
    },

    updateAsset: async (id, updates) => {
        await db.updateAsset(id, updates);
        await get().loadAssets();
    },

    deleteAsset: async (id) => {
        await db.deleteAsset(id);
        await get().loadAssets();
    },

    addLiability: async (lia) => {
        const data = await db.addLiability(lia as any);
        const newLia = data as Liability;
        await get().loadLiabilities();
        return newLia.id;
    },

    updateLiability: async (id, updates) => {
        await db.updateLiability(id, updates);
        await get().loadLiabilities();
    },

    deleteLiability: async (id) => {
        await db.deleteLiability(id);
        await get().loadLiabilities();
    },

    getTotalAssets: () => {
        const customAssets = get().assets.reduce((sum, a) => sum + a.current_value, 0);
        
        // Sum from other stores
        const investmentValue = useInvestmentStore.getState().getTotalCurrentValue();
        const savingsValue = useSavingsStore.getState().goals.reduce((sum, g) => sum + g.saved_amount, 0);
        
        return customAssets + investmentValue + savingsValue;
    },

    getTotalLiabilities: () => {
        return get().liabilities.reduce((sum, l) => sum + l.remaining_amount, 0);
    },

    getNetWorth: () => {
        return get().getTotalAssets() - get().getTotalLiabilities();
    },

    saveMonthlySnapshot: async () => {
        const now = new Date();
        const month = now.getMonth() + 1;
        const year = now.getFullYear();
        const totalAssets = get().getTotalAssets();
        const totalLiabilities = get().getTotalLiabilities();
        const netWorth = totalAssets - totalLiabilities;
        
        await db.saveNetWorthSnapshot(month, year, totalAssets, totalLiabilities, netWorth);
        await get().loadHistory();
    }
}));
