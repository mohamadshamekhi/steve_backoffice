'use client';

import { NodeViewProps, NodeViewWrapper } from '@tiptap/react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { ImageAlign } from './customImage';

const MIN_WIDTH = 80;
const MAX_WIDTH = 1200;

const JUSTIFY: Record<ImageAlign, React.CSSProperties['justifyContent']> = {
    left:   'flex-start',
    center: 'center',
    right:  'flex-end'
};

export const ResizableImageView = ({ node, updateAttributes, selected }: NodeViewProps) => {
    const { src, alt, width, align = 'center' } = node.attrs as {
        src: string;
        alt?: string;
        width?: number | null;
        align?: ImageAlign;
    };

    const [currentWidth, setCurrentWidth] = useState<number | null>(width ?? null);
    const imgRef = useRef<HTMLImageElement>(null);
    const startX = useRef<number>(0);
    const startWidth = useRef<number>(0);
    const dragging = useRef(false);

    // sync width از attrs (مثلاً وقتی edit page load میشه)
    useEffect(() => {
        setCurrentWidth(width ?? null);
    }, [width]);

    const onMouseDown = useCallback(
        (e: React.MouseEvent) => {
            e.preventDefault();
            e.stopPropagation();

            const img = imgRef.current;
            if (!img) return;

            startX.current = e.clientX;
            startWidth.current = img.getBoundingClientRect().width;
            dragging.current = true;

            const onMouseMove = (ev: MouseEvent) => {
                if (!dragging.current) return;
                const next = Math.round(
                    Math.min(MAX_WIDTH, Math.max(MIN_WIDTH, startWidth.current + (ev.clientX - startX.current)))
                );
                setCurrentWidth(next);
            };

            const onMouseUp = (ev: MouseEvent) => {
                if (!dragging.current) return;
                dragging.current = false;
                const final = Math.round(
                    Math.min(MAX_WIDTH, Math.max(MIN_WIDTH, startWidth.current + (ev.clientX - startX.current)))
                );
                updateAttributes({ width: final });
                window.removeEventListener('mousemove', onMouseMove);
                window.removeEventListener('mouseup', onMouseUp);
            };

            window.addEventListener('mousemove', onMouseMove);
            window.addEventListener('mouseup', onMouseUp);
        },
        [updateAttributes]
    );

    const setAlign = useCallback(
        (a: ImageAlign) => updateAttributes({ align: a }),
        [updateAttributes]
    );

    const justifyContent = JUSTIFY[align as ImageAlign] ?? 'center';

    return (
        <NodeViewWrapper
            as='div'
            style={{ display: 'flex', flexDirection: 'column', alignItems: justifyContent }}
            className='my-3'
        >
            {/* Controls toolbar — فقط وقتی selected */}
            {selected && (
                <div
                    className='mb-1 flex w-fit items-center gap-1 rounded-md border bg-white px-1.5 py-1 shadow-md'
                    contentEditable={false}
                >
                    {(
                        [
                            { value: 'left',   label: '⬅ چپ' },
                            { value: 'center', label: '↔ وسط' },
                            { value: 'right',  label: '➡ راست' }
                        ] as { value: ImageAlign; label: string }[]
                    ).map(({ value, label }) => (
                        <button
                            key={value}
                            type='button'
                            onMouseDown={(e) => { e.preventDefault(); setAlign(value); }}
                            className={`rounded px-2 py-0.5 text-xs font-medium transition-colors ${
                                align === value
                                    ? 'bg-blue-500 text-white'
                                    : 'text-gray-600 hover:bg-gray-100'
                            }`}
                        >
                            {label}
                        </button>
                    ))}

                    <div className='mx-1 h-4 w-px bg-gray-200' />
                    <span className='text-xs text-gray-400'>
                        {currentWidth ? `${currentWidth}px` : 'auto'}
                    </span>
                </div>
            )}

            {/* Image + resize handle */}
            <div
                className='relative select-none'
                style={{ width: currentWidth ?? 'auto', maxWidth: '100%' }}
                contentEditable={false}
            >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                    ref={imgRef}
                    src={src}
                    alt={alt ?? ''}
                    draggable={false}
                    style={{ width: '100%', height: 'auto', display: 'block' }}
                    className={`rounded-md ${
                        selected ? 'outline-2 outline-blue-500 outline-offset-2' : 'outline-none'
                    }`}
                />

                {/* drag handle */}
                {selected && (
                    <div
                        onMouseDown={onMouseDown}
                        className='absolute top-1/2 right-0 z-10 h-10 w-2.5 -translate-y-1/2 translate-x-1/2 cursor-ew-resize rounded-full bg-blue-500 shadow'
                    />
                )}
            </div>
        </NodeViewWrapper>
    );
};
