import { supabase } from './supabase';
import { useExpenseStore } from '../store/expenseStore';
import { useCategoryStore } from '../store/categoryStore';
import { useEventStore } from '../store/eventStore';
import { useIncomeStore } from '../store/incomeStore';
import { useSavingsStore } from '../store/savingsStore';
import { useInvestmentStore } from '../store/investmentStore';
import { useNetWorthStore } from '../store/netWorthStore';

let expenseSubscription: any = null;
let categorySubscription: any = null;
let eventSubscription: any = null;
let incomeSubscription: any = null;
let savingsSubscription: any = null;
let investmentSubscription: any = null;
let netWorthSubscription: any = null;

export const startRealtimeSync = (userId: string) => {
  stopRealtimeSync();

  console.log('Starting real-time sync for user:', userId);

  // 1. Expenses Sync
  expenseSubscription = supabase
    .channel('public:expenses')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'expenses', filter: `user_id=eq.${userId}` },
      () => useExpenseStore.getState().refreshFromServer()
    )
    .subscribe();

  // 2. Categories Sync
  categorySubscription = supabase
    .channel('public:categories')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'categories', filter: `user_id=eq.${userId}` },
      () => useCategoryStore.getState().refreshFromServer()
    )
    .subscribe();

  // 3. Events Sync
  eventSubscription = supabase
    .channel('public:events')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'events', filter: `user_id=eq.${userId}` },
      () => useEventStore.getState().refreshFromServer()
    )
    .subscribe();

  // 4. Income Sync
  incomeSubscription = supabase
    .channel('public:income')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'income', filter: `user_id=eq.${userId}` },
      () => useIncomeStore.getState().refreshFromServer()
    )
    .subscribe();

  // 5. Savings Sync (Goals + Contributions)
  savingsSubscription = supabase
    .channel('public:savings')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'savings_goals', filter: `user_id=eq.${userId}` },
      () => useSavingsStore.getState().refreshFromServer()
    )
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'savings_contributions', filter: `user_id=eq.${userId}` },
      () => useSavingsStore.getState().refreshFromServer()
    )
    .subscribe();

  // 6. Investments Sync
  investmentSubscription = supabase
    .channel('public:investments')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'investments', filter: `user_id=eq.${userId}` },
      () => useInvestmentStore.getState().refreshFromServer()
    )
    .subscribe();

  // 7. Net Worth Sync
  netWorthSubscription = supabase
    .channel('public:net_worth')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'net_worth_history', filter: `user_id=eq.${userId}` },
      () => useNetWorthStore.getState().refreshFromServer()
    )
    .subscribe();
};

export const stopRealtimeSync = () => {
  if (expenseSubscription) supabase.removeChannel(expenseSubscription);
  if (categorySubscription) supabase.removeChannel(categorySubscription);
  if (eventSubscription) supabase.removeChannel(eventSubscription);
  if (incomeSubscription) supabase.removeChannel(incomeSubscription);
  if (savingsSubscription) supabase.removeChannel(savingsSubscription);
  if (investmentSubscription) supabase.removeChannel(investmentSubscription);
  if (netWorthSubscription) supabase.removeChannel(netWorthSubscription);

  expenseSubscription = null;
  categorySubscription = null;
  eventSubscription = null;
  incomeSubscription = null;
  savingsSubscription = null;
  investmentSubscription = null;
  netWorthSubscription = null;
};
