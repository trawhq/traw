import * as React from 'react';
const SvgText = (props: any) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 512 512"
    style={{
      enableBackground: 'new 0 0 512 512',
    }}
    xmlSpace="preserve"
    {...props}
  >
    <path
      d="M512 128c0 23.6-19.2 42.6-42.6 42.6-23.6 0-42.6-19.2-42.6-42.6 0-23.6-19.2-42.6-42.6-42.6h-85.4v341.4h42.6c23.6 0 42.6 19.2 42.6 42.6 0 23.6-19.2 42.6-42.6 42.6H170.8c-23.6 0-42.6-19.2-42.6-42.6 0-23.6 19.2-42.6 42.6-42.6h42.6V85.4H128c-23.6 0-42.6 19.2-42.6 42.6 0 23.6-19.2 42.6-42.6 42.6S0 151.6 0 128C0 57.4 57.4 0 128 0h256c70.6 0 128 57.4 128 128z"
      style={{
        fill: '#5b5f80',
      }}
    />
  </svg>
);
export default SvgText;
