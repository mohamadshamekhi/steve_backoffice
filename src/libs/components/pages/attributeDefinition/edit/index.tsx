'use client';
import { useFormik } from 'formik';
import { fetcher } from 'libs/api';
import ApiKeys from 'libs/api/keys';
import { Button, Input } from 'libs/ui';
import Fieldset from 'libs/ui/form/FieldSet/Fieldset';
import { Modal } from 'libs/ui/modal';
import { attributeDefinitionSchema } from 'libs/validator/schemas/attribute-definition.schema';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'react-toastify';
import { toFormikValidationSchema } from 'zod-formik-adapter';

type AttributeDefinition = {
    id: string;
    key: string;
    name: string;
    unit: string;
};

interface ActionCellProps {
    data: AttributeDefinition;
    onUpdated: () => void;
    onClose: () => void;
    isOpen: boolean;
}

const Edit = ({ onClose, data, onUpdated, isOpen }: ActionCellProps) => {
    const router = useRouter();
    const [loading, setLoading] = useState<boolean>(false);

    const formik = useFormik({
        initialValues: {
            key: data?.key || '',
            name: data?.name || '',
            unit: data?.unit || ''
        },
        enableReinitialize: true,
        validationSchema: toFormikValidationSchema(attributeDefinitionSchema),

        onSubmit: async (values) => {
            try {
                setLoading(true);
                const { status } = await fetcher(ApiKeys.PATCH_ATTRIBUTE_DEFINITION(data.id), 'dashboard', 'PATCH', {
                    body: {
                        ...values
                    }
                });

                if (status !== 400) {
                    onUpdated();
                    onClose();
                    toast.success('ساختار ویژگی با موفقیت ویرایش شد');
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
        <Modal isOpen={isOpen} onClose={onClose} className='max-w-[700px]'>
            <form onSubmit={formik.handleSubmit}>
                <div className='space-y-4 pt-5 md:mt-5 md:grid-cols-2 md:gap-2'>
                    <Fieldset label='نام' name='name' touched={formik.touched} errors={formik.errors}>
                        <Input
                            name='name'
                            type='text'
                            error={Boolean(formik.touched.name && formik.errors.name)}
                            onChange={formik.handleChange}
                            value={formik.values.name}
                        />
                    </Fieldset>

                    <Fieldset label='شناسه' name='key' touched={formik.touched} errors={formik.errors}>
                        <Input
                            disabled
                            name='key'
                            type='text'
                            error={Boolean(formik.touched.unit && formik.errors.key)}
                            onChange={formik.handleChange}
                            value={formik.values.key}
                            hint='شناسه غیر قابل تغییر است'
                        />
                    </Fieldset>

                    <Fieldset label='واحد' name='unit' touched={formik.touched} errors={formik.errors}>
                        <Input
                            name='unit'
                            type='text'
                            error={Boolean(formik.touched.unit && formik.errors.unit)}
                            onChange={formik.handleChange}
                            value={formik.values.unit}
                        />
                    </Fieldset>
                </div>

                <div className='mt-5 flex items-center justify-end gap-2'>
                    <Button size='sm' type='button' variant='outline' onClick={onClose}>
                        لغو
                    </Button>

                    <Button disabled={loading} loading={loading} size='sm' type='submit'>
                        ثبت تغییرات
                    </Button>
                </div>
            </form>
        </Modal>
    );
};

export default Edit;
