import { fornaxExecute } from '../../fornax/llm';
import type { ScriptResult, ScriptSection, Task } from '../../types';
import { tryParseAgentJson } from '../../utils/agentOutput';
import { AppError, toAppError } from '../../utils/appError';

const PROMPT_KEY = 'demo.script_generate_agent.prompt';
//不指定version会默认选择最新版本
// const PROMPT_VERSION = '0.0.1';

function isScriptSection(value: unknown): value is ScriptSection {
  if (!value || typeof value !== 'object') {
    return false;
  }
  const record = value as Record<string, unknown>;
  return typeof record.heading === 'string' && typeof record.narration === 'string';
}

function buildScriptResultFromJson(task: Task, value: unknown): ScriptResult | null {
  if (!value || typeof value !== 'object') {
    return null;
  }
  const brief = task.brief;
  const record = value as Record<string, unknown>;
  const sectionsValue = Array.isArray(record.sections) ? record.sections.filter(isScriptSection) : [];
  const title =
    typeof record.title === 'string' && record.title.trim()
      ? record.title.trim()
      : `${brief.productName}带货短视频剧本`;
  const hook = typeof record.hook === 'string' && record.hook.trim() ? record.hook.trim() : null;
  const positioning =
    typeof record.positioning === 'string' && record.positioning.trim()
      ? record.positioning.trim()
      : null;
  const cta = typeof record.cta === 'string' && record.cta.trim() ? record.cta.trim() : null;
  if (!hook || !positioning || !cta || sectionsValue.length === 0) {
    return null;
  }
  return {
    title,
    hook,
    positioning,
    sections: sectionsValue.map((section) => ({
      heading: section.heading.trim(),
      narration: section.narration.trim(),
    })),
    cta,
  };
}

// 短视频剧本生成agent
export async function runScriptGeneratingAgent(task: Task) {
  const brief = task.brief;
  try {
    const response = await fornaxExecute({
      promptKey: PROMPT_KEY,
      variables: {
        productName: brief.productName,
        productImage: brief.productImages || undefined,
        videoPrompt: brief.videoPrompt || '',
      },
      callOptions: {},
    });

    if (!response.ok || !response.text) {
      throw new AppError(
        typeof response.error === 'string' && response.error ? response.error : 'fornax_execute_failed',
        502,
      );
    }

    let result: ScriptResult | null = null;

    result = buildScriptResultFromJson(task, tryParseAgentJson(response.text));

    if (!result) {
      throw new AppError('fornax_script_result_invalid_schema', 502);
    }

    return {
      input: {
        productName: brief.productName,
        productImage: brief.productImages || undefined,
        videoPrompt: brief.videoPrompt ? brief.videoPrompt : '无补充提示词'
      },
      output: result,
    };
  } catch (error) {
    throw toAppError(error, 'fornax_script_generating_failed', 502);
  }
}
