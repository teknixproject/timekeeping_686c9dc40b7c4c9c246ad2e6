import {
  CardProps,
  CollapseProps,
  DropdownProps,
  ImageProps,
  SelectProps,
  TableProps,
  TabsProps,
} from 'antd';
import { CheckboxGroupProps } from 'antd/es/checkbox';
import { LinkProps } from 'antd/es/typography/Link';
import { CSSProperties } from 'react';

// ========== CONSTANT ========== //
export const DEFAULT_COLOR_CHART = '#';
export const DEFAULT_X_FIELD = 'year';
export const DEFAULT_Y_FIELD = 'value';
const DEFAULT_OPTION_TYPE = 'default';

// ========== DEFAULT VALUE ========== //

export const defaultDataChart = [
  { year: '1991', value: 8 },
  { year: '1992', value: 9 },
  { year: '1993', value: 9.1 },
  { year: '1994', value: 9.3 },
  { year: '1995', value: 12 },
  { year: '1996', value: 12.9 },
  { year: '1997', value: 12.9 },
];

export const defaultDataPieChart = [
  { type: 'A1', value: 27 },
  { type: 'A2', value: 25 },
  { type: 'A3', value: 18 },
  { type: 'A4', value: 15 },
  { type: 'A5', value: 10 },
  { type: 'A6', value: 5 },
];

const defaulConfigChart = {
  data: defaultDataChart,
  xField: DEFAULT_X_FIELD,
  yField: DEFAULT_Y_FIELD,
  title: 'Title chart',
};

export const defaultRadioOptions: CheckboxGroupProps<string>['options'] = [
  { label: 'Apple', value: 'Apple' },
  { label: 'Pear', value: 'Pear' },
  { label: 'Orange', value: 'Orange' },
];

export const defaultBaseProp = ({ value, isRoot }: { value: string; isRoot?: boolean }) => {
  const valueType = value?.toLowerCase();

  switch (valueType) {
    case 'text':
      return {
        children: 'Text',
      };
    case 'paragraph':
      return {
        children: 'Paragraph',
      };
    case 'title':
      return {
        children: 'Title',
      };
    case 'tag':
      return {
        color: 'default',
        bordered: true,
      };
    case 'inputtext':
      return {};
    case 'inputnumber':
      return {};
    case 'select':
      return {
        options: [
          {
            value: 'jack',
            label: 'Jack',
          },
          {
            value: 'lucy',
            label: 'Lucy',
          },
          {
            value: 'tom',
            label: 'Tom',
          },
        ],
        size: 'middle',
        placeholder: 'Select a value',
      } as SelectProps;
    case 'radio':
      return {
        options: defaultRadioOptions,
        size: 'middle',
        optionType: DEFAULT_OPTION_TYPE,
      };
    case 'checkbox':
      return {
        options: [
          { label: 'Apple', value: 'Apple' },
          { label: 'Pear', value: 'Pear' },
          { label: 'Orange', value: 'Orange' },
        ],
      } as CheckboxGroupProps;
    case 'collapse':
      return {
        items: [
          { key: '1', label: 'Content 1', children: 'Content 1' },
          { key: '2', label: 'Content 2', children: 'Content 2' },
        ],
      } as CollapseProps;
    case 'tabs':
      return {
        items: [
          {
            key: '1',
            label: 'Tab 1',
            children: 'Content of Tab Pane 1',
          },
          {
            key: '2',
            label: 'Tab 2',
            children: 'Content of Tab Pane 2',
          },
        ],
      } as TabsProps;

    case 'dropdown':
      return {
        menu: {
          items: [
            {
              key: '1',
              label: '1st menu item',
            },
            {
              key: '2',
              label: '2nd menu item',
            },
          ],
        },
        children: 'Dropdown',
        trigger: ['click'],
        autoAdjustOverflow: true,
        placement: 'bottom',
      } as DropdownProps;
    case 'card':
      return {
        title: 'Card title',
        children: 'Card content',
      } as CardProps;

    case 'table':
      return {
        dataSource: [
          {
            key: '1',
            name: 'Mike',
            age: 32,
            address: '10 Downing Street',
          },
          {
            key: '2',
            name: 'Mike',
            age: 32,
            address: '10 Downing Street',
          },
          {
            key: '3',
            name: 'Mike',
            age: 32,
            address: '10 Downing Street',
          },
        ],
        columns: [
          { title: 'Name', dataIndex: 'name', key: 'name' },
          { title: 'Age', dataIndex: 'age', key: 'age' },
          { title: 'Address', dataIndex: 'address', key: 'address' },
        ],
      } as TableProps;

    case 'statistic':
      return {
        value: 100,
      };
    case 'list':
      return {
        dataSource: [
          'Racing car sprays burning fuel into crowd.',
          'Racing car sprays burning fuel into crowd.',
        ],
      };
    case 'image':
      return {
        preview: false,
        width: 200,
        height: 200,
        src: 'https://dynamic-media-cdn.tripadvisor.com/media/photo-o/16/6f/92/60/photo0jpg.jpg?w=500&h=500&s=1',
      } as ImageProps;
    case 'link':
      return {
        href: 'https://example.com',
        children: 'Link',
      } as LinkProps;
    case 'linechart':
      return {
        ...defaulConfigChart,
        style: {
          lineWidth: 2,
          stroke: '#2389ff',
        },
        area: {
          style: {
            fill: 'transparent',
          },
        },
      };
    case 'liquidchart':
      return { percent: 0.3 };
    case 'stockchart':
      return {
        data: [
          {
            time: '2015-11-19',
            start: 8.18,
            max: 8.33,
            min: 7.98,
            end: 8.32,
            volumn: 1810,
            money: 14723.56,
          },
          {
            time: '2015-11-18',
            start: 8.37,
            max: 8.6,
            min: 8.03,
            end: 8.09,
            volumn: 2790.37,
            money: 23309.19,
          },
          {
            time: '2015-11-17',
            start: 8.7,
            max: 8.78,
            min: 8.32,
            end: 8.37,
            volumn: 3729.04,
            money: 31709.71,
          },
          {
            time: '2015-11-16',
            start: 8.18,
            max: 8.69,
            min: 8.05,
            end: 8.62,
            volumn: 3095.44,
            money: 26100.69,
          },
        ],
        xField: 'time',
        yField: ['start', 'end', 'min', 'max'],
      };
    case 'columnchart':
      return {
        ...defaulConfigChart,
        style: {
          fill: '#2389ff',
        },
        title: 'Title chart',
      };
    case 'barchart':
      return defaulConfigChart;
    case 'piechart':
      return {
        data: defaultDataPieChart,
        angleField: 'value',
        colorField: 'type',
        title: 'Title chart',
        label: {
          text: 'value',
        },
      };
    case 'histogramchart':
      return defaulConfigChart;
    case 'radarchart':
      return defaulConfigChart;
    case 'rosechart':
      return defaulConfigChart;
    // case "stockchart":
    // 	return defaulConfigChart;
    case 'flex':
      return {
        style: {
          ...defaultStyle.flex,
        },
      };
    case 'grid':
      return {
        style: {
          ...defaultStyle.grid,
        },
      };
  }

  if (isRoot) {
    return {
      style: {
        overflow: 'auto',
      },
      children: 'Root',
    };
  }

  return {};
};
const styleBase: CSSProperties = {
  display: 'block',
  paddingTop: '10px',
  paddingRight: '10px',
  paddingBottom: '10px',
  paddingLeft: '10px',
  width: '100%',
  // height: "100%",
};

export const defaultStyle: { [key: string]: CSSProperties } = {
  flex: { ...styleBase, display: 'flex', gap: '5px' },
  grid: { ...styleBase, display: 'grid', gap: '5px' },
};
