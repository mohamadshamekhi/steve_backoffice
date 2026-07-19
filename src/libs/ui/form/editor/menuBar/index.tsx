import { Editor } from '@tiptap/react';
import {
    AlignCenterIcon,
    AlignJustifyIcon,
    AlignLeftIcon,
    AlignRightIcon,
    BoldIcon,
    Heading1Icon,
    Heading2Icon,
    Heading3Icon,
    HighLightIcon,
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
import '../../../../../styles/editor.css';
import ImageUploadModal from '../imageUploadModal';

const MenuBar = ({ editor }: { editor: Editor | null }) => {
    const [showTableMenu, setShowTableMenu] = useState(false);
    const [showImageModal, setShowImageModal] = useState(false);

    const setLink = useCallback(() => {
        if (!editor) return;

        const previousUrl = editor.getAttributes('link').href;
        const url = window.prompt('آدرس لینک را وارد کنید:', previousUrl);

        if (url === null) return;

        if (url === '') {
            editor.chain().focus().extendMarkRange('link').unsetLink().run();
            return;
        }

        editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
    }, [editor]);

    const handleImageInsert = useCallback(
        (src: string) => {
            if (!editor) return;
            editor.chain().focus().setImage({ src }).run();
        },
        [editor]
    );

    const insertTable = useCallback(() => {
        if (!editor) return;

        const rows = window.prompt('تعداد سطرها:', '3');
        if (!rows) return;

        const cols = window.prompt('تعداد ستون‌ها:', '3');
        if (!cols) return;

        editor
            .chain()
            .focus()
            .insertTable({ rows: parseInt(rows) || 3, cols: parseInt(cols) || 3, withHeaderRow: true })
            .run();

        setShowTableMenu(false);
    }, [editor]);

    if (!editor) {
        return null;
    }
    const Options = [
        {
            icon: <Heading1Icon className='text-3xl' />,
            onClick: () => editor.chain().focus().toggleHeading({ level: 1 }).run(),
            pressed: editor.isActive('heading', { level: 1 })
        },
        {
            icon: <Heading2Icon />,
            onClick: () => editor.chain().focus().toggleHeading({ level: 2 }).run(),
            pressed: editor.isActive('heading', { level: 2 })
        },
        {
            icon: <Heading3Icon />,
            onClick: () => editor.chain().focus().toggleHeading({ level: 3 }).run(),
            pressed: editor.isActive('heading', { level: 3 })
        },
        {
            icon: <BoldIcon />,
            onClick: () => editor.chain().focus().toggleBold().run(),
            pressed: editor.isActive('bold')
        },
        {
            icon: <ItalicIcon />,
            onClick: () => editor.chain().focus().toggleItalic().run(),
            pressed: editor.isActive('italic')
        },
        {
            icon: <StrikeThroughIcon />,
            onClick: () => editor.chain().focus().toggleStrike().run(),
            pressed: editor.isActive('highlight')
        },
        {
            icon: <AlignLeftIcon />,
            onClick: () => editor.chain().focus().setTextAlign('left').run(),
            pressed: editor.isActive({ textAlign: 'left' })
        },
        {
            icon: <AlignCenterIcon />,
            onClick: () => editor.chain().focus().setTextAlign('center').run(),
            pressed: editor.isActive({ textAlign: 'center' })
        },
        {
            icon: <AlignRightIcon />,
            onClick: () => editor.chain().focus().setTextAlign('right').run(),
            pressed: editor.isActive({ textAlign: 'right' })
        },
        {
            icon: <AlignJustifyIcon />,
            onClick: () => editor.chain().focus().setTextAlign('justify').run(),
            pressed: editor.isActive({ textAlign: 'justify' })
        },
        {
            icon: <HighLightIcon />,
            onClick: () => editor.chain().focus().toggleHighlight().run(),
            pressed: editor.isActive('highlight')
        },
        {
            icon: <ParagraphIcon />,
            onClick: () => editor.chain().focus().setParagraph().run(),
            pressed: editor.isActive('paragraph')
        },
        {
            icon: <UnOrderListIcon className='scale-150 transform font-semibold' />,
            onClick: () => editor.chain().focus().toggleBulletList().run(),
            pressed: editor.isActive('bulletList')
        },
        {
            icon: <OrderListIcon className='scale-150 transform font-semibold' />,
            onClick: () => editor.chain().focus().toggleOrderedList().run(),
            pressed: editor.isActive('orderedList')
        },
        {
            icon: <LinkIcon />,
            onClick: setLink,
            pressed: editor.isActive('link')
        },
        {
            icon: <ImageIcon />,
            onClick: () => setShowImageModal(true),
            pressed: false
        }
    ];

    return (
        <div className='z-10 mb-1 flex flex-wrap gap-2 rounded-md border bg-slate-50 p-1'>
            {Options.map((option, index) => (
                <Toggle key={index} pressed={option.pressed} onClick={option.onClick}>
                    {option.icon}
                </Toggle>
            ))}

            <div className='relative'>
                <Toggle pressed={editor.isActive('table')} onClick={() => setShowTableMenu(!showTableMenu)}>
                    <TableIcon />
                </Toggle>

                {showTableMenu && (
                    <div className='absolute top-full right-0 z-20 mt-1 min-w-[160px] rounded-md border bg-white py-1 shadow-lg'>
                        <button
                            type='button'
                            className='w-full px-3 py-1.5 text-right text-sm hover:bg-gray-100'
                            onClick={insertTable}
                        >
                            افزودن جدول
                        </button>
                        <button
                            type='button'
                            className='w-full px-3 py-1.5 text-right text-sm hover:bg-gray-100'
                            onClick={() => {
                                editor.chain().focus().addRowBefore().run();
                                setShowTableMenu(false);
                            }}
                        >
                            سطر قبل
                        </button>
                        <button
                            type='button'
                            className='w-full px-3 py-1.5 text-right text-sm hover:bg-gray-100'
                            onClick={() => {
                                editor.chain().focus().addRowAfter().run();
                                setShowTableMenu(false);
                            }}
                        >
                            سطر بعد
                        </button>
                        <button
                            type='button'
                            className='w-full px-3 py-1.5 text-right text-sm hover:bg-gray-100'
                            onClick={() => {
                                editor.chain().focus().deleteRow().run();
                                setShowTableMenu(false);
                            }}
                        >
                            حذف سطر
                        </button>
                        <button
                            type='button'
                            className='w-full px-3 py-1.5 text-right text-sm hover:bg-gray-100'
                            onClick={() => {
                                editor.chain().focus().addColumnBefore().run();
                                setShowTableMenu(false);
                            }}
                        >
                            ستون قبل
                        </button>
                        <button
                            type='button'
                            className='w-full px-3 py-1.5 text-right text-sm hover:bg-gray-100'
                            onClick={() => {
                                editor.chain().focus().addColumnAfter().run();
                                setShowTableMenu(false);
                            }}
                        >
                            ستون بعد
                        </button>
                        <button
                            type='button'
                            className='w-full px-3 py-1.5 text-right text-sm hover:bg-gray-100'
                            onClick={() => {
                                editor.chain().focus().deleteColumn().run();
                                setShowTableMenu(false);
                            }}
                        >
                            حذف ستون
                        </button>
                        <button
                            type='button'
                            className='w-full px-3 py-1.5 text-right text-sm hover:bg-gray-100'
                            onClick={() => {
                                editor.chain().focus().mergeCells().run();
                                setShowTableMenu(false);
                            }}
                        >
                            ادغام سلول‌ها
                        </button>
                        <button
                            type='button'
                            className='w-full px-3 py-1.5 text-right text-sm hover:bg-gray-100'
                            onClick={() => {
                                editor.chain().focus().splitCell().run();
                                setShowTableMenu(false);
                            }}
                        >
                            تفکیک سلول
                        </button>
                        <hr className='my-1' />
                        <button
                            type='button'
                            className='w-full px-3 py-1.5 text-right text-sm text-red-600 hover:bg-red-50'
                            onClick={() => {
                                editor.chain().focus().deleteTable().run();
                                setShowTableMenu(false);
                            }}
                        >
                            حذف جدول
                        </button>
                    </div>
                )}
            </div>

            <ImageUploadModal
                isOpen={showImageModal}
                onClose={() => setShowImageModal(false)}
                onInsert={handleImageInsert}
            />
        </div>
    );
};

export default React.memo(MenuBar);
