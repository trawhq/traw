import { ComponentMeta, ComponentStory } from '@storybook/react';
import { default as React, useEffect } from 'react';
import { TrawApp, TrawEventType } from 'state';

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
  const [trawAppLeft] = React.useState(
    new TrawApp({
      user: TEST_USER_1,
      document: TEST_DOCUMENT_1,
      records: [],
    }),
  );
  const [trawAppRight] = React.useState(
    new TrawApp({
      user: TEST_USER_1,
      document: TEST_DOCUMENT_1,
      records: [],
    }),
  );

  useEffect(() => {
    trawAppLeft.on(TrawEventType.CreateRecords, (e) => {
      trawAppRight.addRecords(e.records);
    });
    trawAppRight.on(TrawEventType.CreateRecords, (e) => {
      trawAppLeft.addRecords(e.records);
    });
    console.log('trawAppLeft', trawAppLeft);
    console.log('trawAppRight', trawAppRight);
  });

  return (
    <div className="h-screen flex -m-4">
      <Traw app={trawAppLeft} />
      <Traw app={trawAppRight} />
    </div>
  );
};

export const Sync = SyncTemplate.bind({});
Sync.args = {};
