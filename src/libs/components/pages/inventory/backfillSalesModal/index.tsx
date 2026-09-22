'use client';

import { fetcher } from 'libs/api';
import ApiKeys from 'libs/api/keys';
import { DateRangeFilter, useDateRange } from 'libs/components/pages/report/shared';
import { formatNumber } from 'libs/constants/warehouse/warehouse.constants';
import { Button } from 'libs/ui';
import { Modal } from 'libs/ui/modal';
import { useState } from 'react';
import { toast } from 'react-toastify';

interface IProps {
    isOpen: boolean;
    onClose: () => void;
}

interface IBackfillResult {
    scanned: number;
    recorded: number;
    skipped: number;
}

/** ثبت فروش سفارش‌های قدیمی در دفتر حرکت کالا تا در گزارش سود و داشبورد بیایند. اجرای دوباره بی‌خطر است. */
const BackfillSalesModal = ({ isOpen, onClose }: IProps) => {
    const range = useDateRange();
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<IBackfillResult | null>(null);

    const submit = async () => {
        if (!range.fromDate || !range.toDate) {
            toast.error('بازه‌ی تاریخ را کامل انتخاب کنید');
            return;
        }
        setLoading(true);
        try {
            const response = await fetcher(ApiKeys.POST_INVENTORY_BACKFILL_SALES, 'dashboard', 'POST', {
                params: { from: range.fromDate, to: range.toDate }
            });
            if (response?.success) {
                setResult(response.data);
                toast.success('فروش‌های جاافتاده ثبت شد');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} className='max-w-[520px] p-6'>
            <h3 className='text-base font-medium text-gray-800 dark:text-white/90'>ثبت فروش سفارش‌های قدیمی</h3>
            <p className='mt-2 text-sm text-gray-500 dark:text-gray-400'>
                سفارش‌های این بازه (به‌جز در انتظار پرداخت و لغو شده) که در دفتر انبار ثبت نشده‌اند، ثبت می‌شوند تا در گزارش سود و
                داشبورد بیایند. سفارش‌های ثبت‌شده رد می‌شوند، پس اجرای دوباره مشکلی ندارد.
            </p>

            <div className='mt-5 flex flex-wrap items-end gap-3'>
                <DateRangeFilter {...range} />
            </div>

            {result && (
                <div className='mt-5 grid grid-cols-3 gap-3 text-center'>
                    {[
                        { label: 'بررسی‌شده', value: result.scanned },
                        { label: 'ثبت‌شده', value: result.recorded, className: 'text-success-600' },
                        { label: 'ردشده', value: result.skipped }
                    ].map((item) => (
                        <div key={item.label} className='rounded-xl bg-gray-50 p-3 dark:bg-white/[0.03]'>
                            <p className='text-xs text-gray-400'>{item.label}</p>
                            <p className={`mt-1 text-lg font-bold text-gray-900 dark:text-white ${item.className ?? ''}`}>
                                {formatNumber(item.value)}
                            </p>
                        </div>
                    ))}
                </div>
            )}

            <div className='mt-6 flex justify-end gap-2'>
                <Button type='button' size='sm' variant='outline' onClick={onClose}>
                    بستن
                </Button>
                <Button type='button' size='sm' loading={loading} disabled={loading} onClick={submit}>
                    اجرا
                </Button>
            </div>
        </Modal>
    );
};

export default BackfillSalesModal;
