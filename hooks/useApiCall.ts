import { apiResourceStore } from '@/stores';
import { TApiCallValue, TypeApiCall } from '@/types';
import { getEntireApiCall } from '@/uitls/apiCall';

export const useApiCall = () => {
  const { findApiResourceValue } = apiResourceStore((state) => state);

  const getApiMember = (apiId: string) => {
    const apiCall = findApiResourceValue(apiId) as TApiCallValue;
    const apiCallMember = (apiCall: TApiCallValue) => {
      if (apiCall?.type !== TypeApiCall.MEMBER) return apiCall;
      const group: TApiCallValue | undefined = findApiResourceValue(apiCall?.groupId ?? '');
      if (!group) return apiCall;

      const apiCallEntire = getEntireApiCall({
        apiCall,
        group,
      });
      return apiCallEntire;
    };

    return apiCallMember(apiCall);
  };
  return { getApiMember };
};
