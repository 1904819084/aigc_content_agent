import type { StoryboardShotResult, Task } from '../../types';
import { getStageResult } from '../../utils/getStageResult';
import { buildJsonResultParser, createLLMStageAgent } from '../SubAgentFactory/createLLMStageAgent';

const PROMPT_KEY = 'demo.stotyboard_generate_agent.prompt';

function buildStoryboardResultFromJson(value: unknown): StoryboardShotResult[] | null {
  const record = value && typeof value === 'object' ? (value as Record<string, unknown>) : null;
  const Shots = Array.isArray(record?.shots) ? record.shots : null;

  if (!Shots) {
    return null;
  }

  return Shots.map((shot, index) => ({
    shotId: shot.shotId.trim() || `shot_${index + 1}`,
    duration: shot.duration,
    shotType: shot.shotType.trim(),
    visual: shot.visual.trim(),
    narration: shot.narration.trim(),
    subtitle: shot.subtitle.trim(),
    cameraMotion: shot.cameraMotion.trim(),
  }));
}

// 短视频分镜脚本生成agent
export const runStoryboardGeneratingAgent = createLLMStageAgent<'storyboard_generating'>({
  promptKey: PROMPT_KEY,
  getInput: (task: Task) => ({
    script: getStageResult(task, 'script_generating'),
  }),
  // input 中的 script 字段需要以 video_script 名义传给 prompt
  getVariables: (input) => ({
    video_script: JSON.stringify(input.script, null, 2),
  }),
  parseResult: buildJsonResultParser<'storyboard_generating', void>((value) => {
    const result = buildStoryboardResultFromJson(value);
    return result && result.length > 0 ? result : null;
  }),
  invalidSchemaError: 'fornax_storyboard_result_invalid_schema',
  executeError: 'fornax_storyboard_generating_failed',
});
