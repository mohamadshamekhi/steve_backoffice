import { BreadCrumbs } from 'libs/components/common';
import { CreateService } from 'libs/components/pages/product';
import ROUTES from 'libs/constants/routes/routes.constants';

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;

    const links = [
        { label: 'داشبورد', href: '/dashboard' },
        { label: 'لیست محصولات', href: ROUTES.Products },
        { label: 'ویرایش خدمت' }
    ];

    return (
        <>
            <BreadCrumbs links={links} containerClass='mb-4' />
            <CreateService id={id} />
        </>
    );
}
