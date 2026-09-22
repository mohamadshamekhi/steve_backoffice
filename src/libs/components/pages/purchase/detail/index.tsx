'use client';

import { fetcher } from 'libs/api';
import ApiKeys from 'libs/api/keys';
import DeleteModal from 'libs/components/common/DeleteModal/DeleteModal';
import ContentWrapper from 'libs/components/common/contentWrapper/ContentWrapper';
import ROUTES from 'libs/constants/routes/routes.constants';
import {
    describeAttributes,
    formatDate,
    formatDateTime,
    formatNumber,
    formatToman,
    PAYMENT_STATE_CONFIG,
    PURCHASE_CANCEL,
    PURCHASE_CONFIRM,
    PURCHASE_STATUS_CONFIG,
    PURCHASE_UPDATE
} from 'libs/constants/warehouse/warehouse.constants';
import { usePermission } from 'libs/hooks/usePermission';
import { PAYMENT_METHOD_OPTIONS } from 'libs/constants/accounting/accounting.constants';
import { PaymentMethod } from 'libs/models/accounting.model';
import { IPurchase } from 'libs/models/warehouse.model';
import { Badge, Button, CSelect, Input, Link } from 'libs/ui';
import { Modal } from 'libs/ui/modal';
import { useState } from 'react';
import { toast } from 'react-toastify';
import useSWR from 'swr';

const Row = ({ label, value }: { label: string; value: React.ReactNode }) => (
    <div className='flex items-center justify-between border-b border-gray-100 py-2 text-sm dark:border-gray-800'>
        <span className='text-gray-500'>{label}</span>
        <span className='font-medium text-gray-800 dark:text-white/90'>{value}</span>
    </div>
);

const PurchaseDetail = ({ id }: { id: string }) => {
    const canUpdate = usePermission(PURCHASE_UPDATE);
    const canConfirm = usePermission(PURCHASE_CONFIRM);
    const canCancel = usePermission(PURCHASE_CANCEL);

    const [actionLoading, setActionLoading] = useState(false);
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [cancelOpen, setCancelOpen] = useState(false);
    const [paymentOpen, setPaymentOpen] = useState(false);
    const [paidAmount, setPaidAmount] = useState('0');
    const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash');

    const { data, isLoading, mutate } = useSWR([ApiKeys.GET_PURCHASE(id)], ([url]: [string]) =>
        fetcher(url, 'dashboard', 'GET')
    );

    const purchase: IPurchase | undefined = data?.data?.purchase;

    const runAction = async (action: 'confirm' | 'cancel') => {
        setActionLoading(true);
        try {
            const key = action === 'confirm' ? ApiKeys.POST_PURCHASE_CONFIRM(id) : ApiKeys.POST_PURCHASE_CANCEL(id);
            const response = await fetcher(key, 'dashboard', 'POST');
            if (response?.success) {
                toast.success(action === 'confirm' ? 'فاکتور تأیید شد' : 'فاکتور لغو شد');
                mutate();
            }
        } finally {
            setActionLoading(false);
            setConfirmOpen(false);
            setCancelOpen(false);
        }
    };

    const submitPayment = async () => {
        setActionLoading(true);
        try {
            const response = await fetcher(ApiKeys.POST_PURCHASE_PAYMENT(id), 'dashboard', 'POST', {
                body: { paid_amount: Number(paidAmount || 0), payment_method: paymentMethod }
            });
            if (response?.success) {
                toast.success('پرداخت ثبت شد');
                mutate();
                setPaymentOpen(false);
            }
        } finally {
            setActionLoading(false);
        }
    };

    if (isLoading) {
        return (
            <ContentWrapper title='جزئیات فاکتور خرید'>
                <div className='py-20 text-center text-sm text-gray-400'>در حال بارگذاری...</div>
            </ContentWrapper>
        );
    }

    if (!purchase) {
        return (
            <ContentWrapper title='جزئیات فاکتور خرید'>
                <div className='py-20 text-center text-sm text-gray-400'>فاکتوری یافت نشد.</div>
            </ContentWrapper>
        );
    }

    const statusConfig = PURCHASE_STATUS_CONFIG[purchase.status];
    const paymentConfig = PAYMENT_STATE_CONFIG[purchase.payment_state];
    const isDraft = purchase.status === 'draft';
    const isConfirmed = purchase.status === 'confirmed';

    return (
        <ContentWrapper
            title={`فاکتور خرید ${purchase.invoice_number || ''}`}
            extra={
                <div className='flex flex-wrap items-center gap-2'>
                    {isDraft && (
                        <>
                            {canUpdate ? (
                                <Link
                                    href={`${ROUTES.PurchaseDetail(purchase.id)}/edit`}
                                    className='rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 dark:border-gray-700 dark:text-gray-200'
                                >
                                    ویرایش
                                </Link>
                            ) : null}
                            <Button size='sm' disabled={!canConfirm} onClick={() => setConfirmOpen(true)}>
                                تأیید فاکتور
                            </Button>
                        </>
                    )}

                    {isConfirmed && (
                        <>
                            <span title='فاکتور تأییدشده قابل ویرایش نیست'>
                                <Button size='sm' variant='outline' disabled>
                                    ویرایش
                                </Button>
                            </span>
                            <Button
                                size='sm'
                                variant='outline'
                                onClick={() => {
                                    setPaidAmount(String(purchase.paid_amount ?? 0));
                                    setPaymentOpen(true);
                                }}
                                disabled={!canUpdate}
                            >
                                ثبت پرداخت
                            </Button>
                        </>
                    )}

                    {purchase.status === 'canceled' && (
                        <Button
                            size='sm'
                            variant='outline'
                            onClick={() => {
                                setPaidAmount(String(purchase.paid_amount ?? 0));
                                setPaymentOpen(true);
                            }}
                            disabled={!canUpdate}
                        >
                            ثبت پرداخت
                        </Button>
                    )}

                    {purchase.status !== 'canceled' && (
                        <Button
                            size='sm'
                            variant='outline'
                            className='text-error-500'
                            disabled={!canCancel}
                            onClick={() => setCancelOpen(true)}
                        >
                            لغو فاکتور
                        </Button>
                    )}
                </div>
            }
        >
            <div className='grid grid-cols-1 gap-6 lg:grid-cols-3'>
                <div className='lg:col-span-1'>
                    <Row label='تأمین‌کننده' value={purchase.supplier_name || '-'} />
                    <Row label='شماره فاکتور' value={purchase.invoice_number || '-'} />
                    <Row label='وضعیت فاکتور' value={<Badge color={statusConfig?.color ?? 'light'}>{statusConfig?.label ?? purchase.status}</Badge>} />
                    <Row
                        label='وضعیت پرداخت'
                        value={<Badge color={paymentConfig?.color ?? 'light'}>{paymentConfig?.label ?? purchase.payment_state}</Badge>}
                    />
                    <Row label='مبلغ کل' value={formatToman(purchase.total_amount)} />
                    <Row label='پرداخت‌شده' value={formatToman(purchase.paid_amount)} />
                    <Row label='مانده' value={formatToman(purchase.total_amount - purchase.paid_amount)} />
                    <Row label='تاریخ خرید' value={formatDate(purchase.purchased_at)} />
                    <Row label='تاریخ تأیید' value={purchase.confirmed_at ? formatDateTime(purchase.confirmed_at) : '-'} />
                    <Row
                        label='سفارش مرتبط'
                        value={
                            purchase.order_id ? (
                                <Link href={`${ROUTES.Orders}?id=${purchase.order_id}`} className='text-brand-500'>
                                    مشاهده سفارش
                                </Link>
                            ) : (
                                '-'
                            )
                        }
                    />
                    <Row label='یادداشت' value={purchase.note || '-'} />
                </div>

                <div className='lg:col-span-2'>
                    <h4 className='mb-2 text-sm font-medium text-gray-800 dark:text-white/90'>اقلام فاکتور</h4>
                    <div className='overflow-x-auto'>
                        <table className='min-w-full text-sm' dir='rtl'>
                            <thead>
                                <tr className='text-gray-500'>
                                    <th className='px-3 py-2 text-right font-medium'>محصول</th>
                                    <th className='px-3 py-2 text-right font-medium'>واریانت</th>
                                    <th className='px-3 py-2 text-right font-medium'>تعداد</th>
                                    <th className='px-3 py-2 text-right font-medium'>قیمت واحد</th>
                                    <th className='px-3 py-2 text-right font-medium'>جمع</th>
                                    <th className='px-3 py-2 text-right font-medium'>انبار</th>
                                </tr>
                            </thead>
                            <tbody>
                                {(purchase.items ?? []).map((item, index) => (
                                    <tr key={`${item.variant_id}-${index}`} className='border-t border-gray-100 dark:border-gray-800'>
                                        <td className='px-3 py-2'>{item.product_name || item.product_id}</td>
                                        <td className='px-3 py-2'>{describeAttributes(item.variant_attributes) || '-'}</td>
                                        <td className='px-3 py-2'>{formatNumber(item.quantity)}</td>
                                        <td className='px-3 py-2'>{formatToman(item.unit_cost)}</td>
                                        <td className='px-3 py-2'>
                                            {formatToman(item.total_cost ?? item.quantity * item.unit_cost)}
                                        </td>
                                        <td className='px-3 py-2'>
                                            <Badge color={item.add_to_stock ? 'success' : 'light'}>
                                                {item.add_to_stock ? 'وارد انبار' : 'تحویل مستقیم'}
                                            </Badge>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            <DeleteModal
                isOpen={confirmOpen}
                loading={actionLoading}
                title='تأیید فاکتور خرید'
                description='با تأیید فاکتور، کالاها وارد انبار می‌شوند و قیمت تمام‌شده‌ی محصولات به‌روز می‌شود. پس از تأیید، این فاکتور دیگر قابل ویرایش نیست و برای اصلاح باید آن را لغو و دوباره ثبت کنید.'
                confirmText='تأیید فاکتور'
                cancelText='انصراف'
                onClose={() => setConfirmOpen(false)}
                onDelete={() => runAction('confirm')}
            />

            <DeleteModal
                isOpen={cancelOpen}
                loading={actionLoading}
                title='لغو فاکتور خرید'
                description='میانگین قیمت خرید محصولات به مقدار قبلی برنمی‌گردد. اگر قیمت اشتباه بوده، بعد از لغو، فاکتور صحیح را ثبت و تأیید کنید.'
                confirmText='لغو فاکتور'
                cancelText='انصراف'
                onClose={() => setCancelOpen(false)}
                onDelete={() => runAction('cancel')}
            />

            <Modal isOpen={paymentOpen} onClose={() => setPaymentOpen(false)} className='max-w-[480px] p-6'>
                <h3 className='mb-4 text-base font-medium text-gray-800 dark:text-white/90'>ثبت پرداخت</h3>
                <label className='mb-1 block text-xs text-gray-400'>مجموع پرداختی تا این لحظه (تومان)</label>
                <Input
                    name='paid_amount'
                    type='number'
                    min='0'
                    inputMode='numeric'
                    value={paidAmount}
                    onChange={(e) => setPaidAmount(e.target.value)}
                    hint={`مبلغ کل فاکتور: ${formatToman(purchase.total_amount)}`}
                />
                <label className='mt-4 mb-1 block text-xs text-gray-400'>روش پرداخت</label>
                <CSelect
                    name='payment_method'
                    options={PAYMENT_METHOD_OPTIONS}
                    value={paymentMethod}
                    onChange={(value) => setPaymentMethod(value as PaymentMethod)}
                />
                <p className='mt-1 text-xs text-gray-400'>مابه‌التفاوت پرداخت با همین روش در صندوق ثبت می‌شود.</p>
                <div className='mt-5 flex justify-end gap-2'>
                    <Button size='sm' variant='outline' onClick={() => setPaymentOpen(false)}>
                        انصراف
                    </Button>
                    <Button size='sm' loading={actionLoading} disabled={actionLoading} onClick={submitPayment}>
                        ثبت
                    </Button>
                </div>
            </Modal>
        </ContentWrapper>
    );
};

export default PurchaseDetail;
