'use client';
import { useFormik } from 'formik';
import { fetcher } from 'libs/api';
import ApiKeys from 'libs/api/keys';
import ContentWrapper from 'libs/components/common/contentWrapper/ContentWrapper';
import { Button, Input } from 'libs/ui';
import DropzoneComponent from 'libs/ui/form/dropzone';
import Fieldset from 'libs/ui/form/FieldSet/Fieldset';
import TextArea from 'libs/ui/form/textArea';
import { brandValidationSchema } from 'libs/validator/schemas/brand.schema';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'react-toastify';
import { toFormikValidationSchema } from 'zod-formik-adapter';

const Create = () => {
    const router = useRouter();

    const [loading, setLoading] = useState<boolean>(false);

    const [isValid, setIsValid] = useState<boolean>(false);

    const formik = useFormik({
        initialValues: {
            name: '',
            description: '',
            media_id: null
        },

        validationSchema: toFormikValidationSchema(brandValidationSchema),

        onSubmit: async (values) => {
            try {
                setLoading(true);
                const { status } = await fetcher(ApiKeys.POST_BRAND, 'dashboard', 'POST', {
                    body: {
                        ...values
                    }
                });

                if (status !== 400) {
                    toast.success('برند با موفقیت اضافه شد');
                    router.push('/dashboard/brand');
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
            title='درج برند'
            extra={
                <Button
                    variant='outline'
                    onClick={() => {
                        router.push('/dashboard/brand');
                    }}
                >
                    بازگشت
                </Button>
            }
        >
            <form className='grid grid-cols-1 gap-y-2 md:grid-cols-2 md:gap-2' onSubmit={formik.handleSubmit}>
                <Fieldset
                    label='نام'
                    name='name'
                    touched={formik.touched}
                    errors={formik.errors}
                    className='col-span-2 w-full'
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

                <Fieldset name='media_id' className='col-span-2 mt-4 mb-5'>
                    <DropzoneComponent
                        domain='brand'
                        maxFiles={1}
                        onUpload={(data) => {
                            formik.setFieldValue('media_id', data?.data?.id);
                            setIsValid(true);
                        }}
                    />
                    {formik.touched.media_id && formik.errors.media_id && (
                        <div className='text-sm text-red-500'>{formik.errors.media_id}</div>
                    )}
                </Fieldset>

                <Button
                    disabled={loading || !isValid}
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
