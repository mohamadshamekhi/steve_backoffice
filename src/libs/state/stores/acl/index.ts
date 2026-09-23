'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

/**
 * ادمین اصلی در بک‌اند همه‌ی مجوزها را دارد، ولی permission_keys هنگام لاگین ذخیره می‌شود و
 * مجوزهای جدیدِ بعد از آن را ندارد؛ پس در فرانت برای این نقش همه‌ی گیت‌ها باز است.
 */
export const SUPER_ADMIN_ROLE = 'super_admin';

export const isSuperAdmin = (roles?: string[] | null) => !!roles?.includes(SUPER_ADMIN_ROLE);

interface IACLStore {
    permissions: string[];
    roles: string[];
    setACL: (permissions: string[], roles: string[]) => void;
    clearACL: () => void;
    hasPermission: (key: string) => boolean;
    hasAnyPermission: (keys: string[]) => boolean;
    hasAllPermissions: (keys: string[]) => boolean;
    hasRole: (role: string) => boolean;
}

export const useACLStore = create<IACLStore>()(
    persist(
        (set, get) => ({
            permissions: [],
            roles: [],
            setACL: (permissions, roles) => set({ permissions: permissions ?? [], roles: roles ?? [] }),
            clearACL: () => set({ permissions: [], roles: [] }),
            hasPermission: (key) => isSuperAdmin(get().roles) || (get().permissions ?? []).includes(key),
            hasAnyPermission: (keys) =>
                isSuperAdmin(get().roles) || keys.some((key) => (get().permissions ?? []).includes(key)),
            hasAllPermissions: (keys) =>
                isSuperAdmin(get().roles) || keys.every((key) => (get().permissions ?? []).includes(key)),
            hasRole: (role) => isSuperAdmin(get().roles) || (get().roles ?? []).includes(role)
        }),
        {
            name: 'steve-acl'
        }
    )
);
