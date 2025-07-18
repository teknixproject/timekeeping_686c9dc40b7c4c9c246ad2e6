import _ from 'lodash';

import { TData } from '@/types';

export const convertFieldValue = (value: any) => {
  if (typeof value !== 'object') {
    return {
      valueInput: value,
      type: 'valueInput',
    } as TData;
  }
  return value;
};

export const convertDataToSingleProp = ({
  propName,
  valueProp,
}: {
  propName: string;
  valueProp: TData;
}) => {
  return {
    [propName]:
      _.get(valueProp, 'type') === 'valueInput' ? _.get(valueProp, 'valueInput') : valueProp,
  };
};

export const convertDataToProps = (props: Record<string, TData>): Record<string, any> => {
  return _.reduce(
    props,
    (result, valueProp, key) => {
      return _.assign(result, convertDataToSingleProp({ propName: key, valueProp }));
    },
    {}
  );
};
