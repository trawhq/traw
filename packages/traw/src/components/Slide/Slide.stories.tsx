import { ComponentMeta, ComponentStory } from '@storybook/react';
import React from 'react';
import { TrawContext } from 'hooks';
import { TrawApp } from 'state';
import { Slide } from './';
import { TEST_DOCUMENT_1, TEST_USER_1 } from 'utils/testUtil';

export default {
  title: 'Traw/Slide',
  component: Slide,
  argTypes: {},
  args: {},
} as ComponentMeta<typeof Slide>;

const trawApp = new TrawApp({
  user: TEST_USER_1,
  document: TEST_DOCUMENT_1,
});

const Template: ComponentStory<typeof Slide> = () => (
  <TrawContext.Provider value={trawApp}>
    <Slide />;
  </TrawContext.Provider>
);
export const Default = Template.bind({});

Default.args = {};
