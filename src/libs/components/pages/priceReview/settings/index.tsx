'use client';

import { useFormik } from 'formik';
import { fetcher } from 'libs/api';
import ApiKeys from 'libs/api/keys';
import ContentWrapper from 'libs/components/common/contentWrapper/ContentWrapper';
import ROUTES from 'libs/constants/routes/routes.constants';
import { usePermission } from 'libs/hooks/usePermission';
import { IPriceReviewSettings } from 'libs/models/priceReview.model';
import { Button, Input } from 'libs/ui';
import Fieldset from 'libs/ui/form/FieldSet/Fieldset';
import { priceReviewSettingsSchema } from 'libs/validator/schemas/priceReview.schema';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'react-toastify';
import useSWR from 'swr';
import { toFormikValidationSchema } from 'zod-formik-adapter';
import { PRICE_REVIEW_MANAGE } from '../constants';

const DEFAULT_VALUES: IPriceReviewSettings = { interval_days: 30 };

const Settings = () => {
    const router = useRouter();
    const canManage = usePermission(PRICE_REVIEW_MANAGE);
    const [loading, setLoading] = useState(false);

    const { data, isLoading } = useSWR(ApiKeys.GET_PRICE_REVIEW_SETTINGS, (url: string) =>
        fetcher(url, 'dashboard', 'GET')
    );

    const formik = useFormik<IPriceReviewSettings>({
        initialValues: data?.data ?? DEFAULT_VALUES,
        enableReinitialize: true,
        validationSchema: toFormikValidationSchema(priceReviewSettingsSchema),
        onSubmit: async (values) => {
            setLoading(true);
            try {
                await fetcher(ApiKeys.PUT_PRICE_REVIEW_SETTINGS, 'dashboard', 'PUT', {
                    body: { interval_days: Number(values.interval_days) }
                });
                toast.success('تنظیمات با موفقیت ذخیره شد');
                router.push(ROUTES.PriceReview);
            } finally {
                setLoading(false);
            }
        }
    });

    if (isLoading) {
        return (
            <ContentWrapper title='تنظیمات بازبینی قیمت'>
                <div className='flex min-h-[200px] items-center justify-center'>
                    <span className='h-8 w-8 animate-spin rounded-full border-2 border-gray-300 border-t-transparent' />
                </div>
            </ContentWrapper>
        );
    }

    return (
        <ContentWrapper
            title='تنظیمات بازبینی قیمت'
            extra={
                <Button variant='outline' size='sm' onClick={() => router.push(ROUTES.PriceReview)}>
                    بازگشت
                </Button>
            }
        >
            <form onSubmit={formik.handleSubmit} className='space-y-6'>
                <div className='grid grid-cols-1 gap-4 md:max-w-sm'>
                    <Fieldset
                        label='بازه بازبینی قیمت (روز)'
                        name='interval_days'
                        touched={formik.touched}
                        errors={formik.errors}
                    >
                        <Input
                            type='number'
                            name='interval_days'
                            min='1'
                            value={formik.values.interval_days}
                            onChange={formik.handleChange}
                            error={Boolean(formik.touched.interval_days && formik.errors.interval_days)}
                        />
                    </Fieldset>
                </div>

                <Button type='submit' size='sm' loading={loading} disabled={loading || !canManage} className='w-fit'>
                    ذخیره
                </Button>
                {!canManage && <p className='text-xs text-red-500'>شما اجازهٔ ویرایش این تنظیمات را ندارید.</p>}
            </form>
        </ContentWrapper>
    );
};

export default Settings;
