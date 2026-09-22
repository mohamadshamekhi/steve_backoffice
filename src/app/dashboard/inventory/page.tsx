import { BreadCrumbs, PermissionGate } from 'libs/components/common';
import { InventoryStock } from 'libs/components/pages/inventory';
import { REPORT_INVENTORY } from 'libs/constants/warehouse/warehouse.constants';

const Page = () => {
    const links = [{ label: 'داشبورد', href: '/dashboard' }, { label: 'موجودی انبار' }];

    return (
        <>
            <BreadCrumbs links={links} containerClass='mb-4' />
            <PermissionGate
                permission={REPORT_INVENTORY}
                fallback={<p className='text-sm text-gray-400'>دسترسی لازم را ندارید.</p>}
            >
                <InventoryStock />
            </PermissionGate>
        </>
    );
};

export default Page;
