import type { Task } from '../../types';
import { getStageResult } from '../../utils/getStageResult';
import { createLLMStageAgent } from '../SubAgentFactory/createLLMStageAgent';

const PROMPT_KEY = 'demo.image_prompt_generate.prompt';

// 短视频分镜图/图文提示词生成 agent
export const runImagePromptGeneratingAgent = createLLMStageAgent({
  stageName: 'image_prompt_generating',
  promptKey: PROMPT_KEY,
  // 短视频取 storyboard，图文取 script 的 sections。
  getInput: (task: Task) => {
    const taskType = task.brief.taskType ?? 'short_video';
    return taskType === 'image_text'
      ? { imageText_Script_Sections: getStageResult(task, 'script_generating').sections || [] }
      : { StoryboardShot: getStageResult(task, 'storyboard_generating') };
  },
  invalidSchemaError: 'fornax_image_prompt_result_invalid_schema',
  executeError: 'fornax_image_prompt_generating_failed',
});
