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

            CREATE INDEX IF NOT EXISTS idx_expenses_date ON expenses(date);
            CREATE INDEX IF NOT EXISTS idx_expenses_category ON expenses(category_id);
            CREATE INDEX IF NOT EXISTS idx_expenses_event ON expenses(event_id);
        `);

        // Seed default categories if the table is empty
        const countResult = await db.getFirstAsync<{ count: number }>(`SELECT COUNT(*) as count FROM categories`);
        if (countResult && countResult.count === 0) {
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
