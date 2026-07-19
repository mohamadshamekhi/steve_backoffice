'use client';

import { usePermission } from 'libs/hooks/usePermission';
import React from 'react';

interface PermissionGateProps {
    permission: string | string[];
    mode?: 'any' | 'all';
    fallback?: React.ReactNode;
    children: React.ReactNode;
}

export default function PermissionGate({ permission, mode = 'any', fallback = null, children }: PermissionGateProps) {
    const hasAccess = usePermission(permission, mode);

    if (!hasAccess) {
        return <>{fallback}</>;
    }

    return <>{children}</>;
}
