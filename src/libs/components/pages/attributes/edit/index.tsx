'use client';
import { useFormik } from 'formik';
import { fetcher } from 'libs/api';
import ApiKeys from 'libs/api/keys';
import { Button, Input } from 'libs/ui';
import Fieldset from 'libs/ui/form/FieldSet/Fieldset';
import { Modal } from 'libs/ui/modal';
import AsyncMultiSelect from 'libs/ui/multiSelect/AsyncMultiSelect';
import { attributesSchema } from 'libs/validator/schemas/attribute.schema';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'react-toastify';
import { toFormikValidationSchema } from 'zod-formik-adapter';

type Attribute = {
    id: string;
    name: string;
    attribute_definition_ids: string[];
    attributes?: { id: string; name: string }[];
};

interface ActionCellProps {
    data: Attribute;
    onUpdated: () => void;
    onClose: () => void;
    isOpen: boolean;
}

export type formValue = {
    name: string;
    attribute_definition_ids: string[];
};

type Option = { label: string; value: string };

const Edit = ({ onClose, data, onUpdated, isOpen }: ActionCellProps) => {
    const router = useRouter();
    const [loading, setLoading] = useState<boolean>(false);

    const initialOptions: Option[] = data.attributes
        ? data.attributes.map((attr) => ({ value: attr.id, label: attr.name }))
        : [];

    const loadAttributeOptions = async (inputValue: string): Promise<Option[]> => {
        const url = ApiKeys.SEARCH_ATTRIBUTE_DEFINITION(inputValue);
        const res = await fetcher(url, 'dashboard', 'GET');
        const items: { id: string; name: string }[] = res?.data?.attributes ?? [];
        return items.map((item) => ({ value: item.id, label: item.name }));
    };

    const formik = useFormik<formValue>({
        initialValues: {
            name: data.name || '',
            attribute_definition_ids: data.attributes ? data.attributes.map((attr) => attr.id) : []
        },

        enableReinitialize: true,
        validationSchema: toFormikValidationSchema(attributesSchema),

        onSubmit: async (values) => {
            try {
                setLoading(true);
                const { status } = await fetcher(ApiKeys.PATCH_ATTRIBUTE(data.id), 'dashboard', 'PATCH', {
                    body: {
                        ...values
                    }
                });

                if (status !== 400) {
                    onUpdated();
                    toast.success(' ویژگی با موفقیت ویرایش شد');
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
        <Modal isOpen={isOpen} onClose={onClose} className='modal-attr max-w-[700px]'>
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
                            initialOptions={initialOptions}
                            error={Boolean(
                                formik.touched.attribute_definition_ids && formik.errors.attribute_definition_ids
                            )}
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
