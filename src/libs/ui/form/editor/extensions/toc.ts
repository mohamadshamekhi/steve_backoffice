import { Extension } from '@tiptap/core';
import { Plugin, PluginKey } from '@tiptap/pm/state';
import { slugifyHeading } from '../utils/slugifyHeading';

export interface TocItem {
    level: number;
    text: string;
    id: string;
}

export interface TocOptions {
    onUpdate: (items: TocItem[]) => void;
}

const TocPluginKey = new PluginKey('toc');

export const TocExtension = Extension.create<TocOptions>({
    name: 'toc',

    addOptions() {
        return {
            onUpdate: () => {}
        };
    },

    addProseMirrorPlugins() {
        const { onUpdate } = this.options;

        return [
            new Plugin({
                key: TocPluginKey,
                appendTransaction(transactions, _oldState, newState) {
                    const docChanged = transactions.some((tr) => tr.docChanged);
                    if (!docChanged) return null;

                    const items: TocItem[] = [];
                    const idCounts: Record<string, number> = {};

                    newState.doc.descendants((node, pos) => {
                        if (node.type.name !== 'heading') return;

                        const text = node.textContent;
                        const level = node.attrs.level as number;
                        let id = slugifyHeading(text);

                        if (!id) id = `heading-${pos}`;

                        if (idCounts[id] !== undefined) {
                            idCounts[id]++;
                            id = `${id}-${idCounts[id]}`;
                        } else {
                            idCounts[id] = 0;
                        }

                        items.push({ level, text, id });
                    });

                    onUpdate(items);

                    // Inject id attrs into heading nodes
                    const { tr } = newState;
                    let modified = false;

                    const seenIds: Record<string, number> = {};

                    newState.doc.descendants((node, pos) => {
                        if (node.type.name !== 'heading') return;

                        const text = node.textContent;
                        let id = slugifyHeading(text);
                        if (!id) id = `heading-${pos}`;

                        if (seenIds[id] !== undefined) {
                            seenIds[id]++;
                            id = `${id}-${seenIds[id]}`;
                        } else {
                            seenIds[id] = 0;
                        }

                        if (node.attrs.id !== id) {
                            tr.setNodeMarkup(pos, undefined, { ...node.attrs, id });
                            modified = true;
                        }
                    });

                    return modified ? tr : null;
                }
            })
        ];
    }
});
