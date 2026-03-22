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

export interface IncomeSource {
    id: string;
    name: string;
    icon: string;
    color: string;
    is_custom: number;
    created_at: string;
}

export interface Income {
    id: string;
    amount: number;
    source_id: string;
    date: string;
    note?: string;
    is_recurring: number;
    recurring_interval?: string;
    created_at: string;
}

export interface SavingsGoal {
    id: string;
    name: string;
    icon: string;
    color: string;
    target_amount: number;
    saved_amount: number;
    target_date?: string;
    is_completed: number;
    completed_at?: string;
    created_at: string;
}

export interface SavingsContribution {
    id: string;
    goal_id: string;
    amount: number;
    date: string;
    note?: string;
    created_at: string;
}

export interface InvestmentType {
    id: string;
    name: string;
    icon: string;
    color: string;
    category: 'equity' | 'debt' | 'gold' | 'real_estate' | 'crypto' | 'other';
}

export interface Investment {
    id: string;
    name: string;
    type_id: string;
    invested_amount: number;
    current_value: number;
    purchase_date: string;
    maturity_date?: string;
    expected_return: number;
    institution?: string;
    notes?: string;
    is_active: number;
    created_at: string;
}

export interface SIP {
    id: string;
    fund_name: string;
    monthly_amount: number;
    start_date: string;
    next_date: string;
    expected_return: number;
    total_invested: number;
    current_value: number;
    is_active: number;
    created_at: string;
}

export interface FixedDeposit {
    id: string;
    bank_name: string;
    principal: number;
    interest_rate: number;
    start_date: string;
    maturity_date: string;
    interest_frequency: 'monthly' | 'quarterly' | 'annually' | 'on_maturity';
    maturity_amount: number;
    is_active: number;
    is_renewed: number;
    created_at: string;
}

export interface Asset {
    id: string;
    name: string;
    type: string;
    current_value: number;
    purchase_value: number;
    purchase_date?: string;
    notes?: string;
    created_at: string;
}

export interface Liability {
    id: string;
    name: string;
    type: string;
    total_amount: number;
    remaining_amount: number;
    monthly_payment: number;
    interest_rate: number;
    due_date?: string;
    created_at: string;
}

export interface NetWorthSnapshot {
    id: string;
    month: number;
    year: number;
    total_assets: number;
    total_liabilities: number;
    net_worth: number;
    created_at: string;
}

export interface TaxInvestment {
    id: string;
    investment_id: string;
    section: string;
    financial_year: string;
    amount: number;
    created_at: string;
}

export interface FinancialSummary {
    totalIncome: number;
    totalExpenses: number;
    totalInvestments: number;
    totalSaved: number;
    savingsRate: number;
    investmentRate: number;
    netCashFlow: number;
}

export interface UserProfile {
    id: string;
    full_name: string | null;
    avatar_url: string | null;
    provider: string | null;
    updated_at: string;
}
