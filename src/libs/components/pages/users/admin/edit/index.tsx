'use client';
import { useFormik } from 'formik';
import { fetcher } from 'libs/api';
import ApiKeys from 'libs/api/keys';
import ContentWrapper from 'libs/components/common/contentWrapper/ContentWrapper';
import { useRole } from 'libs/hooks/usePermission';
import { Button, Input, Switch } from 'libs/ui';
import Fieldset from 'libs/ui/form/FieldSet/Fieldset';
import { Modal } from 'libs/ui/modal';
import AsyncMultiSelectInput from 'libs/ui/select/AsyncMultiSelectInput';
import { adminValidationSchema } from 'libs/validator/schemas/admin.schema';
import { useRouter } from 'next/navigation';
import { useCallback, useState } from 'react';
import { toast } from 'react-toastify';
import useSWR from 'swr';
import { toFormikValidationSchema } from 'zod-formik-adapter';

const Edit = ({ id }: { id: string }) => {
    const router = useRouter();
    const [loading, setLoading] = useState<boolean>(false);
    const isSuperAdmin = useRole('super_admin');
    const [tokenModalOpen, setTokenModalOpen] = useState<boolean>(false);
    const [issuedToken, setIssuedToken] = useState<string>('');
    const [issuingToken, setIssuingToken] = useState<boolean>(false);

    const { data, isLoading } = useSWR(ApiKeys.GET_BACKOFFICE(id), (url: string) => fetcher(url, 'dashboard', 'GET'));

    const backofficeUser = data?.data?.backoffice;

    const loadRoles = useCallback(async (inputValue: string) => {
        const { data } = await fetcher(ApiKeys.GET_ALL_ROLES, 'dashboard', 'GET');
        const roles = data?.roles || [];
        const options = roles.map((role: { name: string }) => ({
            label: role.name,
            value: role.name
        }));
        if (inputValue) {
            return options.filter((opt: { label: string }) =>
                opt.label.toLowerCase().includes(inputValue.toLowerCase())
            );
        }
        return options;
    }, []);

    type FormValues = {
        name: string;
        roles: string[];
        address: string;
        phone_number: string;
        is_active: boolean;
    };

    const formik = useFormik<FormValues>({
        enableReinitialize: true,
        initialValues: {
            name: backofficeUser?.name || '',
            roles: backofficeUser?.roles || [],
            address: backofficeUser?.address || '',
            phone_number: backofficeUser?.phone_number || '',
            is_active: backofficeUser?.is_active ?? true
        },
        validationSchema: toFormikValidationSchema(adminValidationSchema),
        onSubmit: async (values) => {
            setLoading(true);
            try {
                const { status } = await fetcher(ApiKeys.PATCH_BACKOFFICE(id), 'dashboard', 'PATCH', {
                    body: {
                        name: values.name,
                        phone_number: values.phone_number,
                        is_active: values.is_active,
                        address: values.address,
                        roles: values.roles
                    }
                });

                if (status !== 400) {
                    toast.success('ادمین با موفقیت ویرایش شد');
                    router.push('/dashboard/admin');
                }
                setLoading(false);
            } catch (error) {
                console.log(error);
                setLoading(false);
            }
        }
    });

    const handleIssueServiceToken = useCallback(async () => {
        setIssuingToken(true);
        try {
            const { data, status } = await fetcher(ApiKeys.ISSUE_SERVICE_TOKEN(id), 'dashboard', 'POST');
            if (status === 403) {
                toast.error('شما دسترسی صدور توکن سرویسی را ندارید');
                return;
            }
            if (data?.token) {
                setIssuedToken(data.token);
                setTokenModalOpen(true);
            }
        } catch (error) {
            console.log(error);
            toast.error('خطا در صدور توکن سرویسی');
        } finally {
            setIssuingToken(false);
        }
    }, [id]);

    const handleCopyToken = useCallback(async () => {
        try {
            await navigator.clipboard.writeText(issuedToken);
            toast.success('توکن کپی شد');
        } catch (error) {
            console.log(error);
            toast.error('کپی توکن ناموفق بود');
        }
    }, [issuedToken]);

    const handleCloseTokenModal = useCallback(() => {
        setTokenModalOpen(false);
        setIssuedToken('');
    }, []);

    if (isLoading) {
        return (
            <ContentWrapper title='ویرایش ادمین'>
                <div className='flex items-center justify-center py-10'>
                    <span>در حال بارگذاری...</span>
                </div>
            </ContentWrapper>
        );
    }

    return (
        <ContentWrapper
            title='ویرایش ادمین'
            extra={
                isSuperAdmin ? (
                    <Button
                        variant='outline'
                        size='sm'
                        type='button'
                        loading={issuingToken}
                        disabled={issuingToken}
                        onClick={handleIssueServiceToken}
                    >
                        صدور توکن سرویسی
                    </Button>
                ) : undefined
            }
        >
            <form onSubmit={formik.handleSubmit}>
                <div className='block grid-cols-1 gap-y-2 pt-5 md:mt-5 md:grid md:grid-cols-2 md:gap-2'>
                    <Fieldset
                        label='نام'
                        name='name'
                        touched={formik.touched as { [key: string]: boolean }}
                        errors={formik.errors as { [key: string]: string }}
                        className='col-span-2 w-full md:col-span-1'
                    >
                        <Input
                            name='name'
                            type='text'
                            error={Boolean(formik.touched.name && formik.errors.name)}
                            onChange={formik.handleChange}
                            value={formik.values.name}
                        />
                    </Fieldset>

                    <Fieldset
                        label='شماره همراه'
                        name='phone_number'
                        touched={formik.touched as { [key: string]: boolean }}
                        errors={formik.errors as { [key: string]: string }}
                        className='w-full'
                        hint='لطفا شماره همراه را با اعداد انگلیسی وارد کنید'
                    >
                        <Input
                            name='phone_number'
                            type='text'
                            maxLength={11}
                            placeholder='0911*******'
                            error={Boolean(formik.touched.phone_number && formik.errors.phone_number)}
                            onChange={formik.handleChange}
                            value={formik.values.phone_number}
                            inputMode='numeric'
                            dir='ltr'
                        />
                    </Fieldset>
                    <Fieldset
                        label='نقش'
                        name='roles'
                        touched={formik.touched as { [key: string]: boolean }}
                        errors={formik.errors as { [key: string]: string }}
                        className='md:col-span-1'
                    >
                        <AsyncMultiSelectInput
                            name='roles'
                            value={formik.values.roles}
                            error={Boolean(formik.touched.roles && formik.errors.roles)}
                            onChange={(val) => formik.setFieldValue('roles', val)}
                            loadOptions={loadRoles}
                            initialOptions={formik.values.roles.map((role: string) => ({ label: role, value: role }))}
                        />
                    </Fieldset>

                    <Fieldset
                        label='آدرس'
                        name='address'
                        touched={formik.touched as { [key: string]: boolean }}
                        errors={formik.errors as { [key: string]: string }}
                        className='col-span-1 w-full'
                    >
                        <Input
                            name='address'
                            type='text'
                            error={Boolean(formik.touched.address && formik.errors.address)}
                            onChange={formik.handleChange}
                            value={formik.values.address}
                        />
                    </Fieldset>

                    <div className='col-span-1 flex items-center gap-2'>
                        <label htmlFor='is_active' className='text-sm text-gray-700'>
                            وضعیت فعال
                        </label>
                        <Switch
                            checked={formik.values.is_active}
                            onChange={(checked) => formik.setFieldValue('is_active', checked)}
                        />
                    </div>
                </div>
                <div className='mt-5 flex items-center justify-end gap-2'>
                    <Button variant='outline' size='sm' type='button' onClick={() => router.back()}>
                        بازگشت
                    </Button>
                    <Button loading={loading} disabled={loading} size='sm' type='submit'>
                        ویرایش
                    </Button>
                </div>
            </form>

            <Modal isOpen={tokenModalOpen} onClose={handleCloseTokenModal} containerClassName='max-w-[600px]'>
                <h3 className='mb-2 text-lg font-medium text-gray-800 dark:text-white/90'>توکن سرویسی صادر شد</h3>
                <p className='mb-4 text-sm text-gray-500 dark:text-gray-400'>
                    این توکن فقط همین یک‌بار نمایش داده می‌شود و در دیتابیس ذخیره نمی‌شود، آن را همین حالا کپی و برای تیم
                    خارجی (ایجنت سئو) ارسال کنید. اعتبار این توکن ۱ سال است.
                </p>
                <div
                    dir='ltr'
                    className='mb-4 rounded-lg border border-gray-200 bg-gray-50 p-3 text-xs break-all text-gray-700 dark:border-gray-800 dark:bg-white/[0.03] dark:text-gray-300'
                >
                    {issuedToken}
                </div>
                <div className='flex items-center justify-end gap-2'>
                    <Button variant='outline' size='sm' type='button' onClick={handleCloseTokenModal}>
                        بستن
                    </Button>
                    <Button size='sm' type='button' onClick={handleCopyToken}>
                        کپی توکن
                    </Button>
                </div>
            </Modal>
        </ContentWrapper>
    );
};

export default Edit;
