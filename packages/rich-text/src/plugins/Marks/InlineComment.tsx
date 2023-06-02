import React from 'react';

import { ChatBubbleIcon } from '@contentful/f36-icons';
import { MARKS } from '@contentful/rich-text-types';
import { css } from 'emotion';
import { RenderLeafProps } from 'slate-react';

import { createMarkToolbarButton } from './components/MarkToolbarButton';

export const ToolbarInlineCommentButton = createMarkToolbarButton({
  title: 'inline-comments',
  mark: 'inline-comment' as unknown as MARKS, // change this once rich text types are updated. Requierement defined
  icon: <ChatBubbleIcon />,
  callback: (sdk) => {
    sdk.field.comments.create();
  },
});

const styles = {
  inlineComment: css({
    background: '#C4E7FF',
    fontWeight: 'normal',
  }),
};

export const InlineComment = ({ children, attributes }: RenderLeafProps) => {
  return (
    <mark {...attributes} className={styles.inlineComment}>
      {children}
    </mark>
  );
};
