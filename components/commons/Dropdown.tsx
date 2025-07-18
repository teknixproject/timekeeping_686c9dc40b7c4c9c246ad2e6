/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

import _ from 'lodash';
import { usePathname, useRouter } from 'next/navigation';
import React, { useEffect, useRef, useState } from 'react';

import { useActions } from '@/hooks/useActions';
import { useHandleData } from '@/hooks/useHandleData';
import { cn } from '@/lib/utils';
import { GridItem } from '@/types/gridItem';
import { Icon } from '@iconify/react/dist/iconify.js';

interface DropdownProps {
  id: string;
  style?: any;
  data?: any;
  childs?: any[];
  menuClassDropdow?: any;
}

const Dropdown: React.FC<DropdownProps> = ({
  id,
  style = '',
  data = {},
  childs = [],
  menuClassDropdow,
  ...props
}) => {
  const pathname = usePathname();
  // const cleanedPath = pathname.startsWith('/') ? pathname.slice(1) : pathname;
  const [isOpen, setIsOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  const { dataState } = useHandleData({ dataProp: data?.data });
  const title = _.get(data, 'dataSlice.title') || dataState;
  const router = useRouter();
  const { handleAction } = useActions();
  // Tạo ref để tham chiếu đến phần tử dropdown
  const dropdownRef = useRef<HTMLDivElement>(null);

  const dropdownItems: { label: string; value: string }[] = data?.childs?.map((item: GridItem) => ({
    label: item?.dataSlice?.title,
    value: item?.action?.pageId,
  }));

  const buttonSelectedClass = style?.dropdownStyles?.buttonSelected
    ? style.dropdownStyles.buttonSelected.toString()
    : '';
  const menuClass = style?.dropdownStyles?.menu ? style.dropdownStyles.menu.toString() : '';
  const buttonChildClass = style?.dropdownStyles?.button
    ? style.dropdownStyles.button.toString()
    : '';

  const styleChild: React.CSSProperties = data?.dropdown?.styleChild || {};

  // Lắng nghe sự kiện click bên ngoài dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (!pathname && childs.length > 0) {
      setSelectedItem(childs[0]?.dataSlice?.title || '');
    } else {
      const label =
        dropdownItems?.find((item) => pathname.includes(item.value))?.label ||
        childs[0]?.dataSlice?.title ||
        title;
      setSelectedItem(label);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname, childs]);

  const handleToggle = () => {
    setIsOpen((prev) => !prev);
  };

  const handleItemClick = (item: any) => {
    if (item?.action?.pageId) router.push(`/${item.action.pageId}`);
    setSelectedItem(item?.dataSlice?.title || null);
    setIsOpen(false);
  };

  const renderChild = (child: any) => {
    if (!child || !child.value) return null;

    switch (child.value) {
      case 'button':
        return (
          <button
            onClick={() => handleItemClick(child)}
            className={`cursor-pointer w-full text-left px-4 py-2 rounded-xl  hover:bg-gray-100 transition-colors ${buttonChildClass}`}
          >
            {_.get(child, 'dataSlice.title') || 'Unnamed Button'}
          </button>
        );
      case 'text':
        return (
          <div className={`px-4 py-2  rounded-lg ${buttonChildClass}`}>
            {_.get(child, 'dataSlice.title') || 'Unnamed Text'}
          </div>
        );
      case 'dropdown':
        return (
          <Dropdown
            id={child.id || `${id}-child-${Math.random()}`}
            style={child.style || ''}
            data={child || {}}
            childs={child.childs || []}
            menuClassDropdow={menuClass}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div
      ref={dropdownRef}
      className={cn(`relative inline-block`, menuClassDropdow)}
      onClick={() => handleAction('onClick')}
    >
      <button
        onClick={handleToggle}
        type="button"
        className={`cursor-pointer transition-all flex items-center gap-2 focus:bg-[##ffffff47] ${buttonSelectedClass}`}
        style={style}
      >
        {selectedItem || data?.name || 'Dropdown'}
        <span>
          {isOpen ? (
            <Icon icon="iconamoon:arrow-up-2" width="24" height="24" />
          ) : (
            <Icon icon="iconamoon:arrow-down-2" width="24" height="24" />
          )}
        </span>
      </button>
      {isOpen && (
        <div
          className={cn(
            'absolute left-0 mt-2 z-10 rounded-xl min-w-40 w-fit text-nowrap',
            menuClass,
            {
              'bg-white': !styleChild?.backgroundColor,
              'text-gray-700': !styleChild?.color,
              'p-2':
                !styleChild?.paddingTop &&
                !styleChild?.paddingRight &&
                !styleChild?.paddingBottom &&
                !styleChild?.paddingLeft,
            }
          )}
          style={styleChild}
        >
          {childs.length > 0 ? (
            childs.map((item: any, index: number) => (
              <div key={item?.id || index} className="cursor-pointer">
                {renderChild(item)}
              </div>
            ))
          ) : (
            <div className="px-4 py-2 text-gray-500">No items</div>
          )}
        </div>
      )}
    </div>
  );
};

export default Dropdown;
