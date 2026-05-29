import type { TaskStageName } from './enums';

/**
 * SubAgent 元信息：仅描述 agent 静态属性（名称、对应阶段、所拉取的 prompt key），
 * 不包含 prompt 内容。列表接口返回该结构，详情接口在此基础上附加运行时拉到的 prompt 文本。
 */
export interface SubAgentMeta {
  /** 路由 key，如 'script' / 'storyboard' / 'qaReviewing' */
  name: string;
  /** 展示名称 */
  displayName: string;
  /**
   * 对应任务阶段。一个 SubAgent 通常 1 对 1 对应一个 stage；
   * QA Agent 一份 prompt 服务多个 stage（image/video/editing 质检），
   * 因此用数组形式承载多 stage 映射。
   */
  stageNames: TaskStageName[];
  /** Fornax prompt key */
  promptKey: string;
  /** 简介 */
  description: string;
}

/**
 * SubAgent 详情：在 meta 基础上附加从 Fornax 拉到的 prompt 内容、模型配置与版本号。
 *
 * Fornax SDK `hub.get` 返回的 `rawPrompt` 中：
 * - `prompt_text.system_prompt`：系统提示词
 * - `prompt_text.message_list[0].content`：用户提示词模板（user_prompt 字段已废弃）
 * - `model_config`：模型配置（name / max_tokens / temperature / top_p / thinking）
 */
export interface SubAgentModelConfig {
  name: string | null;
  maxTokens: number | null;
  temperature: number | null;
  topP: number | null;
  thinking: {
    enabled: boolean;
    option: number | null;
  } | null;
}

export interface SubAgentDetail extends SubAgentMeta {
  prompt: {
    system: string;
    user: string;
    version: string | null;
    modelConfig: SubAgentModelConfig | null;
    /** 原始 rawPrompt，便于前端展示完整 JSON */
    raw: unknown;
  } | null;
  /** 当 Fornax 不可用 / 拉取失败时的错误信息 */
  error: string | null;
}
