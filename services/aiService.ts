import { GoogleGenerativeAI } from '@google/generative-ai';
import { InsightReport, ChatMessage, ExpenseContext } from '../types';
import { useExpenseStore } from '../store/expenseStore';
import { useCategoryStore } from '../store/categoryStore';
import { useEventStore } from '../store/eventStore';
import { useSettingsStore } from '../store/settingsStore';
import { getMonthName } from '../utils/analyticsHelpers';

const getGeminiClient = () => {
    const apiKey = process.env.EXPO_PUBLIC_GEMINI_API_KEY;
    if (!apiKey || apiKey === 'your_key_here') {
        throw new Error('MISSING_API_KEY');
    }
    return new GoogleGenerativeAI(apiKey);
};

export async function generateMonthlyInsights(expenseContext: ExpenseContext): Promise<InsightReport> {
    const genAI = getGeminiClient();
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    const prompt = `
You are a personal finance advisor. Analyze this user's expense data and respond in EXACTLY this format.
Use these exact section headers on their own lines. Do not use markdown formatting like ** or ##.

SUMMARY:
[2-3 sentences giving an overview of their spending. Mention the total amount and overall assessment.]

WARNING AREAS:
[2-3 sentences identifying categories where they are overspending. Be specific with category names and amounts from the data.]

ACTIONABLE TIPS:
1. [First specific tip]
2. [Second specific tip]
3. [Third specific tip]
4. [Fourth specific tip]

SAVINGS GOAL:
[1-2 sentences recommending a realistic savings target for next month. Include a specific amount in ${expenseContext.currencySymbol}.]

Keep total response under 300 words. Be friendly, specific, and use the actual numbers from the data below.

USER EXPENSE DATA:
${JSON.stringify(expenseContext, null, 2)}
    `;

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    return parseInsightResponse(text);
}

export async function chatWithAdvisor(
    chatHistory: ChatMessage[],
    newMessage: string,
    expenseContext: ExpenseContext
): Promise<string> {
    const genAI = getGeminiClient();
    const model = genAI.getGenerativeModel({
        model: 'gemini-2.5-flash',
        systemInstruction: `You are Spendly AI, a friendly personal finance advisor. 
You have access to the user's expense data below. Answer questions helpfully using their actual spending numbers. 
Keep responses concise (2-4 sentences). Be encouraging but honest. Do not use markdown formatting.

USER EXPENSE DATA:
${JSON.stringify(expenseContext, null, 2)}`
    });

    const geminiHistory = chatHistory
        .filter(msg => msg.role !== 'welcome')
        .map(msg => ({
            role: (msg.isUser ? 'user' : 'model') as 'user' | 'model',
            parts: [{ text: msg.content }]
        }));

    const chat = model.startChat({ history: geminiHistory });
    const result = await chat.sendMessage(newMessage);
    return result.response.text();
}

function parseInsightResponse(text: string): InsightReport {
    const sections = {
        summary: '',
        warningAreas: '',
        actionableTips: '',
        savingsGoal: ''
    };

    const summaryMatch = text.match(/SUMMARY:([\s\S]*?)(?=WARNING AREAS:|$)/i);
    const warningMatch = text.match(/WARNING AREAS:([\s\S]*?)(?=ACTIONABLE TIPS:|$)/i);
    const tipsMatch = text.match(/ACTIONABLE TIPS:([\s\S]*?)(?=SAVINGS GOAL:|$)/i);
    const goalMatch = text.match(/SAVINGS GOAL:([\s\S]*?)$/i);

    sections.summary = summaryMatch?.[1]?.trim() ?? text;
    sections.warningAreas = warningMatch?.[1]?.trim() ?? '';
    sections.actionableTips = tipsMatch?.[1]?.trim() ?? '';
    sections.savingsGoal = goalMatch?.[1]?.trim() ?? '';

    if (!sections.warningAreas && !sections.actionableTips && !sections.savingsGoal) {
        sections.summary = text;
    }

    return sections;
}

export function buildExpenseContext(month: number, year: number): ExpenseContext {
    const { expenses } = useExpenseStore.getState();
    const { categories } = useCategoryStore.getState();
    const { events } = useEventStore.getState();
    const { currency, currencySymbol, monthlyBudget } = useSettingsStore.getState();

    const thisMonthExpenses = expenses.filter(e => {
        const d = new Date(e.date);
        return d.getMonth() + 1 === month && d.getFullYear() === year;
    });

    const lastMonth = month === 1 ? 12 : month - 1;
    const lastYear = month === 1 ? year - 1 : year;
    const lastMonthExpenses = expenses.filter(e => {
        const d = new Date(e.date);
        return d.getMonth() + 1 === lastMonth && d.getFullYear() === lastYear;
    });

    const totalSpent = thisMonthExpenses.reduce((sum, e) => sum + e.amount, 0);
    const lastMonthTotal = lastMonthExpenses.reduce((sum, e) => sum + e.amount, 0);
    const changePercent = lastMonthTotal > 0
        ? Math.round(((totalSpent - lastMonthTotal) / lastMonthTotal) * 100)
        : 0;

    const categoryMap: Record<string, { name: string; amount: number; count: number }> = {};
    for (const expense of thisMonthExpenses) {
        const cat = categories.find(c => c.id === expense.category_id);
        if (!cat) continue;
        if (!categoryMap[cat.id]) categoryMap[cat.id] = { name: cat.name, amount: 0, count: 0 };
        categoryMap[cat.id].amount += expense.amount;
        categoryMap[cat.id].count += 1;
    }

    const categoryBreakdown = Object.values(categoryMap)
        .map(c => ({
            ...c,
            amount: Math.round(c.amount),
            percentOfTotal: totalSpent > 0 ? Math.round((c.amount / totalSpent) * 100) : 0
        }))
        .sort((a, b) => b.amount - a.amount);

    const topExpenses = [...thisMonthExpenses]
        .sort((a, b) => b.amount - a.amount)
        .slice(0, 5)
        .map(e => ({
            amount: e.amount,
            category: categories.find(c => c.id === e.category_id)?.name ?? 'Unknown',
            note: e.note ?? '',
            date: e.date
        }));

    const today = new Date();
    const activeEvents = events
        .filter(ev => new Date(ev.end_date) >= today)
        .map(ev => {
            const eventExpenses = expenses.filter(e => e.event_id === ev.id);
            return {
                name: ev.name,
                totalSpent: Math.round(eventExpenses.reduce((s, e) => s + e.amount, 0)),
                budget: ev.total_budget
            };
        });

    const recurringExpenses = thisMonthExpenses
        .filter(e => e.is_recurring)
        .map(e => ({
            category: categories.find(c => c.id === e.category_id)?.name ?? 'Unknown',
            amount: e.amount,
            interval: e.recurring_interval ?? 'monthly'
        }));

    return {
        analysisMonth: `${getMonthName(month)} ${year}`,
        totalSpent: Math.round(totalSpent),
        transactionCount: thisMonthExpenses.length,
        monthlyBudget,
        budgetUsedPercent: monthlyBudget > 0 ? Math.round((totalSpent / monthlyBudget) * 100) : 0,
        currency,
        currencySymbol,
        categoryBreakdown,
        comparedToLastMonth: {
            lastMonthTotal: Math.round(lastMonthTotal),
            changeAmount: Math.round(totalSpent - lastMonthTotal),
            changePercent,
            direction: totalSpent >= lastMonthTotal ? 'increase' : 'decrease'
        },
        topExpenses,
        activeEvents,
        recurringExpenses
    };
}

export function handleGeminiError(error: any): string {
    const message = error?.message ?? '';
    if (message === 'MISSING_API_KEY') {
        return 'Please add your Gemini API key to the .env file as EXPO_PUBLIC_GEMINI_API_KEY';
    }
    if (message.includes('API_KEY_INVALID') || message.includes('401')) {
        return 'Invalid API key. Please check your EXPO_PUBLIC_GEMINI_API_KEY in the .env file.';
    }
    if (message.includes('RATE_LIMIT') || message.includes('429')) {
        return 'Too many requests. Please wait a moment and try again.';
    }
    if (message.includes('SAFETY')) {
        return 'The AI could not process this request. Please try rephrasing.';
    }

    // Fallback for general errors (network or otherwise)
    // Often when testing locally Expo throws weird network warnings under the hood
    // that get caught aggressively by string matching.
    return `Connection issue: ${message.slice(0, 50)}... Please try again.`;
}
