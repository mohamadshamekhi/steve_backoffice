'use client';

import { useFormik } from 'formik';
import { fetcher } from 'libs/api';
import ApiKeys from 'libs/api/keys';
import ContentWrapper from 'libs/components/common/contentWrapper/ContentWrapper';
import { usePermission, useRole } from 'libs/hooks/usePermission';
import { IBirthdayRunResult, IBirthdaySettings, IBirthdaySettingsResponse } from 'libs/models/birthday.model';
import { Badge, Button, Input, Switch } from 'libs/ui';
import Fieldset from 'libs/ui/form/FieldSet/Fieldset';
import SelectInput from 'libs/ui/select';
import { birthdaySettingsSchema } from 'libs/validator/schemas/birthday.schema';
import { useState } from 'react';
import { toast } from 'react-toastify';
import useSWR, { useSWRConfig } from 'swr';
import { toFormikValidationSchema } from 'zod-formik-adapter';
import { DISCOUNT_TYPE_OPTIONS, describeDiscount } from '../../referral/constants';
import {
    BIRTHDAY_MANAGE,
    BIRTHDAY_ROLES,
    describeDaysBefore,
    formatDate,
    formatHour,
    SEND_HOUR_OPTIONS
} from '../constants';

const isFetchError = (res: unknown): res is { status: number } =>
    !!res && typeof res === 'object' && 'status' in res && typeof (res as { status: unknown }).status === 'number';

const DEFAULT_VALUES: IBirthdaySettings = {
    enabled: true,
    days_before: 3,
    send_hour: 10,
    discount_type: 'fixed_amount',
    discount_value: 500000,
    valid_days: 10,
    minimum_purchase_amount: 0
};

const Settings = () => {
    const hasManagePermission = usePermission(BIRTHDAY_MANAGE);
    const isMarketer = useRole(BIRTHDAY_ROLES);
    const canManage = hasManagePermission || isMarketer;
    const { mutate } = useSWRConfig();
    const [loading, setLoading] = useState(false);
    const [running, setRunning] = useState(false);
    const [runResult, setRunResult] = useState<IBirthdayRunResult | null>(null);

    const { data, isLoading } = useSWR(ApiKeys.GET_BIRTHDAY_SETTINGS, (url: string) =>
        fetcher(url, 'dashboard', 'GET')
    );
    const response: IBirthdaySettingsResponse | undefined = data?.data;

    const formik = useFormik<IBirthdaySettings>({
        initialValues: response?.settings ?? DEFAULT_VALUES,
        enableReinitialize: true,
        validationSchema: toFormikValidationSchema(birthdaySettingsSchema),
        onSubmit: async (values) => {
            setLoading(true);
            try {
                const body = {
                    ...values,
                    days_before: Number(values.days_before),
                    send_hour: Number(values.send_hour),
                    discount_value: Number(values.discount_value),
                    valid_days: Number(values.valid_days),
                    minimum_purchase_amount: Number(values.minimum_purchase_amount)
                };
                const res = await fetcher(ApiKeys.PUT_BIRTHDAY_SETTINGS, 'dashboard', 'PUT', { body });
                if (isFetchError(res)) return;
                toast.success('تنظیمات با موفقیت ذخیره شد');
                mutate(ApiKeys.GET_BIRTHDAY_SETTINGS);
            } finally {
                setLoading(false);
            }
        }
    });

    const runNow = async () => {
        if (!window.confirm('کد تخفیف و پیامک برای همه‌ی کسانی که تولدشان در بازه است و هنوز کد نگرفته‌اند ارسال شود؟')) {
            return;
        }
        setRunning(true);
        try {
            const res = await fetcher(ApiKeys.RUN_BIRTHDAY_JOB, 'dashboard', 'POST');
            if (isFetchError(res)) return;
            setRunResult(res.data);
            toast.success('اجرا انجام شد');
            mutate((key) => Array.isArray(key) && key[0] === ApiKeys.GET_BIRTHDAY_REWARDS);
        } finally {
            setRunning(false);
        }
    };

    if (isLoading) {
        return (
            <ContentWrapper title='تنظیمات کد تخفیف تولد'>
                <div className='flex min-h-[200px] items-center justify-center'>
                    <span className='h-8 w-8 animate-spin rounded-full border-2 border-gray-300 border-t-transparent' />
                </div>
            </ContentWrapper>
        );
    }

    const v = formik.values;
    const isPercent = v.discount_type === 'percentage';

    return (
        <ContentWrapper title='تنظیمات کد تخفیف تولد'>
            {response && (
                <div className='mb-6 flex flex-wrap items-center gap-3 rounded-xl border border-gray-200 p-4 text-sm dark:border-gray-800'>
                    <Badge color={response.settings.enabled ? 'success' : 'error'}>
                        {response.settings.enabled ? 'ارسال خودکار فعال است' : 'ارسال خودکار غیرفعال است'}
                    </Badge>
                    <Badge color={response.source === 'custom' ? 'info' : 'light'}>
                        {response.source === 'custom' ? 'تنظیمات سفارشی' : 'مقادیر پیش‌فرض کانفیگ'}
                    </Badge>
                    {response.updated_at && (
                        <span className='text-gray-400'>
                            آخرین تغییر: {formatDate(response.updated_at)}
                            {response.updated_by ? ` توسط ${response.updated_by}` : ''}
                        </span>
                    )}
                </div>
            )}

            <form onSubmit={formik.handleSubmit} className='space-y-8'>
                <section>
                    <div className='mb-3 flex items-center gap-3'>
                        <h3 className='font-semibold text-gray-800 dark:text-white/90'>ارسال خودکار کد تولد</h3>
                        <Switch
                            name='enabled'
                            checked={v.enabled}
                            onChange={(checked) => formik.setFieldValue('enabled', checked)}
                        />
                    </div>
                    <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                        <Fieldset
                            label='چند روز قبل از تولد ارسال شود (۰ = همان روز)'
                            name='days_before'
                            touched={formik.touched}
                            errors={formik.errors}
                        >
                            <Input
                                type='number'
                                name='days_before'
                                min='0'
                                max='30'
                                value={v.days_before}
                                onChange={formik.handleChange}
                                error={Boolean(formik.touched.days_before && formik.errors.days_before)}
                            />
                        </Fieldset>

                        <Fieldset
                            label='ساعت ارسال (به وقت تهران)'
                            name='send_hour'
                            touched={formik.touched}
                            errors={formik.errors}
                        >
                            <SelectInput
                                name='send_hour'
                                options={SEND_HOUR_OPTIONS}
                                isClearable={false}
                                value={String(v.send_hour)}
                                onChange={(val) => formik.setFieldValue('send_hour', Number(val))}
                            />
                        </Fieldset>
                    </div>
                </section>

                <section>
                    <h3 className='mb-3 font-semibold text-gray-800 dark:text-white/90'>کد تخفیف</h3>
                    <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                        <Fieldset
                            label='نوع تخفیف'
                            name='discount_type'
                            touched={formik.touched}
                            errors={formik.errors}
                        >
                            <SelectInput
                                name='discount_type'
                                options={DISCOUNT_TYPE_OPTIONS}
                                isClearable={false}
                                value={v.discount_type}
                                onChange={(val) => formik.setFieldValue('discount_type', val)}
                            />
                        </Fieldset>

                        <Fieldset
                            label={isPercent ? 'مقدار تخفیف (۱ تا ۱۰۰ درصد)' : 'مبلغ تخفیف (تومان)'}
                            name='discount_value'
                            touched={formik.touched}
                            errors={formik.errors}
                        >
                            <Input
                                type='number'
                                name='discount_value'
                                min='0'
                                value={v.discount_value}
                                onChange={formik.handleChange}
                                error={Boolean(formik.touched.discount_value && formik.errors.discount_value)}
                            />
                        </Fieldset>

                        <Fieldset
                            label='مدت اعتبار کد (روز)'
                            name='valid_days'
                            touched={formik.touched}
                            errors={formik.errors}
                        >
                            <Input
                                type='number'
                                name='valid_days'
                                min='1'
                                max='365'
                                value={v.valid_days}
                                onChange={formik.handleChange}
                                error={Boolean(formik.touched.valid_days && formik.errors.valid_days)}
                            />
                        </Fieldset>

                        <Fieldset
                            label='حداقل مبلغ خرید (تومان، ۰ = بدون محدودیت)'
                            name='minimum_purchase_amount'
                            touched={formik.touched}
                            errors={formik.errors}
                        >
                            <Input
                                type='number'
                                name='minimum_purchase_amount'
                                min='0'
                                value={v.minimum_purchase_amount}
                                onChange={formik.handleChange}
                                error={Boolean(
                                    formik.touched.minimum_purchase_amount && formik.errors.minimum_purchase_amount
                                )}
                            />
                        </Fieldset>
                    </div>
                </section>

                <div className='bg-primary-50 dark:bg-primary-500/10 rounded-xl p-4 text-sm leading-7 text-gray-700 dark:text-gray-300'>
                    {v.enabled ? (
                        <>
                            هر روز ساعت {formatHour(Number(v.send_hour) || 0)}، برای کاربرانی که{' '}
                            {describeDaysBefore(Number(v.days_before) || 0)} یک کد{' '}
                            <strong>{describeDiscount(v.discount_type, Number(v.discount_value) || 0)}</strong> با اعتبار{' '}
                            {(Number(v.valid_days) || 0).toLocaleString('fa-IR')} روز پیامک می‌شود. هر کاربر سالی فقط یک
                            کد می‌گیرد.
                        </>
                    ) : (
                        'ارسال خودکار خاموش است؛ هیچ کد یا پیامکی ارسال نمی‌شود.'
                    )}
                </div>

                <div className='flex flex-wrap items-center gap-3'>
                    <Button type='submit' size='sm' loading={loading} disabled={loading || !canManage} className='w-fit'>
                        ذخیرهٔ تنظیمات
                    </Button>
                    <Button
                        type='button'
                        size='sm'
                        variant='outline'
                        loading={running}
                        disabled={running || !canManage || !response?.settings.enabled}
                        onClick={runNow}
                        className='w-fit'
                    >
                        اجرای همین الان
                    </Button>
                </div>
                {!canManage && <p className='text-xs text-red-500'>شما اجازهٔ ویرایش این تنظیمات را ندارید.</p>}
                <p className='text-xs text-gray-400'>
                    «اجرای همین الان» بدون صبر برای ساعت ارسال، طبق تنظیمات ذخیره‌شده اجرا می‌شود و به کسی که کد گرفته
                    دوباره کد نمی‌دهد.
                </p>
                {runResult && (
                    <p className='text-sm text-gray-600 dark:text-gray-300'>
                        نتیجه: {runResult.granted.toLocaleString('fa-IR')} کد صادر شد،{' '}
                        {runResult.skipped.toLocaleString('fa-IR')} نفر قبلاً کد گرفته بودند
                        {runResult.failed > 0 ? `، ${runResult.failed.toLocaleString('fa-IR')} خطا` : ''}.
                    </p>
                )}
            </form>
        </ContentWrapper>
    );
};

export default Settings;
