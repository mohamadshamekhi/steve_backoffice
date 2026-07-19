import Edit from 'libs/components/pages/users/admin/edit';

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    return <Edit id={id} />;
}
