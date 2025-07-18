import React, { useCallback, useMemo } from 'react';
import { Menu } from 'antd';
import { useRouter, usePathname } from 'next/navigation';
import { Icon } from '@iconify/react/dist/iconify.js';

interface NavigationMenuProps {
    items: any[];
    mode?: 'horizontal' | 'vertical' | 'inline';
    theme?: 'light' | 'dark';
    style?: React.CSSProperties;
    defaultSelectedKeys?: string[];
    defaultOpenKeys?: string[];
    multiple?: boolean;
    selectable?: boolean;
    inlineCollapsed?: boolean;
    inlineIndent?: number;
    triggerSubMenuAction?: 'hover' | 'click';
    forceSubMenuRender?: boolean;
    onSelect?: (param: any) => void;
    onDeselect?: (param: any) => void;
    onOpenChange?: (openKeys: string[]) => void;
}

const convertIconStringToComponent = (iconString: string) => {
    if (!iconString || typeof iconString !== 'string') {
        return null;
    }
    return <Icon icon={iconString} />;
};

const ConfigMenu: React.FC<NavigationMenuProps> = ({
    items,
    mode = 'horizontal',
    theme = 'light',
    style = {},
    defaultSelectedKeys = [],
    defaultOpenKeys = [],
    multiple,
    selectable,
    inlineCollapsed,
    inlineIndent,
    triggerSubMenuAction,
    forceSubMenuRender,
    onSelect,
    onDeselect,
    onOpenChange,
}) => {
    const router = useRouter();
    const pathname = usePathname();

    // Process menu items với icon conversion và clean up invalid props
    const processMenuItems = useCallback((menuItems: any[]): any[] => {
        if (!Array.isArray(menuItems)) return menuItems;

        return menuItems.map((item) => {
            const processedItem = { ...item };

            // Chuyển đổi icon string thành Icon component
            if (processedItem.icon && typeof processedItem.icon === 'string') {
                processedItem.icon = convertIconStringToComponent(processedItem.icon);
            }

            // Xử lý đệ quy cho children
            if (processedItem.children && Array.isArray(processedItem.children)) {
                processedItem.children = processMenuItems(processedItem.children);
            }

            // Đảm bảo có key nếu chưa có
            if (!processedItem.key && processedItem.label) {
                processedItem.key = processedItem.label.toLowerCase().replace(/\s+/g, '-');
            }

            // Clean up invalid DOM attributes - Mở rộng danh sách
            const invalidDomAttributes = [
                'collapsible',
                'collapsed',
                'expandable',
                'expanded',
                'selectable',
                'checkable',
                'checked',
                'loading',
                'ghost',
                'block',
                'danger',
                'size',
                'shape',
                'htmlType',
                'minWidth',
                'maxWidth',
                'resizable',
                'sortable',
                'filterable',
                'width',
                'height',
                'flex',
                'flexDirection',
                'justifyContent',
                'alignItems'
            ];

            invalidDomAttributes.forEach(attr => {
                if (processedItem.hasOwnProperty(attr)) {
                    delete processedItem[attr];
                }
            });

            // Chuyển đổi boolean false thành undefined cho các thuộc tính boolean
            if (processedItem.collapsible === false) {
                processedItem.collapsible = undefined;
            }
            if (processedItem.selectable === false) {
                processedItem.selectable = undefined;
            }
            if (processedItem.disabled === false) {
                processedItem.disabled = undefined;
            }

            return processedItem;
        });
    }, []);

    // Tìm selectedKeys dựa trên pathname
    const getSelectedKeysFromPathname = useCallback((menuItems: any[], currentPath: string): string[] => {
        const selectedKeys: string[] = [];

        const findMatchingKeys = (items: any[], path: string) => {
            for (const item of items) {
                // Kiểm tra nếu item.value khớp với pathname
                if (item.value === path) {
                    selectedKeys.push(item.key);
                    return true;
                }

                // Kiểm tra children nếu có
                if (item.children && Array.isArray(item.children)) {
                    if (findMatchingKeys(item.children, path)) {
                        selectedKeys.push(item.key);
                        return true;
                    }
                }
            }
            return false;
        };

        findMatchingKeys(menuItems, currentPath);
        return selectedKeys;
    }, []);

    // Handle menu click
    const handleMenuClick = useCallback((menuInfo: any) => {
        const { key } = menuInfo;

        // Tìm item trong menu data để lấy value/url
        const findItemByKey = (items: any[], targetKey: string): any => {
            for (const item of items) {
                if (item.key === targetKey) {
                    return item;
                }
                if (item.children && Array.isArray(item.children)) {
                    const found = findItemByKey(item.children, targetKey);
                    if (found) return found;
                }
            }
            return null;
        };

        const menuItem = findItemByKey(items, key);
        if (menuItem?.value) {
            router.push(menuItem.value);
        } else if (key) {
            // Fallback: sử dụng key làm path nếu không có value
            router.push(`/${key}`);
        }
    }, [router, items]);

    // Processed items
    const processedItems = useMemo(() => processMenuItems(items), [items, processMenuItems]);

    // Selected keys dựa trên pathname
    const selectedKeys = useMemo(() => {
        const pathBasedKeys = getSelectedKeysFromPathname(items, pathname);
        return pathBasedKeys.length > 0 ? pathBasedKeys : defaultSelectedKeys;
    }, [items, pathname, defaultSelectedKeys, getSelectedKeysFromPathname]);

    // Menu props với style được cải thiện
    const menuProps = useMemo(() => {
        const props: any = {
            items: processedItems,
            mode,
            theme,
            style: {
                // Đảm bảo menu có đủ không gian
                width: '100%',
                minWidth: mode === 'horizontal' ? '800px' : 'auto',
                // Ngăn menu bị wrap xuống dòng
                whiteSpace: 'nowrap',
                // Đảm bảo overflow được xử lý đúng
                overflow: mode === 'horizontal' ? 'visible' : 'hidden',
                ...style,
            },
            selectedKeys,
            defaultSelectedKeys,
            onClick: handleMenuClick,
            // Tắt chế độ overflow menu nếu cần
            overflowedIndicator: mode === 'horizontal' ? null : undefined,
        };

        // Chỉ thêm các props nếu chúng được định nghĩa và không phải false
        if (defaultOpenKeys.length > 0) props.defaultOpenKeys = defaultOpenKeys;
        if (multiple !== undefined && multiple !== false) props.multiple = multiple;
        if (selectable !== undefined && selectable !== false) props.selectable = selectable;
        if (inlineCollapsed !== undefined && inlineCollapsed !== false) props.inlineCollapsed = inlineCollapsed;
        if (inlineIndent !== undefined) props.inlineIndent = inlineIndent;
        if (triggerSubMenuAction !== undefined) props.triggerSubMenuAction = triggerSubMenuAction;
        if (forceSubMenuRender !== undefined && forceSubMenuRender !== false) props.forceSubMenuRender = forceSubMenuRender;
        if (onSelect) props.onSelect = onSelect;
        if (onDeselect) props.onDeselect = onDeselect;
        if (onOpenChange) props.onOpenChange = onOpenChange;

        return props;
    }, [
        processedItems,
        mode,
        theme,
        style,
        selectedKeys,
        defaultSelectedKeys,
        defaultOpenKeys,
        multiple,
        selectable,
        inlineCollapsed,
        inlineIndent,
        triggerSubMenuAction,
        forceSubMenuRender,
        handleMenuClick,
        onSelect,
        onDeselect,
        onOpenChange,
    ]);

    return <Menu {...menuProps} />;
};

export default ConfigMenu;