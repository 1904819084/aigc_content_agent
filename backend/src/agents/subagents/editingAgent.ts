import type { Task } from '../../types';
import { getStageResult } from '../../utils/getStageResult';
import { createLLMStageAgent } from '../SubAgentFactory/createLLMStageAgent';

const PROMPT_KEY = 'demo.video_edit_agent.prompt';

// 短视频分镜视频混剪成片agent
export const runEditingAgent = createLLMStageAgent({
  stageName: 'editing',
  promptKey: PROMPT_KEY,
  getInput: (task: Task) => ({
    video_script: getStageResult(task, 'script_generating'),
    videoList: getStageResult(task, 'video_generating'),
  }),
  invalidSchemaError: 'fornax_video_edit_result_invalid_schema',
  executeError: 'fornax_video_edit_failed',
});
