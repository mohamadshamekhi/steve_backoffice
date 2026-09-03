'use client';

import { fetcher } from 'libs/api';
import ApiKeys from 'libs/api/keys';
import { IPartner } from 'libs/models/partner.model';
import { Badge, Button } from 'libs/ui';
import TextArea from 'libs/ui/form/textArea';
import { ChangeEvent, useState } from 'react';
import { toast } from 'react-toastify';
import { formatPartnerDate, getPartnerStatusConfig } from '../constants';

interface ReviewProps {
    partner: IPartner;
    onDone: () => void;
}

const Row = ({ label, value, dir }: { label: string; value: React.ReactNode; dir?: 'ltr' | 'rtl' }) => (
    <li className='flex flex-wrap items-start gap-2 border-b border-gray-100 py-2 last:border-b-0'>
        <div className='basis-1/3 font-semibold text-gray-400'>{label}</div>
        <span dir={dir} className='flex-1'>
            {value || '-'}
        </span>
    </li>
);

const isValidationError = (res: unknown): res is { status: number } =>
    !!res && typeof res === 'object' && 'status' in res && typeof (res as { status: unknown }).status === 'number';

const Review = ({ partner, onDone }: ReviewProps) => {
    const statusConfig = getPartnerStatusConfig(partner.status);

    const [loadingAction, setLoadingAction] = useState<string | null>(null);
    const [approveDiscount, setApproveDiscount] = useState<string>(String(partner.discount_percent ?? 0));
    const [rejectReason, setRejectReason] = useState('');
    const [pricingDiscount, setPricingDiscount] = useState<string>(String(partner.discount_percent ?? 0));

    const runAction = async (
        action: string,
        key: string,
        method: 'POST' | 'PATCH',
        body?: Record<string, unknown>
    ) => {
        setLoadingAction(action);
        try {
            const res = await fetcher(key, 'dashboard', method, body ? { body } : undefined);
            if (isValidationError(res)) return;
            toast.success('عملیات با موفقیت انجام شد.');
            onDone();
        } finally {
            setLoadingAction(null);
        }
    };

    const handleApprove = () => {
        const value = Number(approveDiscount);
        if (!Number.isInteger(value) || value < 0 || value > 90) {
            toast.error('درصد تخفیف همکار نامعتبر است.');
            return;
        }
        runAction('approve', ApiKeys.APPROVE_PARTNER(partner.id), 'POST', { discount_percent: value });
    };

    const handleReject = () => {
        const reason = rejectReason.trim();
        if (reason.length < 3 || reason.length > 500) {
            toast.error('دلیل الزامی است و باید بین ۳ تا ۵۰۰ کاراکتر باشد.');
            return;
        }
        runAction('reject', ApiKeys.REJECT_PARTNER(partner.id), 'POST', { reason });
    };

    const handleUpdatePricing = () => {
        const value = Number(pricingDiscount);
        if (!Number.isInteger(value) || value < 0 || value > 90) {
            toast.error('درصد تخفیف همکار نامعتبر است.');
            return;
        }
        runAction('pricing', ApiKeys.PATCH_PARTNER_PRICING(partner.id), 'PATCH', { discount_percent: value });
    };

    return (
        <div className='mt-6 space-y-6'>
            <div className='flex items-center justify-between'>
                <h2 className='text-lg font-semibold text-gray-900 dark:text-white/90'>جزئیات درخواست همکاری</h2>
                <Badge color={statusConfig.color}>{statusConfig.label}</Badge>
            </div>

            <ul className='rounded-lg border border-gray-200 p-4 text-sm dark:border-gray-800'>
                <Row label='نام شرکت' value={partner.company_name} />
                <Row label='کد ملی / شناسه' value={partner.national_id} dir='ltr' />
                <Row label='حوزهٔ فعالیت' value={partner.business_field} />
                <Row label='شهر' value={partner.city} />
                <Row label='درصد تخفیف' value={`${partner.discount_percent}%`} />
                <Row label='تاریخ ثبت' value={formatPartnerDate(partner.created_at)} />
                <Row label='تاریخ بررسی' value={formatPartnerDate(partner.reviewed_at)} />
                {partner.status === 'rejected' && <Row label='دلیل رد' value={partner.rejection_reason} />}
            </ul>

            {partner.status === 'pending' && (
                <div className='space-y-6'>
                    <div className='rounded-lg border border-gray-200 p-4 dark:border-gray-800'>
                        <h3 className='mb-3 font-medium text-gray-700 dark:text-gray-300'>تأیید درخواست</h3>
                        <label className='mb-1.5 block text-sm text-gray-500'>درصد تخفیف همکار (۰ تا ۹۰)</label>
                        <input
                            type='number'
                            min={0}
                            max={90}
                            value={approveDiscount}
                            onChange={(e) => setApproveDiscount(e.target.value)}
                            className='shadow-theme-xs focus:border-brand-300 focus:ring-brand-500/10 mb-3 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm focus:ring-3 focus:outline-hidden dark:border-gray-700 dark:bg-gray-900 dark:text-white/90'
                        />
                        <Button
                            variant='success'
                            size='sm'
                            onClick={handleApprove}
                            loading={loadingAction === 'approve'}
                            disabled={!!loadingAction}
                        >
                            تأیید
                        </Button>
                    </div>

                    <div className='rounded-lg border border-gray-200 p-4 dark:border-gray-800'>
                        <h3 className='mb-3 font-medium text-gray-700 dark:text-gray-300'>رد درخواست</h3>
                        <label className='mb-1.5 block text-sm text-gray-500'>دلیل رد (۳ تا ۵۰۰ کاراکتر)</label>
                        <TextArea
                            value={rejectReason}
                            onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setRejectReason(e.target.value)}
                            placeholder='دلیل رد درخواست را وارد کنید...'
                            rows={3}
                            className='mb-3'
                        />
                        <Button
                            variant='danger'
                            size='sm'
                            onClick={handleReject}
                            loading={loadingAction === 'reject'}
                            disabled={!!loadingAction}
                        >
                            رد
                        </Button>
                    </div>
                </div>
            )}

            {partner.status === 'approved' && (
                <div className='space-y-6'>
                    <div className='rounded-lg border border-gray-200 p-4 dark:border-gray-800'>
                        <h3 className='mb-3 font-medium text-gray-700 dark:text-gray-300'>تغییر درصد تخفیف</h3>
                        <input
                            type='number'
                            min={0}
                            max={90}
                            value={pricingDiscount}
                            onChange={(e) => setPricingDiscount(e.target.value)}
                            className='shadow-theme-xs focus:border-brand-300 focus:ring-brand-500/10 mb-3 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm focus:ring-3 focus:outline-hidden dark:border-gray-700 dark:bg-gray-900 dark:text-white/90'
                        />
                        <Button
                            size='sm'
                            onClick={handleUpdatePricing}
                            loading={loadingAction === 'pricing'}
                            disabled={!!loadingAction}
                        >
                            ذخیره درصد تخفیف
                        </Button>
                    </div>

                    <div className='rounded-lg border border-gray-200 p-4 dark:border-gray-800'>
                        <h3 className='mb-3 font-medium text-gray-700 dark:text-gray-300'>تعلیق همکار</h3>
                        <Button
                            variant='warning'
                            size='sm'
                            onClick={() => runAction('suspend', ApiKeys.SUSPEND_PARTNER(partner.id), 'POST')}
                            loading={loadingAction === 'suspend'}
                            disabled={!!loadingAction}
                        >
                            تعلیق
                        </Button>
                    </div>
                </div>
            )}

            {partner.status === 'suspended' && (
                <div className='rounded-lg border border-gray-200 p-4 dark:border-gray-800'>
                    <h3 className='mb-3 font-medium text-gray-700 dark:text-gray-300'>رفع تعلیق همکار</h3>
                    <Button
                        variant='success'
                        size='sm'
                        onClick={() => runAction('unsuspend', ApiKeys.UNSUSPEND_PARTNER(partner.id), 'POST')}
                        loading={loadingAction === 'unsuspend'}
                        disabled={!!loadingAction}
                    >
                        رفع تعلیق
                    </Button>
                </div>
            )}
        </div>
    );
};

export default Review;
