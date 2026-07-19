'use client';
import { create } from 'zustand';

interface sidebarState {
    isExpanded: boolean;
    isMobileOpen: boolean;
    isHovered: boolean;
    activeItem: string | null;
    openSubmenu: string | null;
    toggleSidebar: () => void;
    toggleMobileSidebar: () => void;
    setIsHovered: (isHovered: boolean) => void;
    setActiveItem: (item: string | null) => void;
    toggleSubmenu: (item: string) => void;
}

export const useSidebarStore = create<sidebarState>((set, get) => ({
    isMobileOpen: false,
    isExpanded: true,
    isHovered: false,
    activeItem: null,
    openSubmenu: null,
    toggleSidebar: () => set((state) => ({ isExpanded: !state.isExpanded })),
    toggleMobileSidebar: () => set((state) => ({ isMobileOpen: !state.isMobileOpen })),
    setActiveItem: (item) => set(() => ({ activeItem: item })),
    toggleSubmenu: (item) => {
        const current = get().openSubmenu;
        set(() => ({
            openSubmenu: current === item ? null : item
        }));
    },
    setIsHovered: (isHovered) => set(() => ({ isHovered }))
}));
