import { mergeAttributes, Node, nodeInputRule } from '@tiptap/core';
import { ReactNodeViewRenderer } from '@tiptap/react';
import { ResizableImageView } from './ResizableImageView';

export type ImageAlign = 'left' | 'center' | 'right';

export interface ImageOptions {
    allowBase64: boolean;
    HTMLAttributes: Record<string, unknown>;
}

export interface SetCustomImageOptions {
    src: string;
    alt?: string;
    title?: string;
    width?: number | string;
    align?: ImageAlign;
}

declare module '@tiptap/core' {
    interface Commands<ReturnType> {
        customImage: {
            setImage: (options: SetCustomImageOptions) => ReturnType;
            updateImageAlign: (align: ImageAlign) => ReturnType;
            updateImageWidth: (width: number | string) => ReturnType;
            updateImageAlt: (alt: string) => ReturnType;
        };
    }
}

// No named capture groups — compatible with ES2017 target
const IMAGE_INPUT_REGEX = /!\[([^\]]*)\]\(([^)\s]+)(?:\s+"([^"]+)")?\)/;

export const CustomImage = Node.create<ImageOptions>({
    name: 'image',
    group: 'block',
    atom: true,
    draggable: true,
    selectable: true,

    addOptions() {
        return { allowBase64: true, HTMLAttributes: {} };
    },

    addAttributes() {
        return {
            src:   { default: null },
            alt:   { default: null },
            title: { default: null },
            width: { default: null },
            align: { default: 'center' }
        };
    },

    parseHTML() {
        return [
            {
                tag: this.options.allowBase64 ? 'img[src]' : 'img[src]:not([src^="data:"])',
                getAttrs: (el) => {
                    const img = el as HTMLImageElement;

                    // width attribute را بخوان، اگر نبود از style بخوان
                    const widthAttr = img.getAttribute('width');
                    const styleWidth = img.style.width
                        ? parseInt(img.style.width)
                        : null;
                    const width = widthAttr
                        ? Number(widthAttr)
                        : !isNaN(styleWidth as number) && styleWidth
                          ? styleWidth
                          : null;

                    return {
                        src:   img.getAttribute('src'),
                        alt:   img.getAttribute('alt'),
                        title: img.getAttribute('title'),
                        width,
                        align: img.getAttribute('data-align') ?? 'center'
                    };
                }
            }
        ];
    },

    renderHTML({ HTMLAttributes }) {
        const { align, width, ...rest } = HTMLAttributes as {
            align?: ImageAlign;
            width?: number | null;
            [key: string]: unknown;
        };

        const marginStyle =
            align === 'left'
                ? 'margin-right: auto; margin-left: 0;'
                : align === 'right'
                  ? 'margin-left: auto; margin-right: 0;'
                  : 'margin-left: auto; margin-right: auto;';

        const widthStyle = width ? ` width: ${width}px; max-width: 100%;` : ' max-width: 100%;';
        const style = `display: block;${widthStyle} height: auto; ${marginStyle}`;

        return [
            'img',
            mergeAttributes(this.options.HTMLAttributes, rest, {
                'data-align': align ?? 'center',
                style
            })
        ];
    },

    addNodeView() {
        return ReactNodeViewRenderer(ResizableImageView);
    },

    addCommands() {
        return {
            setImage:
                (options: SetCustomImageOptions) =>
                ({ commands }) =>
                    commands.insertContent({
                        type: this.name,
                        attrs: {
                            src:   options.src,
                            alt:   options.alt   ?? '',
                            title: options.title ?? '',
                            width: options.width ?? null,
                            align: options.align ?? 'center'
                        }
                    }),

            updateImageAlign:
                (align: ImageAlign) =>
                ({ commands }) =>
                    commands.updateAttributes(this.name, { align }),

            updateImageWidth:
                (width: number | string) =>
                ({ commands }) =>
                    commands.updateAttributes(this.name, { width }),

            updateImageAlt:
                (alt: string) =>
                ({ commands }) =>
                    commands.updateAttributes(this.name, { alt })
        };
    },

    addInputRules() {
        return [
            nodeInputRule({
                find: IMAGE_INPUT_REGEX,
                type: this.type,
                getAttributes: (match) => ({
                    src:   match[2],
                    alt:   match[1],
                    title: match[3]
                })
            })
        ];
    }
});
