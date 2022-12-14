import { ComponentMeta, ComponentStory } from '@storybook/react';
import React from 'react';
import ToolBox from '.';
import { TrawContext } from 'hooks';
import { TrawApp } from 'state';
import { TEST_DOCUMENT_1, TEST_USER_1 } from 'utils/testUtil';

export default {
  title: 'Traw/ToolBox',
  component: ToolBox,
  argTypes: {
    selectTool: {
      action: 'tool clicked',
    },
    handleUndo: {
      action: 'undo clicked',
    },
    handleRedo: {
      action: 'redo clicked',
    },
  },
} as ComponentMeta<typeof ToolBox>;

const trawApp = new TrawApp({
  user: TEST_USER_1,
  document: TEST_DOCUMENT_1,
});

const Template: ComponentStory<typeof ToolBox> = (props) => (
  <TrawContext.Provider value={trawApp}>
    <ToolBox {...props} />
  </TrawContext.Provider>
);
export const Default = Template.bind({});

Default.args = {
  currentTool: 'select',
  isUndoable: true,
  isRedoable: true,
};
