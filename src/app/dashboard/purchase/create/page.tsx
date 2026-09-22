import { BreadCrumbs, PermissionGate } from 'libs/components/common';
import { PurchaseForm } from 'libs/components/pages/purchase';
import ROUTES from 'libs/constants/routes/routes.constants';
import { PURCHASE_CREATE } from 'libs/constants/warehouse/warehouse.constants';

const Page = () => {
    const links = [
        { label: 'داشبورد', href: '/dashboard' },
        { label: 'فاکتورهای خرید', href: ROUTES.Purchases },
        { label: 'ثبت فاکتور خرید' }
    ];

    return (
        <>
            <BreadCrumbs links={links} containerClass='mb-4' />
            <PermissionGate
                permission={PURCHASE_CREATE}
                fallback={<p className='text-sm text-gray-400'>دسترسی لازم را ندارید.</p>}
            >
                <PurchaseForm />
            </PermissionGate>
        </>
    );
};

export default Page;
