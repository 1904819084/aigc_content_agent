import type { EditingResult, Task } from '../../types';
import { getStageResult } from '../../utils/getStageResult';
import { buildJsonResultParser, createLLMStageAgent } from '../SubAgentFactory/createLLMStageAgent';

const PROMPT_KEY = 'demo.video_edit_agent.prompt';

function buildEditingResultFromJson(value: unknown): EditingResult | null {
  if (!value || typeof value !== 'object') {
    return null;
  }
  const record = value as Record<string, unknown>;
  const video = typeof record.video === 'string' && record.video.trim() ? record.video.trim() : null;
  if (!video) {
    return null;
  }
  return {
    video,
  };
}

// 短视频分镜视频混剪成片agent
export const runEditingAgent = createLLMStageAgent<'editing'>({
  promptKey: PROMPT_KEY,
  getInput: (task: Task) => ({
    video_script: getStageResult(task, 'script_generating'),
    videoList: getStageResult(task, 'video_generating'),
  }),
  parseResult: buildJsonResultParser<'editing', void>(buildEditingResultFromJson),
  invalidSchemaError: 'fornax_video_edit_result_invalid_schema',
  executeError: 'fornax_video_edit_failed',
});
