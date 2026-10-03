'use client';
import { DndContext, PointerSensor, closestCenter, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, arrayMove, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
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

const SortableItem = ({
    id,
    label,
    index
}: {
    id: string;
    label: string;
    index: number;
}) => {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });

    return (
        <div
            ref={setNodeRef}
            style={{ transform: CSS.Transform.toString(transform), transition }}
            className={`flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 transition-shadow dark:border-gray-700 dark:bg-gray-800 ${
                isDragging ? 'z-50 shadow-lg opacity-80' : 'shadow-none'
            }`}
        >
            <button
                type='button'
                {...attributes}
                {...listeners}
                className='cursor-grab touch-none text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
                aria-label='جابجا کردن'
            >
                <svg width='16' height='16' viewBox='0 0 16 16' fill='currentColor'>
                    <circle cx='5' cy='4' r='1.3' />
                    <circle cx='11' cy='4' r='1.3' />
                    <circle cx='5' cy='8' r='1.3' />
                    <circle cx='11' cy='8' r='1.3' />
                    <circle cx='5' cy='12' r='1.3' />
                    <circle cx='11' cy='12' r='1.3' />
                </svg>
            </button>
            <span className='min-w-[1.5rem] text-center text-xs text-gray-400'>{index + 1}</span>
            <span className='flex-1 text-sm text-gray-700 dark:text-gray-200'>{label}</span>
        </div>
    );
};

const Edit = ({ onClose, data, onUpdated, isOpen }: ActionCellProps) => {
    const router = useRouter();
    const [loading, setLoading] = useState<boolean>(false);

    const initialOptions: Option[] = data.attributes
        ? data.attributes.map((attr) => ({ value: attr.id, label: attr.name }))
        : [];

    const [orderedOptions, setOrderedOptions] = useState<Option[]>(initialOptions);

    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
    );

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
                    body: { ...values }
                });
                if (status !== 400) {
                    onUpdated();
                    toast.success('ویژگی با موفقیت ویرایش شد');
                    router.push('/dashboard/attributes');
                }
                setLoading(false);
            } catch (error) {
                console.log(error);
                setLoading(false);
            }
        }
    });

    const handleMultiSelectChange = (vals: string[]) => {
        formik.setFieldValue('attribute_definition_ids', vals);
    };

    const handleMultiSelectOptionsChange = (opts: Option[]) => {
        setOrderedOptions((prev) => {
            const newIds = new Set(opts.map((o) => o.value));
            const kept = prev.filter((o) => newIds.has(o.value));
            const keptIds = new Set(kept.map((o) => o.value));
            const added = opts.filter((o) => !keptIds.has(o.value));
            const next = [...kept, ...added];
            formik.setFieldValue('attribute_definition_ids', next.map((o) => o.value));
            return next;
        });
    };

    const handleDragEnd = (event: { active: { id: string }; over: { id: string } | null }) => {
        const { active, over } = event;
        if (!over || active.id === over.id) return;
        setOrderedOptions((prev) => {
            const oldIndex = prev.findIndex((o) => o.value === active.id);
            const newIndex = prev.findIndex((o) => o.value === over.id);
            const next = arrayMove(prev, oldIndex, newIndex);
            formik.setFieldValue('attribute_definition_ids', next.map((o) => o.value));
            return next;
        });
    };

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
                            onChange={handleMultiSelectChange}
                            onChangeOptions={handleMultiSelectOptionsChange}
                            value={formik.values.attribute_definition_ids}
                            loadOptions={loadAttributeOptions}
                            initialOptions={initialOptions}
                            error={Boolean(
                                formik.touched.attribute_definition_ids && formik.errors.attribute_definition_ids
                            )}
                        />
                    </Fieldset>

                    {orderedOptions.length > 1 && (
                        <div className='space-y-2'>
                            <p className='text-xs text-gray-400 dark:text-gray-500'>
                                برای تغییر ترتیب نمایش فیلترها، آیتم‌ها را جابجا کنید
                            </p>
                            <DndContext
                                sensors={sensors}
                                collisionDetection={closestCenter}
                                onDragEnd={handleDragEnd as never}
                            >
                                <SortableContext
                                    items={orderedOptions.map((o) => o.value)}
                                    strategy={verticalListSortingStrategy}
                                >
                                    <div className='space-y-1.5 rounded-xl border border-gray-100 bg-gray-50 p-2 dark:border-gray-700 dark:bg-gray-900/50'>
                                        {orderedOptions.map((opt, index) => (
                                            <SortableItem
                                                key={opt.value}
                                                id={opt.value}
                                                label={opt.label}
                                                index={index}
                                            />
                                        ))}
                                    </div>
                                </SortableContext>
                            </DndContext>
                        </div>
                    )}
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
