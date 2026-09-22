import { Suspense } from 'react';
import { BreadCrumbs, PermissionGate } from 'libs/components/common';
import { InventoryMovements } from 'libs/components/pages/inventory';
import ROUTES from 'libs/constants/routes/routes.constants';
import { INVENTORY_VIEW } from 'libs/constants/warehouse/warehouse.constants';

const Page = () => {
    const links = [
        { label: 'داشبورد', href: '/dashboard' },
        { label: 'موجودی انبار', href: ROUTES.InventoryStock },
        { label: 'دفتر حرکت کالا' }
    ];

    return (
        <>
            <BreadCrumbs links={links} containerClass='mb-4' />
            <PermissionGate
                permission={INVENTORY_VIEW}
                fallback={<p className='text-sm text-gray-400'>دسترسی لازم را ندارید.</p>}
            >
                <Suspense>
                    <InventoryMovements />
                </Suspense>
            </PermissionGate>
        </>
    );
};

export default Page;
