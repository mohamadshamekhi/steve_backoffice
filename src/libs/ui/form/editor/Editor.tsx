'use client';

import CharacterCount from '@tiptap/extension-character-count';
import Link from '@tiptap/extension-link';
import Subscript from '@tiptap/extension-subscript';
import Superscript from '@tiptap/extension-superscript';
import { Table, TableCell, TableHeader, TableRow } from '@tiptap/extension-table';
import TextAlign from '@tiptap/extension-text-align';
import Underline from '@tiptap/extension-underline';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { useEffect, useRef } from 'react';
import { CustomImage } from './extensions/customImage';
import { HtmlBlock } from './extensions/htmlBlock';
import { LineHeight } from './extensions/lineHeight';
import { TocExtension, TocItem } from './extensions/toc';
import Toolbar from './Toolbar';
import WordCount from './WordCount';
import '../../../../styles/editor.css';

export interface BlogEditorProps {
    content: string;
    onChange: (html: string) => void;
    onTocChange?: (items: TocItem[]) => void;
}

const BlogEditor = ({ content, onChange, onTocChange }: BlogEditorProps) => {
    const editor = useEditor({
        immediatelyRender: false,
        extensions: [
            StarterKit.configure({
                heading:      { levels: [1, 2, 3, 4, 5, 6] },
                bulletList:   { HTMLAttributes: { class: 'editor-bullet-list' } },
                orderedList:  { HTMLAttributes: { class: 'editor-ordered-list' } },
                blockquote:   { HTMLAttributes: { class: 'editor-blockquote' } },
                codeBlock:    { HTMLAttributes: { class: 'editor-code-block' } },
                code:         { HTMLAttributes: { class: 'editor-inline-code' } }
            }),
            Underline,
            Superscript,
            Subscript,
            CharacterCount,
            TextAlign.configure({ types: ['heading', 'paragraph'] }),
            Link.configure({
                openOnClick: false,
                HTMLAttributes: { class: 'editor-link', rel: 'noopener noreferrer' }
            }),
            LineHeight,
            CustomImage.configure({ allowBase64: true, HTMLAttributes: {} }),
            HtmlBlock,
            Table.configure({ resizable: true }),
            TableRow,
            TableHeader,
            TableCell,
            ...(onTocChange ? [TocExtension.configure({ onUpdate: onTocChange })] : [])
        ],
        editorProps: {
            attributes: { class: 'blog-editor-content' }
        },
        onUpdate: ({ editor }) => onChange(editor.getHTML()),
        content
    });

    // فقط یک بار، وقتی ادیتور mount شد و content از سرور آمد (edit page)
    const initializedRef = useRef(false);
    useEffect(() => {
        if (!editor || initializedRef.current) return;
        if (content && content !== editor.getHTML()) {
            editor.commands.setContent(content);
        }
        initializedRef.current = true;
    }, [editor, content]);

    return (
        <div className='blog-editor-wrapper'>
            <Toolbar editor={editor} />
            <EditorContent editor={editor} />
            <WordCount editor={editor} />
        </div>
    );
};

export default BlogEditor;
