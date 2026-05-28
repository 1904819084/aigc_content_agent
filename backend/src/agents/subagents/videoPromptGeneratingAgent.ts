import type { Task } from '../../types';
import { getStageResult } from '../../utils/getStageResult';
import { createLLMStageAgent } from '../SubAgentFactory/createLLMStageAgent';

const PROMPT_KEY = 'demo.video_prompt_generate.prompt';

// 短视频分镜视频提示词生成agent
export const runVideoPromptGeneratingAgent = createLLMStageAgent({
  stageName: 'video_prompt_generating',
  promptKey: PROMPT_KEY,
  getInput: (task: Task) => ({
    storyboard: getStageResult(task, 'storyboard_generating'),
  }),
  // input 中的 storyboard 字段需要以 StoryboardShot 名义传给 prompt
  getVariables: (input) => ({
    StoryboardShot: JSON.stringify(input.storyboard, null, 2),
  }),
  invalidSchemaError: 'fornax_video_prompt_result_invalid_schema',
  executeError: 'fornax_video_prompt_generating_failed',
});
