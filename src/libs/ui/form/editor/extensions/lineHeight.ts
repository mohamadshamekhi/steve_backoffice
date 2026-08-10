import { Extension } from '@tiptap/core';

export const LINE_HEIGHT_OPTIONS = ['1', '1.25', '1.5', '1.75', '2', '2.5', '3'];
export const LINE_HEIGHT_DEFAULT = '1.75';

declare module '@tiptap/core' {
    interface Commands<ReturnType> {
        lineHeight: {
            setLineHeight: (lineHeight: string) => ReturnType;
            unsetLineHeight: () => ReturnType;
        };
    }
}

export const LineHeight = Extension.create({
    name: 'lineHeight',

    addGlobalAttributes() {
        return [
            {
                types: ['paragraph', 'heading'],
                attributes: {
                    lineHeight: {
                        default: null,
                        parseHTML: (el) => (el as HTMLElement).style.lineHeight || null,
                        renderHTML: (attrs) => {
                            if (!attrs.lineHeight) return {};
                            return { style: `line-height: ${attrs.lineHeight}` };
                        }
                    }
                }
            }
        ];
    },

    addCommands() {
        return {
            setLineHeight:
                (lineHeight: string) =>
                ({ commands }) =>
                    commands.updateAttributes('paragraph', { lineHeight }),

            unsetLineHeight:
                () =>
                ({ commands }) =>
                    commands.updateAttributes('paragraph', { lineHeight: null })
        };
    }
});
