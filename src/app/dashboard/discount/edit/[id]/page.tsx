import { BreadCrumbs } from 'libs/components/common';
import { Edit } from 'libs/components/pages/discount';

interface PageProps {
    params: Promise<{
        id: string;
    }>;
}

const Page = async ({ params }: PageProps) => {
    const { id } = await params;

    const links = [
        { label: 'داشبورد', href: '/dashboard' },
        { label: 'تخفیف ها', href: '/dashboard/discount' },
        { label: 'ویرایش تخفیف' }
    ];

    return (
        <>
            <BreadCrumbs links={links} containerClass='mb-4' />
            <Edit discountId={id} />
        </>
    );
};

export default Page;
