'use client';

import ROUTES from 'libs/constants/routes/routes.constants';
import { useACLStore } from 'libs/state/stores/acl';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';

/** Roles whose users are confined to their own scoped area of the dashboard. */
export const SCOPED_ONLY_ROLES = ['partner'];

/** True when every role the current user holds is a scoped-only role (e.g. a pure partner). */
export const useIsScopedOnlyUser = () => {
    const roles = useACLStore((state) => state.roles) ?? [];
    return roles.length > 0 && roles.every((role) => SCOPED_ONLY_ROLES.includes(role));
};

/** Path prefixes a scoped-only user is still allowed to open. */
const ALLOWED_PREFIXES = [ROUTES.PartnerShop, '/dashboard/profile'];

const isAllowed = (pathname: string) =>
    pathname === ROUTES.Dashboard || ALLOWED_PREFIXES.some((prefix) => pathname.startsWith(prefix));

const ScopedRoleGuard = ({ children }: { children: React.ReactNode }) => {
    const router = useRouter();
    const pathname = usePathname();
    const roles = useACLStore((state) => state.roles);

    const userRoles = roles ?? [];
    const isScopedOnly =
        userRoles.length > 0 && userRoles.every((role) => SCOPED_ONLY_ROLES.includes(role));
    const blocked = isScopedOnly && !isAllowed(pathname);

    useEffect(() => {
        if (blocked) router.replace(ROUTES.PartnerShop);
    }, [blocked, router]);

    if (blocked) return null;

    return <>{children}</>;
};

export default ScopedRoleGuard;
