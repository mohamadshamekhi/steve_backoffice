'use client';

import Highlight from '@tiptap/extension-highlight';
import Link from '@tiptap/extension-link';
import { Table, TableCell, TableHeader, TableRow } from '@tiptap/extension-table';
import TextAlign from '@tiptap/extension-text-align';
import { EditorContent, useEditor } from '@tiptap/react';
import { BubbleMenu } from '@tiptap/react/menus';
import StarterKit from '@tiptap/starter-kit';
import { useEffect } from 'react';
import CustomImage from './customImage';
import ImageBubbleMenu from './imageBubbleMenu';
import MenuBar from './menuBar';

interface TipTapProps {
    content: string;
    onChange: (content: string) => void;
}
const Tiptap = ({ content, onChange }: TipTapProps) => {
    const editor = useEditor({
        extensions: [
            StarterKit.configure({
                bulletList: {
                    HTMLAttributes: {
                        class: 'list-disc mr-3'
                    }
                },
                orderedList: {
                    HTMLAttributes: {
                        class: 'list-decimal mr-3'
                    }
                }
            }),
            TextAlign.configure({
                types: ['heading', 'paragraph', 'image']
            }),
            Highlight.configure({
                HTMLAttributes: {
                    class: 'hover:bg-red-300'
                }
            }),
            Link.configure({
                openOnClick: false,
                HTMLAttributes: {
                    class: 'text-blue-600 underline cursor-pointer'
                }
            }),
            CustomImage.configure({
                inline: false,
                allowBase64: true,
                HTMLAttributes: {
                    class: 'rounded-md max-w-full h-auto'
                }
            }),
            Table.configure({
                resizable: true
            }),
            TableRow,
            TableHeader,
            TableCell
        ],
        onUpdate: ({ editor }) => {
            onChange(editor.getHTML());
        },
        content: content,
        editorProps: {
            attributes: {
                class: 'min-h-[156px] border rounded-md py-2 px-3 bg-slate-50'
            }
        },

        immediatelyRender: false,
        injectCSS: true,
        editable: true
    });
    useEffect(() => {
        if (editor && content !== editor.getHTML()) {
            editor.commands.setContent(content);
        }
    }, [content, editor]);

    return (
        <>
            <MenuBar editor={editor} />
            <EditorContent editor={editor} />
            {editor && (
                <BubbleMenu editor={editor} shouldShow={({ editor }) => editor.isActive('image')}>
                    <ImageBubbleMenu editor={editor} />
                </BubbleMenu>
            )}
        </>
    );
};

export default Tiptap;
