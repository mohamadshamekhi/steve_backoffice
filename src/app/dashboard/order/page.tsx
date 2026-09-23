import { BreadCrumbs, PermissionGate } from 'libs/components/common';
import { List } from 'libs/components/pages/order';

const page = () => {
    const links = [{ label: 'داشبورد', href: '/' }, { label: 'لیست سفارشات' }];
    return (
        <>
            <BreadCrumbs links={links} containerClass='mb-5' />
            <PermissionGate permission='order:list' fallback={<p className='text-sm text-gray-400'>دسترسی لازم را ندارید.</p>}>
                <List />
            </PermissionGate>
        </>
    );
};

export default page;
