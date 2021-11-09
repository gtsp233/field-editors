import * as React from 'react';
import * as Slate from 'slate-react';
import { css } from 'emotion';
import { getRenderLeaf, PlatePlugin } from '@udecode/plate-core';
import { MARKS } from '@contentful/rich-text-types';
import { getToggleMarkOnKeyDown, isMarkActive, toggleMark } from '@udecode/plate-common';
import { FormatBoldIcon } from '@contentful/f36-icons';
import { ToolbarButton } from '../shared/ToolbarButton';
import { CustomSlatePluginOptions } from 'types';
import { useContentfulEditor } from '../../ContentfulEditorProvider';

interface ToolbarBoldButtonProps {
  isDisabled?: boolean;
}

export function ToolbarBoldButton(props: ToolbarBoldButtonProps) {
  const editor = useContentfulEditor();

  function handleClick(event: React.MouseEvent<HTMLButtonElement>) {
    event.preventDefault();

    if (!editor?.selection) return;

    toggleMark(editor, MARKS.BOLD);
    Slate.ReactEditor.focus(editor);
  }

  if (!editor) return null;

  return (
    <ToolbarButton
      title="Bold"
      testId="bold-toolbar-button"
      onClick={handleClick}
      isActive={isMarkActive(editor, MARKS.BOLD)}
      isDisabled={props.isDisabled}>
      <FormatBoldIcon />
    </ToolbarButton>
  );
}

const styles = {
  bold: css({
    fontWeight: 600,
  }),
};

export function Bold(props: Slate.RenderLeafProps) {
  return (
    <strong {...props.attributes} className={styles.bold}>
      {props.children}
    </strong>
  );
}

export function createBoldPlugin(): PlatePlugin {
  return {
    pluginKeys: MARKS.BOLD,
    renderLeaf: getRenderLeaf(MARKS.BOLD),
    onKeyDown: getToggleMarkOnKeyDown(MARKS.BOLD),
    deserialize: () => {
      return {
        leaf: [
          {
            type: MARKS.BOLD,
            deserialize: (element) => {
              // We ignore it otherwise everything will be bold
              const isGoogleBoldWrapper =
                element.id.startsWith('docs-internal-guid') && element.nodeName === 'B';

              const isBold =
                ['600', '700', 'bold'].includes(element.style.fontWeight) ||
                ['STRONG', 'B'].includes(element.nodeName);

              if (isGoogleBoldWrapper || !isBold) return;

              return {
                [MARKS.BOLD]: true,
              };
            },
          },
        ],
      };
    },
  };
}

export const withBoldOptions: CustomSlatePluginOptions = {
  [MARKS.BOLD]: {
    type: MARKS.BOLD,
    component: Bold,
    hotkey: ['mod+b'],
  },
};