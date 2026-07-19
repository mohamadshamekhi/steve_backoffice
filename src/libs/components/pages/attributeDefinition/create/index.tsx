'use client';
import { useFormik } from 'formik';
import { fetcher } from 'libs/api';
import ApiKeys from 'libs/api/keys';
import ContentWrapper from 'libs/components/common/contentWrapper/ContentWrapper';
import { Button, Input } from 'libs/ui';
import Fieldset from 'libs/ui/form/FieldSet/Fieldset';
import { attributeDefinitionSchema } from 'libs/validator/schemas/attribute-definition.schema';
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
            key: '',
            unit: ''
        },
        validationSchema: toFormikValidationSchema(attributeDefinitionSchema),
        onSubmit: async (values) => {
            try {
                setLoading(true);
                const { status } = await fetcher(ApiKeys.POST_ATTRIBUTE_DEFINITION, 'dashboard', 'POST', {
                    body: {
                        ...values
                    }
                });

                if (status !== 400) {
                    toast.success('ساختار ویژگی با موفقیت اضافه شد');
                    router.push('/dashboard/attribute-definition');
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
            title='درج ساختار ویژگی'
            extra={
                <>
                    <Button
                        variant='outline'
                        onClick={() => {
                            router.push('/dashboard/attribute-definition');
                        }}
                    >
                        {/* TODO : add back icon to start icon */}
                        بازگشت
                    </Button>
                </>
            }
        >
            <form
                className='block grid-cols-1 space-y-2 md:grid md:grid-cols-2 md:gap-2'
                onSubmit={formik.handleSubmit}
            >
                <Fieldset label='نام' name='name' touched={formik.touched} errors={formik.errors} className='w-full'>
                    <Input
                        name='name'
                        type='text'
                        error={Boolean(formik.touched.name && formik.errors.name)}
                        onChange={formik.handleChange}
                        value={formik.values.name}
                    />
                </Fieldset>
                <Fieldset label='شناسه' name='key' touched={formik.touched} errors={formik.errors} className='w-full'>
                    <Input
                        name='key'
                        type='text'
                        error={Boolean(formik.touched.key && formik.errors.key)}
                        onChange={formik.handleChange}
                        value={formik.values.key}
                    />
                </Fieldset>

                <Fieldset
                    label='واحد'
                    name='unit'
                    touched={formik.touched}
                    errors={formik.errors}
                    className='col-span-1 w-full'
                >
                    <Input
                        name='unit'
                        type='text'
                        error={Boolean(formik.touched.unit && formik.errors.unit)}
                        onChange={formik.handleChange}
                        value={formik.values.unit}
                    />
                </Fieldset>

                <Button
                    loading={loading}
                    disabled={loading}
                    size='md'
                    type='submit'
                    className='mr-auto ml-0 flex! w-fit justify-end md:col-span-2'
                >
                    افزودن
                </Button>
            </form>
        </ContentWrapper>
    );
};

export default Create;
