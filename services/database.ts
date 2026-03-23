import { supabase } from './supabase'
import { useAuthStore } from '../store/authStore'

// ============================================
// HELPERS
// ============================================
function getUserId(): string {
  const id = useAuthStore.getState().user?.id
  if (!id) throw new Error('User not authenticated')
  return id
}

function handleError(error: any, fn: string): never {
  console.error(`[DB Error] ${fn}:`, error?.message ?? error)
  throw new Error(error?.message ?? `Database error in ${fn}`)
}

// ============================================
// INIT — no-op, tables exist in Supabase
// ============================================
export async function initDatabase(): Promise<void> {
  try {
    await supabase.from('categories').select('id').limit(1)
    console.log('[DB] Supabase connection verified')
  } catch (e) {
    console.warn('[DB] Supabase connection warning:', e)
  }
}

// ============================================
// CATEGORIES
// ============================================
export async function getCategories() {
  const userId = getUserId()
  let { data, error } = await supabase
    .from('categories')
    .select('*')
    .eq('user_id', userId)
    .order('is_custom', { ascending: true })
    .order('created_at', { ascending: true })
  
  if (error) handleError(error, 'getCategories')

  // On-the-fly seeding if empty
  if (!data || data.length === 0) {
    console.log('[DB] No categories found, waiting for trigger...')
    // Wait 1 second to allow handle_new_user trigger to finish
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // Check again
    const retry = await supabase
      .from('categories')
      .select('*')
      .eq('user_id', userId)
      .order('is_custom', { ascending: true })
      .order('created_at', { ascending: true })
    
    if (retry.data && retry.data.length > 0) {
      console.log('[DB] Categories found after wait')
      return retry.data
    }

    console.log('[DB] Still no categories, manual seed...')
    await supabase.rpc('seed_default_categories', { p_user_id: userId })
    
    // Final fetch
    const final = await supabase
      .from('categories')
      .select('*')
      .eq('user_id', userId)
      .order('is_custom', { ascending: true })
      .order('created_at', { ascending: true })
    if (final.error) handleError(final.error, 'getCategories (final)')
    data = final.data
  }

  return data ?? []
}

export async function addCategory(category: any) {
  const userId = getUserId()
  const { data, error } = await supabase
    .from('categories')
    .insert({ ...category, user_id: userId })
    .select()
    .single()
  if (error) handleError(error, 'addCategory')
  return data
}

export async function updateCategory(id: string, updates: any) {
  const userId = getUserId()
  const { error } = await supabase
    .from('categories')
    .update(updates)
    .eq('id', id)
    .eq('user_id', userId)
  if (error) handleError(error, 'updateCategory')
}

export async function deleteCategory(id: string) {
  const userId = getUserId()
  const { error } = await supabase
    .from('categories')
    .delete()
    .eq('id', id)
    .eq('user_id', userId)
  if (error) handleError(error, 'deleteCategory')
}

export async function reassignExpensesCategory(
  oldCategoryId: string,
  newCategoryId: string
) {
  const userId = getUserId()
  const { error } = await supabase
    .from('expenses')
    .update({ category_id: newCategoryId })
    .eq('category_id', oldCategoryId)
    .eq('user_id', userId)
  if (error) handleError(error, 'reassignExpensesCategory')
}

// ============================================
// EXPENSES
// ============================================
export async function getAllExpenses() {
  const userId = getUserId()
  const { data, error } = await supabase
    .from('expenses')
    .select('*')
    .eq('user_id', userId)
    .order('date', { ascending: false })
    .order('created_at', { ascending: false })
  if (error) handleError(error, 'getAllExpenses')
  return data ?? []
}

export async function getExpenses(month: number, year: number) {
  const userId = getUserId()
  const startDate = `${year}-${String(month).padStart(2, '0')}-01`
  const lastDay = new Date(year, month, 0).getDate()
  const endDate = `${year}-${String(month).padStart(2, '0')}-${lastDay}`
  const { data, error } = await supabase
    .from('expenses')
    .select('*')
    .eq('user_id', userId)
    .gte('date', startDate)
    .lte('date', endDate)
    .order('date', { ascending: false })
    .order('created_at', { ascending: false })
  if (error) handleError(error, 'getExpenses')
  return data ?? []
}

export async function addExpense(expense: any) {
  const userId = getUserId()
  const { data, error } = await supabase
    .from('expenses')
    .insert({ ...expense, user_id: userId })
    .select()
    .single()
  if (error) handleError(error, 'addExpense')
  return data
}

export async function updateExpense(id: string, updates: any) {
  const userId = getUserId()
  const { error } = await supabase
    .from('expenses')
    .update(updates)
    .eq('id', id)
    .eq('user_id', userId)
  if (error) handleError(error, 'updateExpense')
}

export async function deleteExpense(id: string) {
  const userId = getUserId()
  const { error } = await supabase
    .from('expenses')
    .delete()
    .eq('id', id)
    .eq('user_id', userId)
  if (error) handleError(error, 'deleteExpense')
}

export async function untagEventExpenses(eventId: string) {
  const userId = getUserId()
  const { error } = await supabase
    .from('expenses')
    .update({ event_id: null })
    .eq('event_id', eventId)
    .eq('user_id', userId)
  if (error) handleError(error, 'untagEventExpenses')
}

export async function bulkInsertExpenses(expenses: any[]) {
  const userId = getUserId()
  const rows = expenses.map(e => ({ ...e, user_id: userId }))
  const { error } = await supabase
    .from('expenses')
    .upsert(rows, { onConflict: 'id', ignoreDuplicates: true })
  if (error) handleError(error, 'bulkInsertExpenses')
}

// ============================================
// EVENTS
// ============================================
export async function getEvents() {
  const userId = getUserId()
  const { data, error } = await supabase
    .from('events')
    .select('*')
    .eq('user_id', userId)
    .order('start_date', { ascending: false })
  if (error) handleError(error, 'getEvents')
  return data ?? []
}

export async function addEvent(event: any) {
  const userId = getUserId()
  const { data, error } = await supabase
    .from('events')
    .insert({ ...event, user_id: userId })
    .select()
    .single()
  if (error) handleError(error, 'addEvent')
  return data
}

export async function deleteEvent(id: string) {
  const userId = getUserId()
  const { error } = await supabase
    .from('events')
    .delete()
    .eq('id', id)
    .eq('user_id', userId)
  if (error) handleError(error, 'deleteEvent')
}

// ============================================
// BUDGETS
// ============================================
export async function getMonthlyBudget(month: number, year: number) {
  const userId = getUserId()
  const { data, error } = await supabase
    .from('budgets')
    .select('*')
    .eq('user_id', userId)
    .eq('month', month)
    .eq('year', year)
    .maybeSingle()
  if (error) handleError(error, 'getMonthlyBudget')
  return data ?? null
}

export async function setMonthlyBudget(
  month: number,
  year: number,
  amount: number
) {
  const userId = getUserId()
  const { error } = await supabase
    .from('budgets')
    .upsert(
      { user_id: userId, month, year, total_budget: amount },
      { onConflict: 'user_id,month,year' }
    )
  if (error) handleError(error, 'setMonthlyBudget')
}

// ============================================
// INCOME SOURCES
// ============================================
export async function getIncomeSources() {
  const userId = getUserId()
  let { data, error } = await supabase
    .from('income_sources')
    .select('*')
    .eq('user_id', userId)
    .order('is_custom', { ascending: true })
    .order('created_at', { ascending: true })
  
  if (error) handleError(error, 'getIncomeSources')

  // On-the-fly seeding if empty
  if (!data || data.length === 0) {
    console.log('[DB] No income sources found, waiting for trigger...')
    // Wait 1 second to allow handle_new_user trigger to finish
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // Check again
    const retry = await supabase
      .from('income_sources')
      .select('*')
      .eq('user_id', userId)
      .order('is_custom', { ascending: true })
      .order('created_at', { ascending: true })
    
    if (retry.data && retry.data.length > 0) {
      console.log('[DB] Income sources found after wait')
      return retry.data
    }

    console.log('[DB] Still no income sources, manual seed...')
    await supabase.rpc('seed_default_income_sources', { p_user_id: userId })
    
    // Final fetch
    const final = await supabase
      .from('income_sources')
      .select('*')
      .eq('user_id', userId)
      .order('is_custom', { ascending: true })
      .order('created_at', { ascending: true })
    if (final.error) handleError(final.error, 'getIncomeSources (final)')
    data = final.data
  }

  return data ?? []
}

export async function addIncomeSource(source: any) {
  const userId = getUserId()
  const { data, error } = await supabase
    .from('income_sources')
    .insert({ ...source, user_id: userId })
    .select()
    .single()
  if (error) handleError(error, 'addIncomeSource')
  return data
}

// ============================================
// INCOME
// ============================================
export async function getAllIncome() {
  const userId = getUserId()
  const { data, error } = await supabase
    .from('income')
    .select('*')
    .eq('user_id', userId)
    .order('date', { ascending: false })
  if (error) handleError(error, 'getAllIncome')
  return data ?? []
}

export async function getIncome(month: number, year: number) {
  const userId = getUserId()
  const startDate = `${year}-${String(month).padStart(2, '0')}-01`
  const lastDay = new Date(year, month, 0).getDate()
  const endDate = `${year}-${String(month).padStart(2, '0')}-${lastDay}`
  const { data, error } = await supabase
    .from('income')
    .select('*')
    .eq('user_id', userId)
    .gte('date', startDate)
    .lte('date', endDate)
    .order('date', { ascending: false })
  if (error) handleError(error, 'getIncome')
  return data ?? []
}

export async function addIncome(income: any) {
  const userId = getUserId()
  const { data, error } = await supabase
    .from('income')
    .insert({ ...income, user_id: userId })
    .select()
    .single()
  if (error) handleError(error, 'addIncome')
  return data
}

export async function updateIncome(id: string, updates: any) {
  const userId = getUserId()
  const { error } = await supabase
    .from('income')
    .update(updates)
    .eq('id', id)
    .eq('user_id', userId)
  if (error) handleError(error, 'updateIncome')
}

export async function deleteIncome(id: string) {
  const userId = getUserId()
  const { error } = await supabase
    .from('income')
    .delete()
    .eq('id', id)
    .eq('user_id', userId)
  if (error) handleError(error, 'deleteIncome')
}

// ============================================
// SAVINGS GOALS
// ============================================
export async function getSavingsGoals() {
  const userId = getUserId()
  const { data, error } = await supabase
    .from('savings_goals')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
  if (error) handleError(error, 'getSavingsGoals')
  return data ?? []
}

export async function addSavingsGoal(goal: any) {
  const userId = getUserId()
  const { data, error } = await supabase
    .from('savings_goals')
    .insert({ ...goal, user_id: userId })
    .select()
    .single()
  if (error) handleError(error, 'addSavingsGoal')
  return data
}

export async function updateSavingsGoal(id: string, updates: any) {
  const userId = getUserId()
  const { error } = await supabase
    .from('savings_goals')
    .update(updates)
    .eq('id', id)
    .eq('user_id', userId)
  if (error) handleError(error, 'updateSavingsGoal')
}

export async function deleteSavingsGoal(id: string) {
  const userId = getUserId()
  const { error } = await supabase
    .from('savings_goals')
    .delete()
    .eq('id', id)
    .eq('user_id', userId)
  if (error) handleError(error, 'deleteSavingsGoal')
}

export async function addSavingsContribution(contribution: any) {
  const userId = getUserId()
  const { data, error } = await supabase
    .from('savings_contributions')
    .insert({ ...contribution, user_id: userId })
    .select()
    .single()
  if (error) handleError(error, 'addSavingsContribution')
  return data
}

export async function getGoalContributions(goalId: string) {
  const userId = getUserId()
  const { data, error } = await supabase
    .from('savings_contributions')
    .select('*')
    .eq('goal_id', goalId)
    .eq('user_id', userId)
    .order('date', { ascending: false })
  if (error) handleError(error, 'getGoalContributions')
  return data ?? []
}

export async function deleteContribution(id: string) {
  const userId = getUserId()
  const { error } = await supabase
    .from('savings_contributions')
    .delete()
    .eq('id', id)
    .eq('user_id', userId)
  if (error) handleError(error, 'deleteContribution')
}

// ============================================
// INVESTMENTS
// ============================================
export async function getInvestmentTypes() {
  const { data, error } = await supabase
    .from('investment_types')
    .select('*')
    .order('name', { ascending: true })
  if (error) handleError(error, 'getInvestmentTypes')
  return data ?? []
}

export async function getInvestments() {
  const userId = getUserId()
  const { data, error } = await supabase
    .from('investments')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
  if (error) handleError(error, 'getInvestments')
  return data ?? []
}

export async function addInvestment(investment: any) {
  const userId = getUserId()
  const { data, error } = await supabase
    .from('investments')
    .insert({ ...investment, user_id: userId })
    .select()
    .single()
  if (error) handleError(error, 'addInvestment')
  return data
}

export async function updateInvestment(id: string, updates: any) {
  const userId = getUserId()
  const { error } = await supabase
    .from('investments')
    .update(updates)
    .eq('id', id)
    .eq('user_id', userId)
  if (error) handleError(error, 'updateInvestment')
}

export async function deleteInvestment(id: string) {
  const userId = getUserId()
  const { error } = await supabase
    .from('investments')
    .delete()
    .eq('id', id)
    .eq('user_id', userId)
  if (error) handleError(error, 'deleteInvestment')
}

// ============================================
// SIPS
// ============================================
export async function getSIPs() {
  const userId = getUserId()
  const { data, error } = await supabase
    .from('sips')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
  if (error) handleError(error, 'getSIPs')
  return data ?? []
}

export async function addSIP(sip: any) {
  const userId = getUserId()
  const { data, error } = await supabase
    .from('sips')
    .insert({ ...sip, user_id: userId })
    .select()
    .single()
  if (error) handleError(error, 'addSIP')
  return data
}

export async function updateSIP(id: string, updates: any) {
  const userId = getUserId()
  const { error } = await supabase
    .from('sips')
    .update(updates)
    .eq('id', id)
    .eq('user_id', userId)
  if (error) handleError(error, 'updateSIP')
}

export async function deleteSIP(id: string) {
  const userId = getUserId()
  const { error } = await supabase
    .from('sips')
    .delete()
    .eq('id', id)
    .eq('user_id', userId)
  if (error) handleError(error, 'deleteSIP')
}

// ============================================
// FIXED DEPOSITS
// ============================================
export async function getFixedDeposits() {
  const userId = getUserId()
  const { data, error } = await supabase
    .from('fixed_deposits')
    .select('*')
    .eq('user_id', userId)
    .order('maturity_date', { ascending: true })
  if (error) handleError(error, 'getFixedDeposits')
  return data ?? []
}

export async function addFixedDeposit(fd: any) {
  const userId = getUserId()
  const { data, error } = await supabase
    .from('fixed_deposits')
    .insert({ ...fd, user_id: userId })
    .select()
    .single()
  if (error) handleError(error, 'addFixedDeposit')
  return data
}

export async function updateFixedDeposit(id: string, updates: any) {
  const userId = getUserId()
  const { error } = await supabase
    .from('fixed_deposits')
    .update(updates)
    .eq('id', id)
    .eq('user_id', userId)
  if (error) handleError(error, 'updateFixedDeposit')
}

export async function deleteFixedDeposit(id: string) {
  const userId = getUserId()
  const { error } = await supabase
    .from('fixed_deposits')
    .delete()
    .eq('id', id)
    .eq('user_id', userId)
  if (error) handleError(error, 'deleteFixedDeposit')
}

// ============================================
// ASSETS
// ============================================
export async function getAssets() {
  const userId = getUserId()
  const { data, error } = await supabase
    .from('assets')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
  if (error) handleError(error, 'getAssets')
  return data ?? []
}

export async function addAsset(asset: any) {
  const userId = getUserId()
  const { data, error } = await supabase
    .from('assets')
    .insert({ ...asset, user_id: userId })
    .select()
    .single()
  if (error) handleError(error, 'addAsset')
  return data
}

export async function updateAsset(id: string, updates: any) {
  const userId = getUserId()
  const { error } = await supabase
    .from('assets')
    .update(updates)
    .eq('id', id)
    .eq('user_id', userId)
  if (error) handleError(error, 'updateAsset')
}

export async function deleteAsset(id: string) {
  const userId = getUserId()
  const { error } = await supabase
    .from('assets')
    .delete()
    .eq('id', id)
    .eq('user_id', userId)
  if (error) handleError(error, 'deleteAsset')
}

// ============================================
// LIABILITIES
// ============================================
export async function getLiabilities() {
  const userId = getUserId()
  const { data, error } = await supabase
    .from('liabilities')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
  if (error) handleError(error, 'getLiabilities')
  return data ?? []
}

export async function addLiability(liability: any) {
  const userId = getUserId()
  const { data, error } = await supabase
    .from('liabilities')
    .insert({ ...liability, user_id: userId })
    .select()
    .single()
  if (error) handleError(error, 'addLiability')
  return data
}

export async function updateLiability(id: string, updates: any) {
  const userId = getUserId()
  const { error } = await supabase
    .from('liabilities')
    .update(updates)
    .eq('id', id)
    .eq('user_id', userId)
  if (error) handleError(error, 'updateLiability')
}

export async function deleteLiability(id: string) {
  const userId = getUserId()
  const { error } = await supabase
    .from('liabilities')
    .delete()
    .eq('id', id)
    .eq('user_id', userId)
  if (error) handleError(error, 'deleteLiability')
}

// ============================================
// NET WORTH HISTORY
// ============================================
export async function getNetWorthHistory() {
  const userId = getUserId()
  const { data, error } = await supabase
    .from('net_worth_history')
    .select('*')
    .eq('user_id', userId)
    .order('year', { ascending: true })
    .order('month', { ascending: true })
  if (error) handleError(error, 'getNetWorthHistory')
  return data ?? []
}

export async function saveNetWorthSnapshot(
  month: number,
  year: number,
  totalAssets: number,
  totalLiabilities: number,
  netWorth: number
) {
  const userId = getUserId()
  const { error } = await supabase
    .from('net_worth_history')
    .upsert(
      {
        user_id: userId,
        month,
        year,
        total_assets: totalAssets,
        total_liabilities: totalLiabilities,
        net_worth: netWorth,
      },
      { onConflict: 'user_id,month,year' }
    )
  if (error) handleError(error, 'saveNetWorthSnapshot')
}

// ============================================
// TAX INVESTMENTS
// ============================================
export async function getTaxInvestments(financialYear: string) {
  const userId = getUserId()
  const { data, error } = await supabase
    .from('tax_investments')
    .select('*')
    .eq('user_id', userId)
    .eq('financial_year', financialYear)
  if (error) handleError(error, 'getTaxInvestments')
  return data ?? []
}

export async function addTaxInvestment(taxInvestment: any) {
  const userId = getUserId()
  const { data, error } = await supabase
    .from('tax_investments')
    .insert({ ...taxInvestment, user_id: userId })
    .select()
    .single()
  if (error) handleError(error, 'addTaxInvestment')
  return data
}

export async function deleteTaxInvestment(id: string) {
  const userId = getUserId()
  const { error } = await supabase
    .from('tax_investments')
    .delete()
    .eq('id', id)
    .eq('user_id', userId)
  if (error) handleError(error, 'deleteTaxInvestment')
}

// ============================================
// BULK OPERATIONS
// ============================================
export async function bulkInsertCategories(categories: any[]) {
  const userId = getUserId()
  const rows = categories.map(c => ({ ...c, user_id: userId }))
  const { error } = await supabase
    .from('categories')
    .upsert(rows, { onConflict: 'id', ignoreDuplicates: true })
  if (error) handleError(error, 'bulkInsertCategories')
}

export async function bulkInsertEvents(events: any[]) {
  const userId = getUserId()
  const rows = events.map(e => ({ ...e, user_id: userId }))
  const { error } = await supabase
    .from('events')
    .upsert(rows, { onConflict: 'id', ignoreDuplicates: true })
  if (error) handleError(error, 'bulkInsertEvents')
}

// ============================================
// CLEAR ALL USER DATA
// ============================================
export async function clearAllUserData() {
  const userId = getUserId()
  const tables = [
    'savings_contributions',
    'tax_investments',
    'savings_goals',
    'investments',
    'sips',
    'fixed_deposits',
    'assets',
    'liabilities',
    'net_worth_history',
    'expenses',
    'income',
    'events',
    'budgets',
  ]
  for (const table of tables) {
    await supabase.from(table).delete().eq('user_id', userId)
  }
  // Delete only custom categories
  await supabase
    .from('categories')
    .delete()
    .eq('user_id', userId)
    .eq('is_custom', 1)
  // Delete only custom income sources
  await supabase
    .from('income_sources')
    .delete()
    .eq('user_id', userId)
    .eq('is_custom', 1)
}
