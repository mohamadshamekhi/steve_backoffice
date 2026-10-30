'use client';

import { ColumnDef } from '@tanstack/react-table';
import { fetcher } from 'libs/api';
import ApiKeys from 'libs/api/keys';
import { DeleteModal } from 'libs/components/common';
import ContentWrapper from 'libs/components/common/contentWrapper/ContentWrapper';
import Pagination from 'libs/components/common/Pagination';
import ROUTES from 'libs/constants/routes/routes.constants';
import { useModal } from 'libs/hooks/modal/useModal';
import { ArticleModel } from 'libs/models';
import { Button, Switch, Table } from 'libs/ui';
import { Dropdown } from 'libs/ui/dropdown/Dropdown';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { toast } from 'react-toastify';
import useSWR from 'swr';

interface BlogProps extends ArticleModel {
    id: string;
    created_at: string;
    updated_at: string;
    media_url: string;
    is_published: boolean;
}
interface ActionCellProps {
    data: BlogProps;
    onDeleted: () => void;
}

const ActionCell = ({ data, onDeleted }: ActionCellProps) => {
    const [isOpenMenu, setIsOpenMenu] = useState(false);
    const { openModal, isOpen, closeModal } = useModal();
    const [deleteLoading, setDeleteLoading] = useState<boolean>(false);

    const toggleDropdown = () => setIsOpenMenu((prev) => !prev);
    const closeDropdown = () => setIsOpenMenu(false);

    const deleteBlog = async () => {
        try {
            setDeleteLoading(true);
            await fetcher(ApiKeys.DELETE_ARTICLE(data.id), 'dashboard', 'DELETE');
            onDeleted();
            closeModal();
            toast.success('حذف با موفقیت انجام شد');
            setDeleteLoading(false);
        } catch (error) {
            setDeleteLoading(false);
            console.error('Failed to delete blog:', error);
        }
    };

    return (
        <div>
            <Button onClick={toggleDropdown} size='sm' variant='outline'>
                عملیات
            </Button>

            <Dropdown isOpen={isOpenMenu} onClose={closeDropdown} className='left-10 min-w-[150px]'>
                <Dropdown.Item
                    tag='a'
                    href={`/dashboard/blog/${data.id}`}
                    onItemClick={() => {
                        closeDropdown();
                    }}
                >
                    جزییات
                </Dropdown.Item>
                <Dropdown.Item
                    className='text-brand-500! hover:bg-brand-100! hover:text-brand-500'
                    tag='a'
                    href={`/dashboard/blog/edit/${data.id}`}
                    onItemClick={() => {
                        closeDropdown();
                    }}
                >
                    ویرایش
                </Dropdown.Item>
                <Dropdown.Item
                    tag='button'
                    onItemClick={() => {
                        closeDropdown();
                        openModal();
                    }}
                    className='text-red-500 hover:bg-red-100 hover:text-red-500'
                >
                    حذف
                </Dropdown.Item>
            </Dropdown>

            <DeleteModal isOpen={isOpen} onClose={closeModal} onDelete={() => deleteBlog()} loading={deleteLoading} />
        </div>
    );
};

const List: React.FC = () => {
    const [page, setPage] = useState(1);

    const limit = 10;

    const { data, isLoading, mutate } = useSWR(ApiKeys.GET_ALL_ARTICLE(page, limit), (url: string) =>
        fetcher(url, 'dashboard', 'GET')
    );

    // یک‌بار برای مقاله‌های قدیمی: عکس‌های base64 داخل متن را آپلود و با لینک جایگزین می‌کند.
    // مقاله‌های جدید هنگام ذخیره خودکار همین کار را انجام می‌دهند.
    const [externalizing, setExternalizing] = useState(false);
    const externalizeInlineImages = async () => {
        setExternalizing(true);
        try {
            const res = await fetcher(ApiKeys.POST_ARTICLE_EXTERNALIZE_IMAGES, 'dashboard', 'POST');
            if (!res?.success) return;
            const fixed: { images: number }[] = res.data?.fixed ?? [];
            const failed: { slug: string }[] = res.data?.failed ?? [];
            const images = fixed.reduce((sum, a) => sum + a.images, 0);
            if (fixed.length === 0 && failed.length === 0) {
                toast.info('مقاله‌ای با عکس base64 پیدا نشد');
            } else {
                toast.success(
                    `${images.toLocaleString('fa-IR')} عکس از ${fixed.length.toLocaleString('fa-IR')} مقاله منتقل شد`
                );
            }
            if (failed.length > 0) {
                toast.error(`انتقال این مقاله‌ها ناموفق بود: ${failed.map((a) => a.slug).join('، ')}`);
            }
            mutate();
        } finally {
            setExternalizing(false);
        }
    };

    const toggleVisibilityHandler = async (id: string, currentState: boolean) => {
        try {
            await fetcher(ApiKeys.PATCH_ARTICLE(id), 'dashboard', 'PATCH', { body: { is_published: !currentState } });

            mutate();

            toast.success('تغییر وضعیت با موفقیت انجام شد');
        } catch (error) {
            console.error('Failed to delete blog:', error);
        }
    };

    const columns: ColumnDef<BlogProps>[] = [
        {
            accessorKey: 'id',
            header: '#',
            cell: ({ row }) => row.index + 1,
            enableSorting: true,
            maxSize: 50
        },
        {
            accessorKey: 'media_id',
            header: 'تصویر',
            cell: ({ row }) => {
                const title = row.getValue<string>('title');
                return <Image src={row.original.media_url} alt={title} width={60} height={60} loading='lazy' />;
            },
            enableSorting: false
        },
        {
            accessorKey: 'title',
            header: 'موضوع',
            enableResizing: true,
            filterFn: 'includesString',
            enableSorting: true,
            cell: ({ row }) => <div className='line-clamp-1 text-ellipsis'>{row?.original?.title}</div>
        },
        {
            accessorKey: 'created_at',
            header: 'تاریخ ثبت',
            filterFn: 'includesString',
            cell: ({ row }) => {
                return new Date(row?.original?.created_at).toLocaleDateString('fa-IR');
            }
        },
        {
            accessorKey: 'updated_at',
            header: 'تاریخ ویرایش',
            filterFn: 'includesString',
            cell: ({ row }) => new Date(row.original.updated_at).toLocaleDateString('fa-ir')
        },
        {
            accessorKey: 'is_published',
            header: 'نمایش وضعیت در سایت',
            filterFn: 'includesString',
            cell: ({ row }) => (
                <Switch
                    checked={row.original.is_published}
                    onChange={() => toggleVisibilityHandler(row.original.id, row.original.is_published)}
                />
            )
        },

        {
            id: 'actions',
            header: 'عملیات',
            cell: ({ row }) => (
                <ActionCell
                    data={row.original}
                    onDeleted={() => {
                        mutate();
                    }}
                />
            ),
            enableSorting: false
        }
    ];
    return (
        <ContentWrapper
            title='بلاگ ها'
            extra={
                <div className='flex flex-wrap items-center gap-2'>
                    <Button
                        size='sm'
                        variant='outline'
                        loading={externalizing}
                        disabled={externalizing}
                        onClick={externalizeInlineImages}
                    >
                        انتقال عکس‌های داخل متن به فضای ابری
                    </Button>
                    <Link
                        className='bg-brand-500 hover:bg-brand-600 rounded-md px-4 py-2 text-sm font-semibold text-white'
                        href={ROUTES.CreateBlog}
                    >
                        درج بلاگ +
                    </Link>
                </div>
            }
        >
            <div className='relative'>
                <Table<BlogProps>
                    headerClass='text-nowrap'
                    columns={columns}
                    data={data?.data?.articles ?? []}
                    loading={isLoading}
                />
            </div>

            <Pagination
                currentPage={page}
                total={data?.data?.pagination.total ?? 0}
                pageSize={limit}
                onPageChange={(newPage) => setPage(newPage)}
            />
        </ContentWrapper>
    );
};

export default List;
