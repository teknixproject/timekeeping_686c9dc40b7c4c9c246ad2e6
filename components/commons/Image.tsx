import _ from 'lodash';
import { CSSProperties } from 'react';

import { useActions } from '@/hooks/useActions';
import { GridItem } from '@/types/gridItem';

import { StyleBox } from './StyleBox';

interface ImageProps {
  data?: GridItem;
  style?: CSSProperties;
}

const Image = ({ data, style }: ImageProps) => {
  const url = _.get(data, 'media.url', '/default-bg.png');
  const { handleAction } = useActions();

  const isBg = _.get(style, 'background');

  return (
    <div
      style={{ width: '100%', height: '100%' }}
      className="relative overflow-hidden flex items-center justify-center"
      onClick={() => handleAction('onClick')}
    >
      <StyleBox
        as={'img'}
        style={style}
        src={url}
        alt="Image"
        className="w-full h-full object-cover"
        styledComponentCss={data?.styledComponentCss}
      />
      {isBg && (
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: isBg as string,
          }}
        ></div>
      )}
    </div>
  );
};

export default Image;
