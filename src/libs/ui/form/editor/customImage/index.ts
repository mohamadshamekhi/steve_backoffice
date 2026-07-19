import { mergeAttributes } from '@tiptap/core';
import Image from '@tiptap/extension-image';

const CustomImage = Image.extend({
    renderHTML({ HTMLAttributes }) {
        const { style, ...imgAttrs } = HTMLAttributes;
        return [
            'figure',
            { style, class: 'image-wrapper' },
            ['img', mergeAttributes(this.options.HTMLAttributes, imgAttrs)]
        ];
    },
    parseHTML() {
        return [
            {
                tag: 'figure.image-wrapper',
                getAttrs: (node) => {
                    const img = (node as HTMLElement).querySelector('img');
                    if (!img) return false;
                    return {
                        src: img.getAttribute('src'),
                        alt: img.getAttribute('alt'),
                        title: img.getAttribute('title'),
                        width: img.getAttribute('width'),
                        height: img.getAttribute('height')
                    };
                }
            },
            {
                tag: this.options.allowBase64 ? 'img[src]' : 'img[src]:not([src^="data:"])'
            }
        ];
    }
});

export default CustomImage;
