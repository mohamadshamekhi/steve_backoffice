import { BreadCrumbs } from 'libs/components/common';
import { Edit } from 'libs/components/pages/product';

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;

    const links = [
        { label: 'داشبورد', href: '/dashboard' },
        { label: 'محصولات', href: '/dashboard/product' },
        { label: 'ویرایش محصول' }
    ];
    return (
        <>
            <BreadCrumbs links={links} containerClass='mb-5' />
            <Edit id={id} />
        </>
    );
}
