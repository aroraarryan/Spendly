import { create } from 'zustand';

interface ToastState {
    visible: boolean;
    title: string;
    body: string;
    showInAppToast: (title: string, body: string) => void;
    hideToast: () => void;
}

export const useToast = create<ToastState>((set) => ({
    visible: false,
    title: '',
    body: '',
    showInAppToast: (title, body) => {
        set({ visible: true, title, body });
    },
    hideToast: () => {
        set({ visible: false });
    },
}));
