'use client';
import { useFormik } from 'formik';
import { fetcher } from 'libs/api';
import ApiKeys from 'libs/api/keys';
import { Button, Input } from 'libs/ui';
import Fieldset from 'libs/ui/form/FieldSet/Fieldset';
import { Modal } from 'libs/ui/modal';
import { ProductVariantSchema } from 'libs/validator/schemas/product.schema';
import { useState } from 'react';
import { toast } from 'react-toastify';
import { toFormikValidationSchema } from 'zod-formik-adapter';

const AddVariant = ({
    id,
    onClose,
    mutate,
    isOpen
}: {
    id: string;
    onClose: () => void;
    mutate: () => void;
    isOpen: boolean;
}) => {
    // const router = useRouter();
    const [loading, setLoading] = useState<boolean>(false);

    const formik = useFormik({
        initialValues: {
            price: 0,
            quantity: 0,
            label: '',
            key: '',
            value: '',
            warranty: ''
        },
        validationSchema: toFormikValidationSchema(ProductVariantSchema),
        onSubmit: async (values) => {
            try {
                setLoading(true);
                const { status } = await fetcher(ApiKeys.PATCH_PRODUCT_ADD_VARIANT(id), 'dashboard', 'PATCH', {
                    body: {
                        ...values
                    }
                });

                if (status !== 400) {
                    toast.success('نوع محصول با موفقیت درج شد');
                    mutate();
                    onClose();
                    // router.push('/dashboard/product');
                }
                setLoading(false);
            } catch (error) {
                console.log(error);
                setLoading(false);
            }
        }
    });

    return (
        <Modal isOpen={isOpen} onClose={onClose} className='max-w-[700px]'>
            <form onSubmit={formik.handleSubmit}>
                <div className='grid grid-cols-1 gap-y-2 pt-5 md:mt-5 md:grid-cols-2 md:gap-2'>
                    <Fieldset
                        label='شناسه'
                        name='key'
                        touched={formik.touched}
                        errors={formik.errors}
                        className='col-span-2 w-full md:col-span-1'
                    >
                        <Input
                            name='key'
                            type='text'
                            error={Boolean(formik.touched.key && formik.errors.key)}
                            onChange={formik.handleChange}
                            value={formik.values.key}
                        />
                    </Fieldset>

                    <Fieldset
                        label='تعداد'
                        name='quantity'
                        touched={formik.touched}
                        errors={formik.errors}
                        className='col-span-2 w-full md:col-span-1'
                    >
                        <Input
                            name='quantity'
                            type='number'
                            error={Boolean(formik.touched.quantity && formik.errors.quantity)}
                            onChange={formik.handleChange}
                            value={formik.values.quantity}
                            inputMode='numeric'
                            min='0'
                        />
                    </Fieldset>
                    <Fieldset
                        label='برچسب'
                        name='label'
                        touched={formik.touched}
                        errors={formik.errors}
                        className='col-span-2 w-full md:col-span-1'
                    >
                        <Input
                            name='label'
                            type='text'
                            error={Boolean(formik.touched.label && formik.errors.label)}
                            onChange={formik.handleChange}
                            value={formik.values.label}
                        />
                    </Fieldset>
                    <Fieldset
                        label='مقدار شناسه'
                        name='value'
                        touched={formik.touched}
                        errors={formik.errors}
                        className='col-span-2 w-full md:col-span-1'
                    >
                        <Input
                            name='value'
                            type='color'
                            error={Boolean(formik.touched.value && formik.errors.value)}
                            onChange={formik.handleChange}
                            value={formik.values.value}
                        />
                    </Fieldset>
                    <Fieldset
                        label='گارانتی'
                        name='warranty'
                        touched={formik.touched}
                        errors={formik.errors}
                        className='col-span-2 w-full md:col-span-1'
                    >
                        <Input
                            name='warranty'
                            type='text'
                            error={Boolean(formik.touched.warranty && formik.errors.warranty)}
                            onChange={formik.handleChange}
                            value={formik.values.warranty}
                        />
                    </Fieldset>
                    <Fieldset
                        label='قیمت'
                        name='price'
                        touched={formik.touched}
                        errors={formik.errors}
                        className='col-span-2 w-full md:col-span-1'
                    >
                        <Input
                            name='price'
                            type='number'
                            min='0'
                            error={Boolean(formik.touched.price && formik.errors.price)}
                            onChange={formik.handleChange}
                            value={formik.values.price}
                            inputMode='numeric'
                            hint='لطفا قیمت را به تومان وارد نمایید'
                        />
                    </Fieldset>
                </div>
                <div className='mt-5 flex items-center justify-end gap-2'>
                    <Button disabled={loading} loading={loading} size='sm' type='submit'>
                        ثبت تغییرات
                    </Button>
                </div>
            </form>
        </Modal>
    );
};

export default AddVariant;
