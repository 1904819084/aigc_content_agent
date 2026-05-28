import { runEditingAgent } from '../../../agents/subagents/editingAgent';
import { runImageGeneratingAgent } from '../../../agents/subagents/imageGeneratingAgent';
import { runImagePromptGeneratingAgent } from '../../../agents/subagents/imagePromptGeneratingAgent';
import { runScriptGeneratingAgent } from '../../../agents/subagents/scriptGeneratingAgent';
import { runStoryboardGeneratingAgent } from '../../../agents/subagents/storyboardGeneratingAgent';
import { runVideoGeneratingAgent } from '../../../agents/subagents/videoGeneratingAgent';
import { runVideoPromptGeneratingAgent } from '../../../agents/subagents/videoPromptGeneratingAgent';
import type { TaskDefinition } from './types';

/**
 * 短视频任务定义：阶段顺序 = stages 列表顺序，与 createInitialTaskStages 直接对齐。
 * agent 字段仅出现在常规生成型阶段；QA 阶段不绑 agent，由 taskGraph 用 createQaReviewingAgent 单独装配。
 */
export const shortVideoTaskDefinition: TaskDefinition = {
  taskType: 'short_video',
  stages: [
    {
      name: 'script_generating',
      label: '短视频剧本生成',
      agent: runScriptGeneratingAgent,
    },
    {
      name: 'storyboard_generating',
      label: '分镜脚本生成',
      agent: runStoryboardGeneratingAgent,
    },
    {
      name: 'image_prompt_generating',
      label: '分镜图提示词生成',
      agent: runImagePromptGeneratingAgent,
    },
    {
      name: 'image_generating',
      label: '分镜图生成',
      agent: runImageGeneratingAgent,
    },
    {
      name: 'image_qa_reviewing',
      label: '分镜图质检',
    },
    {
      name: 'video_prompt_generating',
      label: '分镜视频提示词生成',
      agent: runVideoPromptGeneratingAgent,
    },
    {
      name: 'video_generating',
      label: '分镜视频生成',
      agent: runVideoGeneratingAgent,
    },
    {
      name: 'video_qa_reviewing',
      label: '分镜视频质检',
    },
    {
      name: 'editing',
      label: '分镜视频混剪成片',
      agent: runEditingAgent,
    },
    {
      name: 'editing_qa_reviewing',
      label: '短视频最终成片质检',
    },
  ],
};
