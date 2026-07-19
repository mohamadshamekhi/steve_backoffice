import { Editor } from '@tiptap/react';
import { AlignCenterIcon, AlignLeftIcon, AlignRightIcon } from 'libs/components/icons';
import { Toggle } from 'libs/ui/toggle';

const ImageBubbleMenu = ({ editor }: { editor: Editor }) => {
    return (
        <div className='flex gap-1 rounded-md border bg-white p-1 shadow-lg'>
            <Toggle
                pressed={editor.isActive({ textAlign: 'left' })}
                onClick={() => editor.chain().focus().setTextAlign('left').run()}
            >
                <AlignLeftIcon />
            </Toggle>
            <Toggle
                pressed={editor.isActive({ textAlign: 'center' })}
                onClick={() => editor.chain().focus().setTextAlign('center').run()}
            >
                <AlignCenterIcon />
            </Toggle>
            <Toggle
                pressed={editor.isActive({ textAlign: 'right' })}
                onClick={() => editor.chain().focus().setTextAlign('right').run()}
            >
                <AlignRightIcon />
            </Toggle>
        </div>
    );
};

export default ImageBubbleMenu;
