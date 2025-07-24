/* eslint-disable @typescript-eslint/no-unused-vars */
import dayjs from 'dayjs';
/** @jsxImportSource @emotion/react */
import _ from 'lodash';
import { FC, useMemo } from 'react';
import { Controller, FormProvider, useForm, useFormContext } from 'react-hook-form';

import { actionHookSliceStore } from '@/hooks/store/actionSliceStore';
import { useActions } from '@/hooks/useActions';
import { useHandleData } from '@/hooks/useHandleData';
import { useHandleProps } from '@/hooks/useHandleProps';
import { stateManagementStore } from '@/stores';
import { GridItem } from '@/types/gridItem';
import { getComponentType } from '@/uitls/component';
import { cleanProps } from '@/uitls/renderItem';
import { convertCssObjectToCamelCase, convertToEmotionStyle } from '@/uitls/styleInline';
import { convertToPlainProps } from '@/uitls/transfromProp';
import { css } from '@emotion/react';

import { componentRegistry, convertProps } from './ListComponent';
import LoadingPage from './loadingPage';

type TProps = {
  data: GridItem;
  valueStream?: any;
  formKeys?: { key: string; value: string }[];
};
const getPropData = (data: GridItem) =>
  data?.componentProps?.dataProps?.filter((item: any) => item.type === 'data');

const getPropActions = (data: GridItem) =>
  data?.componentProps?.dataProps?.filter((item: any) => item.type.includes('MouseEventHandler'));
const handleCssWithEmotion = (staticProps: Record<string, any>) => {
  const advancedCss = convertToEmotionStyle(staticProps?.styleMultiple);
  let cssMultiple;

  if (typeof advancedCss === 'string') {
    // If it's a CSS string, use template literal directly
    cssMultiple = css`
      ${advancedCss}
    `;
  } else if (advancedCss && typeof advancedCss === 'object') {
    // If it's a CSS object, convert kebab-case to camelCase and use as object
    const convertedCssObj = convertCssObjectToCamelCase(advancedCss);
    cssMultiple = css(convertedCssObj);
  } else {
    // Fallback to empty css
    cssMultiple = css``;
  }

  return cssMultiple;
};
// Custom hook to extract common logic
const useRenderItem = (data: GridItem, valueStream?: any) => {
  const valueType = useMemo(() => data?.value?.toLowerCase() || '', [data?.value]);
  const { isForm, isNoChildren, isChart, isDatePicker } = getComponentType(data?.value || '');
  const { findVariable } = stateManagementStore();
  const { dataState, getData } = useHandleData({
    dataProp: getPropData(data),
    componentProps: data?.componentProps,
    valueStream,
    valueType,
    activeData: data,
  });

  const { actions } = useHandleProps({ dataProps: getPropActions(data), data, valueStream });

  const { isLoading } = useActions({ data, valueStream });

  const Component = useMemo(
    () => (valueType ? _.get(componentRegistry, valueType) || 'div' : 'div'),
    [valueType]
  );

  const propsCpn = useMemo(() => {
    const staticProps: Record<string, any> = {
      ...convertProps({ initialProps: dataState, valueType }),
    };

    staticProps.css = handleCssWithEmotion(staticProps);

    let result =
      valueType === 'menu'
        ? { ...staticProps, ...actions }
        : {
            ...dataState,
            ...staticProps,
            ...actions,
          };

    if (isDatePicker) {
      if (typeof result.value === 'string') result.value = dayjs(result.value);
      if (typeof result.defaultValue === 'string') result.defaultValue = dayjs(result.defaultValue);
    }
    if (isNoChildren && 'children' in result) {
      _.unset(result, 'children');
    }
    if ('styleMultiple' in result) _.unset(result, 'styleMultiple');
    if ('dataProps' in result) _.unset(result, 'dataProps');
    const plainProps = convertToPlainProps(result, getData);

    result = cleanProps(plainProps, valueType);

    return result;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, dataState, valueStream]);

  return {
    isLoading,
    valueType,
    Component,
    propsCpn,
    findVariable,
    dataState,
  };
};

// Generic component renderer
const ComponentRenderer: FC<{
  Component: any;
  propsCpn: any;
  data: GridItem;
  children?: React.ReactNode;
}> = ({ Component, propsCpn, data, children }) => {
  // console.log('ComponentRenderer', propsCpn?.style);
  const { style, ...newPropsCpn } = propsCpn;

  return (
    <Component key={data?.id} {...newPropsCpn}>
      {!_.isEmpty(data?.childs) ? children : propsCpn.children}
    </Component>
  );
};

const RenderSliceItem: FC<TProps> = (props) => {
  const { data, valueStream } = useMemo(() => props, [props]);

  const { isLoading, valueType, Component, propsCpn, dataState } = useRenderItem(data, valueStream);
  console.log(`🚀 ~ propsCpn: ${data.id}`, propsCpn);

  const { isForm, isNoChildren, isChart, isMap } = getComponentType(data?.value || '');
  if (!valueType) return <div></div>;
  if (isLoading) return <LoadingPage />;
  if (isForm) return <RenderForm {...props} />;

  if (isNoChildren || isChart) return <Component key={data?.id} {...propsCpn} />;
  if (isMap)
    return (
      <div style={{ width: propsCpn.width || '100%', height: propsCpn.height || '400px' }}>
        <Component key={data?.id} {...propsCpn} />
      </div>
    );
  return (
    <ComponentRenderer Component={Component} propsCpn={propsCpn} data={data}>
      {data?.childs?.map((child, index) => (
        <RenderSliceItem
          {...props}
          data={child}
          key={child.id ? String(child.id) : `child-${index}`}
        />
      ))}
    </ComponentRenderer>
  );
};

const RenderForm: FC<TProps> = (props) => {
  const { data, valueStream } = props;
  const { isLoading, valueType, Component, propsCpn, dataState } = useRenderItem(data, valueStream);

  const methods = useForm({
    values: dataState,
  });
  const { handleSubmit } = methods;
  const { handleAction } = useActions(props);
  const setFormData = actionHookSliceStore((state) => state.setFormData);
  const formKeys = useMemo(() => data?.componentProps?.formKeys, [data?.componentProps?.formKeys]);

  const onSubmit = (formData: any) => {
    setFormData(formData);
    propsCpn?.onFinish();
  };

  if (!valueType) return <div></div>;
  if (isLoading) return <></>;

  return (
    <FormProvider {...methods}>
      <ComponentRenderer
        Component={Component}
        propsCpn={{
          ...propsCpn,
          onFinish: () => handleSubmit(onSubmit)(),
        }}
        data={data}
      >
        {data?.childs?.map((child, index) => (
          <RenderFormItem
            {...props}
            data={child}
            key={`form-child-${child.id}`}
            formKeys={formKeys}
          />
        ))}
      </ComponentRenderer>
    </FormProvider>
  );
};

const RenderFormItem: FC<TProps> = (props) => {
  const { data, formKeys, valueStream } = props;
  const { isLoading, valueType, Component, propsCpn, dataState } = useRenderItem(data, valueStream);
  const { control } = useFormContext();
  const { isInput } = getComponentType(data?.value || '');

  if (!valueType) return <div></div>;

  if (isInput) {
    const inFormKeys = formKeys?.find((item) => item?.value === data?.name);

    if (inFormKeys) {
      return (
        <Controller
          control={control}
          name={inFormKeys.key}
          render={({ field }) => <Component {...propsCpn} {...field} />}
        />
      );
    }
    return <Component {...propsCpn} />;
  }
  if (!valueType) return <div></div>;
  if (isLoading) return;
  return (
    <ComponentRenderer Component={Component} propsCpn={propsCpn} data={data}>
      {data?.childs?.map((child) => (
        <RenderFormItem {...props} data={child} key={`form-child-${child.id}`} />
      ))}
    </ComponentRenderer>
  );
};

export default RenderSliceItem;
