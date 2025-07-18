import _ from 'lodash';
import { CSSProperties } from 'react';

import { useActions } from '@/hooks/useActions';
import { GridItem } from '@/types/gridItem';

interface IconCompoProps {
  data?: GridItem;
  style?: CSSProperties;
}

const IconCompo = ({ data, style }: IconCompoProps) => {
  const url = _.get(data, 'media.url');
  const { handleAction } = useActions();
  return url ? (
    <img
      src={url}
      alt="Image"
      className="w-full h-full"
      style={style}
      onClick={() => handleAction('onClick')}
    />
  ) : (
    <img
      src="/default-icon.png"
      alt="default-icon"
      style={style}
      onClick={() => handleAction('onClick')}
    />
  );
};

export default IconCompo;
