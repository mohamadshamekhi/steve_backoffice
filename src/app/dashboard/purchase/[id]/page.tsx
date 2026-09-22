import { BreadCrumbs, PermissionGate } from 'libs/components/common';
import { PurchaseDetail } from 'libs/components/pages/purchase';
import ROUTES from 'libs/constants/routes/routes.constants';
import { PURCHASE_VIEW } from 'libs/constants/warehouse/warehouse.constants';

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;

    const links = [
        { label: 'داشبورد', href: '/dashboard' },
        { label: 'فاکتورهای خرید', href: ROUTES.Purchases },
        { label: 'جزئیات فاکتور' }
    ];

    return (
        <>
            <BreadCrumbs links={links} containerClass='mb-4' />
            <PermissionGate
                permission={PURCHASE_VIEW}
                fallback={<p className='text-sm text-gray-400'>دسترسی لازم را ندارید.</p>}
            >
                <PurchaseDetail id={id} />
            </PermissionGate>
        </>
    );
}
