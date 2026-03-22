import { create } from 'zustand';
import { getEvents, addEvent, deleteEvent } from '../services/database';

export interface EventRow {
    id: string;
    name: string;
    start_date: string;
    end_date: string;
    total_budget: number;
    cover_color: string;
    created_at: string;
}

interface EventState {
    events: EventRow[];
    isLoading: boolean;
    loadEvents: () => Promise<void>;
    addEvent: (event: { name: string, start_date: string, end_date: string, total_budget?: number, cover_color: string }) => Promise<void>;
    deleteEvent: (id: string) => Promise<void>;
    getActiveEvents: () => EventRow[];
    getPastEvents: () => EventRow[];
    getEventById: (id: string) => EventRow | undefined;
    clearEvents: () => Promise<void>;
    deleteEventAndUntag: (id: string) => Promise<void>;
    importEvents: (events: EventRow[]) => Promise<void>;
}

export const useEventStore = create<EventState>((set, get) => ({
    events: [],
    isLoading: false,
    loadEvents: async () => {
        set({ isLoading: true });
        try {
            const data = await getEvents() as EventRow[];
            set({ events: data });
        } catch (error) {
            console.error(error);
        } finally {
            set({ isLoading: false });
        }
    },
    addEvent: async (event) => {
        const id = await addEvent(event);
        const newEvent: EventRow = {
            id,
            name: event.name,
            start_date: event.start_date,
            end_date: event.end_date,
            total_budget: event.total_budget || 0,
            cover_color: event.cover_color,
            created_at: new Date().toISOString()
        };
        set(state => ({ events: [newEvent, ...state.events] }));
    },
    deleteEvent: async (id) => {
        await deleteEvent(id);
        set(state => ({ events: state.events.filter(e => e.id !== id) }));
    },
    getActiveEvents: () => {
        const today = new Date().toISOString().split('T')[0];
        return get().events.filter(e => e.end_date >= today);
    },
    getPastEvents: () => {
        const today = new Date().toISOString().split('T')[0];
        return get().events.filter(e => e.end_date < today);
    },
    getEventById: (id) => {
        return get().events.find(e => e.id === id);
    },
    clearEvents: async () => {
        const { deleteAllEvents } = await import('../services/database');
        await deleteAllEvents();
        set({ events: [] });
    },
    deleteEventAndUntag: async (id) => {
        const { untagEventExpenses } = await import('../services/database');
        await untagEventExpenses(id);

        // Reload expenses to reflect the untagging
        const { useExpenseStore } = await import('./expenseStore');
        await useExpenseStore.getState().reloadExpenses();

        await get().deleteEvent(id);
    },
    importEvents: async (importedEvents) => {
        const currentEvents = get().events;
        const toImport = importedEvents.filter(ie =>
            !currentEvents.some(ce => ce.name === ie.name && ce.start_date === ie.start_date)
        );

        if (toImport.length > 0) {
            const { bulkInsertEvents } = await import('../services/database');
            await bulkInsertEvents(toImport);
            await get().loadEvents();
        }
    }
}));
