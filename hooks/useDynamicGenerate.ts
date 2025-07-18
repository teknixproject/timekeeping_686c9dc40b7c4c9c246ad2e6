import _ from 'lodash';
import { useEffect, useState } from 'react';

import { TData } from '@/types';
import { GridItem } from '@/types/gridItem';

import { useHandleData } from './useHandleData';

type TProps = {
  data: GridItem;
};

const addItemInNested = (childs: GridItem[], item: any): GridItem[] => {
  return childs.map((child, index) => {
    const updatedChild = {
      ..._.cloneDeep(child),
      data: {
        ...child.data,
        temp: item,
      },
      id: `${child.id}_${index}`,
    };

    if (child.childs?.length) {
      updatedChild.childs = addItemInNested(child.childs, item);
    }

    return updatedChild;
  }) as GridItem[];
};

const updateDynamicChilds = (data: GridItem, list: any[], maxItems: number): GridItem => {
  if (!data?.childs?.length) return data;

  const limitedList = _.slice(list, 0, maxItems);
  const firstChild = data.childs[0];

  const newChilds: GridItem[] = limitedList.map((item, index) => {
    const clonedChild = _.cloneDeep({ ...firstChild, id: `${firstChild.id}_${index}` });

    if (clonedChild.childs?.length) {
      clonedChild.childs = addItemInNested(clonedChild.childs, item);
    }

    return {
      ...clonedChild,
      data: {
        ...clonedChild.data,
        temp: item,
      } as TData,
    };
  });

  return {
    ...data,
    childs: newChilds,
  };
};

export const useDynamicGenerate = ({
  data,
}: TProps): { dynamicData: GridItem; loading: boolean } => {
  const dynamic = data?.dynamicGenerate;
  const { dataState: list } = useHandleData({ dataProp: dynamic?.list });
  console.log('🚀 ~ list:', list);
  const { dataState: maxItemsRaw } = useHandleData({ dataProp: dynamic?.maxItems });

  const [dynamicData, setDynamicData] = useState<GridItem>(data);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const generate = () => {
      if (_.isEmpty(dynamic)) {
        setDynamicData(data);
        setLoading(false);
        return;
      }

      const maxItems = Number(maxItemsRaw) || 0;
      const newData = updateDynamicChilds(_.cloneDeep(data), list, maxItems);

      setDynamicData(newData);
      setLoading(false);
    };

    setLoading(true);
    generate();
  }, [data, list, maxItemsRaw, dynamic]);

  return { dynamicData, loading };
};
