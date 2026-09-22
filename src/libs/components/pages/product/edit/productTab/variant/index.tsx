'use client';
import { ColumnDef } from '@tanstack/react-table';
import { fetcher } from 'libs/api';
import ApiKeys from 'libs/api/keys';
import { DeleteModal } from 'libs/components/common';
import ContentWrapper from 'libs/components/common/contentWrapper/ContentWrapper';
import { STOCK_MODE_CONFIG } from 'libs/constants/warehouse/warehouse.constants';
import { useModal } from 'libs/hooks/modal/useModal';
import { StockMode } from 'libs/models/warehouse.model';
import { Badge, Button, Table } from 'libs/ui';
import { Dropdown } from 'libs/ui/dropdown/Dropdown';
import { Case, Switch } from 'libs/utilities';
import { useState } from 'react';
import { toast } from 'react-toastify';
import useSWR from 'swr';
import AddVariant from './addvariant';
import EditVariant from './editVarinat';

interface VariantAttribute {
    value: string;
    label: string;
    key: string;
    id: string;
}
interface VariantModel {
    id: string;
    price: number;
    quantity: number;
    warranty: string;
    variant_attribute: VariantAttribute[];
    stock_mode?: StockMode;
    allow_backorder?: boolean;
    backorder_limit?: number | null;
    supplier_id?: string;
    supply_cost?: number;
    avg_cost?: number;
}

interface ActionCellProps {
    data: VariantModel;
    variantKeys: string;
    id: string;
    onDeleted: () => void;
    onUpdated: () => void;
}

const ProductVariant = ({ id }: { id: string }) => {
    const {
        isLoading,
        data: product,
        mutate
    } = useSWR(ApiKeys.GET_PRODUCT(id), (url: string) => fetcher(url, 'dashboard', 'GET'));

    const isService = product?.data?.product?.kind === 'service';

    const { openModal: insertModal, isOpen: insertIsOpen, closeModal: insertCloseModal } = useModal();

    const insertModalHandler = () => {
        // id: string
        // TODO : FIX them
        insertModal();
    };

    const ActionCell = ({ id, variantKeys, onDeleted, data, onUpdated }: ActionCellProps) => {
        const [isOpenMenu, setIsOpenMenu] = useState(false);
        const [modalType, setModalType] = useState('');
        const { openModal, isOpen, closeModal } = useModal();

        const toggleDropdown = () => setIsOpenMenu((prev) => !prev);
        const closeDropdown = () => setIsOpenMenu(false);

        const deleteVariant = async (id: string, key: string) => {
            try {
                // const { status } = await fetcher(ApiKeys.PATCH_PRODUCT_DELETE_VARIANT(id, key), 'dashboard', 'PATCH');
                await fetcher(ApiKeys.PATCH_PRODUCT_DELETE_VARIANT(id, key), 'dashboard', 'PATCH');

                onDeleted();
                closeModal();
                await mutate();
                toast.success('حذف با موفقیت انجام شد');
            } catch (error) {
                console.error('Failed to delete Variant:', error);
            }
        };
        return (
            <div>
                <Button onClick={toggleDropdown} size='sm' variant='outline'>
                    عملیات
                </Button>

                <Dropdown isOpen={isOpenMenu} onClose={closeDropdown} className='left-10 min-w-[150px]'>
                    <Dropdown.Item
                        className='text-brand-500! hover:bg-brand-100! hover:text-brand-500'
                        tag='button'
                        onItemClick={() => {
                            closeDropdown();
                            openModal();
                            setModalType('edit');
                        }}
                    >
                        ویرایش
                    </Dropdown.Item>
                    {/* واریانت خدمت را بک‌اند اجازه‌ی حذف نمی‌دهد (product.service_variant_not_deletable) */}
                    {!isService && (
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
                    )}
                </Dropdown>

                <Switch>
                    <Case condition={modalType === 'edit'}>
                        <EditVariant
                            mutate={mutate}
                            onUpdated={onUpdated}
                            data={data}
                            onClose={closeModal}
                            isOpen={isOpen}
                            id={id}
                            isService={isService}
                        />
                    </Case>

                    <Case condition={modalType === 'delete'}>
                        <DeleteModal
                            onDelete={() => deleteVariant(id, variantKeys)}
                            onClose={closeModal}
                            isOpen={isOpen}
                        />
                    </Case>
                </Switch>
            </div>
        );
    };

    const columns: ColumnDef<VariantModel>[] = [
        {
            accessorKey: 'id',
            header: '#',
            enableSorting: true,
            maxSize: 50,
            cell: ({ row }) => row.index + 1
        },
        {
            accessorKey: 'price',
            header: 'قیمت',
            filterFn: 'includesString',
            enableSorting: true
        },
        {
            accessorKey: 'label',
            header: 'برچسب محصول',
            enableResizing: true,
            filterFn: 'includesString',
            enableSorting: true,
            cell: ({ row }) => (
                <div className='flex flex-col gap-1'>
                    {row.original?.variant_attribute.map((item, index) => (
                        <span key={index}>{item.label}</span>
                    ))}
                </div>
            )
        },
        {
            accessorKey: 'key',
            header: 'شناسه',
            enableResizing: true,
            filterFn: 'includesString',
            enableSorting: true,
            cell: ({ row }) => (
                <div className='flex flex-col gap-1'>
                    {row.original?.variant_attribute.map((item, index) => (
                        <span key={index}>{item.key}</span>
                    ))}
                </div>
            )
        },
        {
            accessorKey: 'value',
            header: 'مقدار',
            enableResizing: true,
            filterFn: 'includesString',
            enableSorting: true,
            cell: ({ row }) => (
                <div className='flex flex-col gap-1'>
                    {row.original?.variant_attribute.map((item, index) => (
                        <span
                            className='block aspect-square w-6 rounded-md border border-gray-200'
                            key={index}
                            style={{
                                backgroundColor: item.value
                            }}
                        ></span>
                    ))}
                </div>
            )
        },
        {
            accessorKey: 'warranty',
            header: 'گارانتی',
            enableResizing: true,
            filterFn: 'includesString',
            enableSorting: true
        },
        {
            accessorKey: 'quantity',
            header: 'تعداد',
            enableResizing: true,
            filterFn: 'includesString',
            enableSorting: true,
            cell: ({ row }) => (row.original.stock_mode === 'tracked' ? row.original.quantity : '-')
        },
        {
            accessorKey: 'stock_mode',
            header: 'حالت موجودی',
            enableSorting: false,
            cell: ({ row }) => {
                const mode = row.original.stock_mode ?? 'tracked';
                const config = STOCK_MODE_CONFIG[mode];
                return <Badge color={config?.color ?? 'light'}>{config?.label ?? mode}</Badge>;
            }
        },
        {
            id: 'actions',
            header: 'عملیات',
            cell: ({ row }) => {
                return (
                    <ActionCell
                        data={row.original}
                        onDeleted={() => {
                            mutate();
                        }}
                        onUpdated={() => {
                            mutate();
                        }}
                        id={id}
                        variantKeys={row?.original?.id}
                    />
                );
            },
            enableSorting: false
        }
    ];

    return (
        <ContentWrapper
            title='لیست نوع محصول'
            extra={
                // خدمات فقط یک واریانت دارند و بک‌اند افزودن واریانت جدید را رد می‌کند
                // (product.service_single_variant)
                isService ? undefined : (
                    <Button size='sm' onClick={() => insertModalHandler()}>
                        درج نوع محصول +
                    </Button>
                )
            }
        >
            {isService && (
                <p className='mb-3 text-sm text-gray-500 dark:text-gray-400'>
                    خدمات فقط یک واریانت دارند و امکان افزودن یا حذف واریانت برایشان وجود ندارد. برای تغییر قیمت، از تب
                    «مشخصات محصول» استفاده کنید.
                </p>
            )}

            <div className='relative'>
                <Table<VariantModel>
                    headerClass='text-nowrap'
                    columns={columns}
                    data={product?.data?.product?.variants ?? []}
                    loading={isLoading}
                />
            </div>

            <AddVariant
                id={id}
                mutate={mutate}
                onClose={insertCloseModal}
                isOpen={insertIsOpen}
                isService={isService}
            />
        </ContentWrapper>
    );
};

export default ProductVariant;
