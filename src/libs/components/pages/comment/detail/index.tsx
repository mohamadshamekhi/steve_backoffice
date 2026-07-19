'use client';

import { fetcher } from 'libs/api';
import ApiKeys from 'libs/api/keys';
import { IComment } from 'libs/models/comment.model';
import { Badge, Button } from 'libs/ui';
import TextArea from 'libs/ui/form/textArea';
import { ChangeEvent, useState } from 'react';
import { toast } from 'react-toastify';

const Detail = ({ data }: { data: IComment }) => {
    const [replyBody, setReplyBody] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const submitReplyHandler = async () => {
        if (!replyBody.trim()) return;

        setIsSubmitting(true);
        try {
            await fetcher(ApiKeys.POST_BACKOFFICE_COMMENT, 'dashboard', 'POST', {
                body: {
                    body: replyBody,
                    commentable_type: data.commentable.type,
                    commentable_id: data.commentable.id,
                    parent_id: data.id
                }
            });
            toast.success('پاسخ با موفقیت ثبت شد');
            setReplyBody('');
        } catch {
            toast.error('خطا در ثبت پاسخ');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className='mt-6'>
            <ul className='space-y-2 *:border-b *:border-gray-100 *:p-2'>
                <li className='flex flex-wrap items-start gap-2 border-b-0!'>
                    <div className='basis-1/4 font-semibold text-gray-400'>زمان ثبت</div>
                    <span>{new Date(data.created_at).toLocaleDateString('fa-ir')}</span>
                </li>

                <li className='flex flex-wrap items-start gap-2 border-b-0!'>
                    <div className='basis-1/4 font-semibold text-gray-400'>متن نظر:</div>
                    <span>{data.body}</span>
                </li>

                <li className='flex flex-wrap items-start gap-2 border-b-0!'>
                    <div className='basis-1/4 font-semibold text-gray-400'>منبع:</div>

                    {data.commentable.type === 'article' ? (
                        <Badge color='primary'>محصولات</Badge>
                    ) : (
                        <Badge color='success'>بلاگ</Badge>
                    )}
                </li>

                <li className='flex flex-wrap items-start gap-2 border-b-0!'>
                    <div className='basis-1/4 font-semibold text-gray-400'>مرتبط با:</div>

                    <div>{data.commentable.title}</div>
                </li>

                <li className='flex flex-wrap items-start gap-2 border-b-0!'>
                    <div className='basis-1/4 font-semibold text-gray-400'>نمایش وضعیت</div>
                    {data.is_approved ? (
                        <Badge color='info' variant='solid'>
                            نمایش
                        </Badge>
                    ) : (
                        <Badge variant='solid' color='error'>
                            عدم نمایش
                        </Badge>
                    )}
                </li>

                <li className='flex flex-wrap items-start gap-2 border-b-0!'>
                    <div className='basis-1/4 font-semibold text-gray-400'>نام پاسخ دهنده:</div>
                    <span>{data.commenter.name}</span>
                </li>
            </ul>

            <div className='mt-4 border-t border-gray-100 pt-4'>
                <p className='mb-2 font-semibold text-gray-600'>پاسخ به نظر:</p>
                <TextArea
                    value={replyBody}
                    onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setReplyBody(e.target.value)}
                    placeholder='متن پاسخ را وارد کنید...'
                    rows={4}
                />
                <Button
                    onClick={submitReplyHandler}
                    disabled={isSubmitting || !replyBody.trim()}
                    className='mt-2'
                    size='sm'
                >
                    {isSubmitting ? 'در حال ارسال...' : 'ثبت پاسخ'}
                </Button>
            </div>
        </div>
    );
};

export default Detail;
