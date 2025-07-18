'use client';

import _ from 'lodash';

import { useEffect, useState, useRef } from 'react';
import { Icon } from '@iconify/react/dist/iconify.js';
import Link from 'next/link';

interface NavigationProps {
  data?: any;
  styleDevice?: string;
  pathname?: string;
}

const Navigation = ({ data, styleDevice, pathname }: NavigationProps) => {
  const [navigationData, setNavigationData] = useState(
    _.get(data, 'dataSlice.navigation') || { layout: 'horizontal' }
  );
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  const [activeId, setActiveId] = useState<string | undefined>();

  const navigationRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!_.isEmpty(data?.dataSlice?.navigation)) {
      setNavigationData({
        ...data?.dataSlice.navigation,
        layout: data?.dataSlice.navigation.layout || 'horizontal',
      });
    }
  }, [data?.dataSlice]);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(styleDevice === 'mobile');
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, [styleDevice]);

  useEffect(() => {
    setActiveId(pathname);
  }, [pathname]);

  // Effect để xử lý click outside
  useEffect(() => {
    const handleClickOutside = (event: Event) => {
      if (navigationRef.current && !navigationRef.current.contains(event.target as Node)) {
        setActiveDropdown(null);
        setIsMobileMenuOpen(false);
      }
    };

    // Chỉ thêm event listener khi có dropdown active hoặc mobile menu open
    if (activeDropdown || isMobileMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
    }

    // Cleanup
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [activeDropdown, isMobileMenuOpen]);

  // Effect để xử lý ESC key
  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setActiveDropdown(null);
        setIsMobileMenuOpen(false);
      }
    };

    if (activeDropdown || isMobileMenuOpen) {
      document.addEventListener('keydown', handleEscKey);
    }

    return () => {
      document.removeEventListener('keydown', handleEscKey);
    };
  }, [activeDropdown, isMobileMenuOpen]);

  const handleDropdownToggle = (menuId: string) => {
    setActiveDropdown(activeDropdown === menuId ? null : menuId);
  };

  const handleMobileMenuToggle = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const renderLogo = () => {
    if (!navigationData.logo) return null;

    const logoContent =
      navigationData.logo.type === 'image' ? (
        <img
          src={navigationData.logo.content}
          alt="Logo"
          className="object-contain"
          style={{
            width: navigationData.logo.width || 'auto',
            height: navigationData.logo.height || '40px',
          }}
        />
      ) : (
        <span
          className="font-bold"
          style={{
            fontSize: navigationData.menuStyle?.fontSize || '18px',
            color: navigationData.menuStyle?.color || '#333',
          }}
        >
          {navigationData.logo.content}
        </span>
      );

    return navigationData.logo.href ? (
      <Link href={navigationData.logo.href} className="no-underline">
        {logoContent}
      </Link>
    ) : (
      logoContent
    );
  };

  const renderMenuItem = (item: any) => {
    const hasChildren = item.children && item.children.length > 0;
    const isDropdownActive = activeDropdown === item.id;
    const isVertical = navigationData?.layout === 'vertical';

    const isActive = item?.href === activeId || _.find(item?.children, (i) => i?.href === activeId);

    return (
      <li
        key={item.id}
        className="relative"
        onClick={() => setActiveId(item.id)}
        style={{
          color: `${navigationData?.activeStyle?.hoverColor} !important`,
          background: isActive ? navigationData?.activeStyle?.backgroundColor : '',
          borderRadius: navigationData?.menuStyle?.borderRadius,
        }}
      >
        <Link
          prefetch={true}
          href={hasChildren ? '' : item.href || ''}
          target={item.target || '_self'}
          onClick={
            hasChildren
              ? (e) => {
                  e.preventDefault();
                  e.stopPropagation(); // Ngăn event bubble up
                  handleDropdownToggle(item.id);
                }
              : () => {
                  // Đóng dropdown khi click vào link
                  setActiveDropdown(null);
                }
          }
          className={`flex ${
            item.iconOrientation === 'vertical' ? 'flex-col' : 'flex-row'
          } items-center gap-2 px-4 py-2 no-underline cursor-pointer transition-colors duration-300`}
          style={{
            color: isActive ? navigationData?.activeStyle?.color : navigationData?.menuStyle?.color,
            fontSize: navigationData?.menuStyle?.fontSize || '16px',
            fontWeight: navigationData?.menuStyle?.fontWeight || '500',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = isActive
              ? navigationData?.activeStyle?.hoverColor
              : navigationData?.menuStyle?.hoverColor;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = isActive
              ? navigationData?.activeStyle?.color
              : navigationData?.menuStyle?.color;
          }}
        >
          {item.icon && item.iconPosition === 'before' && (
            <Icon icon={item.icon} width={20} height={20} />
          )}
          <span>{item.label}</span>
          {item.icon && item.iconPosition === 'after' && (
            <Icon icon={item.icon} width={20} height={20} />
          )}
          {hasChildren && (
            <span
              className={`transition-transform duration-300 ${
                isDropdownActive ? 'rotate-180' : 'rotate-0'
              }`}
            >
              {isVertical ? '▶' : '▼'}
            </span>
          )}
        </Link>

        {/* Dropdown Menu */}
        {hasChildren && isDropdownActive && (
          <ul
            className={`${
              isVertical ? 'absolute left-full top-0 ml-1' : 'absolute mt-1 top-full left-0'
            } rounded-lg border border-gray-200 list-none p-2 z-[1000]`}
            style={{
              backgroundColor: navigationData?.dropdownStyle?.backgroundColor || '#ffffff',
              borderRadius: navigationData?.dropdownStyle?.borderRadius,
              boxShadow: navigationData?.dropdownStyle?.boxShadow,
              minWidth: navigationData?.dropdownStyle?.minWidth || '200px',
            }}
            // Ngăn click vào dropdown đóng menu
            onClick={(e) => e.stopPropagation()}
          >
            {item.children?.map((subItem: any) => (
              <li key={subItem.id} onClick={() => setActiveId(subItem.id)}>
                <a
                  href={subItem.href || '#'}
                  target={subItem.target || '_self'}
                  className={`flex ${
                    subItem.iconOrientation === 'vertical' ? 'flex-col' : 'flex-row'
                  } items-center gap-2 px-4 py-2 text-sm no-underline hover:bg-gray-100 transition-all duration-300`}
                  style={{
                    color: isActive
                      ? navigationData?.activeStyle?.color
                      : navigationData?.menuStyle?.color,
                    fontSize: navigationData?.menuStyle?.fontSize || '16px',
                    fontWeight: navigationData?.menuStyle?.fontWeight || '500',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = isActive
                      ? navigationData?.activeStyle?.hoverColor
                      : navigationData?.menuStyle?.hoverColor;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = isActive
                      ? navigationData?.activeStyle?.color
                      : navigationData?.menuStyle?.color;
                  }}
                  onClick={() => {
                    // Đóng dropdown khi click vào sub-item
                    setActiveDropdown(null);
                  }}
                >
                  {subItem?.icon && subItem?.iconPosition === 'before' && (
                    <Icon icon={subItem.icon} width={16} height={16} />
                  )}
                  <span>{subItem?.label}</span>
                  {subItem?.icon && subItem?.iconPosition === 'after' && (
                    <Icon icon={subItem?.icon} width={16} height={16} />
                  )}
                </a>
              </li>
            ))}
          </ul>
        )}
      </li>
    );
  };

  const renderMobileMenu = () => {
    if (!isMobileMenuOpen) return null;

    return (
      <div
        className={`${
          navigationData.layout === 'vertical'
            ? 'fixed top-0 left-0 h-full w-64 p-4 z-[999]'
            : 'absolute top-full left-0 right-0 p-4 z-[999]'
        }`}
        style={{
          backgroundColor: navigationData.style?.backgroundColor || '#ffffff',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        }}
        // Ngăn click vào mobile menu đóng menu
        onClick={(e) => e.stopPropagation()}
      >
        <button
          className="absolute top-4 right-4 text-2xl cursor-pointer bg-transparent border-none"
          onClick={handleMobileMenuToggle}
          style={{
            color: navigationData.menuStyle?.color || '#333',
          }}
        >
          {navigationData.mobileMenuIcon?.closeIcon || '✕'}
        </button>
        <div className="mt-10">
          <div className="logo mb-4">{renderLogo()}</div>
          <ul className="list-none p-0 m-0">
            {navigationData.menuItems?.map((item: any) => (
              <li key={item.id} className="mb-2">
                <a
                  href={item.href || '#'}
                  target={item.target || '_self'}
                  className={`flex ${
                    item.iconOrientation === 'vertical' ? 'flex-col' : 'flex-row'
                  } items-center gap-2 py-3 border-b border-gray-200 no-underline`}
                  style={{
                    color: navigationData.menuStyle?.color || '#333',
                    fontSize: navigationData.menuStyle?.fontSize || '16px',
                  }}
                  onClick={() => {
                    // Đóng mobile menu khi click vào link
                    setIsMobileMenuOpen(false);
                  }}
                >
                  {item.icon && item.iconPosition === 'before' && (
                    <Icon icon={item.icon} width={20} height={20} />
                  )}
                  <span>{item.label}</span>
                  {item.icon && item.iconPosition === 'after' && (
                    <Icon icon={item.icon} width={20} height={20} />
                  )}
                </a>
                {item.children && item.children.length > 0 && (
                  <ul className="list-none pl-4 mt-2">
                    {item.children.map((subItem: any) => (
                      <li key={subItem.id}>
                        <a
                          href={subItem.href || '#'}
                          target={subItem.target || '_self'}
                          className={`flex ${
                            subItem.iconOrientation === 'vertical' ? 'flex-col' : 'flex-row'
                          } items-center gap-2 py-2 text-sm no-underline`}
                          style={{
                            color: navigationData.menuStyle?.color || '#666',
                          }}
                          onClick={() => {
                            // Đóng mobile menu khi click vào sub-item
                            setIsMobileMenuOpen(false);
                          }}
                        >
                          {subItem.icon && subItem.iconPosition === 'before' && (
                            <Icon icon={subItem.icon} width={16} height={16} />
                          )}
                          <span>{subItem.label}</span>
                          {subItem.icon && subItem.iconPosition === 'after' && (
                            <Icon icon={subItem.icon} width={16} height={16} />
                          )}
                        </a>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
          </ul>
        </div>
      </div>
    );
  };

  if (_.isEmpty(navigationData) || !navigationData.menuItems) {
    return (
      <div className="flex items-center justify-center h-16 bg-gray-100">
        <p className="text-gray-500">No navigation data available</p>
      </div>
    );
  }

  const isVertical = navigationData.layout === 'vertical';

  return (
    <div className="relative" ref={navigationRef}>
      <nav
        className={`${isVertical ? 'h-full w-fit flex flex-col' : 'w-full'}`}
        style={{
          ...navigationData.style,
          top: isVertical
            ? 0
            : navigationData.style?.position === 'sticky' ||
              navigationData.style?.position === 'fixed'
            ? 0
            : 'auto',
          zIndex: navigationData.style?.zIndex || 1000,
          backgroundColor: navigationData.style?.backgroundColor,
          padding: navigationData.style?.padding,
          borderRadius: navigationData.style?.borderRadius || '0px',
          boxShadow: navigationData.style?.boxShadow,
        }}
      >
        {isVertical ? (
          // Vertical Sidebar Layout
          <div className="flex flex-col h-full p-4">
            <div className="logo">{renderLogo()}</div>
            <ul
              className="list-none m-0 p-0 flex flex-col mt-4"
              style={{
                gap: navigationData.menuStyle?.spacing || '0.5rem',
              }}
            >
              {navigationData.menuItems?.map((item: any) => renderMenuItem(item))}
            </ul>
          </div>
        ) : (
          // Horizontal Top-Bar Layout
          <div className="flex items-center justify-between max-w-6xl mx-auto relative">
            <div className="logo">{renderLogo()}</div>
            <ul
              className="desktop-menu hidden md:flex list-none m-0 p-0 !mb-0"
              style={{
                gap: navigationData.menuStyle?.spacing || '0rem',
                alignItems: 'center',
              }}
            >
              {navigationData.menuItems?.map((item: any) => renderMenuItem(item))}
            </ul>
            <button
              className="md:hidden bg-transparent border-none text-2xl cursor-pointer p-2"
              onClick={handleMobileMenuToggle}
              style={{
                color: navigationData.menuStyle?.color || '#333',
              }}
            >
              {isMobileMenuOpen
                ? navigationData.mobileMenuIcon?.closeIcon || '✕'
                : navigationData.mobileMenuIcon?.openIcon || '☰'}
            </button>
            {renderMobileMenu()}
          </div>
        )}
        {isVertical && isMobile && renderMobileMenu()}
      </nav>
    </div>
  );
};

export default Navigation;
