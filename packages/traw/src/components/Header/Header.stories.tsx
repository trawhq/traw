import { ComponentMeta, ComponentStory } from '@storybook/react';
import React from 'react';
import { Header } from './';

export default {
  title: 'Traw/Header',
  component: Header,
  argTypes: {},
  args: {
    title: 'My Traw',
    canEdit: true,

    Room: <div />,
  },
} as ComponentMeta<typeof Header>;

const Template: ComponentStory<typeof Header> = (props) => <Header {...props} />;
export const Default = Template.bind({});

Default.args = {};
