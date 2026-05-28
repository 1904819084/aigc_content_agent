import { getFornaxAuthOptions } from './fornaxAuth';
import { loadFornaxSdk } from './fornaxSdk';

let cachedHub: unknown = null;

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

  cachedHub = (fornaxPromptHub as (options: Record<string, unknown>) => unknown)({
    ak: auth.ak,
    sk: auth.sk,
    region: auth.region,
    serviceMeta: auth.serviceMeta,
  });

  return cachedHub;
}

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

  const prompt = await (hub as { get: (params: Record<string, unknown>) => Promise<unknown> }).get({
    key,
    version: version || undefined,
    releaseLabel: releaseLabel || undefined,
    variables: variables ?? {},
    forceRefresh: Boolean(forceRefresh),
  });

  return prompt ?? null;
}
