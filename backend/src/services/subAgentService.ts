import { Injectable } from '@gulux/gulux';
import {
  findSubAgentByName,
  SUB_AGENT_REGISTRY,
  type SubAgentDetail,
  type SubAgentMeta,
  type SubAgentModelConfig,
} from '@aigc/shared';
import { getFornaxPrompt } from '../agents/fornax/promptHub';
import { AppError } from '../utils/appError';

interface FornaxRawPrompt {
  version?: string;
  prompt_text?: {
    system_prompt?: { content?: string };
    message_list?: Array<{ content?: string }>;
  };
  model_config?: {
    name?: string;
    max_tokens?: number;
    temperature?: number;
    top_p?: number;
    thinking?: {
      enabled?: boolean;
      thinking_option?: number;
    };
  };
}

interface FornaxPromptShape {
  system?: string;
  user?: string;
  rawPrompt?: FornaxRawPrompt;
}

function extractUserPrompt(raw: FornaxRawPrompt | undefined, fallback: string | undefined): string {
  // 用户提示词从 message_list[0].content 取，user_prompt 字段已废弃
  const fromMessageList = raw?.prompt_text?.message_list?.[0]?.content;
  if (typeof fromMessageList === 'string' && fromMessageList.length > 0) {
    return fromMessageList;
  }
  return fallback ?? '';
}

function extractModelConfig(raw: FornaxRawPrompt | undefined): SubAgentModelConfig | null {
  const cfg = raw?.model_config;
  if (!cfg) return null;
  return {
    name: cfg.name ?? null,
    maxTokens: cfg.max_tokens ?? null,
    temperature: cfg.temperature ?? null,
    topP: cfg.top_p ?? null,
    thinking: cfg.thinking
      ? {
          enabled: Boolean(cfg.thinking.enabled),
          option: cfg.thinking.thinking_option ?? null,
        }
      : null,
  };
}

@Injectable()
export default class SubAgentService {
  public listSubAgents(): SubAgentMeta[] {
    return SUB_AGENT_REGISTRY;
  }

  public async getSubAgentDetail(name: string): Promise<SubAgentDetail> {
    const meta = findSubAgentByName(name);
    if (!meta) {
      throw new AppError('sub_agent_not_found', 404);
    }

    try {
      // 不传 variables：仅用于预览，不希望渲染占位符
      const prompt = (await getFornaxPrompt({
        key: meta.promptKey,
      })) as FornaxPromptShape | null;

      if (!prompt) {
        return {
          ...meta,
          prompt: null,
          error: 'fornax_unavailable',
        };
      }

      return {
        ...meta,
        prompt: {
          system: prompt.system ?? '',
          user: extractUserPrompt(prompt.rawPrompt, prompt.user),
          version: prompt.rawPrompt?.version ?? null,
          modelConfig: extractModelConfig(prompt.rawPrompt),
          raw: prompt.rawPrompt ?? null,
        },
        error: null,
      };
    } catch (error) {
      return {
        ...meta,
        prompt: null,
        error: error instanceof Error ? error.message : 'fornax_fetch_failed',
      };
    }
  }
}
