import { BreadCrumbs, PermissionGate } from 'libs/components/common';
import { PurchaseEdit } from 'libs/components/pages/purchase';
import ROUTES from 'libs/constants/routes/routes.constants';
import { PURCHASE_UPDATE } from 'libs/constants/warehouse/warehouse.constants';

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;

    const links = [
        { label: 'داشبورد', href: '/dashboard' },
        { label: 'فاکتورهای خرید', href: ROUTES.Purchases },
        { label: 'ویرایش فاکتور' }
    ];

    return (
        <>
            <BreadCrumbs links={links} containerClass='mb-4' />
            <PermissionGate
                permission={PURCHASE_UPDATE}
                fallback={<p className='text-sm text-gray-400'>دسترسی لازم را ندارید.</p>}
            >
                <PurchaseEdit id={id} />
            </PermissionGate>
        </>
    );
}
