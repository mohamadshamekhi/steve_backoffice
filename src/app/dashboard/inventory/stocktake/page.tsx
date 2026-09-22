import { BreadCrumbs, PermissionGate } from 'libs/components/common';
import { InventoryStocktake } from 'libs/components/pages/inventory';
import ROUTES from 'libs/constants/routes/routes.constants';
import { REPORT_INVENTORY } from 'libs/constants/warehouse/warehouse.constants';

const Page = () => {
    const links = [
        { label: 'داشبورد', href: '/dashboard' },
        { label: 'موجودی انبار', href: ROUTES.InventoryStock },
        { label: 'انبارگردانی' }
    ];

    return (
        <>
            <BreadCrumbs links={links} containerClass='mb-4' />
            <PermissionGate
                permission={REPORT_INVENTORY}
                fallback={<p className='text-sm text-gray-400'>دسترسی لازم را ندارید.</p>}
            >
                <InventoryStocktake />
            </PermissionGate>
        </>
    );
};

export default Page;
