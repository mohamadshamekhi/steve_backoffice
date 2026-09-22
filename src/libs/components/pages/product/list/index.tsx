'use client';

import { ColumnDef } from '@tanstack/react-table';
import { fetcher } from 'libs/api';
import ApiKeys from 'libs/api/keys';
import { DeleteModal } from 'libs/components/common';
import ContentWrapper from 'libs/components/common/contentWrapper/ContentWrapper';
import Pagination from 'libs/components/common/Pagination';
import ROUTES from 'libs/constants/routes/routes.constants';
import {
    formatNumber,
    PRODUCT_KIND_OPTIONS,
    SALES_CHANNEL_OPTIONS
} from 'libs/constants/warehouse/warehouse.constants';
import { useModal } from 'libs/hooks/modal/useModal';
import { ProductKind, SalesChannel } from 'libs/models/warehouse.model';
import { Button, CSelect, Input, Switch, Table } from 'libs/ui';
import Image, { StaticImageData } from 'next/image';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { parseCookies } from 'nookies';
import { useState } from 'react';
import { toast } from 'react-toastify';
import useSWR from 'swr';
import noPic from '../../../../../../public/images/placeholder/no-pic.png';

const STOREFRONT_URL = process.env.NEXT_PUBLIC_STOREFRONT_URL ?? 'https://stevemobile.com';

interface ProductModel {
    id: string;
    slug: string;
    media_id: StaticImageData | string;
    name: string;
    en_title: string;
    is_second_hand?: boolean;
    category_id?: number;
    brand_id?: number;
    description?: string;
    thumbnail_url: string;
    is_published: boolean;
    kind?: ProductKind;
    sales_channels?: SalesChannel[];
    /** فقط برای خدمات پر می‌شود؛ قیمت کالا روی واریانت است */
    price?: number;
    category?: string;
    brand?: string;
}

const Chip = ({ className, children }: { className: string; children: React.ReactNode }) => (
    <span
        className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium whitespace-nowrap ring-1 ring-inset ${className}`}
    >
        {children}
    </span>
);

const CHANNEL_META: Record<SalesChannel, { label: string; className: string }> = {
    website: {
        label: 'آنلاین',
        className: 'bg-sky-50 text-sky-700 ring-sky-200 dark:bg-sky-500/10 dark:text-sky-400 dark:ring-sky-500/20'
    },
    in_person: {
        label: 'حضوری',
        className: 'bg-amber-50 text-amber-700 ring-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:ring-amber-500/20'
    }
};

const KIND_TABS: { value: '' | ProductKind; label: string }[] = [
    { value: '', label: 'همه' },
    ...PRODUCT_KIND_OPTIONS.map((option) => ({
        value: option.value,
        label: option.label
    }))
];

const CHANNEL_OPTIONS = [
    { value: '', label: 'همه‌ی کانال‌ها' },
    ...SALES_CHANNEL_OPTIONS.map((option) => ({
        value: option.value,
        label: option.value === 'website' ? 'قابل نمایش در وب‌سایت' : 'فروش حضوری'
    }))
];

const ActionCell = ({
    id,
    slug,
    isService,
    onDeleted
}: {
    id: string;
    slug: string;
    isService: boolean;
    onDeleted: () => void;
}) => {
    const { openModal, isOpen, closeModal } = useModal();

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

    const iconBtn =
        'flex h-9 w-9 items-center justify-center rounded-lg border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/40';

    return (
        <div className='flex items-center justify-end gap-1.5'>
            <a
                href={`${STOREFRONT_URL}/product/${slug}`}
                target='_blank'
                rel='noopener noreferrer'
                title='مشاهده در سایت'
                aria-label='مشاهده در سایت'
                className={`${iconBtn} border-gray-200 text-gray-500 hover:bg-gray-100 hover:text-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white`}
            >
                <svg aria-hidden width='17' height='17' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='1.8' strokeLinecap='round' strokeLinejoin='round'>
                    <path d='M14 4h6v6' />
                    <path d='M20 4 11 13' />
                    <path d='M19 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1h5' />
                </svg>
            </a>
            <Link
                href={isService ? ROUTES.EditService(id) : `/dashboard/product/edit/${id}`}
                title='ویرایش'
                aria-label='ویرایش'
                className={`${iconBtn} border-brand-100 bg-brand-50 text-brand-600 hover:bg-brand-100 dark:border-brand-500/20 dark:bg-brand-500/15 dark:text-brand-400`}
            >
                <svg aria-hidden width='17' height='17' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='1.8' strokeLinecap='round' strokeLinejoin='round'>
                    <path d='M4 20h4L19 9a2.8 2.8 0 0 0-4-4L4 16v4Z' />
                    <path d='m13.5 6.5 4 4' />
                </svg>
            </Link>
            <button
                type='button'
                onClick={openModal}
                title='حذف'
                aria-label='حذف'
                className={`${iconBtn} border-red-100 text-red-500 hover:bg-red-50 dark:border-red-500/20 dark:hover:bg-red-500/10`}
            >
                <svg aria-hidden width='17' height='17' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='1.8' strokeLinecap='round' strokeLinejoin='round'>
                    <path d='M4 7h16' />
                    <path d='M10 11v6M14 11v6' />
                    <path d='M6 7l1 12a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-12' />
                    <path d='M9 7V4h6v3' />
                </svg>
            </button>

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
    const [kind, setKind] = useState<'' | ProductKind>('');
    const [salesChannel, setSalesChannel] = useState<'' | SalesChannel>('');
    const [exporting, setExporting] = useState(false);

    const limit = 10;

    const handleExportExcel = async () => {
        try {
            setExporting(true);

            const cookie = parseCookies();
            const access_token = cookie['steve-session'];

            const exportParams = new URLSearchParams({
                ...(kind && { kind }),
                ...(salesChannel && { sales_channel: salesChannel })
            }).toString();

            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}${ApiKeys.GET_PRODUCT_EXPORT_EXCEL}${
                    exportParams ? `?${exportParams}` : ''
                }`,
                {
                    headers: { Authorization: `Bearer ${access_token}` }
                }
            );

            if (!response.ok) throw new Error('خطا در دریافت فایل خروجی');

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');

            link.href = url;
            link.download = `products-${Date.now()}.xlsx`;
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Failed to export products excel:', error);
            toast.error('خطا در دریافت فایل خروجی اکسل');
        } finally {
            setExporting(false);
        }
    };

    const setPage = (newPage: number) => {
        const params = new URLSearchParams(searchParams.toString());
        params.set('page', newPage.toString());
        router.push(`?${params.toString()}`);
    };

    const { isLoading, data, mutate } = useSWR(
        [ApiKeys.GET_ALL_PRODUCT, page, limit, searchTerm, kind, salesChannel],
        () =>
            fetcher(ApiKeys.GET_ALL_PRODUCT, 'dashboard', 'GET', {
                params: {
                    page_number: page,
                    page_size: limit,
                    ...(searchTerm && { name: searchTerm }),
                    ...(kind && { kind }),
                    ...(salesChannel && { sales_channel: salesChannel })
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
            cell: ({ row }) => (
                <span className='text-sm text-gray-500'>{((page - 1) * limit + row.index + 1).toLocaleString('fa-IR')}</span>
            )
        },
        {
            accessorKey: 'name',
            header: 'محصول',
            filterFn: 'includesString',
            enableSorting: true,
            cell: ({ row }) => {
                const { name, en_title, thumbnail_url } = row.original;
                const src = typeof thumbnail_url === 'string' && thumbnail_url ? thumbnail_url : noPic;

                return (
                    <div className='flex min-w-[260px] max-w-[380px] items-center gap-3'>
                        <div className='h-14 w-14 shrink-0 overflow-hidden rounded-lg border border-gray-100 bg-gray-50 dark:border-gray-800 dark:bg-gray-900'>
                            <Image src={src} alt={name} width={56} height={56} className='h-full w-full object-cover' />
                        </div>
                        <div className='flex min-w-0 flex-col gap-1'>
                            <span className='line-clamp-2 text-sm font-medium leading-6 text-gray-800 dark:text-white/90'>
                                {name}
                            </span>
                            {en_title && (
                                <span dir='ltr' className='line-clamp-1 text-xs text-gray-400 [text-align:right]'>
                                    {en_title}
                                </span>
                            )}
                        </div>
                    </div>
                );
            }
        },
        {
            accessorKey: 'category',
            header: 'دسته‌بندی / برند',
            enableSorting: true,
            cell: ({ row }) => (
                <div className='flex flex-col gap-0.5 whitespace-nowrap'>
                    <span className='text-sm text-gray-700 dark:text-gray-300'>
                        {row.original.category || <span className='text-gray-400'>—</span>}
                    </span>
                    {row.original.brand && <span className='text-xs text-gray-400'>{row.original.brand}</span>}
                </div>
            )
        },
        {
            accessorKey: 'kind',
            header: 'نوع / کانال فروش',
            enableSorting: false,
            cell: ({ row }) => {
                // Legacy products carry neither field; the backend treats them as physical, both channels.
                const isService = row.original.kind === 'service';
                const channels = row.original.sales_channels?.length
                    ? row.original.sales_channels
                    : (['website', 'in_person'] as SalesChannel[]);

                return (
                    <div className='flex flex-col items-start gap-1.5'>
                        <Chip
                            className={
                                isService
                                    ? 'bg-violet-50 text-violet-700 ring-violet-200 dark:bg-violet-500/10 dark:text-violet-400 dark:ring-violet-500/20'
                                    : 'bg-gray-50 text-gray-700 ring-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:ring-gray-700'
                            }
                        >
                            {isService ? 'خدمات' : 'کالا'}
                        </Chip>
                        <div className='flex gap-1'>
                            {(['website', 'in_person'] as SalesChannel[])
                                .filter((c) => channels.includes(c))
                                .map((c) => (
                                    <Chip key={c} className={CHANNEL_META[c].className}>
                                        {CHANNEL_META[c].label}
                                    </Chip>
                                ))}
                        </div>
                    </div>
                );
            }
        },
        {
            accessorKey: 'price',
            header: 'قیمت',
            enableSorting: false,
            cell: ({ row }) =>
                row.original.kind === 'service' && row.original.price != null ? (
                    <span className='text-sm font-semibold whitespace-nowrap text-gray-800 tabular-nums dark:text-white/90'>
                        {formatNumber(row.original.price)} تومان
                    </span>
                ) : (
                    <span className='text-xs whitespace-nowrap text-gray-400'>بر اساس تنوع</span>
                )
        },
        {
            accessorKey: 'is_second_hand',
            header: 'وضعیت کالا',
            enableSorting: true,
            cell: ({ row }) =>
                row.original.is_second_hand ? (
                    <Chip className='bg-orange-50 text-orange-700 ring-orange-200 dark:bg-orange-500/10 dark:text-orange-400 dark:ring-orange-500/20'>
                        دست دوم
                    </Chip>
                ) : (
                    <Chip className='bg-emerald-50 text-emerald-700 ring-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:ring-emerald-500/20'>
                        نو
                    </Chip>
                )
        },
        {
            accessorKey: 'is_published',
            header: 'نمایش',
            enableSorting: true,
            cell: ({ row }) => (
                <div className='flex items-center gap-2 whitespace-nowrap'>
                    <Switch
                        checked={row.original.is_published}
                        onChange={() => toggleVisibilityHandler(row.original.id, row.original.is_published)}
                    />
                    <span
                        className={`text-xs ${row.original.is_published ? 'text-gray-600 dark:text-gray-300' : 'text-gray-400'}`}
                    >
                        {row.original.is_published ? 'منتشر شده' : 'مخفی'}
                    </span>
                </div>
            )
        },
        {
            id: 'actions',
            header: '',
            cell: ({ row }) => (
                <ActionCell
                    id={row.original.id}
                    slug={row.original.slug}
                    isService={row.original.kind === 'service'}
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
                <div className='flex items-center gap-3'>
                    <Button size='sm' variant='outline' loading={exporting} onClick={handleExportExcel}>
                        خروجی اکسل
                    </Button>

                    <Link
                        className='rounded-md border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 dark:border-gray-700 dark:text-gray-200'
                        href={ROUTES.CreateService}
                    >
                        درج خدمات +
                    </Link>

                    <Link
                        className='bg-brand-500 hover:bg-brand-600 rounded-md px-4 py-2 text-sm font-semibold text-white'
                        href={ROUTES.CreateProduct}
                    >
                        درج محصول +
                    </Link>
                </div>
            }
        >
            <div className='mb-4 flex flex-wrap items-center gap-3'>
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

                <nav className='flex overflow-x-auto rounded-lg bg-gray-100 p-1 dark:bg-gray-900'>
                    {KIND_TABS.map((tab) => (
                        <button
                            key={tab.value || 'all'}
                            type='button'
                            onClick={() => {
                                setKind(tab.value);
                                setPage(1);
                            }}
                            className={`inline-flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                                kind === tab.value
                                    ? 'shadow-theme-xs bg-white text-gray-900 dark:bg-white/[0.03] dark:text-white'
                                    : 'bg-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400'
                            }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </nav>

                <div className='w-full md:w-56'>
                    <CSelect
                        name='sales_channel'
                        options={CHANNEL_OPTIONS}
                        value={salesChannel}
                        onChange={(value) => {
                            setSalesChannel(value as '' | SalesChannel);
                            setPage(1);
                        }}
                    />
                </div>
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
