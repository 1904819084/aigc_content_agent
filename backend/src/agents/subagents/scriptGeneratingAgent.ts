import type { ScriptResult, Task } from '../../types';
import { tryParseAgentJson } from '../../utils/agentOutput';
import { createLLMStageAgent } from '../SubAgentFactory/createLLMStageAgent';

const PROMPT_KEY = 'demo.script_generate_agent.prompt';
//不指定version会默认选择最新版本
// const PROMPT_VERSION = '0.0.1';

function buildScriptResultFromJson(value: unknown): ScriptResult | null {
  if (!value || typeof value !== 'object') {
    return null;
  }
  const record = value as Record<string, unknown>;
  const sectionsValue = Array.isArray(record.sections) ? record.sections : [];
  const title = record.title as string;
  const hook = record.hook as string;
  const positioning = record.positioning as string;
  const cta = record.cta as string;
  if (!title || !hook || !positioning || !cta || sectionsValue.length === 0) {
    return null;
  }
  return {
    title,
    hook,
    positioning,
    sections: sectionsValue.map((section) => ({
      heading: section.heading,
      narration: section.narration,
    })),
    cta,
  };
}

// 短视频/图文 剧本生成 agent
export const runScriptGeneratingAgent = createLLMStageAgent<'script_generating'>({
  promptKey: PROMPT_KEY,
  getInput: (task: Task) => ({
    productName: task.brief.productName,
    productImage: task.brief.productImages || undefined,
    inputPrompt: task.brief.inputPrompt ? task.brief.inputPrompt : '无输入提示词',
    taskType: task.brief.taskType ?? 'short_video',
  }),
  // 剧本生成阶段的 fornax variables 与 input 字段名不同，需要单独映射；并且取的是原始 brief 而非 input 中的兜底文案。
  getVariables: (_input, task) => ({
    product_name: task.brief.productName,
    product_images: task.brief.productImages || undefined,
    add_prompt: task.brief.inputPrompt || '',
    taskType: task.brief.taskType ?? 'short_video',
  }),
  parseResult: (response) => {
    if (!response.ok || !response.text) {
      return null;
    }
    return buildScriptResultFromJson(tryParseAgentJson(response.text));
  },
  invalidSchemaError: 'fornax_script_result_invalid_schema',
  executeError: 'fornax_script_generating_failed',
});
