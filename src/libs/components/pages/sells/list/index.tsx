'use client';

import { ColumnDef } from '@tanstack/react-table';
import { fetcher } from 'libs/api';
import ApiKeys from 'libs/api/keys';
import ContentWrapper from 'libs/components/common/contentWrapper/ContentWrapper';
import Pagination from 'libs/components/common/Pagination';
import { Button, Table } from 'libs/ui';
import { Modal } from 'libs/ui/modal';
import SelectInput from 'libs/ui/select';
import { useState } from 'react';
import { toast } from 'react-toastify';
import useSWR from 'swr';

interface SellProps {
    id: string;
    user_id: {
        name: string;
        phone_number: string;
    };
    brand_name: string;
    product_name: string;
    color: string;
    battery_health: string;
    register_status: string;
    physical_condition: string;
    description: string;
    status: string;
    created_at: string;
    updated_at: string;
}

const STATUS_OPTIONS = [
    { label: 'ثبت شده', value: 'new' },
    { label: 'در انتظار ارسال', value: 'pending_shipment' },
    { label: 'ارسال شده', value: 'shipped' },
    { label: 'در حال بررسی فنی', value: 'under_inspection' },
    { label: 'پیشنهاد قیمت داده شده', value: 'offer_made' },
    { label: 'پیشنهاد پذیرفته شد', value: 'offer_accepted' },
    { label: 'پرداخت انجام شد', value: 'payment_processed' },
    { label: 'پیشنهاد رد شد', value: 'offer_rejected' },
    { label: 'بازگردانده شد', value: 'returned_to_customer' },
    { label: 'لغو شده', value: 'canceled' },
    { label: 'رد شده', value: 'rejected' }
];

const getStatusLabel = (status: string) => {
    const found = STATUS_OPTIONS.find((opt) => opt.value === status);
    return found?.label || status;
};

const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
        new: 'bg-blue-100 text-blue-800',
        pending_shipment: 'bg-yellow-100 text-yellow-800',
        shipped: 'bg-purple-100 text-purple-800',
        under_inspection: 'bg-orange-100 text-orange-800',
        offer_made: 'bg-cyan-100 text-cyan-800',
        offer_accepted: 'bg-green-100 text-green-800',
        payment_processed: 'bg-emerald-100 text-emerald-800',
        offer_rejected: 'bg-red-100 text-red-800',
        returned_to_customer: 'bg-gray-100 text-gray-800',
        canceled: 'bg-red-100 text-red-800',
        rejected: 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
};

const List: React.FC = () => {
    const [page, setPage] = useState(1);
    const limit = 25;

    const { data, isLoading, mutate } = useSWR(ApiKeys.GET_ALL_SELLS(page, limit), (url: string) =>
        fetcher(url, 'dashboard', 'GET')
    );

    const [selectedSell, setSelectedSell] = useState<SellProps | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [editStatus, setEditStatus] = useState('');
    const [updateLoading, setUpdateLoading] = useState(false);

    const openDetailsModal = (sell: SellProps) => {
        setSelectedSell(sell);
        setEditStatus(sell.status);
        setIsEditMode(false);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedSell(null);
        setIsEditMode(false);
    };

    const handleUpdateStatus = async () => {
        if (!selectedSell) return;

        setUpdateLoading(true);
        try {
            const { status } = await fetcher(ApiKeys.PATCH_SELL(selectedSell.id), 'dashboard', 'PATCH', {
                body: { status: editStatus }
            });

            if (status !== 400) {
                toast.success('وضعیت با موفقیت بروزرسانی شد');
                mutate();
                closeModal();
            }
        } catch (error) {
            console.error('Failed to update status:', error);
            toast.error('خطا در بروزرسانی وضعیت');
        } finally {
            setUpdateLoading(false);
        }
    };

    const columns: ColumnDef<SellProps>[] = [
        {
            accessorKey: 'id',
            header: '#',
            cell: ({ row }) => row.index + 1,
            enableSorting: true,
            maxSize: 50
        },
        {
            accessorKey: 'user_id.name',
            header: 'نام مشتری',
            enableResizing: true,
            filterFn: 'includesString',
            enableSorting: true,
            cell: ({ row }) => <div className='line-clamp-1 text-ellipsis'>{row.original.user_id?.name ?? '-'}</div>
        },
        {
            accessorKey: 'product_name',
            header: 'نام محصول',
            filterFn: 'includesString',
            cell: ({ row }) => (
                <div className='line-clamp-1 max-w-[200px] text-ellipsis'>{row.original.product_name || '-'}</div>
            )
        },
        {
            accessorKey: 'status',
            header: 'وضعیت',
            filterFn: 'includesString',
            cell: ({ row }) => (
                <span className={`rounded-full px-2 py-1 text-xs ${getStatusColor(row.original.status)}`}>
                    {getStatusLabel(row.original.status)}
                </span>
            )
        },
        {
            accessorKey: 'created_at',
            header: 'تاریخ ثبت',
            filterFn: 'includesString',
            cell: ({ row }) => new Date(row.original.created_at).toLocaleDateString('fa-ir')
        },
        {
            id: 'actions',
            header: 'عملیات',
            cell: ({ row }) => (
                <Button variant='outline' size='sm' onClick={() => openDetailsModal(row.original)}>
                    جزئیات
                </Button>
            )
        }
    ];

    return (
        <ContentWrapper title='لیست فروش'>
            <div className='relative'>
                <Table<SellProps>
                    headerClass='text-nowrap'
                    columns={columns}
                    data={data?.data?.sells ?? []}
                    loading={isLoading}
                />
            </div>

            <Pagination
                currentPage={page}
                total={data?.data?.pagination?.total ?? 0}
                pageSize={limit}
                onPageChange={(newPage) => setPage(newPage)}
            />

            <Modal isOpen={isModalOpen} onClose={closeModal}>
                {selectedSell && (
                    <div className='space-y-6'>
                        <div className='flex items-center justify-between'>
                            <h2 className='text-lg font-semibold text-gray-900'>جزئیات درخواست فروش</h2>
                            <span className={`rounded-full px-3 py-1 text-sm ${getStatusColor(selectedSell.status)}`}>
                                {getStatusLabel(selectedSell.status)}
                            </span>
                        </div>

                        <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                            <div className='rounded-lg border border-gray-200 bg-gray-50 p-4'>
                                <h3 className='mb-3 font-medium text-gray-700'>اطلاعات مشتری</h3>
                                <div className='space-y-2 text-sm'>
                                    <div className='flex justify-between'>
                                        <span className='text-gray-500'>نام:</span>
                                        <span className='font-medium'>{selectedSell.user_id?.name || '-'}</span>
                                    </div>
                                    <div className='flex justify-between'>
                                        <span className='text-gray-500'>شماره تماس:</span>
                                        <span className='font-medium' dir='ltr'>
                                            {selectedSell.user_id?.phone_number || '-'}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className='rounded-lg border border-gray-200 bg-gray-50 p-4'>
                                <h3 className='mb-3 font-medium text-gray-700'>اطلاعات محصول</h3>
                                <div className='space-y-2 text-sm'>
                                    <div className='flex justify-between'>
                                        <span className='text-gray-500'>برند:</span>
                                        <span className='font-medium'>{selectedSell.brand_name || '-'}</span>
                                    </div>
                                    <div className='flex justify-between'>
                                        <span className='text-gray-500'>محصول:</span>
                                        <span className='font-medium'>{selectedSell.product_name || '-'}</span>
                                    </div>
                                    <div className='flex items-center justify-between'>
                                        <span className='text-gray-500'>رنگ:</span>
                                        <div className='flex items-center gap-2'>
                                            <span>{selectedSell.color}</span>
                                            <div
                                                className='h-4 w-4 rounded border border-gray-300'
                                                style={{ backgroundColor: selectedSell.color }}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className='rounded-lg border border-gray-200 bg-gray-50 p-4'>
                                <h3 className='mb-3 font-medium text-gray-700'>وضعیت دستگاه</h3>
                                <div className='space-y-2 text-sm'>
                                    <div className='flex justify-between'>
                                        <span className='text-gray-500'>سلامت باتری:</span>
                                        <span className='font-medium'>{selectedSell.battery_health}%</span>
                                    </div>
                                    <div className='flex justify-between'>
                                        <span className='text-gray-500'>وضعیت رجیستری:</span>
                                        <span className='font-medium'>{selectedSell.register_status}</span>
                                    </div>
                                    <div className='flex justify-between'>
                                        <span className='text-gray-500'>وضعیت فیزیکی:</span>
                                        <span className='font-medium'>{selectedSell.physical_condition}</span>
                                    </div>
                                </div>
                            </div>

                            <div className='rounded-lg border border-gray-200 bg-gray-50 p-4'>
                                <h3 className='mb-3 font-medium text-gray-700'>تاریخ‌ها</h3>
                                <div className='space-y-2 text-sm'>
                                    <div className='flex justify-between'>
                                        <span className='text-gray-500'>تاریخ ثبت:</span>
                                        <span className='font-medium'>
                                            {new Date(selectedSell.created_at).toLocaleDateString('fa-ir')}
                                        </span>
                                    </div>
                                    <div className='flex justify-between'>
                                        <span className='text-gray-500'>آخرین بروزرسانی:</span>
                                        <span className='font-medium'>
                                            {new Date(selectedSell.updated_at).toLocaleDateString('fa-ir')}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {selectedSell.description && (
                            <div className='rounded-lg border border-gray-200 bg-gray-50 p-4'>
                                <h3 className='mb-2 font-medium text-gray-700'>توضیحات</h3>
                                <p className='text-sm whitespace-pre-wrap text-gray-600'>{selectedSell.description}</p>
                            </div>
                        )}

                        <div className='border-t pt-4'>
                            {isEditMode ? (
                                <div className='space-y-4'>
                                    <div>
                                        <label className='mb-2 block text-sm font-medium text-gray-700'>
                                            تغییر وضعیت
                                        </label>
                                        <SelectInput
                                            name='status'
                                            options={STATUS_OPTIONS}
                                            value={editStatus}
                                            onChange={(val) => setEditStatus(val)}
                                        />
                                    </div>
                                    <div className='flex gap-2'>
                                        <Button
                                            size='sm'
                                            onClick={handleUpdateStatus}
                                            loading={updateLoading}
                                            disabled={updateLoading}
                                        >
                                            ذخیره
                                        </Button>
                                        <Button
                                            variant='outline'
                                            size='sm'
                                            onClick={() => setIsEditMode(false)}
                                            disabled={updateLoading}
                                        >
                                            انصراف
                                        </Button>
                                    </div>
                                </div>
                            ) : (
                                <Button variant='outline' size='sm' onClick={() => setIsEditMode(true)}>
                                    تغییر وضعیت
                                </Button>
                            )}
                        </div>
                    </div>
                )}
            </Modal>
        </ContentWrapper>
    );
};

export default List;
