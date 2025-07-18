/* eslint-disable @typescript-eslint/no-unused-vars */
import dayjs from 'dayjs';
/** @jsxImportSource @emotion/react */
import _ from 'lodash';
import { FC, memo, useMemo } from 'react';
import isEqual from 'react-fast-compare';
import { Controller, FormProvider, useForm, useFormContext } from 'react-hook-form';

import { useActions } from '@/hooks/useActions';
import { useHandleData } from '@/hooks/useHandleData';
import { useHandleProps } from '@/hooks/useHandleProps';
import { stateManagementStore } from '@/stores';
import { GridItem } from '@/types/gridItem';
import { getComponentType } from '@/uitls/component';
import { convertCssObjectToCamelCase, convertToEmotionStyle } from '@/uitls/styleInline';
import { convertDataToProps } from '@/uitls/transfromProp';
import { css } from '@emotion/react';

import { componentRegistry, convertProps } from './ListComponent';
import LoadingPage from './loadingPage';

type TProps = {
  data: GridItem;
  valueStream?: any;
  formKeys?: { key: string; value: string }[];
};

// Custom hook to extract common logic
const useRenderItem = (data: GridItem, valueStream?: any) => {
  const { isForm, isNoChildren, isChart, isDatePicker } = getComponentType(data?.value || '');
  const { findVariable } = stateManagementStore();
  const { getData, dataState } = useHandleData({ dataProp: data?.data });
  console.log('🚀 ~ useRenderItem ~ dataState:', dataState);
  const actionsProp = useMemo(
    () => data?.componentProps?.dataProps || [],
    [data?.componentProps?.dataProps]
  );
  console.log('🚀 ~ useRenderItem ~ actionsProp:', actionsProp);
  const { multiples } = useHandleProps({ actionsProp, valueStream });
  const { handleAction, isLoading } = useActions(data);

  const valueType = useMemo(() => data?.value?.toLowerCase() || '', [data?.value]);

  const Component = useMemo(
    () => (valueType ? _.get(componentRegistry, valueType) || 'div' : 'div'),
    [valueType]
  );

  const propsCpn = useMemo(() => {
    const staticProps = {
      ...convertProps({ data }),
      onClick: () => handleAction('onClick'),
      // onChange: () => handleAction('onChange'),
    };

    const advancedCss = convertToEmotionStyle(staticProps?.styleMultiple);

    // Fix 1: Check if advancedCss is a string (CSS string) or object (CSS object)
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

    staticProps.css = cssMultiple;

    const result = {
      ...staticProps,
      ...multiples,
    };
    if (isDatePicker) {
      if (typeof result.value === 'string') result.value = dayjs(result.value);
      if (typeof result.defaultValue === 'string') result.defaultValue = dayjs(result.defaultValue);
    }
    // if (isNoChildren && 'children' in result) {
    //   delete result.children;
    // }
    if ('styleMultiple' in result) delete result.styleMultiple;
    if ('dataProps' in result) delete result.dataProps;

    return result;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, getData, dataState, valueStream, multiples, handleAction]);

  return {
    isLoading,
    valueType,
    Component,
    propsCpn: convertDataToProps(propsCpn),
    findVariable,
    dataState,
    getData,
  };
};

// Generic component renderer
const ComponentRenderer: FC<{
  Component: any;
  propsCpn: any;
  data: GridItem;
  children?: React.ReactNode;
}> = ({ Component, propsCpn, data, children }) => (
  <Component key={data?.id} {...propsCpn}>
    {!_.isEmpty(data?.childs) ? children : propsCpn.children}
  </Component>
);

const RenderSliceItem: FC<TProps> = (props) => {
  const { data, valueStream } = props;
  const { isLoading, valueType, Component, propsCpn, dataState } = useRenderItem(data, valueStream);
  console.log('🚀 ~ propsCpn:', propsCpn);
  const { isForm, isNoChildren, isChart, isFeebBack } = getComponentType(data?.value || '');
  if (!valueType) return <div></div>;
  if (isLoading) return <LoadingPage />;
  if (isForm) return <RenderForm {...props} />;

  if (isNoChildren || isChart) return <Component key={data?.id} {...propsCpn} />;

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
  const { handleAction } = useActions();
  const formKeys = useMemo(() => data?.componentProps?.formKeys, [data?.componentProps?.formKeys]);

  const onSubmit = (formData: any) => {
    handleAction('onSubmit', data?.actions, formData);
  };
  if (!valueType) return <div></div>;
  if (isLoading) return <LoadingPage />;

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
  const { findVariable } = stateManagementStore();
  // const { getData, dataState } = useHandleData({ dataProp: data?.data });
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

  return (
    <ComponentRenderer Component={Component} propsCpn={propsCpn} data={data}>
      {data?.childs?.map((child) => (
        <RenderFormItem {...props} data={child} key={`form-child-${child.id}`} />
      ))}
      <p className="grow"></p>
    </ComponentRenderer>
  );
};

export default memo(RenderSliceItem, isEqual);
