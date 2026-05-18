import { loadFornaxSdk } from './fornaxSdk';
import { getFornaxAuthOptions } from './fornaxAuth';

// 单例模式加载Fornax Prompt Hub
let cachedHub;

// 获取Fornax Prompt Hub
export async function getFornaxPromptHub() {
  if (cachedHub) {
    return cachedHub;
  }

  const { fornaxPromptHub } = await loadFornaxSdk();

  if (!fornaxPromptHub) {
    return null;
  }

  const auth = getFornaxAuthOptions();
  if (!auth.ak || !auth.sk) {
    return null;
  }

  cachedHub = fornaxPromptHub({
    ak: auth.ak,
    sk: auth.sk,
    region: auth.region,
    serviceMeta: auth.serviceMeta,
  });

  return cachedHub;
}

// 获取Fornax Prompt
export async function getFornaxPrompt({
  key,
  version,
  variables,
  releaseLabel,
  forceRefresh,
}: {
  key: string;
  version?: string;
  variables?: Record<string, unknown>;
  releaseLabel?: string;
  forceRefresh?: boolean;
}) {
  const hub = await getFornaxPromptHub();

  if (!hub) {
    return null;
  }

  const prompt = await hub.get({
    key,
    version: version || undefined,
    releaseLabel: releaseLabel || undefined,
    variables: variables ?? {},
    forceRefresh: Boolean(forceRefresh),
  });

  return prompt ?? null;
}
