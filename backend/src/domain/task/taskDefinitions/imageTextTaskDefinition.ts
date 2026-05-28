import { runImageGeneratingAgent } from '../../../agents/subagents/imageGeneratingAgent';
import { runImagePromptGeneratingAgent } from '../../../agents/subagents/imagePromptGeneratingAgent';
import { runScriptGeneratingAgent } from '../../../agents/subagents/scriptGeneratingAgent';
import type { TaskDefinition } from './types';

/**
 * 图文任务定义：复用短视频中相同的生成型 agent（其内部按 task.brief.taskType 自适应），
 * 但 label 在图文任务下需要换成更贴合业务的措辞。
 */
export const imageTextTaskDefinition: TaskDefinition = {
  taskType: 'image_text',
  stages: [
    {
      name: 'script_generating',
      label: '图文剧本生成',
      agent: runScriptGeneratingAgent,
    },
    {
      name: 'image_prompt_generating',
      label: '图文生图提示词生成',
      agent: runImagePromptGeneratingAgent,
    },
    {
      name: 'image_generating',
      label: '图文生成',
      agent: runImageGeneratingAgent,
    },
    {
      name: 'image_qa_reviewing',
      label: '图文质检',
    },
  ],
};
