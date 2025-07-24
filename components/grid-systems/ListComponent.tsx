/* eslint-disable @typescript-eslint/no-unused-vars */

import {
    Badge, Button, Card, Checkbox, Collapse, DatePicker, Drawer, Dropdown, DropdownProps, Form,
    Image, Input, InputNumber, List, Modal, Popover, Radio, Select, Statistic, Table, TableProps,
    Tabs, Tag, Typography
} from 'antd';
import GoogleMapReact from 'google-map-react';
import _ from 'lodash';

import { getComponentType } from '@/uitls/component';
import { Bar, Column, Histogram, Line, Liquid, Pie, Radar, Rose, Stock } from '@ant-design/plots';
import { Icon } from '@iconify/react/dist/iconify.js';

import ConfigMenu from './configComponent/ConfigMenu';
import RenderSliceItem from './RenderSliceItem';

export const componentRegistry = {
  button: Button,
  text: Typography.Text,
  link: Typography.Link,
  title: Typography.Title,
  paragraph: Typography.Paragraph,
  image: Image,
  list: List,
  inputtext: Input,
  inputnumber: InputNumber,
  table: Table,
  checkbox: Checkbox,
  radio: Radio,
  select: Select,
  form: Form,
  formitem: Form.Item,
  collapse: Collapse,
  tag: Tag,
  tabs: Tabs,
  dropdown: Dropdown,
  card: Card,
  statistic: Statistic,
  linechart: Line,
  columnchart: Column,
  piechart: Pie,
  barchart: Bar,
  histogramchart: Histogram,
  liquidchart: Liquid,
  radarchart: Radar,
  rosechart: Rose,
  stockchart: Stock,
  menu: ConfigMenu,
  modal: Modal,
  drawer: Drawer,
  datepicker: DatePicker,
  badge: Badge,
  icon: Icon,
  map: GoogleMapReact,
};

const convertIconStringToComponent = (iconString: string) => {
  if (!iconString || typeof iconString !== 'string') {
    return null;
  }

  return <Icon icon={iconString} />;
};

export const convertProps = ({
  initialProps,
  valueType,
}: {
  initialProps: Record<string, any>;
  valueType: string;
}) => {
  if (!initialProps) return {};
  // const value = getData(data?.data, valueStream) || dataState || valueStream;
  const { isInput, isChart, isUseOptionsData } = getComponentType(valueType || '');
  switch (valueType) {
    case 'tabs':
      return {
        ...initialProps,
        items: initialProps?.items?.map((item: any) => {
          return {
            ...item,
            children: <RenderSliceItem data={item.children} />,
          };
        }),
      };

    case 'dropdown':
      return {
        ...initialProps,
        children: <Button>{initialProps?.label || valueType}</Button>,
      } as DropdownProps;
    case 'image':
      return {
        ...initialProps,
      };
    case 'list':
      return {
        ...initialProps,
        renderItem: (item: any) => {
          return (
            <List.Item>
              <RenderSliceItem data={initialProps.box} valueStream={item} />
            </List.Item>
          );
        },
      };
    case 'table':
      const configs: any = _.cloneDeep(initialProps) || {};
      let summary = null;
      if (configs.enableFooter && configs.footerColumns?.length > 0) {
        summary = () => (
          <Table.Summary>
            <Table.Summary.Row>
              {configs.footerColumns?.map((footer: any, index: any) => {
                return (
                  <Table.Summary.Cell
                    key={footer.key || index}
                    index={index}
                    align={footer?.align || 'left'}
                  >
                    <RenderSliceItem data={footer.box} />
                  </Table.Summary.Cell>
                );
              })}
            </Table.Summary.Row>
          </Table.Summary>
        );
      }
      return {
        ...initialProps,
        columns: initialProps?.columns?.map((item: any) => {
          return {
            ...item,
            render: (value: any) => {
              return <RenderSliceItem data={item.box} valueStream={value} key={item.box.id} />;
            },
          };
        }),
        summary,
      } as TableProps;
    case 'modal': {
      return {
        ...initialProps,
      };
    }
    case 'drawer': {
      return { ...initialProps };
    }

    case 'button': {
      const buttonProps = _.cloneDeep(initialProps) || {};

      // Xử lý icon cho Button
      if (buttonProps.iconData && buttonProps.iconData.name) {
        buttonProps.icon = convertIconStringToComponent(buttonProps.iconData.name);
        // Xóa iconData khỏi props vì Button component không cần nó
        delete buttonProps.iconData;
      }

      return {
        ...buttonProps,
      };
    }
    case 'map':
      return {
        ...initialProps,
        children: initialProps.dataSource?.map((item: any) => (
          <Maker key={`${item.lat}-${item.lng}`} lat={item.lat} lng={item.lng} text="My Marker" />
        )),
      };
    default:
      break;
  }
  if (isUseOptionsData) {
    return {
      ...initialProps,
    };
  }
  if (isInput) {
    return {
      ...initialProps,
      // style: { ...getStyleOfDevice(data), ...data?.componentProps?.style },
    };
  }
  if (isChart) {
    return {
      ...initialProps,
      // style: { ...getStyleOfDevice(data), ...data?.componentProps?.style },
    };
  }
  return {
    ...initialProps,
    // style: { ...getStyleOfDevice(data), ...data?.componentProps?.style },
  };
};
export const getName = (id: string) => id.split('$')[0];
const Maker = ({ text, lat, lng }: { text: string; lat: number; lng: number }) => (
  <Popover title={text}>
    <Icon icon={'healthicons:geo-location-outline-24px'} className="text-red-400 fill-cyan-50" />
  </Popover>
);
