import { useRequest } from 'ahooks';
import { fetchSubAgents } from '../services/subAgentService';

export function useSubAgentList() {
  const { data, loading, error, refresh } = useRequest(fetchSubAgents);

  return {
    subAgents: data?.items ?? [],
    loading,
    error: error instanceof Error ? error.message : null,
    refresh,
  };
}
