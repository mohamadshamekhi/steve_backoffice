'use client';

import { NodeViewProps, NodeViewWrapper } from '@tiptap/react';
import { useCallback, useState } from 'react';

export const HtmlBlockView = ({ node, updateAttributes, selected, deleteNode }: NodeViewProps) => {
    const { html } = node.attrs as { html: string };
    const [editing, setEditing] = useState(!html);
    const [draft, setDraft] = useState(html);

    const handleSave = useCallback(() => {
        updateAttributes({ html: draft });
        setEditing(false);
    }, [draft, updateAttributes]);

    const handleCancel = useCallback(() => {
        if (!html) {
            deleteNode();
            return;
        }
        setDraft(html);
        setEditing(false);
    }, [html, deleteNode]);

    return (
        <NodeViewWrapper as='div' className='my-3'>
            {editing ? (
                <div className='rounded-lg border-2 border-blue-400 bg-white p-3'>
                    <div className='mb-2 flex items-center justify-between'>
                        <span className='text-xs font-semibold text-blue-600'>HTML / Embed</span>
                        <div className='flex gap-2'>
                            <button
                                type='button'
                                onClick={handleCancel}
                                className='rounded px-2 py-0.5 text-xs text-gray-500 hover:bg-gray-100'
                            >
                                انصراف
                            </button>
                            <button
                                type='button'
                                onClick={handleSave}
                                className='rounded bg-blue-500 px-2 py-0.5 text-xs text-white hover:bg-blue-600'
                            >
                                ذخیره
                            </button>
                        </div>
                    </div>
                    <textarea
                        className='w-full rounded border border-gray-200 bg-slate-50 p-2 font-mono text-xs text-gray-800 focus:outline-none focus:ring-1 focus:ring-blue-400'
                        rows={6}
                        value={draft}
                        onChange={(e) => setDraft(e.target.value)}
                        placeholder='<iframe src="..." />'
                        dir='ltr'
                        spellCheck={false}
                        autoFocus
                    />
                </div>
            ) : (
                <div
                    className={`relative rounded-lg border bg-white ${
                        selected ? 'border-blue-400' : 'border-gray-200'
                    }`}
                >
                    {/* Preview */}
                    <div
                        className='p-2'
                        dangerouslySetInnerHTML={{ __html: html }}
                    />

                    {/* Overlay controls when selected */}
                    {selected && (
                        <div
                            className='absolute top-1.5 left-1.5 flex gap-1'
                            contentEditable={false}
                        >
                            <button
                                type='button'
                                onClick={() => { setDraft(html); setEditing(true); }}
                                className='rounded bg-blue-500 px-2 py-0.5 text-xs text-white shadow hover:bg-blue-600'
                            >
                                ویرایش
                            </button>
                            <button
                                type='button'
                                onClick={deleteNode}
                                className='rounded bg-red-500 px-2 py-0.5 text-xs text-white shadow hover:bg-red-600'
                            >
                                حذف
                            </button>
                        </div>
                    )}

                    {/* Badge */}
                    <div className='absolute top-1.5 right-1.5 rounded bg-gray-100 px-1.5 py-0.5 text-xs text-gray-400'>
                        HTML
                    </div>
                </div>
            )}
        </NodeViewWrapper>
    );
};
