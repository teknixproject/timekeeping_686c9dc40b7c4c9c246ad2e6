import { TTriggerActions } from './actions';
import { TData } from './dataItem';

interface GridItem {
  _id?: string;
  id: string; // Optional slice ID for identifying slices
  columns?: string; // Number of columns (for grid layout)
  rows?: string; // Number of rows (for grid layout)
  colspan?: string; // Number of columns to span
  rowspan?: string; // Number of rows to span
  gap?: string; // Gap between items (applies to grid layout)
  type: 'grid' | 'flex'; // Determines if the container is grid or flex
  justifyContent?:
    | 'flex-start'
    | 'center'
    | 'flex-end'
    | 'space-between'
    | 'space-around'
    | 'space-evenly'; // Flexbox alignment on the main axis
  alignItems?: 'flex-start' | 'center' | 'flex-end' | 'stretch' | 'baseline'; // Flexbox alignment on the cross axis
  // style?: React.CSSProperties; // Inline styles for the item
  childs?: GridItem[]; // Nested child components
  // style?: {
  //   style_pc: React.CSSProperties;
  //   style_laptop: React.CSSProperties;
  //   style_tablet: React.CSSProperties;
  //   style_mobile: React.CSSProperties;
  // };
  style?: React.CSSProperties;
  dataSlice?: any; // Data to render in the component
  style_pc?: React.CSSProperties;
  style_laptop?: React.CSSProperties;
  style_tablet?: React.CSSProperties;
  style_mobile?: React.CSSProperties;
  value?: string; // Value to render in the component
  valueRender?: ValueRender;
  dynamicGenerate?: TDynamicGenerate;
  state?: DocumentType;
  name?: string;
  action?: any;
  actions?: TTriggerActions;
  collapse?: TCollapse;
  tooltip?: TTooltip;
  dropdown?: TDropdown;
  inputText?: TInputText;
  styledComponentCss?: string;
  props?: any;
  data?: TData;
  componentProps: any;
}
export type TInputText = {
  prefixIcon?: string;
  suffixIcon?: string;
};
export type TDropdown = {
  styleChild: React.CSSProperties;
};
export type TTooltip = {
  title: string;
  style: React.CSSProperties;
};
export type TCollapse = {
  styleChild: React.CSSProperties;
  childs: { value: string }[];
};
export type TDynamicGenerate = {
  variableId: string;
  list: TData;
  maxItems: TData;
  variableName: string;
};
export type TValueFields = {
  total: string;
};
export type TQueryConvert = {
  page?: string;
  limit?: string;
  skip?: string;
};
export interface ValueRender {
  jsonPath?: string;
  valueFields?: TValueFields;
  index?: number;
  allowDynamicGenerate?: boolean;
  apiCall?: {
    id: string;
    name: string;
    url: string;
    method: string;
    body?: any;
    headers?: any;
    queryConvert?: TQueryConvert;
  };
}

interface ContainerConfig {
  page: string; // The name of the page
  container: GridItem; // The root container for the page layout
}

export type { ContainerConfig, GridItem };
