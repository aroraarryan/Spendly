export interface InsightReport {
    summary: string;
    warningAreas: string;
    actionableTips: string;
    savingsGoal: string;
}

export interface ChatMessage {
    id: string;
    content: string;
    isUser: boolean;
    timestamp: Date;
    role?: 'welcome';
}

export interface ExpenseContext {
    analysisMonth: string;
    totalSpent: number;
    transactionCount: number;
    monthlyBudget: number;
    budgetUsedPercent: number;
    currency: string;
    currencySymbol: string;
    categoryBreakdown: Array<{
        name: string;
        amount: number;
        count: number;
        percentOfTotal: number;
    }>;
    comparedToLastMonth: {
        lastMonthTotal: number;
        changeAmount: number;
        changePercent: number;
        direction: 'increase' | 'decrease';
    };
    topExpenses: Array<{
        amount: number;
        category: string;
        note: string;
        date: string;
    }>;
    activeEvents: Array<{
        name: string;
        totalSpent: number;
        budget: number;
    }>;
    recurringExpenses: Array<{
        category: string;
        amount: number;
        interval: string;
    }>;
}
