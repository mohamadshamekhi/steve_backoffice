'use client';

import { useFormik } from 'formik';
import { fetcher } from 'libs/api';
import ApiKeys from 'libs/api/keys';
import ContentWrapper from 'libs/components/common/contentWrapper/ContentWrapper';
import ROUTES from 'libs/constants/routes/routes.constants';
import { usePermission, useRole } from 'libs/hooks/usePermission';
import { IReferralSettings, IReferralSettingsResponse } from 'libs/models/referral.model';
import { Badge, Button, Input, Switch } from 'libs/ui';
import Fieldset from 'libs/ui/form/FieldSet/Fieldset';
import SelectInput from 'libs/ui/select';
import { referralSettingsSchema } from 'libs/validator/schemas/referral.schema';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'react-toastify';
import useSWR from 'swr';
import { toFormikValidationSchema } from 'zod-formik-adapter';
import { DISCOUNT_TYPE_OPTIONS, formatReferralDate, REFERRAL_MANAGE, REFERRAL_ROLES } from '../constants';

const isFetchError = (res: unknown): res is { status: number } =>
    !!res && typeof res === 'object' && 'status' in res && typeof (res as { status: unknown }).status === 'number';

const DEFAULT_VALUES: IReferralSettings = {
    reward_threshold: 5,
    reward_discount_type: 'percentage',
    reward_discount_value: 10,
    reward_valid_days: 30,
    reward_minimum_purchase_amount: 0,
    welcome_discount_enabled: true,
    welcome_discount_type: 'percentage',
    welcome_discount_value: 5,
    welcome_valid_days: 30
};

const Settings = () => {
    const router = useRouter();
    const hasManagePermission = usePermission(REFERRAL_MANAGE);
    const isMarketer = useRole(REFERRAL_ROLES);
    const canManage = hasManagePermission || isMarketer;
    const [loading, setLoading] = useState(false);

    const { data, isLoading } = useSWR(ApiKeys.GET_REFERRAL_SETTINGS, (url: string) =>
        fetcher(url, 'dashboard', 'GET')
    );
    const response: IReferralSettingsResponse | undefined = data?.data;

    const formik = useFormik<IReferralSettings>({
        initialValues: response?.settings ?? DEFAULT_VALUES,
        enableReinitialize: true,
        validationSchema: toFormikValidationSchema(referralSettingsSchema),
        onSubmit: async (values) => {
            setLoading(true);
            try {
                const body = {
                    ...values,
                    reward_threshold: Number(values.reward_threshold),
                    reward_discount_value: Number(values.reward_discount_value),
                    reward_valid_days: Number(values.reward_valid_days),
                    reward_minimum_purchase_amount: Number(values.reward_minimum_purchase_amount),
                    welcome_discount_value: Number(values.welcome_discount_value),
                    welcome_valid_days: Number(values.welcome_valid_days)
                };
                const res = await fetcher(ApiKeys.PUT_REFERRAL_SETTINGS, 'dashboard', 'PUT', { body });
                if (isFetchError(res)) return;
                toast.success('تنظیمات با موفقیت ذخیره شد');
                router.push(ROUTES.Referral);
            } finally {
                setLoading(false);
            }
        }
    });

    if (isLoading) {
        return (
            <ContentWrapper title='تنظیمات تخفیف دعوت'>
                <div className='flex min-h-[200px] items-center justify-center'>
                    <span className='h-8 w-8 animate-spin rounded-full border-2 border-gray-300 border-t-transparent' />
                </div>
            </ContentWrapper>
        );
    }

    const welcomeEnabled = formik.values.welcome_discount_enabled;

    return (
        <ContentWrapper
            title='تنظیمات تخفیف دعوت'
            extra={
                <Button variant='outline' size='sm' onClick={() => router.push(ROUTES.Referral)}>
                    بازگشت
                </Button>
            }
        >
            {response && (
                <div className='mb-6 flex flex-wrap items-center gap-3 rounded-xl border border-gray-200 p-4 text-sm dark:border-gray-800'>
                    <Badge color={response.program_enabled ? 'success' : 'error'}>
                        {response.program_enabled ? 'برنامهٔ دعوت فعال است' : 'برنامهٔ دعوت غیرفعال است'}
                    </Badge>
                    <Badge color={response.source === 'custom' ? 'info' : 'light'}>
                        {response.source === 'custom' ? 'تنظیمات سفارشی' : 'مقادیر پیش‌فرض کانفیگ'}
                    </Badge>
                    <span className='text-gray-400'>
                        لینک دعوت: <span dir='ltr'>{response.invite_base_url}</span>
                    </span>
                    {response.updated_at && (
                        <span className='text-gray-400'>
                            آخرین تغییر: {formatReferralDate(response.updated_at)}
                            {response.updated_by ? ` توسط ${response.updated_by}` : ''}
                        </span>
                    )}
                </div>
            )}

            <form onSubmit={formik.handleSubmit} className='space-y-8'>
                <section>
                    <h3 className='mb-3 font-semibold text-gray-800 dark:text-white/90'>پاداش دعوت‌کننده</h3>
                    <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                        <Fieldset
                            label='حد نصاب پاداش (تعداد عضو)'
                            name='reward_threshold'
                            touched={formik.touched}
                            errors={formik.errors}
                        >
                            <Input
                                type='number'
                                name='reward_threshold'
                                min='1'
                                value={formik.values.reward_threshold}
                                onChange={formik.handleChange}
                                error={Boolean(formik.touched.reward_threshold && formik.errors.reward_threshold)}
                            />
                        </Fieldset>

                        <Fieldset
                            label='نوع تخفیف پاداش'
                            name='reward_discount_type'
                            touched={formik.touched}
                            errors={formik.errors}
                        >
                            <SelectInput
                                name='reward_discount_type'
                                options={DISCOUNT_TYPE_OPTIONS}
                                value={formik.values.reward_discount_type}
                                onChange={(val) => formik.setFieldValue('reward_discount_type', val)}
                            />
                        </Fieldset>

                        <Fieldset
                            label={
                                formik.values.reward_discount_type === 'percentage'
                                    ? 'مقدار تخفیف (۱ تا ۱۰۰ درصد)'
                                    : 'مبلغ تخفیف (تومان)'
                            }
                            name='reward_discount_value'
                            touched={formik.touched}
                            errors={formik.errors}
                        >
                            <Input
                                type='number'
                                name='reward_discount_value'
                                min='0'
                                value={formik.values.reward_discount_value}
                                onChange={formik.handleChange}
                                error={Boolean(
                                    formik.touched.reward_discount_value && formik.errors.reward_discount_value
                                )}
                            />
                        </Fieldset>

                        <Fieldset
                            label='مدت اعتبار کد پاداش (روز)'
                            name='reward_valid_days'
                            touched={formik.touched}
                            errors={formik.errors}
                        >
                            <Input
                                type='number'
                                name='reward_valid_days'
                                min='1'
                                value={formik.values.reward_valid_days}
                                onChange={formik.handleChange}
                                error={Boolean(formik.touched.reward_valid_days && formik.errors.reward_valid_days)}
                            />
                        </Fieldset>

                        <Fieldset
                            label='حداقل مبلغ خرید برای پاداش (تومان)'
                            name='reward_minimum_purchase_amount'
                            touched={formik.touched}
                            errors={formik.errors}
                        >
                            <Input
                                type='number'
                                name='reward_minimum_purchase_amount'
                                min='0'
                                value={formik.values.reward_minimum_purchase_amount}
                                onChange={formik.handleChange}
                                error={Boolean(
                                    formik.touched.reward_minimum_purchase_amount &&
                                        formik.errors.reward_minimum_purchase_amount
                                )}
                            />
                        </Fieldset>
                    </div>
                </section>

                <section>
                    <div className='mb-3 flex items-center gap-3'>
                        <h3 className='font-semibold text-gray-800 dark:text-white/90'>تخفیف خوش‌آمدگویی دعوت‌شده</h3>
                        <Switch
                            name='welcome_discount_enabled'
                            checked={welcomeEnabled}
                            onChange={(checked) => formik.setFieldValue('welcome_discount_enabled', checked)}
                        />
                    </div>

                    {welcomeEnabled && (
                        <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                            <Fieldset
                                label='نوع تخفیف خوش‌آمد'
                                name='welcome_discount_type'
                                touched={formik.touched}
                                errors={formik.errors}
                            >
                                <SelectInput
                                    name='welcome_discount_type'
                                    options={DISCOUNT_TYPE_OPTIONS}
                                    value={formik.values.welcome_discount_type}
                                    onChange={(val) => formik.setFieldValue('welcome_discount_type', val)}
                                />
                            </Fieldset>

                            <Fieldset
                                label={
                                    formik.values.welcome_discount_type === 'percentage'
                                        ? 'مقدار تخفیف (۱ تا ۱۰۰ درصد)'
                                        : 'مبلغ تخفیف (تومان)'
                                }
                                name='welcome_discount_value'
                                touched={formik.touched}
                                errors={formik.errors}
                            >
                                <Input
                                    type='number'
                                    name='welcome_discount_value'
                                    min='0'
                                    value={formik.values.welcome_discount_value}
                                    onChange={formik.handleChange}
                                    error={Boolean(
                                        formik.touched.welcome_discount_value &&
                                            formik.errors.welcome_discount_value
                                    )}
                                />
                            </Fieldset>

                            <Fieldset
                                label='مدت اعتبار کد خوش‌آمد (روز)'
                                name='welcome_valid_days'
                                touched={formik.touched}
                                errors={formik.errors}
                            >
                                <Input
                                    type='number'
                                    name='welcome_valid_days'
                                    min='1'
                                    value={formik.values.welcome_valid_days}
                                    onChange={formik.handleChange}
                                    error={Boolean(
                                        formik.touched.welcome_valid_days && formik.errors.welcome_valid_days
                                    )}
                                />
                            </Fieldset>
                        </div>
                    )}
                </section>

                <p className='text-xs text-gray-400'>
                    تغییرات بدون ری‌استارت اعمال می‌شود و فقط روی کدهای تخفیفِ جدید اثر دارد.
                </p>

                <Button
                    type='submit'
                    size='sm'
                    loading={loading}
                    disabled={loading || !canManage}
                    className='w-fit'
                >
                    ذخیرهٔ تنظیمات
                </Button>
                {!canManage && (
                    <p className='text-xs text-red-500'>شما اجازهٔ ویرایش این تنظیمات را ندارید.</p>
                )}
            </form>
        </ContentWrapper>
    );
};

export default Settings;
