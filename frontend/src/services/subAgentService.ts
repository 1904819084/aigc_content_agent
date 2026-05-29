import { request } from './httpService';
import type { SubAgentDetail, SubAgentMeta } from '../types';

export async function fetchSubAgents() {
  return request<{ items: SubAgentMeta[] }>('/api/subagents');
}

export async function fetchSubAgentDetail(name: string) {
  return request<SubAgentDetail>(`/api/subagents/${name}`);
}
