import { loadFornaxSdk } from './fornaxSdk';
import { getFornaxAuthOptions } from './fornaxAuth';
import { stripMarkdownCodeFence } from '../utils/agentOutput';

// 标准化Fornax SDK返回的文本结果
function normalizeTextResult(result: unknown) {
  if (!result) {
    return '';
  }

  if (typeof result === 'string') {
    return stripMarkdownCodeFence(result);
  }

  if (typeof result !== 'object') {
    return '';
  }

  const record = result as { text?: unknown; choices?: unknown };

  if (typeof record.text === 'string') {
    return stripMarkdownCodeFence(record.text);
  }

  const maybeChoices = record.choices;
  const firstChoice = Array.isArray(maybeChoices) ? maybeChoices[0] : null;
  const firstMessage = firstChoice?.message;

  if (typeof firstMessage?.content === 'string') {
    return stripMarkdownCodeFence(firstMessage.content);
  }

  return '';
}

// 执行Fornax模型调用
export async function fornaxExecute({
  promptKey,
  promptVersion,
  variables,
  callOptions,
}: {
  promptKey: string;
  promptVersion?: string;
  variables?: Record<string, unknown>;
  callOptions?: Record<string, unknown>;
}) {
  const { ptaas } = await loadFornaxSdk();
  const auth = getFornaxAuthOptions();

  if (!ptaas) {
    return {
      ok: false,
      error: 'fornax_ptaas_unavailable',
      text: '',
    };
  }

  if (!auth.ak || !auth.sk) {
    return {
      ok: false,
      error: 'fornax_auth_missing',
      text: '',
    };
  }

  try {
    const model = ptaas(promptKey, {
      ak: auth.ak,
      sk: auth.sk,
      region: auth.region,
      serviceMeta: auth.serviceMeta,
      timeout: 60_000,
    });
    const result = await model.invoke({
      messages: [],
      modelConfigs: {
        version: promptVersion,
        variables: variables ?? {},
      },
      callOptions: callOptions ?? {},
    });

    return {
      ok: true,
      error: null,
      text: normalizeTextResult(result),
      raw: result,
    };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : 'fornax_execute_failed',
      text: '',
    };
  }
}
