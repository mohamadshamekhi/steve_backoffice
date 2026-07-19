'use client';
import { useFormik } from 'formik';
import { fetcher } from 'libs/api';
import ApiKeys from 'libs/api/keys';
import { Button, Input, Switch } from 'libs/ui';
import DropzoneComponent from 'libs/ui/form/dropzone';
import Tiptap from 'libs/ui/form/editor';
import Fieldset from 'libs/ui/form/FieldSet/Fieldset';
import { blogValidationSchema } from 'libs/validator/schemas/blog.schema';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'react-toastify';
import { toFormikValidationSchema } from 'zod-formik-adapter';

const Create = () => {
    const router = useRouter();
    const [loading, setLoading] = useState<boolean>(false);
    const [isValid, setIsValid] = useState<boolean>(false);
    const [tagInput, setTagInput] = useState<string>('');

    const formik = useFormik({
        initialValues: {
            title: '',
            slug: '',
            body: '',
            media_id: '',
            alt: '',
            tags: [] as string[],
            meta_description: '',
            is_published: true
        },
        validationSchema: toFormikValidationSchema(blogValidationSchema),
        onSubmit: async (values) => {
            setLoading(true);
            try {
                setLoading(true);
                const { status } = await fetcher(ApiKeys.POST_ARTICLE, 'dashboard', 'POST', {
                    body: {
                        ...values
                    }
                });

                if (status !== 400) {
                    toast.success('مقاله با موفقیت اضافه شد');
                    router.push('/dashboard/blog');
                }
                setLoading(false);
            } catch (error) {
                console.log(error);
                setLoading(false);
            }
        }
    });

    const handleAddTag = () => {
        const trimmedTag = tagInput.trim();
        if (trimmedTag && !formik.values.tags.includes(trimmedTag)) {
            formik.setFieldValue('tags', [...formik.values.tags, trimmedTag]);
            setTagInput('');
        }
    };

    const handleRemoveTag = (tagToRemove: string) => {
        formik.setFieldValue(
            'tags',
            formik.values.tags.filter((tag) => tag !== tagToRemove)
        );
    };

    const handleTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleAddTag();
        }
    };

    return (
        <form onSubmit={formik.handleSubmit}>
            <div className='grid grid-cols-1 pt-5 md:mt-5 md:grid-cols-2 md:gap-2'>
                <Fieldset
                    label='عنوان'
                    name='title'
                    touched={formik.touched}
                    errors={formik.errors}
                    className='col-span-2 md:col-span-1'
                >
                    <Input
                        name='title'
                        type='text'
                        error={Boolean(formik.touched.title && formik.errors.title)}
                        onChange={formik.handleChange}
                        value={formik.values.title}
                    />
                </Fieldset>

                <Fieldset
                    label='اسلاگ (slug)'
                    name='slug'
                    touched={formik.touched}
                    errors={formik.errors}
                    className='col-span-2 md:col-span-1'
                >
                    <Input
                        name='slug'
                        type='text'
                        error={Boolean(formik.touched.slug && formik.errors.slug)}
                        onChange={formik.handleChange}
                        value={formik.values.slug}
                        dir='ltr'
                    />
                </Fieldset>

                <Fieldset
                    label='توضیحات متا'
                    name='meta_description'
                    touched={formik.touched}
                    errors={formik.errors}
                    className='col-span-2'
                >
                    <Input
                        name='meta_description'
                        type='text'
                        error={Boolean(formik.touched.meta_description && formik.errors.meta_description)}
                        onChange={formik.handleChange}
                        value={formik.values.meta_description}
                    />
                </Fieldset>

                <Fieldset
                    label='تگ‌ها'
                    name='tags'
                    touched={formik.touched}
                    errors={formik.errors}
                    className='col-span-2'
                >
                    <div className='space-y-3'>
                        <div className='flex gap-2'>
                            <Input
                                name='tagInput'
                                type='text'
                                value={tagInput}
                                onChange={(e) => setTagInput(e.target.value)}
                                onKeyDown={handleTagKeyDown}
                                placeholder='تگ جدید را وارد کنید و Enter بزنید'
                                className='flex-1'
                            />
                            <Button type='button' variant='outline' size='sm' onClick={handleAddTag}>
                                افزودن
                            </Button>
                        </div>
                        {formik.values.tags.length > 0 && (
                            <div className='flex flex-wrap gap-2'>
                                {formik.values.tags.map((tag, index) => (
                                    <span
                                        key={index}
                                        className='bg-brand-100 text-brand-800 inline-flex items-center gap-1 rounded-full px-3 py-1 text-sm'
                                    >
                                        {tag}
                                        <button
                                            type='button'
                                            onClick={() => handleRemoveTag(tag)}
                                            className='hover:text-brand-600'
                                        >
                                            ×
                                        </button>
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>
                </Fieldset>

                <Fieldset
                    touched={formik.touched}
                    errors={formik.errors}
                    name='media_id'
                    className='col-span-2 mt-4 mb-5'
                >
                    <DropzoneComponent
                        maxFiles={1}
                        domain='article'
                        onUpload={(data) => {
                            formik.setFieldValue('media_id', data?.data?.id);
                            setIsValid(true);
                        }}
                    />
                </Fieldset>

                <Fieldset
                    label='متن جایگزین تصویر (alt)'
                    name='alt'
                    touched={formik.touched}
                    errors={formik.errors}
                    className='col-span-2'
                >
                    <Input
                        name='alt'
                        type='text'
                        error={Boolean(formik.touched.alt && formik.errors.alt)}
                        onChange={formik.handleChange}
                        value={formik.values.alt}
                    />
                </Fieldset>

                <Fieldset
                    label='توضیحات'
                    name='body'
                    touched={formik.touched}
                    errors={formik.errors}
                    className='col-span-2 w-full'
                >
                    <Tiptap
                        content={formik.values.body}
                        onChange={(newContent) => {
                            formik.setFieldValue('body', newContent);
                        }}
                    />
                </Fieldset>

                <div className='col-span-2 flex items-center gap-3'>
                    <Switch
                        checked={formik.values.is_published}
                        onChange={(val) => formik.setFieldValue('is_published', val)}
                    />
                    <span className='text-sm text-gray-700'>انتشار مقاله</span>
                </div>
            </div>

            <div className='mt-5 flex items-center justify-end gap-2'>
                <Button loading={loading} disabled={loading || !isValid} size='sm' type='submit'>
                    افزودن
                </Button>
            </div>
        </form>
    );
};

export default Create;
