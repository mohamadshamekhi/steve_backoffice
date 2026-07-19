'use client';
import { useFormik } from 'formik';
import { fetcher } from 'libs/api';
import ApiKeys from 'libs/api/keys';
import ContentWrapper from 'libs/components/common/contentWrapper/ContentWrapper';
import { Button, Input, Switch } from 'libs/ui';
import Fieldset from 'libs/ui/form/FieldSet/Fieldset';
import TextArea from 'libs/ui/form/textArea';
import { shippingValidationSchema } from 'libs/validator/schemas/shipping.schema';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'react-toastify';
import { toFormikValidationSchema } from 'zod-formik-adapter';

const Create = () => {
    const router = useRouter();

    const [loading, setLoading] = useState<boolean>(false);

    const formik = useFormik({
        initialValues: {
            name: '',
            description: '',
            cost: 0,
            is_active: true
        },

        validationSchema: toFormikValidationSchema(shippingValidationSchema),

        onSubmit: async (values) => {
            console.log('submit values', values);
            try {
                setLoading(true);
                const { status } = await fetcher(ApiKeys.POST_SHIPPING, 'dashboard', 'POST', {
                    body: {
                        ...values,
                        cost: Number(values.cost)
                    }
                });

                if (status !== 400) {
                    toast.success('نحوه ارسال با موفقیت اضافه شد');
                    router.push('/dashboard/setting/shipping');
                }

                setLoading(false);
            } catch (error) {
                console.log(error);
                setLoading(false);
            }
        }
    });
    return (
        <ContentWrapper
            title='درج نحوه ارسال'
            extra={
                <Button
                    variant='outline'
                    onClick={() => {
                        router.push('/dashboard/setting/shipping');
                    }}
                >
                    بازگشت
                </Button>
            }
        >
            <form className='grid grid-cols-1 gap-y-2 md:grid-cols-2 md:gap-2' onSubmit={formik.handleSubmit}>
                <Fieldset label='نام' name='name' touched={formik.touched} errors={formik.errors} className='w-full'>
                    <Input
                        name='name'
                        type='text'
                        error={Boolean(formik.touched.name && formik.errors.name)}
                        onChange={formik.handleChange}
                        value={formik.values.name}
                    />
                </Fieldset>

                <Fieldset label='هزینه' name='cost' touched={formik.touched} errors={formik.errors} className='w-full'>
                    <Input
                        name='cost'
                        type='text'
                        error={Boolean(formik.touched.cost && formik.errors.cost)}
                        onChange={formik.handleChange}
                        value={formik.values.cost}
                        hint='هزینه را با اعداد انگلیسی وارد کنید'
                    />
                </Fieldset>

                <Fieldset
                    label='توضیحات'
                    name='description'
                    touched={formik.touched}
                    errors={formik.errors}
                    className='col-span-2 w-full'
                >
                    <TextArea
                        name='description'
                        error={Boolean(formik.touched.description && formik.errors.description)}
                        onChange={formik.handleChange}
                        value={formik.values.description}
                    />
                </Fieldset>

                <Fieldset
                    label='فعال کردن'
                    name='is_active'
                    touched={formik.touched}
                    errors={formik.errors}
                    className='sr-only col-span-2 w-full md:col-span-1'
                >
                    <Switch
                        size='md'
                        variant='primary'
                        name='is_active'
                        checked={formik.values.is_active}
                        onChange={(checked) => {
                            formik.setFieldValue('is_active', checked);
                        }}
                    />
                </Fieldset>

                <Button
                    disabled={loading}
                    loading={loading}
                    size='sm'
                    type='submit'
                    className='col-span-2 mr-auto ml-0 w-fit'
                >
                    افزودن
                </Button>
            </form>
        </ContentWrapper>
    );
};

export default Create;
