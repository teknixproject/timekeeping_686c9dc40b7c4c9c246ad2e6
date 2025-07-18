import { ClassValue, clsx } from 'clsx';
import _ from 'lodash';
import { twMerge } from 'tailwind-merge';

import { BREAKPOINTS } from '@/components/grid-systems/const';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
export function getDeviceType() {
  if (typeof window !== 'undefined') {
    const width = window.innerWidth;
    if (width >= 1024) {
      return 'desktop';
    } else {
      return 'mobile';
    }
  }
  return 'desktop';
}

export function getDeviceSize() {
  if (typeof window !== 'undefined') {
    const width = window.innerWidth;
    const result = _.find(BREAKPOINTS, (b) => width >= b.minWidth && width <= b.maxWidth);
    return result?.style;
  }
  return BREAKPOINTS.laptop.style; // Giá trị mặc định nếu window không tồn tại (SSR)
}

export const defaultStyle: React.CSSProperties = {
  background: '',
  backgroundColor: '',
  paddingBottom: '',
  paddingTop: '',
  paddingLeft: '',
  paddingRight: '',
  marginTop: '',
  marginBottom: '',
  marginRight: '',
  marginLeft: '',
  border: '',
  borderColor: '',
  position: 'initial',
  top: '',
  right: '',
  left: '',
  bottom: '',
};

export const convertStyle = (style: any) => {
  return {
    ...style,
    ...defaultStyle,
  };
};

export const setActive = ({
  isMenu,
  data,
  cleanedPath,
}: {
  data: any;
  isMenu?: boolean;
  cleanedPath?: string | undefined;
}) => {
  if (isMenu) {
    return cleanedPath?.includes(_.get(data, 'action.pageId'));
  }
  return false;
};
