import { TApiCallValue } from '@/types';

export const getEntireApiCall = ({
  apiCall,
  group,
}: {
  apiCall: TApiCallValue;
  group: TApiCallValue;
}) => {
  if (apiCall?.groupId !== group?.apiId) {
    return apiCall;
  }

  const headers = { ...group?.headers, ...apiCall?.headers };
  const variables = [...(group?.variables || []), ...(apiCall?.variables || [])];
  const url = (group?.baseUrl || '') + apiCall?.url;

  const data: TApiCallValue = { ...apiCall, headers, variables, url };
  return data;
};
