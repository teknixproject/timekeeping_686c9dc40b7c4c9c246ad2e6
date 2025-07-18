import React from 'react';

import { Icon } from '@iconify/react/dist/iconify.js';

type Props = object;

const Loading: React.FC<Props> = ({}) => {
  return (
    <div className="transition-all duration-300 absolute inset-0 bg-gray-50 h-screen w-screen  opacity-50 flex items-center justify-center">
      <div className="flex justify-center items-center gap-3 px-3 py-1 bg-sky-500 rounded-lg text-white">
        <Icon icon="uil:spinner-alt" width="24" height="24" className="animate-spin " />
        Loading...
      </div>
    </div>
  );
};

export default Loading;
