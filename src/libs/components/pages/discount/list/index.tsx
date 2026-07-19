'use client';
import { ColumnDef } from '@tanstack/react-table';
import { fetcher } from 'libs/api';
import ApiKeys from 'libs/api/keys';
import { DeleteModal } from 'libs/components/common';
import ContentWrapper from 'libs/components/common/contentWrapper/ContentWrapper';
import Pagination from 'libs/components/common/Pagination';
import ROUTES from 'libs/constants/routes/routes.constants';
import { useModal } from 'libs/hooks/modal/useModal';
import { Badge, Button, Table } from 'libs/ui';
import { Dropdown } from 'libs/ui/dropdown/Dropdown';
import { Modal } from 'libs/ui/modal';
import { Case, formatDiscount, Switch } from 'libs/utilities';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'react-toastify';
import useSWR, { mutate } from 'swr';

enum DiscountTypeFa {
    fixed_amount = 'مبلغ ثابت',
    percentage = 'درصدی'
}

interface DiscountProps {
    id: string;
    code: string;
    type: 'percentage' | 'fixed_amount';
    value: number;
    created_at: string;
    updated_at: string;
    expires_at: string;
    starts_at: string;
    applicable_product_ids: string[];
    applicable_user_ids: string[];
    is_active: boolean;
    is_special: boolean;
}

interface ApplicableProductDetail {
    product_id: string;
    variant_id: string;
    discount_type: 'fixed_amount' | 'percentage';
    discount_value: number;
}

interface DiscountDetail {
    id: string;
    code: string;
    type: 'percentage' | 'fixed_amount';
    value: number;
    starts_at: string;
    expires_at: string;
    applicable_to: string;
    applicable_product_ids: ApplicableProductDetail[];
    is_active: boolean;
    is_special?: boolean;
    minimum_purchase_amount?: number;
    total_usage_limit?: number;
    created_at: string;
    updated_at: string;
}

interface IDetailProps {
    data: DiscountProps;
    onClose: () => void;
    isOpen: boolean;
}

const ProductItem = ({ productId }: { productId: string }) => {
    const { data: productData, isLoading } = useSWR(productId ? ApiKeys.GET_PRODUCT(productId) : null, (url) =>
        fetcher(url, 'dashboard', 'GET')
    );

    const product = productData?.data?.product;

    if (isLoading) {
        return (
            <div className='flex items-center gap-3 rounded border border-gray-200 p-3'>
                <div className='text-sm text-gray-500'>در حال بارگذاری...</div>
            </div>
        );
    }

    if (!product) {
        return (
            <div className='flex items-center gap-3 rounded border border-gray-200 p-3'>
                <div className='text-sm text-red-500'>محصول یافت نشد</div>
            </div>
        );
    }

    return (
        <div className='flex items-center gap-3 rounded border border-gray-200 p-3'>
            {product.images && product.images.length > 0 && (
                <Image
                    src={product.images[0]}
                    alt={product.name}
                    width={64}
                    height={64}
                    className='h-16 w-16 rounded object-cover'
                />
            )}
            <div className='font-medium'>{product.name}</div>
        </div>
    );
};

const Detail = ({ isOpen, onClose, data }: IDetailProps) => {
    const { data: discountDetails } = useSWR(isOpen && data?.id ? ApiKeys.GET_DISCOUNT(data.id) : null, (url) =>
        fetcher(url, 'dashboard', 'GET')
    );

    const discount: DiscountDetail | undefined = discountDetails?.data?.discount;

    if (!isOpen) return null;

    return (
        <Modal isOpen={isOpen} onClose={onClose} className='max-w-[800px]'>
            <div className='space-y-6'>
                <h2 className='text-xl font-bold'>جزئیات تخفیف</h2>

                <ul className='space-y-2 *:border-b *:border-gray-200 *:py-2'>
                    <li className='flex flex-wrap items-center gap-2'>
                        <span className='basis-1/4 text-gray-400'>نوع تخفیف کلی</span>
                        <Badge>{DiscountTypeFa[data.type]}</Badge>
                    </li>

                    <li className='flex flex-wrap items-center gap-2'>
                        <span className='basis-1/4 text-gray-400'>کد تخفیف</span>
                        <span>{discount?.code || data.code || '-'}</span>
                    </li>

                    <li className='flex flex-wrap items-center gap-2'>
                        <span className='basis-1/4 text-gray-400'>مقدار کلی</span>
                        <span>
                            {data.type === 'percentage' ? `${data.value}%` : `${data.value.toLocaleString()} تومان`}
                        </span>
                    </li>

                    {discount?.minimum_purchase_amount && (
                        <li className='flex flex-wrap items-center gap-2'>
                            <span className='basis-1/4 text-gray-400'>حداقل مبلغ خرید</span>
                            <span>{discount.minimum_purchase_amount.toLocaleString()} تومان</span>
                        </li>
                    )}

                    {discount?.total_usage_limit && (
                        <li className='flex flex-wrap items-center gap-2'>
                            <span className='basis-1/4 text-gray-400'>محدودیت استفاده</span>
                            <span>{discount.total_usage_limit} بار</span>
                        </li>
                    )}

                    <li className='flex flex-wrap items-center gap-2'>
                        <span className='basis-1/4 text-gray-400'>وضعیت</span>
                        <Badge color={discount?.is_active ? 'success' : 'error'}>
                            {discount?.is_active ? 'فعال' : 'غیرفعال'}
                        </Badge>
                    </li>

                    {discount?.is_special && (
                        <li className='flex flex-wrap items-center gap-2'>
                            <span className='basis-1/4 text-gray-400'>تخفیف ویژه</span>
                            <Badge color='warning'>ویژه</Badge>
                        </li>
                    )}

                    <li className='flex flex-wrap items-center gap-2'>
                        <span className='basis-1/4 text-gray-400'>زمان شروع</span>
                        <span>{new Date(data.starts_at).toLocaleDateString('fa-IR')}</span>
                    </li>

                    <li className='flex flex-wrap items-center gap-2'>
                        <span className='basis-1/4 text-gray-400'>زمان پایان</span>
                        <span>{new Date(data.expires_at).toLocaleDateString('fa-IR')}</span>
                    </li>
                </ul>

                {discount?.applicable_product_ids && discount.applicable_product_ids.length > 0 && (
                    <div>
                        <h3 className='mb-3 text-lg font-semibold'>محصولات قابل اعمال تخفیف</h3>
                        <div className='space-y-3'>
                            {discount.applicable_product_ids.map((item, index) => (
                                <ProductItem key={index} productId={item.product_id} />
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </Modal>
    );
};

interface ActionCellProps {
    data: DiscountProps;
    onDeleted: () => void;
}

const ActionCell = ({ data, onDeleted }: ActionCellProps) => {
    const router = useRouter();
    const [modalType, setModalType] = useState('');

    const [isOpenMenu, setIsOpenMenu] = useState(false);

    const { openModal, isOpen, closeModal } = useModal();

    const [deleteLoading, setDeleteLoading] = useState<boolean>(false);

    const toggleDropdown = () => setIsOpenMenu((prev) => !prev);

    const closeDropdown = () => setIsOpenMenu(false);

    const deleteDisCount = async () => {
        try {
            closeModal();
            toast.success('در حال حاضر حذف تخفیف ها امکان پذیر نیست');
            return null;
            //  TODO - when delete discount is available, uncomment this
            setDeleteLoading(true);
            await fetcher(ApiKeys.DELETE_DISCOUNT(data.id), 'dashboard', 'DELETE');
            onDeleted();
            closeModal();
            toast.success('حذف با موفقیت انجام شد');
            setDeleteLoading(false);
        } catch (error) {
            setDeleteLoading(false);
            console.error('Failed to delete Discount:', error);
        }
    };

    return (
        <div>
            <Button onClick={toggleDropdown} size='sm' variant='outline'>
                عملیات
            </Button>

            <Dropdown isOpen={isOpenMenu} onClose={closeDropdown} className='left-10 min-w-[150px]'>
                <Dropdown.Item
                    tag='button'
                    onItemClick={() => {
                        closeDropdown();
                        openModal();
                        setModalType('detail');
                    }}
                >
                    جزییات
                </Dropdown.Item>

                <Dropdown.Item
                    className='text-brand-500! hover:bg-brand-100! hover:text-brand-500'
                    tag='button'
                    onItemClick={() => {
                        closeDropdown();
                        router.push(`${ROUTES.EditDiscount}/${data.id}`);
                    }}
                >
                    ویرایش
                </Dropdown.Item>

                <Dropdown.Item
                    tag='button'
                    onItemClick={() => {
                        closeDropdown();
                        openModal();
                        setModalType('delete');
                    }}
                    className='text-red-500 hover:bg-red-100 hover:text-red-500'
                >
                    حذف
                </Dropdown.Item>
            </Dropdown>

            <Switch>
                <Case condition={modalType === 'delete'}>
                    <DeleteModal
                        isOpen={isOpen}
                        onClose={closeModal}
                        onDelete={() => deleteDisCount()}
                        loading={deleteLoading}
                    />
                </Case>

                <Case condition={modalType === 'detail'}>
                    <Detail data={data} isOpen={isOpen} onClose={closeModal} />
                </Case>
            </Switch>
        </div>
    );
};

const List: React.FC = () => {
    const [page, setPage] = useState(1);

    const limit = 10;

    const { data, isLoading } = useSWR(ApiKeys.GET_ALL_DISCOUNT(page, limit), (url: string) =>
        fetcher(url, 'dashboard', 'GET')
    );

    const columns: ColumnDef<DiscountProps>[] = [
        {
            accessorKey: 'id',
            header: '#',
            cell: ({ row }) => row.index + 1,
            enableSorting: true,
            maxSize: 50
        },

        {
            accessorKey: 'code',
            header: 'کد تخفیف',
            enableResizing: true,
            filterFn: 'includesString',
            enableSorting: true
        },

        {
            accessorKey: 'value',
            header: 'مقدار',
            enableResizing: true,
            filterFn: 'includesString',
            enableSorting: true,
            cell: ({ row }) => {
                return formatDiscount(row.original.value, row.original.type);
            }
        },
        {
            accessorKey: 'starts_at',
            header: 'زمان شروع',
            filterFn: 'includesString',
            cell: ({ row }) => {
                return new Date(row.original.starts_at).toLocaleString('fa-IR');
            }
        },
        {
            accessorKey: 'expires_at',
            header: 'زمان اتمام ',
            filterFn: 'includesString',
            cell: ({ row }) => {
                return new Date(row?.original?.expires_at).toLocaleString('fa-IR');
            }
        },
        {
            accessorKey: 'type',
            header: 'نوع',
            enableResizing: true,
            filterFn: 'includesString',
            enableSorting: true,
            cell: ({ row }) => <Badge>{DiscountTypeFa[row.original.type]}</Badge>
        },
        {
            accessorKey: 'is_active',
            header: 'وضعیت',
            enableResizing: true,
            filterFn: 'includesString',
            enableSorting: true,
            cell: ({ row }) => (
                <Badge color={row.original.is_active ? 'success' : 'error'}>
                    {row.original.is_active ? 'فعال' : 'غیرفعال'}
                </Badge>
            )
        },
        {
            id: 'actions',
            header: 'عملیات',
            cell: ({ row }) => (
                <ActionCell
                    data={row.original}
                    onDeleted={() => {
                        mutate(ApiKeys.GET_ALL_DISCOUNT);
                    }}
                />
            ),
            enableSorting: false
        }
    ];

    return (
        <ContentWrapper
            title='لیست تخفیف'
            extra={
                <Link
                    href={ROUTES.CreateDiscount}
                    className='bg-brand-500 hover:bg-brand-600 rounded-md px-4 py-2 text-sm font-semibold text-white'
                >
                    درج تخفیف +
                </Link>
            }
        >
            <div className='relative'>
                <Table<DiscountProps>
                    headerClass='text-nowrap'
                    columns={columns}
                    data={data?.data?.discounts ?? []}
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
