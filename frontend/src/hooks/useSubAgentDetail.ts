import { useRequest } from 'ahooks';
import { fetchSubAgentDetail } from '../services/subAgentService';

export function useSubAgentDetail(name: string | undefined) {
  const { data, loading, error } = useRequest(
    () => {
      if (!name) {
        return Promise.reject(new Error('sub_agent_name_required'));
      }
      return fetchSubAgentDetail(name);
    },
    {
      ready: Boolean(name),
      refreshDeps: [name],
    },
  );

  return {
    detail: data,
    loading,
    error: error instanceof Error ? error.message : null,
  };
}
