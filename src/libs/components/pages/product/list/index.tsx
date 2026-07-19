'use client';

import { ColumnDef } from '@tanstack/react-table';
import { fetcher } from 'libs/api';
import ApiKeys from 'libs/api/keys';
import { DeleteModal } from 'libs/components/common';
import ContentWrapper from 'libs/components/common/contentWrapper/ContentWrapper';
import Pagination from 'libs/components/common/Pagination';
import ROUTES from 'libs/constants/routes/routes.constants';
import { useModal } from 'libs/hooks/modal/useModal';
import { Badge, Button, Input, Switch, Table } from 'libs/ui';
import { Dropdown } from 'libs/ui/dropdown/Dropdown';
import Image, { StaticImageData } from 'next/image';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'react-toastify';
import useSWR from 'swr';
import noPic from '../../../../../../public/images/placeholder/no-pic.png';

interface ProductModel {
    id: string;
    media_id: StaticImageData | string;
    name: string;
    en_title: string;
    is_second_hand?: boolean;
    category_id?: number;
    brand_id?: number;
    description?: string;
    thumbnail_url: string;
    is_published: boolean;
}

const ActionCell = ({ id, onDeleted }: { id: string; onDeleted: () => void }) => {
    const [isOpenMenu, setIsOpenMenu] = useState(false);
    const { openModal, isOpen, closeModal } = useModal();

    const toggleDropdown = () => setIsOpenMenu((prev) => !prev);
    const closeDropdown = () => setIsOpenMenu(false);

    const [loadingDelete, setLoadingDelete] = useState<boolean>(false);

    const deleteProduct = async () => {
        try {
            setLoadingDelete(true);
            await fetcher(ApiKeys.DELETE_PRODUCT(id.toString()), 'dashboard', 'DELETE');
            onDeleted();
            closeModal();
            toast.success('حذف با موفقیت انجام شد');
            setLoadingDelete(false);
        } catch (error) {
            setLoadingDelete(false);
            console.error('Failed to delete Product:', error);
            toast.error('حذف با خطا مواجه شد');
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
                    href={`/dashboard/product/${id}`}
                    onItemClick={() => {
                        closeDropdown();
                    }}
                >
                    جزییات
                </Dropdown.Item>
                <Dropdown.Item
                    className='text-brand-500! hover:bg-brand-100! hover:text-brand-500'
                    tag='a'
                    href={`/dashboard/product/edit/${id}`}
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

            <DeleteModal
                isOpen={isOpen}
                onClose={closeModal}
                onDelete={() => deleteProduct()}
                loading={loadingDelete}
            />
        </div>
    );
};

const List = () => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const page = Number(searchParams.get('page')) || 1;
    const [searchTerm, setSearchTerm] = useState('');

    const limit = 10;

    const setPage = (newPage: number) => {
        const params = new URLSearchParams(searchParams.toString());
        params.set('page', newPage.toString());
        router.push(`?${params.toString()}`);
    };

    const { isLoading, data, mutate } = useSWR([ApiKeys.GET_ALL_PRODUCT, page, limit, searchTerm], () =>
        fetcher(ApiKeys.GET_ALL_PRODUCT, 'dashboard', 'GET', {
            params: {
                page_number: page,
                page_size: limit,
                ...(searchTerm && { name: searchTerm })
            }
        })
    );

    const toggleVisibilityHandler = async (id: string, currentState: boolean) => {
        try {
            if (currentState) {
                await fetcher(ApiKeys.PATCH_PRODUCT_UNPUBLISHED(id), 'dashboard', 'PATCH', {
                    body: { is_published: false }
                });
            } else {
                await fetcher(ApiKeys.PATCH_PRODUCT_PUBLISHED(id), 'dashboard', 'PATCH', {
                    body: { is_published: true }
                });
            }

            mutate();

            toast.success('تغییر وضعیت با موفقیت انجام شد');
        } catch (error) {
            console.error('Failed to toggle product visibility:', error);

            toast.error('خطا در تغییر وضعیت محصول');
        }
    };

    const columns: ColumnDef<ProductModel>[] = [
        {
            accessorKey: 'id',
            header: '#',
            enableSorting: true,
            maxSize: 50,
            cell: ({ row }) => row.index + 1
        },
        {
            accessorKey: 'media_id',
            header: 'تصویر محصول',
            enableSorting: false,
            cell: ({ row }) => {
                const name = row.original.name;
                const src = typeof row.original.thumbnail_url === 'string' ? row.original.thumbnail_url : noPic;

                return src ? <Image src={src} alt={name} width={60} height={60} className='rounded-md' /> : null;
            }
        },
        {
            accessorKey: 'name',
            header: 'نام محصول',
            filterFn: 'includesString',
            enableSorting: true
        },
        {
            accessorKey: 'en_title',
            header: 'نام انگلیسی محصول',
            enableResizing: true,
            filterFn: 'includesString',
            enableSorting: true
        },
        {
            accessorKey: 'category',
            header: 'دسته بندی',
            enableResizing: true,
            filterFn: 'includesString',
            enableSorting: true
        },
        {
            accessorKey: 'brand',
            header: 'برند',
            enableResizing: true,
            filterFn: 'includesString',
            enableSorting: true
        },
        {
            accessorKey: 'is_second_hand',
            header: 'وضعیت',
            enableResizing: true,
            filterFn: 'includesString',
            enableSorting: true,
            cell: ({ row }) => {
                const isSecondHand = row.original.is_second_hand;

                return (
                    <div className='flex items-center gap-2'>
                        {isSecondHand ? (
                            <Badge size='sm' className='text-nowrap' variant='solid' color='warning'>
                                دست دوم
                            </Badge>
                        ) : (
                            <Badge size='sm' className='text-nowrap' variant='solid'>
                                نو
                            </Badge>
                        )}
                    </div>
                );
            }
        },
        {
            accessorKey: 'is_published',
            header: 'نمایش/عدم نمایش',
            enableResizing: true,
            filterFn: 'includesString',
            enableSorting: true,
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
                    id={row.original.id}
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
            title='لیست محصولات'
            extra={
                <Link
                    className='bg-brand-500 hover:bg-brand-600 rounded-md px-4 py-2 text-sm font-semibold text-white'
                    href={ROUTES.CreateProduct}
                >
                    درج محصول +
                </Link>
            }
        >
            <div className='mb-4'>
                <Input
                    type='text'
                    placeholder='جستجو بر اساس نام محصول...'
                    value={searchTerm}
                    onChange={(e) => {
                        setSearchTerm(e.target.value);
                        setPage(1);
                    }}
                    className='max-w-md'
                />
            </div>

            <div className='relative'>
                <Table<ProductModel>
                    loading={isLoading}
                    headerClass='text-nowrap'
                    columns={columns}
                    data={data?.data?.products ?? []}
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
