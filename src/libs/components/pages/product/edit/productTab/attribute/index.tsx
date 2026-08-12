'use client';

import { ErrorMessage, Field, FieldArray, Form, Formik } from 'formik';
import { fetcher } from 'libs/api';
import ApiKeys from 'libs/api/keys';
import { Button, CreatableSelectInput } from 'libs/ui';
import LoadingState from 'libs/ui/loadingState';
import { attributeSchema } from 'libs/validator/schemas/attributes.schema';
import { useState } from 'react';
import { toast } from 'react-toastify';
import useSWR from 'swr';
import { z } from 'zod';
import { toFormikValidationSchema } from 'zod-formik-adapter';
import { FormValues } from './attributes.types';

interface Attribute {
    id: number;
    key: string;
    name: string;
}

interface FilterOption {
    key: string;
    name: string;
    unit: string;
    options: string[];
}

const ProductVariant = ({ id }: { id: string }) => {
    const [loading, setLoading] = useState<boolean>(false);

    const {
        isLoading,
        data: product,
        mutate
    } = useSWR(ApiKeys.GET_PRODUCT(id), (url: string) => fetcher(url, 'dashboard', 'GET'));

    const formSchema = z.object({
        attributes: z.array(attributeSchema).min(1, 'حداقل یک ویژگی باید اضافه شود')
    });

    const attributeSet: Attribute[] = product?.data?.product?.category?.attribute_set ?? [];
    const specifications = (product?.data?.product?.specifications ?? []) as { key: string; value: string }[];
    const categoryId: string | undefined = product?.data?.product?.category?.id;

    const { data: filterData } = useSWR(
        categoryId ? ApiKeys.GET_CATEGORY_FILTER(categoryId) : null,
        (url: string) => fetcher(url, 'web', 'GET')
    );

    const filterOptions: FilterOption[] = filterData?.data?.filter_option ?? [];

    const getValueOptions = (key: string) =>
        (filterOptions.find((f) => f.key === key)?.options ?? []).map((option) => ({
            label: option,
            value: option
        }));

    const initialValues: FormValues = {
        attributes: attributeSet.length
            ? attributeSet.map((attr) => {
                  const spec = specifications.find((s) => s.key === attr.key);
                  return {
                      key: attr.key,
                      value: spec ? spec.value : ''
                  };
              })
            : [{ key: '', value: '' }]
    };

    if (isLoading) return <LoadingState />;

    return (
        <div className='p-4'>
            <Formik
                validateOnBlur={false}
                validateOnChange={false}
                initialValues={initialValues}
                validationSchema={toFormikValidationSchema(formSchema)}
                onSubmit={async (values) => {
                    try {
                        setLoading(true);
                        const attrs = values.attributes
                            .filter((attr) => attr.key.trim() !== '' && attr.value.trim() !== '')
                            .map((attr) => ({
                                key: attr.key.trim(),
                                value: attr.value.trim()
                            }));

                        const { status } = await fetcher(
                            ApiKeys.PATCH_PRODUCT_ADD_ATTRIBUTE(id),
                            'dashboard',
                            'PATCH',
                            {
                                body: { attrs }
                            }
                        );

                        if (status !== 400) {
                            await mutate();
                            toast.success('نوع محصول با موفقیت درج شد');
                        }
                    } catch (error) {
                        console.log(error);
                    } finally {
                        setLoading(false);
                    }
                }}
            >
                {({ values, setFieldValue }) => (
                    <Form>
                        <FieldArray name='attributes'>
                            {({}) => (
                                <div className='space-y-4'>
                                    {values.attributes.map((attr, index) => (
                                        <div className='flex items-start gap-4' key={index}>
                                            <div className='grid grow grid-cols-1 gap-3 md:grid-cols-2'>
                                                <div>
                                                    <label htmlFor={`attributes.${index}.key`}>ویژگی</label>
                                                    <Field
                                                        disabled
                                                        value={
                                                            attributeSet.find((a) => a.key === attr.key)?.name ??
                                                            attr.key
                                                        }
                                                        type='text'
                                                        className='shadow-theme-xs focus:border-brand-300 focus:ring-brand-500/20 dark:focus:border-brand-800 mt-2 h-11 w-full appearance-none rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-right text-sm text-gray-800 placeholder:text-gray-400 focus:ring-3 focus:outline-hidden dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30'
                                                    />
                                                    <Field
                                                        disabled
                                                        name={`attributes.${index}.key`}
                                                        type='hidden'
                                                        className='shadow-theme-xs focus:border-brand-300 focus:ring-brand-500/20 dark:focus:border-brand-800 mt-2 h-11 w-full appearance-none rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-right text-sm text-gray-800 placeholder:text-gray-400 focus:ring-3 focus:outline-hidden dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30'
                                                    />

                                                    <ErrorMessage
                                                        name={`attributes.${index}.key`}
                                                        component='div'
                                                        className='mt-2 text-sm text-red-500'
                                                    />
                                                </div>

                                                <div>
                                                    <label htmlFor={`attributes.${index}.value`}>مقدار</label>
                                                    <div className='mt-2'>
                                                        <CreatableSelectInput
                                                            name={`attributes.${index}.value`}
                                                            value={attr.value}
                                                            options={getValueOptions(attr.key)}
                                                            onChange={(value) =>
                                                                setFieldValue(`attributes.${index}.value`, value)
                                                            }
                                                        />
                                                    </div>

                                                    <ErrorMessage
                                                        name={`attributes.${index}.value`}
                                                        component='div'
                                                        className='mt-2 text-sm text-red-500'
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </FieldArray>

                        <Button disabled={loading} className='mt-10 mr-auto ml-0 block!' type='submit'>
                            ثبت تغییرات
                        </Button>
                    </Form>
                )}
            </Formik>
        </div>
    );
};

export default ProductVariant;
