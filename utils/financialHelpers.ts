/**
 * Financial Calculation Utilities for Spendly 2.0
 */

// Calculate compound interest
export function calculateCompoundInterest(
    principal: number,
    rate: number,
    years: number,
    frequency: number = 12
): number {
    const r = rate / 100;
    const n = frequency;
    const t = years;
    return principal * Math.pow(1 + r / n, n * t);
}

// Calculate SIP future value: P × ({[1 + i]^n – 1} / i) × (1 + i)
export function calculateSIPFutureValue(
    monthlyAmount: number,
    annualRate: number,
    years: number
): number {
    const i = annualRate / 100 / 12; // monthly rate
    const n = years * 12; // number of months
    return monthlyAmount * ((Math.pow(1 + i, n) - 1) / i) * (1 + i);
}

// Calculate FD maturity amount
export function calculateFDMaturity(
    principal: number,
    rate: number,
    years: number,
    frequency: 'monthly' | 'quarterly' | 'annually' | 'on_maturity'
): number {
    let n = 1;
    if (frequency === 'monthly') n = 12;
    if (frequency === 'quarterly') n = 4;
    if (frequency === 'annually') n = 1;
    if (frequency === 'on_maturity') return principal + (principal * rate * years) / 100;

    return calculateCompoundInterest(principal, rate, years, n);
}

// Calculate interest earned on FD so far (Linear approximation)
export function calculateFDInterestEarned(
    principal: number,
    rate: number,
    startDate: string,
    frequency: string
): number {
    const start = new Date(startDate);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const years = diffDays / 365;

    // Simple interest for approximation of "earned so far"
    return (principal * rate * years) / 100;
}

// Calculate CAGR (Compound Annual Growth Rate)
export function calculateCAGR(
    initialValue: number,
    finalValue: number,
    years: number
): number {
    if (initialValue <= 0 || years <= 0) return 0;
    return (Math.pow(finalValue / initialValue, 1 / years) - 1) * 100;
}

// Get current financial year string (India: April to March)
export function getCurrentFinancialYear(): string {
    const now = new Date();
    const month = now.getMonth(); // 0-indexed
    const year = now.getFullYear();

    if (month >= 3) { // April onwards
        return `${year}-${String(year + 1).slice(-2)}`;
    } else {
        return `${year - 1}-${String(year).slice(-2)}`;
    }
}

// Get days until a date
export function getDaysUntil(date: string): number {
    const target = new Date(date);
    const now = new Date();
    const diffTime = target.getTime() - now.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

// Format large numbers Indian style (Lakhs/Crores)
export function formatIndianNumber(amount: number): string {
    const rounded = Math.round(amount);
    if (rounded >= 10000000) {
        return `₹${(rounded / 10000000).toFixed(2)} Cr`;
    }
    
    // Use Intl.NumberFormat for standard Indian comma placement
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0
    }).format(rounded);
}

// Calculate savings rate: (Income - Expenses) / Income * 100
export function calculateSavingsRate(
    income: number,
    expenses: number,
    investments: number = 0
): number {
    if (income <= 0) return 0;
    // We count investments as "saved" for the rate calculation
    return ((income - expenses) / income) * 100;
}

// Approx XIRR would require a numerical method like Newton-Raphson
// For now, we'll provide a simplified version or a placeholder if complex
export function calculateXIRR(
    cashFlows: Array<{ amount: number; date: string }>
): number {
    // Placeholder: Real XIRR is complex to implement without a library
    // For now returning a dummy or simple return
    if (cashFlows.length < 2) return 0;
    const totalOut = cashFlows.filter(c => c.amount < 0).reduce((s, c) => s + Math.abs(c.amount), 0);
    const totalIn = cashFlows.filter(c => c.amount > 0).reduce((s, c) => s + c.amount, 0);
    if (totalOut === 0) return 0;
    return ((totalIn - totalOut) / totalOut) * 100;
}

// Calculate how much needs to be saved per month to hit target
export function calculateMonthlyNeeded(
    targetAmount: number,
    savedAmount: number,
    targetDate: string | null
): number | null {
    if (!targetDate || savedAmount >= targetAmount) return null;
    
    const target = new Date(targetDate);
    const now = new Date();
    
    const years = target.getFullYear() - now.getFullYear();
    const months = target.getMonth() - now.getMonth();
    const monthsRemaining = years * 12 + months;
    
    if (monthsRemaining <= 0) return targetAmount - savedAmount;
    
    return (targetAmount - savedAmount) / monthsRemaining;
}

// Calculate projected completion date at current savings rate
export function projectCompletionDate(
    targetAmount: number,
    savedAmount: number,
    averageMonthlyContribution: number
): string | null {
    if (averageMonthlyContribution <= 0 || savedAmount >= targetAmount) return null;
    
    const remaining = targetAmount - savedAmount;
    const monthsToGoal = Math.ceil(remaining / averageMonthlyContribution);
    
    const completionDate = new Date();
    completionDate.setMonth(completionDate.getMonth() + monthsToGoal);
    
    return completionDate.toISOString();
}

// Check if goal is on track
export function isGoalOnTrack(
    targetAmount: number,
    savedAmount: number,
    createdAt: string,
    targetDate: string
): boolean {
    const start = new Date(createdAt);
    const end = new Date(targetDate);
    const now = new Date();
    
    if (now >= end) return savedAmount >= targetAmount;
    
    const totalDuration = end.getTime() - start.getTime();
    const elapsedDuration = now.getTime() - start.getTime();
    
    const expectedProgress = (elapsedDuration / totalDuration) * targetAmount;
    return savedAmount >= expectedProgress;
}

// Format goal target date display
export function formatGoalDeadline(targetDate: string | null): string {
    if (!targetDate) return 'No deadline';
    
    const target = new Date(targetDate);
    const now = new Date();
    
    if (target < now) return 'Overdue';
    
    return target.toLocaleDateString('default', { month: 'short', year: 'numeric' });
}

