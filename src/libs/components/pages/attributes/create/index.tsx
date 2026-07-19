'use client';
import { useFormik } from 'formik';
import { fetcher } from 'libs/api';
import ApiKeys from 'libs/api/keys';
import ContentWrapper from 'libs/components/common/contentWrapper/ContentWrapper';
import { Button, Input } from 'libs/ui';
import Fieldset from 'libs/ui/form/FieldSet/Fieldset';
import AsyncMultiSelect from 'libs/ui/multiSelect/AsyncMultiSelect';
import { attributesSchema } from 'libs/validator/schemas/attribute.schema';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'react-toastify';
import { toFormikValidationSchema } from 'zod-formik-adapter';

export type formValue = {
    name: string;
    attribute_definition_ids: string[];
};

type Option = { label: string; value: string };

const Create = () => {
    const router = useRouter();
    const [loading, setLoading] = useState<boolean>(false);

    const loadAttributeOptions = async (inputValue: string): Promise<Option[]> => {
        const url = ApiKeys.SEARCH_ATTRIBUTE_DEFINITION(inputValue);
        const res = await fetcher(url, 'dashboard', 'GET');
        const items: { id: string; name: string }[] = res?.data?.attributes ?? [];
        return items.map((item) => ({ value: item.id, label: item.name }));
    };

    const formik = useFormik<formValue>({
        initialValues: {
            name: '',
            attribute_definition_ids: []
        },

        validationSchema: toFormikValidationSchema(attributesSchema),
        onSubmit: async (values) => {
            try {
                setLoading(true);
                const { status } = await fetcher(ApiKeys.POST_ATTRIBUTE, 'dashboard', 'POST', {
                    body: {
                        ...values
                    }
                });

                if (status !== 400) {
                    toast.success(' ویژگی با موفقیت اضافه شد');
                    router.push('/dashboard/attributes');
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
            title='درج ویژگی'
            extra={
                <>
                    <Button
                        variant='outline'
                        onClick={() => {
                            router.push('/dashboard/attributes');
                        }}
                    >
                        {/* TODO : add back icon to start icon */}
                        بازگشت
                    </Button>
                </>
            }
        >
            <form onSubmit={formik.handleSubmit}>
                <div className='block grid-cols-1 gap-y-2 md:grid md:grid-cols-2 md:gap-2'>
                    <Fieldset
                        label='نام'
                        name='name'
                        touched={formik.touched}
                        errors={formik.errors}
                        className='md:col-span-1'
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
                        label='ویژگی'
                        name='attribute_definition_ids'
                        touched={formik.touched}
                        errors={formik.errors}
                        className='md:col-span-1'
                    >
                        <AsyncMultiSelect
                            name='attribute_definition_ids'
                            placeholder='جستجو کنید...'
                            onChange={(vals: string[]) => formik.setFieldValue('attribute_definition_ids', vals)}
                            value={formik.values.attribute_definition_ids}
                            loadOptions={loadAttributeOptions}
                            error={Boolean(
                                formik.touched.attribute_definition_ids && formik.errors.attribute_definition_ids
                            )}
                        />
                    </Fieldset>

                    <Button
                        disabled={loading}
                        loading={loading}
                        size='sm'
                        type='submit'
                        className='col-span-2 mt-3 mr-auto ml-0 w-fit'
                    >
                        افزودن
                    </Button>
                </div>
            </form>
        </ContentWrapper>
    );
};

export default Create;
