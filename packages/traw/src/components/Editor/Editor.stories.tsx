import { ComponentMeta, ComponentStory } from '@storybook/react';
import React from 'react';
import { TrawContext } from 'hooks';
import { TrawApp } from 'state';
import { Editor } from './';
import { TEST_DOCUMENT_1, TEST_USER_1 } from 'utils/testUtil';

export default {
  title: 'Traw/Editor',
  component: Editor,
  argTypes: {},
  args: {},
} as ComponentMeta<typeof Editor>;

const trawApp = new TrawApp({
  user: TEST_USER_1,
  document: TEST_DOCUMENT_1,
});

const Template: ComponentStory<typeof Editor> = () => (
  <TrawContext.Provider value={trawApp}>
    <Editor />;
  </TrawContext.Provider>
);
export const Default = Template.bind({});

Default.args = {};
