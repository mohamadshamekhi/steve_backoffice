'use client';

import { Editor } from '@tiptap/react';
import {
    AlignCenterIcon,
    AlignLeftIcon,
    AlignRightIcon,
    BoldIcon,
    Heading1Icon,
    Heading2Icon,
    Heading3Icon,
    ImageIcon,
    ItalicIcon,
    LinkIcon,
    OrderListIcon,
    ParagraphIcon,
    StrikeThroughIcon,
    TableIcon,
    UnOrderListIcon
} from 'libs/components/icons';
import { Toggle } from 'libs/ui/toggle';
import React, { useCallback, useState } from 'react';
import { LINE_HEIGHT_OPTIONS } from './extensions/lineHeight';
import ImageUploadModal from './modals/ImageUploadModal';
import LinkModal from './modals/LinkModal';

// ── Inline SVG icons for missing icon components ────────────────────────────

const UnderlineIcon = () => (
    <svg width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2'>
        <path d='M6 3v7a6 6 0 0 0 12 0V3' />
        <line x1='4' y1='21' x2='20' y2='21' />
    </svg>
);

const BlockquoteIcon = () => (
    <svg width='16' height='16' viewBox='0 0 24 24' fill='currentColor'>
        <path d='M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V20c0 1 0 1 1 1z' />
        <path d='M15 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2h.75c0 2.25.25 4-2.75 4v3c0 1 0 1 1 1z' />
    </svg>
);

const CodeBlockIcon = () => (
    <svg width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2'>
        <polyline points='16 18 22 12 16 6' />
        <polyline points='8 6 2 12 8 18' />
    </svg>
);

const HorizontalRuleIcon = () => (
    <svg width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2'>
        <line x1='3' y1='12' x2='21' y2='12' />
    </svg>
);

const ClearFormattingIcon = () => (
    <svg width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2'>
        <path d='M4 7V4h16v3' />
        <path d='M5 20h6' />
        <path d='M13 4 9 20' />
        <line x1='17' y1='10' x2='22' y2='15' />
        <line x1='22' y1='10' x2='17' y2='15' />
    </svg>
);

const H4Icon = () => <span className='text-xs font-bold leading-none'>H4</span>;
const H5Icon = () => <span className='text-xs font-bold leading-none'>H5</span>;
const H6Icon = () => <span className='text-xs font-bold leading-none'>H6</span>;

const SuperscriptIcon = () => (
    <svg width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2'>
        <path d='m4 19 8-8' /><path d='m12 19-8-8' />
        <path d='M20 12h-4c0-1.5.442-2 1.5-2.5S20 8.334 20 7.002c0-.472-.17-.93-.484-1.29a2.105 2.105 0 0 0-2.617-.436c-.42.239-.738.614-.899 1.06' />
    </svg>
);

const SubscriptIcon = () => (
    <svg width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2'>
        <path d='m4 5 8 8' /><path d='m12 5-8 8' />
        <path d='M20 19h-4c0-1.5.442-2 1.5-2.5S20 15.334 20 14.002c0-.472-.17-.93-.484-1.29a2.105 2.105 0 0 0-2.617-.436c-.42.239-.738.614-.899 1.06' />
    </svg>
);

const HtmlIcon = () => (
    <svg width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2'>
        <polyline points='13 17 18 12 13 7' />
        <polyline points='11 7 6 12 11 17' />
    </svg>
);

// ── Separator ────────────────────────────────────────────────────────────────

const Separator = () => <div className='mx-0.5 h-6 w-px self-center bg-gray-200' />;

// ── Toolbar group types ──────────────────────────────────────────────────────

interface ToolbarItem {
    icon: React.ReactNode;
    label: string;
    onClick: () => void;
    isActive: boolean;
    disabled?: boolean;
}

interface ToolbarGroupProps {
    items: ToolbarItem[];
}

const ToolbarGroup = ({ items }: ToolbarGroupProps) => (
    <div className='flex items-center gap-0.5'>
        {items.map((item) => (
            <Toggle
                key={item.label}
                pressed={item.isActive}
                onClick={item.onClick}
                disabled={item.disabled}
                title={item.label}
                className='h-8 min-w-[2rem] px-2'
            >
                {item.icon}
            </Toggle>
        ))}
    </div>
);

// ── Main Toolbar ─────────────────────────────────────────────────────────────

interface ToolbarProps {
    editor: Editor | null;
}

const Toolbar = ({ editor }: ToolbarProps) => {
    const [showTableMenu, setShowTableMenu] = useState(false);
    const [showImageModal, setShowImageModal] = useState(false);
    const [showLinkModal, setShowLinkModal] = useState(false);

    const handleImageInsert = useCallback(
        (src: string, alt: string) => {
            if (!editor) return;
            editor.chain().focus().setImage({ src, alt }).run();
        },
        [editor]
    );

    const handleLinkSave = useCallback(
        (href: string) => {
            if (!editor) return;
            if (!href) {
                editor.chain().focus().extendMarkRange('link').unsetLink().run();
                return;
            }
            editor.chain().focus().extendMarkRange('link').setLink({ href }).run();
        },
        [editor]
    );

    const insertTable = useCallback(() => {
        if (!editor) return;
        editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run();
        setShowTableMenu(false);
    }, [editor]);

    if (!editor) return null;

    const textStyleGroup: ToolbarItem[] = [
        {
            icon: <BoldIcon />,
            label: 'Bold',
            onClick: () => editor.chain().focus().toggleBold().run(),
            isActive: editor.isActive('bold')
        },
        {
            icon: <ItalicIcon />,
            label: 'Italic',
            onClick: () => editor.chain().focus().toggleItalic().run(),
            isActive: editor.isActive('italic')
        },
        {
            icon: <UnderlineIcon />,
            label: 'Underline',
            onClick: () => editor.chain().focus().toggleUnderline().run(),
            isActive: editor.isActive('underline')
        },
        {
            icon: <StrikeThroughIcon />,
            label: 'Strike',
            onClick: () => editor.chain().focus().toggleStrike().run(),
            isActive: editor.isActive('strike')
        },
        {
            icon: <SuperscriptIcon />,
            label: 'Superscript',
            onClick: () => editor.chain().focus().toggleSuperscript().run(),
            isActive: editor.isActive('superscript')
        },
        {
            icon: <SubscriptIcon />,
            label: 'Subscript',
            onClick: () => editor.chain().focus().toggleSubscript().run(),
            isActive: editor.isActive('subscript')
        }
    ];

    const blockGroup: ToolbarItem[] = [
        {
            icon: <ParagraphIcon />,
            label: 'Paragraph',
            onClick: () => editor.chain().focus().setParagraph().run(),
            isActive: editor.isActive('paragraph')
        },
        {
            icon: <Heading1Icon />,
            label: 'Heading 1',
            onClick: () => editor.chain().focus().toggleHeading({ level: 1 }).run(),
            isActive: editor.isActive('heading', { level: 1 })
        },
        {
            icon: <Heading2Icon />,
            label: 'Heading 2',
            onClick: () => editor.chain().focus().toggleHeading({ level: 2 }).run(),
            isActive: editor.isActive('heading', { level: 2 })
        },
        {
            icon: <Heading3Icon />,
            label: 'Heading 3',
            onClick: () => editor.chain().focus().toggleHeading({ level: 3 }).run(),
            isActive: editor.isActive('heading', { level: 3 })
        },
        {
            icon: <H4Icon />,
            label: 'Heading 4',
            onClick: () => editor.chain().focus().toggleHeading({ level: 4 }).run(),
            isActive: editor.isActive('heading', { level: 4 })
        },
        {
            icon: <H5Icon />,
            label: 'Heading 5',
            onClick: () => editor.chain().focus().toggleHeading({ level: 5 }).run(),
            isActive: editor.isActive('heading', { level: 5 })
        },
        {
            icon: <H6Icon />,
            label: 'Heading 6',
            onClick: () => editor.chain().focus().toggleHeading({ level: 6 }).run(),
            isActive: editor.isActive('heading', { level: 6 })
        }
    ];

    const listGroup: ToolbarItem[] = [
        {
            icon: <UnOrderListIcon />,
            label: 'Bullet list',
            onClick: () => editor.chain().focus().toggleBulletList().run(),
            isActive: editor.isActive('bulletList')
        },
        {
            icon: <OrderListIcon />,
            label: 'Ordered list',
            onClick: () => editor.chain().focus().toggleOrderedList().run(),
            isActive: editor.isActive('orderedList')
        }
    ];

    const insertGroup: ToolbarItem[] = [
        {
            icon: <BlockquoteIcon />,
            label: 'Blockquote',
            onClick: () => editor.chain().focus().toggleBlockquote().run(),
            isActive: editor.isActive('blockquote')
        },
        {
            icon: <CodeBlockIcon />,
            label: 'Code block',
            onClick: () => editor.chain().focus().toggleCodeBlock().run(),
            isActive: editor.isActive('codeBlock')
        },
        {
            icon: <HorizontalRuleIcon />,
            label: 'Horizontal rule',
            onClick: () => editor.chain().focus().setHorizontalRule().run(),
            isActive: false
        },
        {
            icon: <LinkIcon />,
            label: 'Link',
            onClick: () => setShowLinkModal(true),
            isActive: editor.isActive('link')
        },
        {
            icon: <ImageIcon />,
            label: 'Image',
            onClick: () => setShowImageModal(true),
            isActive: false
        },
        {
            icon: <HtmlIcon />,
            label: 'HTML / Embed',
            onClick: () => editor.chain().focus().insertHtmlBlock().run(),
            isActive: editor.isActive('htmlBlock')
        }
    ];

    const alignGroup: ToolbarItem[] = [
        {
            icon: <AlignLeftIcon />,
            label: 'Align left',
            onClick: () => editor.chain().focus().setTextAlign('left').run(),
            isActive: editor.isActive({ textAlign: 'left' })
        },
        {
            icon: <AlignCenterIcon />,
            label: 'Align center',
            onClick: () => editor.chain().focus().setTextAlign('center').run(),
            isActive: editor.isActive({ textAlign: 'center' })
        },
        {
            icon: <AlignRightIcon />,
            label: 'Align right',
            onClick: () => editor.chain().focus().setTextAlign('right').run(),
            isActive: editor.isActive({ textAlign: 'right' })
        }
    ];

    const utilGroup: ToolbarItem[] = [
        {
            icon: <ClearFormattingIcon />,
            label: 'Clear formatting',
            onClick: () => editor.chain().focus().unsetAllMarks().clearNodes().run(),
            isActive: false
        }
    ];

    const currentLineHeight = editor.getAttributes('paragraph').lineHeight as string | null;

    return (
        <div className='flex flex-wrap items-center gap-1 rounded-t-md border border-b-0 bg-white p-1.5'>
            <ToolbarGroup items={textStyleGroup} />
            <Separator />
            <ToolbarGroup items={blockGroup} />
            <Separator />
            <ToolbarGroup items={listGroup} />
            <Separator />
            <ToolbarGroup items={insertGroup} />
            <Separator />
            <ToolbarGroup items={alignGroup} />
            <Separator />

            {/* Table dropdown */}
            <div className='relative'>
                <Toggle
                    pressed={editor.isActive('table')}
                    onClick={() => setShowTableMenu((v) => !v)}
                    title='Table'
                    className='h-8 min-w-[2rem] px-2'
                >
                    <TableIcon />
                </Toggle>
                {showTableMenu && (
                    <div className='absolute top-full left-0 z-50 mt-1 min-w-[160px] rounded-md border bg-white py-1 shadow-lg'>
                        {[
                            { label: 'افزودن جدول', action: insertTable },
                            { label: 'سطر قبل', action: () => editor.chain().focus().addRowBefore().run() },
                            { label: 'سطر بعد', action: () => editor.chain().focus().addRowAfter().run() },
                            { label: 'حذف سطر', action: () => editor.chain().focus().deleteRow().run() },
                            { label: 'ستون قبل', action: () => editor.chain().focus().addColumnBefore().run() },
                            { label: 'ستون بعد', action: () => editor.chain().focus().addColumnAfter().run() },
                            { label: 'حذف ستون', action: () => editor.chain().focus().deleteColumn().run() },
                            { label: 'ادغام سلول‌ها', action: () => editor.chain().focus().mergeCells().run() },
                            { label: 'تفکیک سلول', action: () => editor.chain().focus().splitCell().run() }
                        ].map(({ label, action }) => (
                            <button
                                key={label}
                                type='button'
                                className='w-full px-3 py-1.5 text-right text-sm hover:bg-gray-100'
                                onClick={() => { action(); setShowTableMenu(false); }}
                            >
                                {label}
                            </button>
                        ))}
                        <hr className='my-1' />
                        <button
                            type='button'
                            className='w-full px-3 py-1.5 text-right text-sm text-red-600 hover:bg-red-50'
                            onClick={() => { editor.chain().focus().deleteTable().run(); setShowTableMenu(false); }}
                        >
                            حذف جدول
                        </button>
                    </div>
                )}
            </div>

            <Separator />

            {/* Line height picker */}
            <select
                value={currentLineHeight ?? ''}
                onChange={(e) => {
                    const val = e.target.value;
                    if (val) {
                        editor.chain().focus().setLineHeight(val).run();
                    } else {
                        editor.chain().focus().unsetLineHeight().run();
                    }
                }}
                title='فاصله خطوط'
                className='h-8 rounded border border-gray-200 bg-white px-1.5 text-xs text-gray-700 hover:border-gray-300 focus:outline-none'
            >
                <option value=''>فاصله خط</option>
                {LINE_HEIGHT_OPTIONS.map((v) => (
                    <option key={v} value={v}>{v}</option>
                ))}
            </select>

            <Separator />
            <ToolbarGroup items={utilGroup} />

            {/* Modals */}
            <ImageUploadModal
                isOpen={showImageModal}
                onClose={() => setShowImageModal(false)}
                onInsert={handleImageInsert}
            />
            <LinkModal
                isOpen={showLinkModal}
                onClose={() => setShowLinkModal(false)}
                initialHref={editor.getAttributes('link').href ?? ''}
                onSave={handleLinkSave}
            />
        </div>
    );
};

export default React.memo(Toolbar);
