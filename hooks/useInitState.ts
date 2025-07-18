/* eslint-disable react-hooks/exhaustive-deps */
import _ from 'lodash';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState } from 'react';

import { useConstructorDataAPI, usePreviewUI } from '@/app/actions/use-constructor';
import { getDeviceType } from '@/lib/utils';
import { apiCallService, stateManagerService } from '@/services';
import { authSettingService } from '@/services/authSetting';
import { customFunctionService } from '@/services/customFunctionService';
import { documentService } from '@/services/document';
import { apiResourceStore, stateManagementStore } from '@/stores';
import { authSettingStore } from '@/stores/authSetting';
import { customFunctionStore } from '@/stores/customFunction';
import { TAuthSetting, TTypeSelect, TTypeSelectState, TVariable, TVariableMap } from '@/types';
import { getMatchingRoutePattern } from '@/uitls/pathname';

type DeviceType = 'mobile' | 'desktop';

interface SearchParams {
  uid: string | null;
  customWidgetName: string | null;
  projectId: string | null;
  sectionName: string | null;
  userId: string | null;
}

// Custom hook for search params
const useSearchParamsData = (): SearchParams => {
  const searchParams = useSearchParams();

  return useMemo(
    () => ({
      uid: searchParams.get('uid'),
      customWidgetName: searchParams.get('customWidgetName'),
      projectId: searchParams.get('projectId'),
      sectionName: searchParams.get('sectionName'),
      userId: searchParams.get('userId'),
    }),
    [searchParams]
  );
};

// Custom hook for device type management
const useDeviceType = () => {
  const [deviceType, setDeviceType] = useState(() => getDeviceType());

  useEffect(() => {
    const handleResize = () => setDeviceType(getDeviceType());
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return deviceType;
};

// Custom hook for layout processing
const useLayoutProcessing = (dataPreviewUI: any, deviceType: string) => {
  return useMemo(() => {
    const getLayoutForDevice = (layout: any): any => {
      if (_.isEmpty(layout)) return {};
      const layoutData = layout?.layoutJson || layout;
      return layoutData?.[deviceType] || {};
    };

    return {
      selectedHeaderLayout: getLayoutForDevice(dataPreviewUI?.headerLayout),
      selectedBodyLayout: getLayoutForDevice(dataPreviewUI?.bodyLayout),
      selectedFooterLayout: getLayoutForDevice(dataPreviewUI?.footerLayout),
    };
  }, [dataPreviewUI, deviceType]);
};

export const useInitStatePreview = () => {
  // Extract search params
  const { uid, customWidgetName, projectId, sectionName, userId } = useSearchParamsData();

  // Store actions
  const { addAndUpdateApiResource } = apiResourceStore();
  const { setStateManagement } = stateManagementStore();
  const setCustomFunctions = customFunctionStore((state) => state.setCustomFunctions);
  const resetAuthSettings = authSettingStore((state) => state.reset);
  const [loading, setLoading] = useState<boolean>(false);

  // Device type management
  const deviceType = useDeviceType();

  // Data fetching
  const { dataPreviewUI, isLoading } = usePreviewUI(projectId ?? '', uid, sectionName, userId);

  // Computed values
  const isPage = useMemo(() => _.get(dataPreviewUI, 'typePreview') === 'page', [dataPreviewUI]);

  const state = useMemo(() => _.get(dataPreviewUI, 'state'), [dataPreviewUI]);

  // Layout processing
  const { selectedHeaderLayout, selectedBodyLayout, selectedFooterLayout } = useLayoutProcessing(
    dataPreviewUI,
    deviceType
  );

  // Optimized API calls with error handling
  const apiCalls = useMemo(() => {
    const effectiveProjectId = projectId || process.env.NEXT_PUBLIC_PROJECT_ID || '';

    const getApiCall = async (): Promise<void> => {
      try {
        const result = await apiCallService.getAll({ projectId: effectiveProjectId });
        addAndUpdateApiResource({ apis: result?.data?.apis });
      } catch (error) {
        console.error('Failed to fetch API calls:', error);
      }
    };

    const getAuthSettings = async (): Promise<void> => {
      if (!projectId) return;
      try {
        const result = await authSettingService.get({ projectId });
        resetAuthSettings(result?.data);
      } catch (error) {
        console.error('Failed to fetch auth settings:', error);
      }
    };

    const getCustomFunctions = async (): Promise<void> => {
      if (!uid) return;
      try {
        const result = await customFunctionService.getAll({
          uid,
          projectId: effectiveProjectId,
        });
        setCustomFunctions(result.data);
      } catch (error) {
        console.error('Failed to fetch custom functions:', error);
      }
    };

    return { getApiCall, getAuthSettings, getCustomFunctions };
  }, [projectId, uid, addAndUpdateApiResource, resetAuthSettings, setCustomFunctions]);

  // State management setup
  const setStateFormDataPreview = useCallback(() => {
    if (_.isEmpty(state)) return;

    const stateTypes: TTypeSelect[] = [
      'appState',
      'globalState',
      'componentState',
      'apiResponse',
      'dynamicGenerate',
    ];

    stateTypes.forEach((type) => {
      if (state[type]) {
        setStateManagement({
          type,
          dataUpdate: state[type],
        });
      }
    });
  }, [state, setStateManagement]);

  // Effect for data initialization
  useEffect(() => {
    if (!uid || !projectId) return;

    const initializeData = async () => {
      try {
        await Promise.allSettled([
          setStateFormDataPreview(),
          apiCalls.getApiCall(),
          apiCalls.getCustomFunctions(),
          apiCalls.getAuthSettings(),
        ]);
      } catch (error) {
        console.error('Failed to initialize data:', error);
      }
    };
    setLoading(true);
    initializeData();
    setLoading(false);
  }, [uid, projectId, setStateFormDataPreview, apiCalls]);

  // Return optimized values
  return {
    // Core data
    isPage,
    customWidgetName,
    deviceType,

    // Layout data
    selectedHeaderLayout,
    selectedBodyLayout,
    selectedFooterLayout,

    // Loading state
    isLoading: isLoading || loading,

    // Additional computed values for potential use
    hasValidParams: !!(uid && projectId),
    state,
  };
};
//#region State Render
const projectId = process.env.NEXT_PUBLIC_PROJECT_ID;
export const useInitStateRender = () => {
  const pathname = usePathname(); // /detail/123
  const [uid, setUid] = useState<string | null>(null);
  useEffect(() => {
    async function fetchData() {
      const result = await documentService.getAllPageNames(projectId || '');
      const uids = result?.data?.map((item: any) => item.uid) || [];

      const matched = getMatchingRoutePattern(pathname, uids);
      setUid(matched);
    }
    fetchData();
  }, [pathname]);

  const addAndUpdateApiResource = apiResourceStore((state) => state.addAndUpdateApiResource);
  const { setStateManagement, findVariable } = stateManagementStore();
  const resetAuthSettings = authSettingStore((state) => state.reset);

  const router = useRouter();

  const setCustomFunctions = customFunctionStore((state) => state.setCustomFunctions);
  const { enable, pages, entryPage } = authSettingStore();
  const { bodyLayout, isLoading } = useConstructorDataAPI(uid || '');
  const [loading, setLoading] = useState<boolean>(false);

  const [deviceType, setDeviceType] = useState<DeviceType>(getDeviceType());
  const selectedBodyLayout = bodyLayout[deviceType] ?? bodyLayout ?? {};

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const handleResize = () => {
      setDeviceType(getDeviceType());
    };
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const getStates = async () => {
    const list: TTypeSelectState[] = [
      'parameters',
      'appState',
      'componentState',
      'globalState',
      'apiResponse',
      'dynamicGenerate',
    ];
    try {
      await Promise.all(
        list.map(async (type: TTypeSelectState) => {
          const result = await stateManagerService.getData(
            type === 'globalState'
              ? {
                  projectId: projectId || process.env.NEXT_PUBLIC_PROJECT_ID || '',
                  type,
                }
              : {
                  uid: uid ?? '/',
                  projectId: projectId || process.env.NEXT_PUBLIC_PROJECT_ID || '',
                  type,
                }
          );
          if (_.isEmpty(result?.data)) return;
          const { state } = result?.data;
          if (_.isEmpty(state)) return;

          if (state) {
            setStateManagement({
              type,
              dataUpdate: state.reduce((acc: TVariableMap, item: TVariable) => {
                return {
                  ...acc,
                  [item.id]: item,
                };
              }, {}),
            });
          }
        })
      );
    } catch (error) {
      console.log('🚀 ~ getStates ~ error:', error);
    }
  };

  const getApiCall = async () => {
    try {
      const result = await apiCallService.getAll({
        projectId: projectId || process.env.NEXT_PUBLIC_PROJECT_ID || '',
      });
      addAndUpdateApiResource({ apis: result?.data?.apis });
    } catch (error) {
      console.log('🚀 ~ getApiCall ~ error:', error);
    }
  };
  const getCustomFunctions = async () => {
    try {
      const result = await customFunctionService.getAll({
        uid: uid || '',
        projectId: projectId || process.env.NEXT_PUBLIC_PROJECT_ID || '',
      });
      setCustomFunctions(result.data);
    } catch (error) {
      console.log('🚀 ~ getCustomFunctions ~ error:', error);
    }
  };
  const getAuthSettings = async () => {
    try {
      const result = await authSettingService.get({ projectId });
      resetAuthSettings(result?.data);
    } catch (error) {
      console.log('🚀 ~ getAuthSettings ~ error:', error);
    }
  };
  useEffect(() => {
    if (enable) {
      const pageRole = pages.find(
        (item: TAuthSetting['pages'][number]) => item.documentId.uid === pathname
      );
      if (pageRole?.required) {
        const roles = pageRole?.roles?.map((item) => item.value);
        const role = localStorage.getItem('role') || localStorage.getItem('ROLE') || '';
        const check = () => {
          return roles?.includes(role);
        };
        const checkRole = check();

        if (!checkRole) {
          if (entryPage) {
            router.push(entryPage);
          }
        }
      }
    }
  }, [enable, findVariable, entryPage, pages, pathname, router]);
  useEffect(() => {
    if (!projectId) return;
    setLoading(true);
    async function fetchData() {
      await Promise.all([getStates(), getApiCall(), getCustomFunctions(), getAuthSettings()]);
    }
    fetchData();
    setLoading(false);
  }, [uid, projectId]);

  return {
    isLoading: isLoading || loading,
    selectedBodyLayout,
    deviceType,
  };
};
