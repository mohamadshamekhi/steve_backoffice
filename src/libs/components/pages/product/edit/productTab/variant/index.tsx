'use client';
import { ColumnDef } from '@tanstack/react-table';
import { fetcher } from 'libs/api';
import ApiKeys from 'libs/api/keys';
import { DeleteModal } from 'libs/components/common';
import ContentWrapper from 'libs/components/common/contentWrapper/ContentWrapper';
import { useModal } from 'libs/hooks/modal/useModal';
import { Button, Table } from 'libs/ui';
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
                    <Dropdown.Item
                        tag='button'
                        onItemClick={() => {
                            console.log(454546);
                            closeDropdown();
                            openModal();
                            setModalType('delete');
                            console.log(333);
                        }}
                        className='text-red-500 hover:bg-red-100 hover:text-red-500'
                    >
                        حذف
                    </Dropdown.Item>
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
            enableSorting: true
        },
        {
            id: 'actions',
            header: 'عملیات',
            cell: ({ row }) => {
                const variantKeys = row?.original?.variant_attribute.map((item) => item.id)[0];
                console.log(variantKeys, 'variantKeys');
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
                // insertModalHandler(id)}
                // TODO : fix them
                <Button size='sm' onClick={() => insertModalHandler()}>
                    درج نوع محصول +
                </Button>
            }
        >
            <div className='relative'>
                <Table<VariantModel>
                    headerClass='text-nowrap'
                    columns={columns}
                    data={product?.data?.product?.variants ?? []}
                    loading={isLoading}
                />
            </div>

            <AddVariant id={id} mutate={mutate} onClose={insertCloseModal} isOpen={insertIsOpen} />
        </ContentWrapper>
    );
};

export default ProductVariant;
