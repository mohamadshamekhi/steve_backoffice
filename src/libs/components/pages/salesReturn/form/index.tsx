'use client';

import { fetcher } from 'libs/api';
import ApiKeys from 'libs/api/keys';
import { PAYMENT_METHOD_OPTIONS } from 'libs/constants/accounting/accounting.constants';
import { describeAttributes, formatToman } from 'libs/constants/warehouse/warehouse.constants';
import { PaymentMethod } from 'libs/models/accounting.model';
import { Button, CSelect, Input, Switch } from 'libs/ui';
import { Modal } from 'libs/ui/modal';
import { useMemo, useState } from 'react';
import { toast } from 'react-toastify';
import { IPickerOrder } from '../orderPicker';

interface IProps {
    isOpen: boolean;
    order: IPickerOrder;
    onClose: () => void;
    mutate: () => void;
}

interface IRowState {
    selected: boolean;
    quantity: number;
    restock: boolean;
}

/** قیمت واقعی هر واحد پس از کسر تخفیف همان ردیف. */
const effectiveUnitPrice = (price: number, quantity: number, discount = 0) =>
    quantity > 0 ? Math.max(price - Math.floor(discount / quantity), 0) : price;

const SalesReturnForm = ({ isOpen, order, onClose, mutate }: IProps) => {
    const [loading, setLoading] = useState(false);
    const [rows, setRows] = useState<Record<string, IRowState>>(() =>
        Object.fromEntries(
            (order.items ?? []).map((item) => [
                item.VariantID,
                { selected: false, quantity: item.Quantity, restock: !item.IsCustom }
            ])
        )
    );

    const [refundAmount, setRefundAmount] = useState('');
    const [refundMethod, setRefundMethod] = useState<PaymentMethod>('cash');
    const [isRefunded, setIsRefunded] = useState(true);
    const [reason, setReason] = useState('');

    const selectedItems = useMemo(
        () => (order.items ?? []).filter((item) => rows[item.VariantID]?.selected),
        [order.items, rows]
    );

    // برآورد ارزش اقلام برگشتی؛ مبلغ نهایی را بک‌اند از روی خود سفارش محاسبه می‌کند.
    const itemsAmount = useMemo(
        () =>
            selectedItems.reduce((sum, item) => {
                const row = rows[item.VariantID];
                return sum + effectiveUnitPrice(item.PriceAtTime, item.Quantity, item.DiscountAmount) * row.quantity;
            }, 0),
        [selectedItems, rows]
    );

    const setRow = (variantId: string, patch: Partial<IRowState>) =>
        setRows((prev) => ({ ...prev, [variantId]: { ...prev[variantId], ...patch } }));

    const handleSubmit = async () => {
        if (selectedItems.length === 0) {
            toast.error('حداقل یک قلم را انتخاب کنید');
            return;
        }

        const amount = refundAmount === '' ? undefined : Number(refundAmount);

        if (amount !== undefined && amount > itemsAmount) {
            toast.error('مبلغ استرداد نمی‌تواند از ارزش اقلام برگشتی بیشتر باشد');
            return;
        }

        setLoading(true);
        try {
            const response = await fetcher(ApiKeys.POST_SALES_RETURN, 'dashboard', 'POST', {
                body: {
                    order_id: order.id,
                    items: selectedItems.map((item) => ({
                        variant_id: item.VariantID,
                        quantity: rows[item.VariantID].quantity,
                        restock: rows[item.VariantID].restock
                    })),
                    ...(amount !== undefined && { refund_amount: amount }),
                    is_refunded: isRefunded,
                    ...(isRefunded && { refund_method: refundMethod }),
                    ...(reason && { reason })
                }
            });

            if (response?.success) {
                toast.success('مرجوعی ثبت شد');
                mutate();
                onClose();
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} className='max-w-[820px] p-6'>
            <h3 className='text-base font-medium text-gray-800 dark:text-white/90'>ثبت مرجوعی</h3>
            <p className='mt-1 text-xs text-gray-400'>
                سفارش {order.user_name || 'بدون نام'} · <span dir='ltr'>{order.user_phone_number}</span>
            </p>

            <div className='mt-4 max-h-[42vh] space-y-2 overflow-y-auto'>
                {(order.items ?? []).map((item) => {
                    const row = rows[item.VariantID];
                    const unitPrice = effectiveUnitPrice(item.PriceAtTime, item.Quantity, item.DiscountAmount);

                    return (
                        <div
                            key={item.VariantID}
                            className={`rounded-xl border p-3 transition-colors ${
                                row?.selected
                                    ? 'border-brand-500 bg-brand-500/5'
                                    : 'border-gray-200 dark:border-gray-800'
                            }`}
                        >
                            <div className='flex flex-wrap items-center justify-between gap-3'>
                                <label className='flex cursor-pointer items-center gap-3'>
                                    <input
                                        type='checkbox'
                                        className='accent-brand-500 size-4'
                                        checked={Boolean(row?.selected)}
                                        onChange={(e) => setRow(item.VariantID, { selected: e.target.checked })}
                                    />
                                    <span className='text-sm text-gray-800 dark:text-white/90'>
                                        {item.ProductName}
                                        <span className='mr-2 text-xs text-gray-400'>
                                            {describeAttributes(item.VariantAttributes)}
                                        </span>
                                    </span>
                                </label>
                                <span className='text-xs text-gray-400'>
                                    {formatToman(unitPrice)} × {item.Quantity}
                                </span>
                            </div>

                            {row?.selected && (
                                <div className='mt-3 flex flex-wrap items-end gap-4'>
                                    <div className='w-32'>
                                        <label className='mb-1 block text-xs text-gray-400'>تعداد برگشتی</label>
                                        <Input
                                            name={`quantity-${item.VariantID}`}
                                            type='number'
                                            min='1'
                                            max={String(item.Quantity)}
                                            value={row.quantity}
                                            onChange={(e) =>
                                                setRow(item.VariantID, {
                                                    quantity: Math.min(
                                                        Math.max(Number(e.target.value || 1), 1),
                                                        item.Quantity
                                                    )
                                                })
                                            }
                                        />
                                    </div>
                                    <div>
                                        <label className='mb-1 block text-xs text-gray-400'>بازگشت به انبار</label>
                                        <Switch
                                            name={`restock-${item.VariantID}`}
                                            checked={row.restock}
                                            onChange={(checked) => setRow(item.VariantID, { restock: checked })}
                                            size='md'
                                            variant='primary'
                                        />
                                    </div>
                                    <p className='text-xs text-gray-400'>
                                        کالای معیوب یا خدمات را بدون بازگشت به انبار ثبت کنید.
                                    </p>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            <div className='mt-5 grid grid-cols-1 gap-3 md:grid-cols-2'>
                <div>
                    <label className='mb-1 block text-xs text-gray-400'>مبلغ استرداد (خالی = کل ارزش اقلام)</label>
                    <Input
                        name='refund_amount'
                        numeric
                        inputMode='numeric'
                        placeholder={String(itemsAmount)}
                        value={refundAmount}
                        onChange={(e) => setRefundAmount(e.target.value)}
                    />
                </div>

                <div>
                    <label className='mb-1 block text-xs text-gray-400'>دلیل مرجوعی</label>
                    <Input name='reason' value={reason} onChange={(e) => setReason(e.target.value)} />
                </div>

                <div>
                    <label className='mb-1 block text-xs text-gray-400'>پول برگردانده شد</label>
                    <Switch
                        name='is_refunded'
                        checked={isRefunded}
                        onChange={setIsRefunded}
                        size='md'
                        variant='primary'
                    />
                </div>

                {isRefunded && (
                    <div>
                        <label className='mb-1 block text-xs text-gray-400'>روش استرداد</label>
                        <CSelect
                            name='refund_method'
                            options={PAYMENT_METHOD_OPTIONS}
                            value={refundMethod}
                            onChange={(value) => setRefundMethod(value as PaymentMethod)}
                        />
                    </div>
                )}
            </div>

            <div className='mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-gray-200 pt-4 dark:border-gray-800'>
                <p className='text-sm text-gray-500 dark:text-gray-400'>
                    ارزش اقلام انتخاب‌شده: <span className='font-bold'>{formatToman(itemsAmount)}</span>
                </p>
                <div className='flex items-center gap-2'>
                    <Button variant='outline' size='sm' onClick={onClose} type='button'>
                        انصراف
                    </Button>
                    <Button loading={loading} disabled={loading} size='sm' onClick={handleSubmit}>
                        ثبت مرجوعی
                    </Button>
                </div>
            </div>
        </Modal>
    );
};

export default SalesReturnForm;
