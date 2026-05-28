import type { Task } from '../../types';
import { getStageResult } from '../../utils/getStageResult';
import { createLLMStageAgent } from '../SubAgentFactory/createLLMStageAgent';

const PROMPT_KEY = 'demo.stotyboard_generate_agent.prompt';

// 短视频分镜脚本生成agent
export const runStoryboardGeneratingAgent = createLLMStageAgent({
  stageName: 'storyboard_generating',
  promptKey: PROMPT_KEY,
  getInput: (task: Task) => ({
    script: getStageResult(task, 'script_generating'),
  }),
  // input 中的 script 字段需要以 video_script 名义传给 prompt
  getVariables: (input) => ({
    video_script: JSON.stringify(input.script, null, 2),
  }),
  invalidSchemaError: 'fornax_storyboard_result_invalid_schema',
  executeError: 'fornax_storyboard_generating_failed',
});
