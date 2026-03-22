import * as SQLite from 'expo-sqlite';
import * as Crypto from 'expo-crypto';

// Use openDatabaseSync for expo-sqlite >= v14
const db = SQLite.openDatabaseSync('spendly.db');

export const initDatabase = async () => {
    try {
        await db.execAsync(`
            PRAGMA journal_mode = WAL;

            CREATE TABLE IF NOT EXISTS categories (
                id TEXT PRIMARY KEY NOT NULL,
                name TEXT NOT NULL,
                icon TEXT NOT NULL,
                color TEXT NOT NULL,
                monthly_budget REAL DEFAULT 0,
                is_custom INTEGER DEFAULT 0,
                created_at TEXT NOT NULL
            );

            CREATE TABLE IF NOT EXISTS expenses (
                id TEXT PRIMARY KEY NOT NULL,
                amount REAL NOT NULL,
                category_id TEXT NOT NULL,
                event_id TEXT,
                note TEXT,
                date TEXT NOT NULL,
                is_recurring INTEGER DEFAULT 0,
                recurring_interval TEXT,
                photo_uri TEXT,
                created_at TEXT NOT NULL
            );

            CREATE TABLE IF NOT EXISTS events (
                id TEXT PRIMARY KEY NOT NULL,
                name TEXT NOT NULL,
                start_date TEXT NOT NULL,
                end_date TEXT NOT NULL,
                total_budget REAL DEFAULT 0,
                cover_color TEXT NOT NULL,
                created_at TEXT NOT NULL
            );

            CREATE TABLE IF NOT EXISTS budgets (
                id TEXT PRIMARY KEY NOT NULL,
                month INTEGER NOT NULL,
                year INTEGER NOT NULL,
                total_budget REAL NOT NULL,
                created_at TEXT NOT NULL
            );

            -- Income Sources
            CREATE TABLE IF NOT EXISTS income_sources (
                id TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                icon TEXT NOT NULL,
                color TEXT NOT NULL,
                is_custom INTEGER DEFAULT 0,
                created_at TEXT NOT NULL
            );

            -- Income entries
            CREATE TABLE IF NOT EXISTS income (
                id TEXT PRIMARY KEY,
                amount REAL NOT NULL,
                source_id TEXT NOT NULL,
                date TEXT NOT NULL,
                note TEXT,
                is_recurring INTEGER DEFAULT 0,
                recurring_interval TEXT,
                created_at TEXT NOT NULL
            );

            -- Savings Goals
            CREATE TABLE IF NOT EXISTS savings_goals (
                id TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                icon TEXT NOT NULL,
                color TEXT NOT NULL,
                target_amount REAL NOT NULL,
                saved_amount REAL DEFAULT 0,
                target_date TEXT,
                is_completed INTEGER DEFAULT 0,
                completed_at TEXT,
                created_at TEXT NOT NULL
            );

            -- Savings Contributions
            CREATE TABLE IF NOT EXISTS savings_contributions (
                id TEXT PRIMARY KEY,
                goal_id TEXT NOT NULL,
                amount REAL NOT NULL,
                date TEXT NOT NULL,
                note TEXT,
                created_at TEXT NOT NULL
            );

            -- Investment Types
            CREATE TABLE IF NOT EXISTS investment_types (
                id TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                icon TEXT NOT NULL,
                color TEXT NOT NULL,
                category TEXT NOT NULL
            );

            -- Investments
            CREATE TABLE IF NOT EXISTS investments (
                id TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                type_id TEXT NOT NULL,
                invested_amount REAL NOT NULL,
                current_value REAL NOT NULL,
                purchase_date TEXT NOT NULL,
                maturity_date TEXT,
                expected_return REAL DEFAULT 0,
                institution TEXT,
                notes TEXT,
                is_active INTEGER DEFAULT 1,
                created_at TEXT NOT NULL
            );

            -- SIPs
            CREATE TABLE IF NOT EXISTS sips (
                id TEXT PRIMARY KEY,
                fund_name TEXT NOT NULL,
                monthly_amount REAL NOT NULL,
                start_date TEXT NOT NULL,
                next_date TEXT NOT NULL,
                expected_return REAL DEFAULT 12,
                total_invested REAL DEFAULT 0,
                current_value REAL DEFAULT 0,
                is_active INTEGER DEFAULT 1,
                created_at TEXT NOT NULL
            );

            -- Fixed Deposits
            CREATE TABLE IF NOT EXISTS fixed_deposits (
                id TEXT PRIMARY KEY,
                bank_name TEXT NOT NULL,
                principal REAL NOT NULL,
                interest_rate REAL NOT NULL,
                start_date TEXT NOT NULL,
                maturity_date TEXT NOT NULL,
                interest_frequency TEXT DEFAULT 'on_maturity',
                maturity_amount REAL NOT NULL,
                is_active INTEGER DEFAULT 1,
                is_renewed INTEGER DEFAULT 0,
                created_at TEXT NOT NULL
            );

            -- Assets
            CREATE TABLE IF NOT EXISTS assets (
                id TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                type TEXT NOT NULL,
                current_value REAL NOT NULL,
                purchase_value REAL DEFAULT 0,
                purchase_date TEXT,
                notes TEXT,
                created_at TEXT NOT NULL
            );

            -- Liabilities
            CREATE TABLE IF NOT EXISTS liabilities (
                id TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                type TEXT NOT NULL,
                total_amount REAL NOT NULL,
                remaining_amount REAL NOT NULL,
                monthly_payment REAL DEFAULT 0,
                interest_rate REAL DEFAULT 0,
                due_date TEXT,
                created_at TEXT NOT NULL
            );

            -- Net Worth History
            CREATE TABLE IF NOT EXISTS net_worth_history (
                id TEXT PRIMARY KEY,
                month INTEGER NOT NULL,
                year INTEGER NOT NULL,
                total_assets REAL NOT NULL,
                total_liabilities REAL NOT NULL,
                net_worth REAL NOT NULL,
                created_at TEXT NOT NULL
            );

            -- Tax Investments
            CREATE TABLE IF NOT EXISTS tax_investments (
                id TEXT PRIMARY KEY,
                investment_id TEXT NOT NULL,
                section TEXT NOT NULL,
                financial_year TEXT NOT NULL,
                amount REAL NOT NULL,
                created_at TEXT NOT NULL
            );

            CREATE INDEX IF NOT EXISTS idx_expenses_date ON expenses(date);
            CREATE INDEX IF NOT EXISTS idx_expenses_category ON expenses(category_id);
            CREATE INDEX IF NOT EXISTS idx_expenses_event ON expenses(event_id);
            
            -- New Indexes
            CREATE INDEX IF NOT EXISTS idx_income_date ON income(date);
            CREATE INDEX IF NOT EXISTS idx_income_source ON income(source_id);
            CREATE INDEX IF NOT EXISTS idx_contributions_goal ON savings_contributions(goal_id);
            CREATE INDEX IF NOT EXISTS idx_investments_type ON investments(type_id);
            CREATE INDEX IF NOT EXISTS idx_tax_year ON tax_investments(financial_year);
        `);

        // Seed default categories if table is empty
        const catCount = await db.getFirstAsync<{ count: number }>(`SELECT COUNT(*) as count FROM categories`);
        if (catCount && catCount.count === 0) {
            const defaultCategories = [
                { name: 'Food & Dining', icon: '🍔', color: '#FF6B6B' },
                { name: 'Transport', icon: '🚗', color: '#4ECDC4' },
                { name: 'Entertainment', icon: '🎬', color: '#45B7D1' },
                { name: 'Shopping', icon: '🛍️', color: '#96CEB4' },
                { name: 'Health', icon: '💊', color: '#88D8B0' },
                { name: 'Utilities', icon: '💡', color: '#FFEAA7' },
                { name: 'Travel', icon: '✈️', color: '#DDA0DD' },
                { name: 'Education', icon: '📚', color: '#98D8C8' },
                { name: 'Subscriptions', icon: '📱', color: '#F7DC6F' },
                { name: 'Others', icon: '💰', color: '#AEB6BF' },
            ];

            const now = new Date().toISOString();
            const statement = await db.prepareAsync(
                `INSERT INTO categories (id, name, icon, color, is_custom, created_at) VALUES ($id, $name, $icon, $color, $is_custom, $created_at)`
            );

            try {
                for (const cat of defaultCategories) {
                    await statement.executeAsync({
                        $id: Crypto.randomUUID(),
                        $name: cat.name,
                        $icon: cat.icon,
                        $color: cat.color,
                        $is_custom: 0,
                        $created_at: now
                    });
                }
            } finally {
                await statement.finalizeAsync();
            }
        }

        // Seed income sources if table is empty
        const incomeSourceCount = await db.getFirstAsync<{ count: number }>(`SELECT COUNT(*) as count FROM income_sources`);
        if (incomeSourceCount && incomeSourceCount.count === 0) {
            const defaultSources = [
                { name: 'Salary', icon: '💼', color: '#6C63FF' },
                { name: 'Freelance', icon: '💻', color: '#10B981' },
                { name: 'Business', icon: '🏪', color: '#F59E0B' },
                { name: 'Investments', icon: '📈', color: '#3B82F6' },
                { name: 'Rental', icon: '🏠', color: '#8B5CF6' },
                { name: 'Interest', icon: '🏦', color: '#06B6D4' },
                { name: 'Dividends', icon: '💰', color: '#EC4899' },
                { name: 'Gift', icon: '🎁', color: '#F97316' },
                { name: 'Other', icon: '💵', color: '#6B7280' },
            ];

            const now = new Date().toISOString();
            const statement = await db.prepareAsync(
                `INSERT INTO income_sources (id, name, icon, color, is_custom, created_at) VALUES ($id, $name, $icon, $color, $is_custom, $created_at)`
            );

            try {
                for (const source of defaultSources) {
                    await statement.executeAsync({
                        $id: Crypto.randomUUID(),
                        $name: source.name,
                        $icon: source.icon,
                        $color: source.color,
                        $is_custom: 0,
                        $created_at: now
                    });
                }
            } finally {
                await statement.finalizeAsync();
            }
        }

        // Seed investment types if table is empty
        const invTypeCount = await db.getFirstAsync<{ count: number }>(`SELECT COUNT(*) as count FROM investment_types`);
        if (invTypeCount && invTypeCount.count === 0) {
            const defaultTypes = [
                { name: 'Mutual Fund', icon: '📊', color: '#6C63FF', category: 'equity' },
                { name: 'Stocks', icon: '📈', color: '#10B981', category: 'equity' },
                { name: 'Fixed Deposit', icon: '🏦', color: '#F59E0B', category: 'debt' },
                { name: 'PPF', icon: '🛡️', color: '#3B82F6', category: 'debt' },
                { name: 'NPS', icon: '🏛️', color: '#8B5CF6', category: 'debt' },
                { name: 'Gold', icon: '🥇', color: '#F59E0B', category: 'gold' },
                { name: 'Real Estate', icon: '🏠', color: '#EC4899', category: 'real_estate' },
                { name: 'Crypto', icon: '₿', color: '#F97316', category: 'crypto' },
                { name: 'US Stocks', icon: '🌎', color: '#06B6D4', category: 'equity' },
                { name: 'RD', icon: '💳', color: '#6B7280', category: 'debt' },
            ];

            const statement = await db.prepareAsync(
                `INSERT INTO investment_types (id, name, icon, color, category) VALUES ($id, $name, $icon, $color, $category)`
            );

            try {
                for (const type of defaultTypes) {
                    await statement.executeAsync({
                        $id: Crypto.randomUUID(),
                        $name: type.name,
                        $icon: type.icon,
                        $color: type.color,
                        $category: type.category
                    });
                }
            } finally {
                await statement.finalizeAsync();
            }
        }



    } catch (error) {
        console.error("Error initializing database:", error);
        throw error;
    }
};

export const getCategories = async () => {
    return await db.getAllAsync(`SELECT * FROM categories ORDER BY name ASC`);
};

export const addCategory = async (category: { name: string, icon: string, color: string, monthly_budget?: number }) => {
    const id = Crypto.randomUUID();
    const now = new Date().toISOString();
    await db.runAsync(
        `INSERT INTO categories (id, name, icon, color, monthly_budget, is_custom, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)`,
        id, category.name, category.icon, category.color, category.monthly_budget || 0, 1, now
    );
    return id;
};

export const updateCategory = async (id: string, updates: { name?: string, icon?: string, color?: string, monthly_budget?: number }) => {
    const allowedKeys = ['name', 'icon', 'color', 'monthly_budget'];
    const updateClauses = [];
    const updateValues = [];

    for (const key of allowedKeys) {
        const val = updates[key as keyof typeof updates];
        if (val !== undefined) {
            updateClauses.push(`${key} = ?`);
            updateValues.push(val);
        }
    }

    if (updateClauses.length === 0) return;
    updateValues.push(id);

    await db.runAsync(`UPDATE categories SET ${updateClauses.join(', ')} WHERE id = ?`, ...updateValues);
};

export const deleteCategory = async (id: string) => {
    await db.runAsync(`DELETE FROM categories WHERE id = ?`, id);
};

export const addExpense = async (expense: { amount: number, category_id: string, event_id?: string, note?: string, date: string, is_recurring?: number, recurring_interval?: string, photo_uri?: string }) => {
    const id = Crypto.randomUUID();
    const now = new Date().toISOString();
    await db.runAsync(
        `INSERT INTO expenses (id, amount, category_id, event_id, note, date, is_recurring, recurring_interval, photo_uri, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        id, expense.amount, expense.category_id, expense.event_id || null, expense.note || null, expense.date, expense.is_recurring || 0, expense.recurring_interval || null, expense.photo_uri || null, now
    );
    return id;
};

export const getExpenses = async (month: number, year: number) => {
    const startPattern = `${year}-${String(month).padStart(2, '0')}`;
    return await db.getAllAsync(
        `SELECT * FROM expenses WHERE date LIKE ? ORDER BY date DESC`,
        `%${startPattern}%`
    );
};

export const getAllExpenses = async () => {
    return await db.getAllAsync(`SELECT * FROM expenses ORDER BY date DESC`);
};

export const updateExpense = async (id: string, updates: any) => {
    const keys = Object.keys(updates);
    if (keys.length === 0) return;

    const clauses = keys.map(k => `${k} = ?`);
    const values = keys.map(k => updates[k]);
    values.push(id);

    await db.runAsync(`UPDATE expenses SET ${clauses.join(', ')} WHERE id = ?`, ...values);
};

export const deleteExpense = async (id: string) => {
    await db.runAsync(`DELETE FROM expenses WHERE id = ?`, id);
};

export const addEvent = async (event: { name: string, start_date: string, end_date: string, total_budget?: number, cover_color: string }) => {
    const id = Crypto.randomUUID();
    const now = new Date().toISOString();
    await db.runAsync(
        `INSERT INTO events (id, name, start_date, end_date, total_budget, cover_color, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)`,
        id, event.name, event.start_date, event.end_date, event.total_budget || 0, event.cover_color, now
    );
    return id;
};

export const getEvents = async () => {
    return await db.getAllAsync(`SELECT * FROM events ORDER BY start_date DESC`);
};

export const deleteEvent = async (id: string) => {
    await db.runAsync(`UPDATE expenses SET event_id = NULL WHERE event_id = ?`, id);
    await db.runAsync(`DELETE FROM events WHERE id = ?`, id);
};

export const setMonthlyBudget = async (month: number, year: number, amount: number) => {
    const existing = await db.getFirstAsync<{ id: string }>(`SELECT id FROM budgets WHERE month = ? AND year = ?`, month, year);
    if (existing) {
        await db.runAsync(`UPDATE budgets SET total_budget = ? WHERE id = ?`, amount, existing.id);
    } else {
        const id = Crypto.randomUUID();
        const now = new Date().toISOString();
        await db.runAsync(
            `INSERT INTO budgets (id, month, year, total_budget, created_at) VALUES (?, ?, ?, ?, ?)`,
            id, month, year, amount, now
        );
    }
};

export const getMonthlyBudget = async (month: number, year: number) => {
    return await db.getFirstAsync<{ total_budget: number }>(`SELECT total_budget FROM budgets WHERE month = ? AND year = ?`, month, year);
};

export const deleteAllExpenses = async () => {
    await db.runAsync(`DELETE FROM expenses`);
};

export const deleteAllEvents = async () => {
    await db.runAsync(`DELETE FROM events`);
    await db.runAsync(`UPDATE expenses SET event_id = NULL`);
};

export const resetCategoriesToDefault = async () => {
    await db.runAsync(`DELETE FROM categories`);
    // reseeding is handled in initDatabase, but we can call it manually if needed
    // For now, just deleting triggers the check on next app load, 
    // but let's reseed immediately for better UX
    const defaultCategories = [
        { name: 'Food & Dining', icon: '🍔', color: '#FF6B6B' },
        { name: 'Transport', icon: '🚗', color: '#4ECDC4' },
        { name: 'Entertainment', icon: '🎬', color: '#45B7D1' },
        { name: 'Shopping', icon: '🛍️', color: '#96CEB4' },
        { name: 'Health', icon: '💊', color: '#88D8B0' },
        { name: 'Utilities', icon: '💡', color: '#FFEAA7' },
        { name: 'Travel', icon: '✈️', color: '#DDA0DD' },
        { name: 'Education', icon: '📚', color: '#98D8C8' },
        { name: 'Subscriptions', icon: '📱', color: '#F7DC6F' },
        { name: 'Others', icon: '💰', color: '#AEB6BF' },
    ];

    const now = new Date().toISOString();
    for (const cat of defaultCategories) {
        await db.runAsync(
            `INSERT INTO categories (id, name, icon, color, is_custom, created_at) VALUES (?, ?, ?, ?, ?, ?)`,
            Crypto.randomUUID(), cat.name, cat.icon, cat.color, 0, now
        );
    }
};

export const reassignExpensesCategory = async (oldCategoryId: string, newCategoryId: string) => {
    await db.runAsync(`UPDATE expenses SET category_id = ? WHERE category_id = ?`, newCategoryId, oldCategoryId);
};

export const untagEventExpenses = async (eventId: string) => {
    await db.runAsync(`UPDATE expenses SET event_id = NULL WHERE event_id = ?`, eventId);
};

export const getExpensesByEvent = async (eventId: string) => {
    return await db.getAllAsync(`SELECT * FROM expenses WHERE event_id = ? ORDER BY date DESC`, eventId);
};

export const getAllBudgets = async () => {
    return await db.getAllAsync(`SELECT * FROM budgets`);
};

export const bulkInsertExpenses = async (expenses: any[]) => {
    await db.withTransactionAsync(async () => {
        const statement = await db.prepareAsync(
            `INSERT OR IGNORE INTO expenses (id, amount, category_id, event_id, note, date, is_recurring, recurring_interval, photo_uri, created_at)
             VALUES ($id, $amount, $category_id, $event_id, $note, $date, $is_recurring, $recurring_interval, $photo_uri, $created_at)`
        );
        try {
            for (const exp of expenses) {
                await statement.executeAsync({
                    $id: exp.id,
                    $amount: exp.amount,
                    $category_id: exp.category_id,
                    $event_id: exp.event_id || null,
                    $note: exp.note || null,
                    $date: exp.date,
                    $is_recurring: exp.is_recurring || 0,
                    $recurring_interval: exp.recurring_interval || null,
                    $photo_uri: exp.photo_uri || null,
                    $created_at: exp.created_at || new Date().toISOString()
                });
            }
        } finally {
            await statement.finalizeAsync();
        }
    });
};

export const bulkInsertCategories = async (categories: any[]) => {
    await db.withTransactionAsync(async () => {
        const statement = await db.prepareAsync(
            `INSERT OR IGNORE INTO categories (id, name, icon, color, monthly_budget, is_custom, created_at)
             VALUES ($id, $name, $icon, $color, $monthly_budget, $is_custom, $created_at)`
        );
        try {
            for (const cat of categories) {
                await statement.executeAsync({
                    $id: cat.id,
                    $name: cat.name,
                    $icon: cat.icon,
                    $color: cat.color,
                    $monthly_budget: cat.monthly_budget || 0,
                    $is_custom: cat.is_custom || 0,
                    $created_at: cat.created_at || new Date().toISOString()
                });
            }
        } finally {
            await statement.finalizeAsync();
        }
    });
};

export const bulkInsertEvents = async (events: any[]) => {
    await db.withTransactionAsync(async () => {
        const statement = await db.prepareAsync(
            `INSERT OR IGNORE INTO events (id, name, start_date, end_date, total_budget, cover_color, created_at)
             VALUES ($id, $name, $start_date, $end_date, $total_budget, $cover_color, $created_at)`
        );
        try {
            for (const event of events) {
                await statement.executeAsync({
                    $id: event.id,
                    $name: event.name,
                    $start_date: event.start_date,
                    $end_date: event.end_date,
                    $total_budget: event.total_budget || 0,
                    $cover_color: event.cover_color,
                    $created_at: event.created_at || new Date().toISOString()
                });
            }
        } finally {
            await statement.finalizeAsync();
        }
    });
};

// --- INCOME FUNCTIONS ---

export const getIncomeSources = async () => {
    return await db.getAllAsync(`SELECT * FROM income_sources ORDER BY is_custom ASC, name ASC`);
};

export const addIncomeSource = async (source: { name: string, icon: string, color: string }) => {
    const id = Crypto.randomUUID();
    const now = new Date().toISOString();
    await db.runAsync(
        `INSERT INTO income_sources (id, name, icon, color, is_custom, created_at) VALUES (?, ?, ?, ?, ?, ?)`,
        id, source.name, source.icon, source.color, 1, now
    );
    return id;
};

export const getIncome = async (month: number, year: number) => {
    const startPattern = `${year}-${String(month).padStart(2, '0')}`;
    return await db.getAllAsync(
        `SELECT * FROM income WHERE date LIKE ? ORDER BY date DESC`,
        `%${startPattern}%`
    );
};

export const getAllIncome = async () => {
    return await db.getAllAsync(`SELECT * FROM income ORDER BY date DESC`);
};

export const addIncome = async (income: { amount: number, source_id: string, date: string, note?: string, is_recurring?: number, recurring_interval?: string }) => {
    const id = Crypto.randomUUID();
    const now = new Date().toISOString();
    await db.runAsync(
        `INSERT INTO income (id, amount, source_id, date, note, is_recurring, recurring_interval, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        id, income.amount, income.source_id, income.date, income.note || null, income.is_recurring || 0, income.recurring_interval || null, now
    );
    return id;
};

export const updateIncome = async (id: string, updates: any) => {
    const keys = Object.keys(updates);
    if (keys.length === 0) return;
    const clauses = keys.map(k => `${k} = ?`);
    const values = keys.map(k => updates[k]);
    values.push(id);
    await db.runAsync(`UPDATE income SET ${clauses.join(', ')} WHERE id = ?`, ...values);
};

export const deleteIncome = async (id: string) => {
    await db.runAsync(`DELETE FROM income WHERE id = ?`, id);
};

// --- SAVINGS FUNCTIONS ---

export const getSavingsGoals = async () => {
    return await db.getAllAsync(`SELECT * FROM savings_goals ORDER BY is_completed ASC, created_at DESC`);
};

export const addSavingsGoal = async (goal: { name: string, icon: string, color: string, target_amount: number, target_date?: string }) => {
    const id = Crypto.randomUUID();
    const now = new Date().toISOString();
    await db.runAsync(
        `INSERT INTO savings_goals (id, name, icon, color, target_amount, saved_amount, target_date, is_completed, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        id, goal.name, goal.icon, goal.color, goal.target_amount, 0, goal.target_date || null, 0, now
    );
    return id;
};

export const updateSavingsGoal = async (id: string, updates: any) => {
    const keys = Object.keys(updates);
    if (keys.length === 0) return;
    const clauses = keys.map(k => `${k} = ?`);
    const values = keys.map(k => updates[k]);
    values.push(id);
    await db.runAsync(`UPDATE savings_goals SET ${clauses.join(', ')} WHERE id = ?`, ...values);
};

export const deleteSavingsGoal = async (id: string) => {
    await db.withTransactionAsync(async () => {
        await db.runAsync(`DELETE FROM savings_contributions WHERE goal_id = ?`, id);
        await db.runAsync(`DELETE FROM savings_goals WHERE id = ?`, id);
    });
};

export const addSavingsContribution = async (contribution: { goal_id: string, amount: number, date: string, note?: string }) => {
    const id = Crypto.randomUUID();
    const now = new Date().toISOString();
    await db.withTransactionAsync(async () => {
        await db.runAsync(
            `INSERT INTO savings_contributions (id, goal_id, amount, date, note, created_at)
             VALUES (?, ?, ?, ?, ?, ?)`,
            id, contribution.goal_id, contribution.amount, contribution.date, contribution.note || null, now
        );
        await db.runAsync(
            `UPDATE savings_goals SET saved_amount = saved_amount + ? WHERE id = ?`,
            contribution.amount, contribution.goal_id
        );
    });
    return id;
};

export const getGoalContributions = async (goalId: string) => {
    return await db.getAllAsync(`SELECT * FROM savings_contributions WHERE goal_id = ? ORDER BY date DESC`, goalId);
};

export const deleteContribution = async (id: string) => {
    const contribution = await db.getFirstAsync<{ goal_id: string, amount: number }>(`SELECT goal_id, amount FROM savings_contributions WHERE id = ?`, id);
    if (contribution) {
        await db.withTransactionAsync(async () => {
            await db.runAsync(`DELETE FROM savings_contributions WHERE id = ?`, id);
            await db.runAsync(
                `UPDATE savings_goals SET saved_amount = saved_amount - ? WHERE id = ?`,
                contribution.amount, contribution.goal_id
            );
        });
    }
};

// --- INVESTMENT FUNCTIONS ---

export const getInvestments = async () => {
    return await db.getAllAsync(`SELECT * FROM investments ORDER BY created_at DESC`);
};

export const addInvestment = async (inv: { name: string, type_id: string, invested_amount: number, current_value: number, purchase_date: string, maturity_date?: string, expected_return?: number, institution?: string, notes?: string }) => {
    const id = Crypto.randomUUID();
    const now = new Date().toISOString();
    await db.runAsync(
        `INSERT INTO investments (id, name, type_id, invested_amount, current_value, purchase_date, maturity_date, expected_return, institution, notes, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        id, inv.name, inv.type_id, inv.invested_amount, inv.current_value, inv.purchase_date, inv.maturity_date || null, inv.expected_return || 0, inv.institution || null, inv.notes || null, now
    );
    return id;
};

export const updateInvestment = async (id: string, updates: any) => {
    const keys = Object.keys(updates);
    if (keys.length === 0) return;
    const clauses = keys.map(k => `${k} = ?`);
    const values = keys.map(k => updates[k]);
    values.push(id);
    await db.runAsync(`UPDATE investments SET ${clauses.join(', ')} WHERE id = ?`, ...values);
};

export const deleteInvestment = async (id: string) => {
    await db.runAsync(`DELETE FROM investments WHERE id = ?`, id);
};

export const getInvestmentTypes = async () => {
    return await db.getAllAsync(`SELECT * FROM investment_types ORDER BY name ASC`);
};

// --- SIP FUNCTIONS ---

export const getSIPs = async () => {
    return await db.getAllAsync(`SELECT * FROM sips ORDER BY created_at DESC`);
};

export const addSIP = async (sip: { fund_name: string, monthly_amount: number, start_date: string, next_date: string, expected_return?: number }) => {
    const id = Crypto.randomUUID();
    const now = new Date().toISOString();
    await db.runAsync(
        `INSERT INTO sips (id, fund_name, monthly_amount, start_date, next_date, expected_return, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        id, sip.fund_name, sip.monthly_amount, sip.start_date, sip.next_date, sip.expected_return || 12, now
    );
    return id;
};

export const updateSIP = async (id: string, updates: any) => {
    const keys = Object.keys(updates);
    if (keys.length === 0) return;
    const clauses = keys.map(k => `${k} = ?`);
    const values = keys.map(k => updates[k]);
    values.push(id);
    await db.runAsync(`UPDATE sips SET ${clauses.join(', ')} WHERE id = ?`, ...values);
};

export const deleteSIP = async (id: string) => {
    await db.runAsync(`DELETE FROM sips WHERE id = ?`, id);
};

// --- FIXED DEPOSIT FUNCTIONS ---

export const getFixedDeposits = async () => {
    return await db.getAllAsync(`SELECT * FROM fixed_deposits ORDER BY maturity_date ASC`);
};

export const addFixedDeposit = async (fd: { bank_name: string, principal: number, interest_rate: number, start_date: string, maturity_date: string, maturity_amount: number, interest_frequency?: string }) => {
    const id = Crypto.randomUUID();
    const now = new Date().toISOString();
    await db.runAsync(
        `INSERT INTO fixed_deposits (id, bank_name, principal, interest_rate, start_date, maturity_date, maturity_amount, interest_frequency, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        id, fd.bank_name, fd.principal, fd.interest_rate, fd.start_date, fd.maturity_date, fd.maturity_amount, fd.interest_frequency || 'on_maturity', now
    );
    return id;
};

export const updateFixedDeposit = async (id: string, updates: any) => {
    const keys = Object.keys(updates);
    if (keys.length === 0) return;
    const clauses = keys.map(k => `${k} = ?`);
    const values = keys.map(k => updates[k]);
    values.push(id);
    await db.runAsync(`UPDATE fixed_deposits SET ${clauses.join(', ')} WHERE id = ?`, ...values);
};

export const deleteFixedDeposit = async (id: string) => {
    await db.runAsync(`DELETE FROM fixed_deposits WHERE id = ?`, id);
};

// --- ASSET/LIABILITY FUNCTIONS ---

export const getAssets = async () => {
    return await db.getAllAsync(`SELECT * FROM assets ORDER BY created_at DESC`);
};

export const addAsset = async (asset: { name: string, type: string, current_value: number, purchase_value?: number, purchase_date?: string, notes?: string }) => {
    const id = Crypto.randomUUID();
    const now = new Date().toISOString();
    await db.runAsync(
        `INSERT INTO assets (id, name, type, current_value, purchase_value, purchase_date, notes, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        id, asset.name, asset.type, asset.current_value, asset.purchase_value || 0, asset.purchase_date || null, asset.notes || null, now
    );
    return id;
};

export const updateAsset = async (id: string, updates: any) => {
    const keys = Object.keys(updates);
    if (keys.length === 0) return;
    const clauses = keys.map(k => `${k} = ?`);
    const values = keys.map(k => updates[k]);
    values.push(id);
    await db.runAsync(`UPDATE assets SET ${clauses.join(', ')} WHERE id = ?`, ...values);
};

export const deleteAsset = async (id: string) => {
    await db.runAsync(`DELETE FROM assets WHERE id = ?`, id);
};

export const getLiabilities = async () => {
    return await db.getAllAsync(`SELECT * FROM liabilities ORDER BY created_at DESC`);
};

export const addLiability = async (lia: { name: string, type: string, total_amount: number, remaining_amount: number, monthly_payment?: number, interest_rate?: number, due_date?: string }) => {
    const id = Crypto.randomUUID();
    const now = new Date().toISOString();
    await db.runAsync(
        `INSERT INTO liabilities (id, name, type, total_amount, remaining_amount, monthly_payment, interest_rate, due_date, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        id, lia.name, lia.type, lia.total_amount, lia.remaining_amount, lia.monthly_payment || 0, lia.interest_rate || 0, lia.due_date || null, now
    );
    return id;
};

export const updateLiability = async (id: string, updates: any) => {
    const keys = Object.keys(updates);
    if (keys.length === 0) return;
    const clauses = keys.map(k => `${k} = ?`);
    const values = keys.map(k => updates[k]);
    values.push(id);
    await db.runAsync(`UPDATE liabilities SET ${clauses.join(', ')} WHERE id = ?`, ...values);
};

export const deleteLiability = async (id: string) => {
    await db.runAsync(`DELETE FROM liabilities WHERE id = ?`, id);
};

// --- NET WORTH FUNCTIONS ---

export const saveNetWorthSnapshot = async (month: number, year: number, totalAssets: number, totalLiabilities: number, netWorth: number) => {
    const id = Crypto.randomUUID();
    const now = new Date().toISOString();
    await db.runAsync(
        `INSERT INTO net_worth_history (id, month, year, total_assets, total_liabilities, net_worth, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        id, month, year, totalAssets, totalLiabilities, netWorth, now
    );
    return id;
};

export const getNetWorthHistory = async () => {
    return await db.getAllAsync(`SELECT * FROM net_worth_history ORDER BY year DESC, month DESC`);
};

// --- TAX FUNCTIONS ---

export const getTaxInvestments = async (financialYear: string) => {
    return await db.getAllAsync(`SELECT * FROM tax_investments WHERE financial_year = ?`, financialYear);
};

export const addTaxInvestment = async (tax: { investment_id: string, section: string, financial_year: string, amount: number }) => {
    const id = Crypto.randomUUID();
    const now = new Date().toISOString();
    await db.runAsync(
        `INSERT INTO tax_investments (id, investment_id, section, financial_year, amount, created_at)
         VALUES (?, ?, ?, ?, ?, ?)`,
        id, tax.investment_id, tax.section, tax.financial_year, tax.amount, now
    );
    return id;
};

export const deleteTaxInvestment = async (id: string) => {
    await db.runAsync(`DELETE FROM tax_investments WHERE id = ?`, id);
};
