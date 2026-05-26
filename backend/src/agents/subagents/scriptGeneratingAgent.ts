import { fornaxExecute } from '../../fornax/llm';
import type { ScriptResult, Task } from '../../types';
import { tryParseAgentJson } from '../../utils/agentOutput';
import { AppError, toAppError } from '../../utils/appError';

const PROMPT_KEY = 'demo.script_generate_agent.prompt';
//不指定version会默认选择最新版本
// const PROMPT_VERSION = '0.0.1';

function buildScriptResultFromJson(value: unknown): ScriptResult | null {
  if (!value || typeof value !== 'object') {
    return null;
  }
  const record = value as Record<string, unknown>;
  const sectionsValue = Array.isArray(record.sections) ? record.sections : [];
  const title =record.title as string;
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
export async function runScriptGeneratingAgent(task: Task) {
  const brief = task.brief;
  try {
    const response = await fornaxExecute({
      promptKey: PROMPT_KEY,
      variables: {
        product_name: brief.productName,
        product_images: brief.productImages || undefined,
        add_prompt: brief.inputPrompt || '',
        taskType:brief.taskType ?? 'short_video'
      },
      callOptions: {},
    });

    if (!response.ok || !response.text) {
      throw new AppError(
        typeof response.error === 'string' && response.error ? response.error : 'fornax_execute_failed',
        502,
      );
    }

    const result = buildScriptResultFromJson(tryParseAgentJson(response.text));

    if (!result) {
      throw new AppError('fornax_script_result_invalid_schema', 502);
    }

    return {
      input: {
        productName: brief.productName,
        productImage: brief.productImages || undefined,
        inputPrompt: brief.inputPrompt ? brief.inputPrompt : '无输入提示词',
        taskType:brief.taskType ?? 'short_video'
      },
      output: result,
    };
  } catch (error) {
    throw toAppError(error, 'fornax_script_generating_failed', 502);
  }
}
