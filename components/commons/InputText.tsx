import _ from 'lodash';
import React, { ChangeEvent, useMemo } from 'react';
import { CSSProperties } from 'styled-components';
import { useDebouncedCallback } from 'use-debounce';

import { useActions } from '@/hooks/useActions';
import { useHandleData } from '@/hooks/useHandleData';
import { useUpdateData } from '@/hooks/useUpdateData';
// import { useData } from '@/hooks';
import { cn } from '@/lib/utils';
import { GridItem } from '@/types/gridItem';
import { Icon } from '@iconify/react/dist/iconify.js';

import { StyleBox } from './StyleBox';

type Props = { data: GridItem };

const InputText: React.FC<Props> = ({ data }) => {
  const { dataState } = useHandleData({ dataProp: data?.data });
  const { handleAction } = useActions(data);
  const style = _.get(data, 'dataSlice.style', {});
  const newStyle: CSSProperties = {
    ...style,
    position: 'initial',
    transform: '',
    margin: 0,
    padding: '5px',
    maxHeight: '',
    maxWidth: '',
    minHeight: '24px',
    width: '100%',
    height: '100%',
  };

  const prefixIcon = useMemo(() => {
    return data?.inputText?.prefixIcon;
  }, [data?.inputText]);
  const suffixIcon = useMemo(() => {
    return data?.inputText?.suffixIcon;
  }, [data?.inputText]);

  const { updateData } = useUpdateData({ dataProp: data?.data });

  const handleInputChange = useDebouncedCallback((e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;

    updateData(value);
  }, 300);
  const handleEnter = (e: any) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      e.stopPropagation();
      handleAction('onEnter');
    }
  };
  return (
    <StyleBox
      className="w-full flex items-center gap-1"
      style={newStyle}
      styledComponentCss={data?.styledComponentCss}
    >
      {prefixIcon && (
        <div className="">
          <Icon icon={prefixIcon} width="24" height="24" />
        </div>
      )}
      <input
        className={cn('w-full h-full outline-none')}
        onChange={handleInputChange}
        defaultValue={dataState as string}
        onKeyDown={handleEnter}
      />
      {suffixIcon && (
        <div className="">
          <Icon icon={suffixIcon} width="24" height="24" />
        </div>
      )}
    </StyleBox>
  );
};

export default InputText;
