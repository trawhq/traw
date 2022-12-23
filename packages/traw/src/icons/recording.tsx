import * as React from 'react';
const SvgRecording = (props: any) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 512 512"
    style={{
      enableBackground: 'new 0 0 512 512',
    }}
    xmlSpace="preserve"
    {...props}
  >
    <circle cx={256} cy={256} r={256} fill="currentColor" />
  </svg>
);
export default SvgRecording;
