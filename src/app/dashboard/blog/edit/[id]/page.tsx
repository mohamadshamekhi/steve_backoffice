import { BreadCrumbs } from 'libs/components/common';
import Edit from 'libs/components/pages/blogs/edit';

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const links = [{ label: 'داشبورد', href: '/dashboard' }, { label: 'ویرایش بلاگ' }];
    return (
        <>
            <BreadCrumbs links={links} containerClass='mb-4' />
            <Edit id={id} />
        </>
    );
}
