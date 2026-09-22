import { BreadCrumbs, PermissionGate } from 'libs/components/common';
import { PurchaseList } from 'libs/components/pages/purchase';
import { PURCHASE_LIST } from 'libs/constants/warehouse/warehouse.constants';

const Page = () => {
    const links = [{ label: 'داشبورد', href: '/dashboard' }, { label: 'فاکتورهای خرید' }];

    return (
        <>
            <BreadCrumbs links={links} containerClass='mb-4' />
            <PermissionGate
                permission={PURCHASE_LIST}
                fallback={<p className='text-sm text-gray-400'>دسترسی لازم را ندارید.</p>}
            >
                <PurchaseList />
            </PermissionGate>
        </>
    );
};

export default Page;
