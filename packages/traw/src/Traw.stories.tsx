import { ComponentMeta, ComponentStory } from '@storybook/react';
import { default as React } from 'react';
import { TrawApp } from 'state';

import { Traw } from 'Traw';
import { TEST_DOCUMENT_1, TEST_USER_1 } from 'utils/testUtil';

export default {
  title: 'Traw/Traw',
  component: Traw,
  argTypes: {},
  args: {},
} as ComponentMeta<typeof Traw>;

const Template: ComponentStory<typeof Traw> = () => {
  return (
    <div className="h-screen flex -m-4">
      <Traw />
    </div>
  );
};
export const Default = Template.bind({});

Default.args = {};

const SyncTemplate: ComponentStory<typeof Traw> = () => {
  const [trawApp] = React.useState(
    new TrawApp({
      user: TEST_USER_1,
      document: TEST_DOCUMENT_1,
      records: [],
    }),
  );

  return (
    <div className="h-screen flex -m-4">
      <Traw app={trawApp} />
    </div>
  );
};

export const Sync = SyncTemplate.bind({});
Sync.args = {};
