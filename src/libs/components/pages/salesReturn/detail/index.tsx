'use client';

import { fetcher } from 'libs/api';
import ApiKeys from 'libs/api/keys';
import {
    PAYMENT_METHOD_OPTIONS,
    paymentMethodLabel,
    SALES_RETURN_REFUND
} from 'libs/constants/accounting/accounting.constants';
import { describeAttributes, formatDateTime, formatToman } from 'libs/constants/warehouse/warehouse.constants';
import { usePermission } from 'libs/hooks/usePermission';
import { ISalesReturn, PaymentMethod } from 'libs/models/accounting.model';
import { Badge, Button, CSelect } from 'libs/ui';
import { Modal } from 'libs/ui/modal';
import { useState } from 'react';
import { toast } from 'react-toastify';
import useSWR from 'swr';

interface IProps {
    isOpen: boolean;
    id: string;
    onClose: () => void;
    mutate: () => void;
}

const Row = ({ label, value }: { label: string; value: React.ReactNode }) => (
    <div className='flex items-center justify-between border-b border-gray-100 py-2 text-sm last:border-0 dark:border-gray-800'>
        <span className='text-gray-400'>{label}</span>
        <span className='text-gray-800 dark:text-white/90'>{value}</span>
    </div>
);

const SalesReturnDetail = ({ isOpen, id, onClose, mutate }: IProps) => {
    const canRefund = usePermission(SALES_RETURN_REFUND);
    const [refundMethod, setRefundMethod] = useState<PaymentMethod>('cash');
    const [loading, setLoading] = useState(false);

    const { data, isLoading, mutate: mutateDetail } = useSWR([ApiKeys.GET_SALES_RETURN(id)], ([url]: [string]) =>
        fetcher(url, 'dashboard', 'GET')
    );

    const salesReturn: ISalesReturn | undefined = data?.data?.sales_return;

    const submitRefund = async () => {
        setLoading(true);
        try {
            const response = await fetcher(ApiKeys.POST_SALES_RETURN_REFUND(id), 'dashboard', 'POST', {
                body: { refund_method: refundMethod }
            });

            if (response?.success) {
                toast.success('استرداد ثبت شد');
                mutateDetail();
                mutate();
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} className='max-w-[760px] p-6'>
            <h3 className='text-base font-medium text-gray-800 dark:text-white/90'>جزئیات مرجوعی</h3>

            {isLoading && <p className='py-16 text-center text-sm text-gray-400'>در حال بارگذاری...</p>}

            {!isLoading && !salesReturn && (
                <p className='py-16 text-center text-sm text-gray-400'>مرجوعی یافت نشد.</p>
            )}

            {salesReturn && (
                <>
                    <div className='mt-4 grid grid-cols-1 gap-x-8 md:grid-cols-2'>
                        <Row label='شماره سفارش' value={<span dir='ltr' className='font-mono text-xs'>{salesReturn.order_id}</span>} />
                        <Row label='تاریخ برگشت' value={formatDateTime(salesReturn.returned_at)} />
                        <Row label='ارزش اقلام' value={formatToman(salesReturn.items_amount)} />
                        <Row label='مبلغ مسترد شده' value={formatToman(salesReturn.refund_amount)} />
                        <Row label='بهای تمام‌شده برگشتی' value={formatToman(salesReturn.returned_cost)} />
                        <Row label='روش استرداد' value={paymentMethodLabel(salesReturn.refund_method)} />
                        <Row
                            label='وضعیت استرداد'
                            value={
                                <Badge color={salesReturn.is_refunded ? 'success' : 'warning'}>
                                    {salesReturn.is_refunded ? 'پرداخت شده' : 'در انتظار پرداخت'}
                                </Badge>
                            }
                        />
                        <Row label='دلیل' value={salesReturn.reason || '-'} />
                    </div>

                    <div className='mt-5 space-y-2'>
                        <p className='text-sm font-medium text-gray-800 dark:text-white/90'>اقلام برگشتی</p>
                        {salesReturn.items.map((item) => (
                            <div
                                key={item.variant_id}
                                className='flex flex-wrap items-center justify-between gap-2 rounded-xl border border-gray-200 p-3 text-sm dark:border-gray-800'
                            >
                                <span className='text-gray-800 dark:text-white/90'>
                                    {item.product_name || item.variant_id}
                                    <span className='mr-2 text-xs text-gray-400'>
                                        {describeAttributes(item.variant_attributes)}
                                    </span>
                                </span>
                                <span className='flex items-center gap-3 text-xs text-gray-400'>
                                    <span>
                                        {formatToman(item.unit_price)} × {item.quantity}
                                    </span>
                                    <Badge color={item.restock ? 'success' : 'light'}>
                                        {item.restock ? 'برگشت به انبار' : 'بدون بازگشت به انبار'}
                                    </Badge>
                                </span>
                            </div>
                        ))}
                    </div>

                    {!salesReturn.is_refunded && (
                        <div className='mt-5 flex flex-wrap items-end gap-3 border-t border-gray-200 pt-4 dark:border-gray-800'>
                            <div className='w-full md:w-48'>
                                <label className='mb-1 block text-xs text-gray-400'>روش استرداد</label>
                                <CSelect
                                    name='refund_method'
                                    options={PAYMENT_METHOD_OPTIONS}
                                    value={refundMethod}
                                    onChange={(value) => setRefundMethod(value as PaymentMethod)}
                                />
                            </div>
                            <Button size='sm' loading={loading} disabled={loading || !canRefund} onClick={submitRefund}>
                                ثبت استرداد
                            </Button>
                        </div>
                    )}
                </>
            )}

            <div className='mt-5 flex justify-end'>
                <Button variant='outline' size='sm' onClick={onClose} type='button'>
                    بستن
                </Button>
            </div>
        </Modal>
    );
};

export default SalesReturnDetail;
