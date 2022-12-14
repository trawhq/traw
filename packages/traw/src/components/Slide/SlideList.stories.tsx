import { ComponentMeta, ComponentStory } from '@storybook/react';
import React from 'react';
import { TrawContext } from 'hooks';
import { TrawApp } from 'state';
import SlideList from './SlideList';
import { TEST_DOCUMENT_1, TEST_USER_1 } from 'utils/testUtil';

export default {
  title: 'Traw/Slide/SlideList',
  component: SlideList,
  argTypes: {},
} as ComponentMeta<typeof SlideList>;

const trawApp = new TrawApp({
  user: TEST_USER_1,
  document: TEST_DOCUMENT_1,
});

const Template: ComponentStory<typeof SlideList> = (props) => (
  <TrawContext.Provider value={trawApp}>
    <SlideList {...props} />
  </TrawContext.Provider>
);
export const Default = Template.bind({});

Default.args = {
  canAddSlide: true,
};
