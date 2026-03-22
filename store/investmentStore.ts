import { create } from 'zustand';
import * as db from '@/services/database';
import { Investment, InvestmentType, SIP, FixedDeposit } from '@/types';

interface InvestmentState {
    investments: Investment[];
    investmentTypes: InvestmentType[];
    sips: SIP[];
    fixedDeposits: FixedDeposit[];
    isLoading: boolean;
    loadInvestments: () => Promise<void>;
    loadInvestmentTypes: () => Promise<void>;
    loadSIPs: () => Promise<void>;
    loadFixedDeposits: () => Promise<void>;
    addInvestment: (inv: Omit<Investment, 'id' | 'created_at'>) => Promise<string>;
    updateInvestment: (id: string, updates: Partial<Investment>) => Promise<void>;
    deleteInvestment: (id: string) => Promise<void>;
    addSIP: (sip: Omit<SIP, 'id' | 'total_invested' | 'current_value' | 'created_at'>) => Promise<string>;
    updateSIP: (id: string, updates: Partial<SIP>) => Promise<void>;
    deleteSIP: (id: string) => Promise<void>;
    addFixedDeposit: (fd: Omit<FixedDeposit, 'id' | 'created_at'>) => Promise<string>;
    updateFixedDeposit: (id: string, updates: Partial<FixedDeposit>) => Promise<void>;
    deleteFixedDeposit: (id: string) => Promise<void>;
    getTotalInvested: () => number;
    getTotalCurrentValue: () => number;
    getTotalReturns: () => number;
    getReturnsPercent: () => number;
    getTypeById: (id: string) => InvestmentType | undefined;
}

export const useInvestmentStore = create<InvestmentState>((set, get) => ({
    investments: [],
    investmentTypes: [],
    sips: [],
    fixedDeposits: [],
    isLoading: false,

    loadInvestments: async () => {
        set({ isLoading: true });
        try {
            const data = await db.getInvestments();
            set({ investments: data as Investment[] });
        } catch (error) {
            console.error('Error loading investments:', error);
        } finally {
            set({ isLoading: false });
        }
    },

    loadInvestmentTypes: async () => {
        try {
            const data = await db.getInvestmentTypes();
            set({ investmentTypes: data as InvestmentType[] });
        } catch (error) {
            console.error('Error loading investment types:', error);
        }
    },

    loadSIPs: async () => {
        try {
            const data = await db.getSIPs();
            set({ sips: data as SIP[] });
        } catch (error) {
            console.error('Error loading SIPs:', error);
        }
    },

    loadFixedDeposits: async () => {
        try {
            const data = await db.getFixedDeposits();
            set({ fixedDeposits: data as FixedDeposit[] });
        } catch (error) {
            console.error('Error loading FDs:', error);
        }
    },

    addInvestment: async (inv) => {
        const id = await db.addInvestment(inv as any);
        await get().loadInvestments();
        return id;
    },

    updateInvestment: async (id, updates) => {
        await db.updateInvestment(id, updates);
        await get().loadInvestments();
    },

    deleteInvestment: async (id) => {
        await db.deleteInvestment(id);
        await get().loadInvestments();
    },

    addSIP: async (sip) => {
        const id = await db.addSIP(sip as any);
        await get().loadSIPs();
        return id;
    },

    updateSIP: async (id, updates) => {
        await db.updateSIP(id, updates);
        await get().loadSIPs();
    },

    deleteSIP: async (id) => {
        await db.deleteSIP(id);
        await get().loadSIPs();
    },

    addFixedDeposit: async (fd) => {
        const id = await db.addFixedDeposit(fd as any);
        await get().loadFixedDeposits();
        return id;
    },

    updateFixedDeposit: async (id, updates) => {
        await db.updateFixedDeposit(id, updates);
        await get().loadFixedDeposits();
    },

    deleteFixedDeposit: async (id) => {
        await db.deleteFixedDeposit(id);
        await get().loadFixedDeposits();
    },

    getTotalInvested: () => {
        const invTotal = get().investments.reduce((sum, i) => sum + i.invested_amount, 0);
        const fdTotal = get().fixedDeposits.reduce((sum, fd) => sum + fd.principal, 0);
        // SIP historical data might be complex, for now we can track total_invested field if we implement updates for it
        return invTotal + fdTotal;
    },

    getTotalCurrentValue: () => {
        const invTotal = get().investments.reduce((sum, i) => sum + i.current_value, 0);
        const fdTotal = get().fixedDeposits.reduce((sum, fd) => sum + fd.maturity_amount, 0); // Approx
        return invTotal + fdTotal;
    },

    getTotalReturns: () => {
        return get().getTotalCurrentValue() - get().getTotalInvested();
    },

    getReturnsPercent: () => {
        const invested = get().getTotalInvested();
        if (invested === 0) return 0;
        return (get().getTotalReturns() / invested) * 100;
    },

    getTypeById: (id) => {
        return get().investmentTypes.find(t => t.id === id);
    }
}));
