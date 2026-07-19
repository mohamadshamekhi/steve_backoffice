'use client';
import { useFormik } from 'formik';
import { fetcher } from 'libs/api';
import ApiKeys from 'libs/api/keys';
import ContentWrapper from 'libs/components/common/contentWrapper/ContentWrapper';
import { Button, Input, Switch } from 'libs/ui';
import Fieldset from 'libs/ui/form/FieldSet/Fieldset';
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
        <ContentWrapper title='ویرایش ادمین'>
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
        </ContentWrapper>
    );
};

export default Edit;
