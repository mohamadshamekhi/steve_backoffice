'use client';

import { Editor } from '@tiptap/react';
import { AlignCenterIcon, AlignLeftIcon, AlignRightIcon } from 'libs/components/icons';
import { Toggle } from 'libs/ui/toggle';
import { ImageAlign } from './extensions/customImage';

interface ImageBubbleMenuProps {
    editor: Editor;
}

const ImageBubbleMenu = ({ editor }: ImageBubbleMenuProps) => {
    const currentAlign = (editor.getAttributes('image').align ?? 'center') as ImageAlign;

    const setAlign = (align: ImageAlign) => {
        editor.chain().focus().updateImageAlign(align).run();
    };

    return (
        <div className='flex items-center gap-1 rounded-md border bg-white p-1.5 shadow-lg'>
            <Toggle pressed={currentAlign === 'left'}   onClick={() => setAlign('left')}   title='تراز چپ'   className='h-7 px-1.5'><AlignLeftIcon /></Toggle>
            <Toggle pressed={currentAlign === 'center'} onClick={() => setAlign('center')} title='تراز وسط'  className='h-7 px-1.5'><AlignCenterIcon /></Toggle>
            <Toggle pressed={currentAlign === 'right'}  onClick={() => setAlign('right')}  title='تراز راست' className='h-7 px-1.5'><AlignRightIcon /></Toggle>
        </div>
    );
};

export default ImageBubbleMenu;
