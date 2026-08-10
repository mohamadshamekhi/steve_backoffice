'use client';

import { Editor } from '@tiptap/react';

interface WordCountProps {
    editor: Editor | null;
}

const WordCount = ({ editor }: WordCountProps) => {
    if (!editor) return null;

    const characters = editor.storage.characterCount?.characters() ?? 0;
    const words      = editor.storage.characterCount?.words()      ?? 0;

    return (
        <div className='flex items-center gap-3 border-t border-gray-100 bg-gray-50 px-3 py-1.5 text-xs text-gray-400'>
            <span>{words} کلمه</span>
            <span className='h-3 w-px bg-gray-200' />
            <span>{characters} کاراکتر</span>
        </div>
    );
};

export default WordCount;
