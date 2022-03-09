import { BLOCKS, CONTAINERS, TEXT_CONTAINERS } from '@contentful/rich-text-types';
import { getAbove } from '@udecode/plate-core';
import { BaseRange, BaseSelection, Element, Node, Point, Transforms } from 'slate';

import { transformLift, transformUnwrap } from '../../helpers/transformers';
import { RichTextPlugin } from '../../types';
import { Quote } from './components/Quote';
import { onKeyDownToggleQuote } from './toggleQuote';

export function createQuotePlugin(): RichTextPlugin {
  return {
    key: BLOCKS.QUOTE,
    type: BLOCKS.QUOTE,
    isElement: true,
    component: Quote,
    options: {
      hotkey: 'mod+shift+1',
    },
    handlers: {
      onKeyDown: onKeyDownToggleQuote,
    },
    deserializeHtml: {
      rules: [
        {
          validNodeName: 'BLOCKQUOTE',
        },
      ],
    },
    normalizer: [
      {
        validChildren: CONTAINERS[BLOCKS.QUOTE],
        transform: {
          [BLOCKS.QUOTE]: transformUnwrap,
          default: transformLift,
        },
      },
    ],
    withOverrides: (editor) => {
      const { insertFragment } = editor;

      editor.insertFragment = (fragment) => {
        const startingNode = fragment.length && fragment[0];
        const startsWithBlockquote =
          Element.isElement(startingNode) && startingNode.type === BLOCKS.QUOTE;

        const containerEntry = getAbove(editor, {
          match: {
            type: TEXT_CONTAINERS,
          },
        });
        const containerIsNotEmpty = containerEntry && Node.string(containerEntry[0]) !== '';

        if (startsWithBlockquote && containerIsNotEmpty) {
          const { selection } = editor;
          const isContentSelected = (selection: BaseSelection): selection is BaseRange =>
            !!selection && Point.compare(selection.anchor, selection.focus) !== 0;
          // if something is selected (highlighted) we replace the selection
          if (isContentSelected(selection)) {
            Transforms.delete(editor, { at: selection });
          }

          // get the cursor entry again, it may be different after deletion
          const containerEntry = getAbove(editor, {
            match: {
              type: TEXT_CONTAINERS,
            },
          });

          const containerIsNotEmpty = containerEntry && Node.string(containerEntry[0]) !== '';

          if (containerIsNotEmpty) {
            Transforms.insertNodes(editor, fragment);
            return;
          }
        }

        insertFragment(fragment);
      };

      return editor;
    },
  };
}