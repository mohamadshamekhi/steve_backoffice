import { mergeAttributes, Node } from '@tiptap/core';
import { ReactNodeViewRenderer } from '@tiptap/react';
import { HtmlBlockView } from './HtmlBlockView';

declare module '@tiptap/core' {
    interface Commands<ReturnType> {
        htmlBlock: {
            insertHtmlBlock: (html?: string) => ReturnType;
        };
    }
}

export const HtmlBlock = Node.create({
    name: 'htmlBlock',
    group: 'block',
    atom: true,
    selectable: true,
    draggable: true,

    addAttributes() {
        return {
            html: { default: '' }
        };
    },

    parseHTML() {
        return [{ tag: 'div[data-html-block]' }];
    },

    renderHTML({ HTMLAttributes }) {
        const { html, ...rest } = HTMLAttributes as { html: string; [k: string]: unknown };
        return ['div', mergeAttributes(rest, { 'data-html-block': 'true' }), html];
    },

    addNodeView() {
        return ReactNodeViewRenderer(HtmlBlockView);
    },

    addCommands() {
        return {
            insertHtmlBlock:
                (html = '') =>
                ({ commands }) =>
                    commands.insertContent({ type: this.name, attrs: { html } })
        };
    }
});
