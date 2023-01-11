import React from 'react';

import Lottie from 'lottie-react';
import HansCollaborationAnimation from 'static/json/hands-collaboration.json';

const EmptyContents = () => {
  return (
    <>
      <div className="text-traw-purple text-[15px] text-center">
        From video recording to editing and sharing.
        <br />
        Draw and explain anywhere.
      </div>
      <div>
        <Lottie animationData={HansCollaborationAnimation} />
      </div>
    </>
  );
};

export default EmptyContents;
