import _ from 'lodash';

import { getDeviceSize } from '@/lib/utils';
import { GridItem } from '@/types/gridItem';

export const getStyleOfDevice = (data: GridItem) => {
  const styleDevice: string = getDeviceSize() as string;

  const style = (_.get(data, [styleDevice]) as React.CSSProperties) || data?.style;

  return {
    ...style,
  };
};
