'use client';
import { useFormik } from 'formik';
import { fetcher } from 'libs/api';
import ApiKeys from 'libs/api/keys';
import { Button, Input, Switch } from 'libs/ui';
import Fieldset from 'libs/ui/form/FieldSet/Fieldset';
import AsyncMultiSelectInput from 'libs/ui/select/AsyncMultiSelectInput';
import { adminValidationSchema } from 'libs/validator/schemas/admin.schema';
import { useRouter } from 'next/navigation';
import { useCallback, useState } from 'react';
import { toast } from 'react-toastify';
import { toFormikValidationSchema } from 'zod-formik-adapter';

const Create = () => {
    const router = useRouter();
    const [loading, setLoading] = useState<boolean>(false);

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

    const formik = useFormik({
        initialValues: {
            name: '',
            roles: [] as string[],
            address: '',
            phone_number: '',
            is_active: true
        },
        validationSchema: toFormikValidationSchema(adminValidationSchema),
        onSubmit: async (values) => {
            setLoading(true);
            try {
                const { status } = await fetcher(ApiKeys.POST_BACKOFFICE, 'dashboard', 'POST', {
                    body: {
                        name: values.name,
                        phone_number: values.phone_number,
                        is_active: values.is_active,
                        address: values.address,
                        roles: values.roles
                    }
                });

                if (status !== 400) {
                    toast.success('ادمین با موفقیت اضافه شد');
                    router.push('/dashboard/admin');
                }
                setLoading(false);
            } catch (error) {
                console.log(error);
                setLoading(false);
            }
        }
    });

    return (
        <form onSubmit={formik.handleSubmit}>
            <div className='block grid-cols-1 gap-y-2 pt-5 md:mt-5 md:grid md:grid-cols-2 md:gap-2'>
                <Fieldset
                    label='نام'
                    name='name'
                    touched={formik.touched}
                    errors={formik.errors}
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
                    touched={formik.touched}
                    errors={formik.errors}
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
                    touched={formik.touched}
                    errors={formik.errors}
                    className='md:col-span-1'
                >
                    <AsyncMultiSelectInput
                        name='roles'
                        value={formik.values.roles}
                        error={Boolean(formik.touched.roles && formik.errors.roles)}
                        onChange={(val) => formik.setFieldValue('roles', val)}
                        loadOptions={loadRoles}
                    />
                </Fieldset>

                <Fieldset
                    label='آدرس'
                    name='address'
                    touched={formik.touched}
                    errors={formik.errors}
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
                    افزودن
                </Button>
            </div>
        </form>
    );
};

export default Create;
