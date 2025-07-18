'use client';

import _ from 'lodash';
import { useEffect, useState } from 'react';
import { Icon } from '@iconify/react/dist/iconify.js';

import { useActions } from '@/hooks/useActions';

import { RenderSlice } from '../grid-systems';

interface TabsProps {
  id: string;
  data?: any;
  childs?: any[];
  menuClassDropdow?: any;
}

const Tabs = ({ id, data = {}, childs = [] }: TabsProps) => {
  const [activeTab, setActiveTab] = useState<string>();

  const tabs = _.get(data, 'dataSlice.tabs');
  const { handleAction } = useActions();
  const handleActiveTab = (id: string) => {
    setActiveTab(id);
    handleAction('onClick');
  };

  useEffect(() => {
    if (!activeTab && !_.isElement(tabs)) {
      setActiveTab(tabs[0]?.id);
    }
  }, [activeTab, tabs]);

  return (
    <div style={{ width: '100%' }}>
      {/* Tab headers */}
      <TabHeader tabs={tabs} activeTab={activeTab} handleActiveTab={handleActiveTab} />

      {/* Tab content */}
      <div style={{ padding: '10px' }}>
        {childs.map((child: any, index: any) => {
          if (child?.id === activeTab) {
            return <RenderSlice key={index} slice={child} idParent={id} />;
          }
        })}
      </div>
    </div>
  );
};

const TabHeader = ({
  tabs,
  activeTab,
  handleActiveTab,
}: {
  tabs: any;
  activeTab: string | undefined;
  handleActiveTab: any;
}) => {
  return (
    <div
      style={{
        display: 'flex',
      }}
    >
      {tabs.map((tab: any, index: number) => (
        <div
          className="relative group"
          key={tab.id}
          style={{ display: 'flex', alignItems: 'center' }}
        >
          <button
            type="button"
            onClick={() => {
              if (tab?.id) handleActiveTab(tab?.id);
            }}
            style={{
              padding: '10px 20px',
              cursor: 'pointer',
              borderBottom: activeTab === tab.id ? '2px solid #3b82f6' : '2px solid transparent',
              borderRadius: '5px 5px 0 0',
              marginRight: '5px',
              transition: 'all 0.3s',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            {renderTabIcon(tab.icon)}
            <span style={{ transition: 'transform 0.5s' }}>{tab.label || `Tab ${index + 1}`}</span>
          </button>
        </div>
      ))}
    </div>
  );
};

const renderTabIcon = (iconInfo: any) => {
  if (!iconInfo || !iconInfo.name) return null;
  return <Icon icon={iconInfo.name} width={16} height={16} className="mr-2" />;
};

export default Tabs;
