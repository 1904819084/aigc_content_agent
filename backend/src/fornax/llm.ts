import { loadFornaxSdk } from './fornaxSdk';
import { getFornaxAuthOptions } from './fornaxAuth';
import { stripMarkdownCodeFence } from '../utils/agentOutput';
import { sanitizeHttpUrl } from '../utils/url';

//  标准化图片/视频生成模型返回的结果
function normalizeMessageParts(parts: unknown) {
  if (!Array.isArray(parts)) {
    return '';
  }

  return parts
    .map((part) => {
      if (!part || typeof part !== 'object') {
        return '';
      }

      const record = part as {
        type?: unknown;
        text?: unknown;
        image_url?: { url?: unknown };
        video_url?: { url?: unknown };
      };

      if (record.type === 'text' && typeof record.text === 'string') {
        return record.text;
      }

      if (record.type === 'image_url' && typeof record.image_url?.url === 'string') {
        return sanitizeHttpUrl(record.image_url.url);
      }

      if (record.type === 'video_url' && typeof record.video_url?.url === 'string') {
        return sanitizeHttpUrl(record.video_url.url);
      }

      return '';
    })
    .join('');
}

// 标准化文本模型返回的结果
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
    const content = firstMessage.content.trim();
    if (content) {
      return stripMarkdownCodeFence(content);
    }
  }

  const normalizedPartsText = normalizeMessageParts(firstMessage?.parts);
  if (normalizedPartsText) {
    return stripMarkdownCodeFence(normalizedPartsText);
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
