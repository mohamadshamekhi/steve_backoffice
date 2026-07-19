import { BreadCrumbs } from 'libs/components/common';

const page = () => {
    const links = [{ label: 'dashboard', href: '/dashboard' }, { label: 'profile' }];
    return (
        <div>
            <BreadCrumbs links={links} />
        </div>
    );
};

export default page;
