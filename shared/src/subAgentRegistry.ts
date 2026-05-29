import { TaskStageName } from './enums';
import type { SubAgentMeta } from './subAgent';

/**
 * SubAgent 注册表：前后端共享的 Single Source of Truth。
 *
 * - 与 backend/src/agents/subagents/*.ts 中各 agent 的 promptKey 严格保持同步。
 * - QA Agent 一份 prompt 模板服务三个 stage（image/video/editing），
 *   因此只列 1 条，stageNames 用数组承载多 stage 映射。
 */
export const SUB_AGENT_REGISTRY: SubAgentMeta[] = [
  {
    name: 'script',
    displayName: '短视频/图文剧本生成 Agent',
    stageNames: [TaskStageName.ScriptGenerating],
    promptKey: 'demo.script_generate_agent.prompt',
    description: '根据商品信息和用户提示词生成短视频/图文剧本。',
  },
  {
    name: 'storyboard',
    displayName: '短视频分镜脚本生成 Agent',
    stageNames: [TaskStageName.StoryboardGenerating],
    promptKey: 'demo.stotyboard_generate_agent.prompt',
    description: '基于剧本拆解每个镜头的画面、动作与时长。',
  },
  {
    name: 'imagePrompt',
    displayName: '图像 Prompt 生成 Agent',
    stageNames: [TaskStageName.ImagePromptGenerating],
    promptKey: 'demo.image_prompt_generate.prompt',
    description: '生成图像模型的 prompt。',
  },
  {
    name: 'image',
    displayName: '图像生成 Agent',
    stageNames: [TaskStageName.ImageGenerating],
    promptKey: 'demo.image_generate_agent.prompt',
    description: '调用图像模型，按 prompt 生成图文/分镜图。',
  },
  {
    name: 'videoPrompt',
    displayName: '视频 Prompt 生成 Agent',
    stageNames: [TaskStageName.VideoPromptGenerating],
    promptKey: 'demo.video_prompt_generate.prompt',
    description: '基于短视频分镜脚本，生成视频模型的prompt。',
  },
  {
    name: 'video',
    displayName: '视频生成 Agent',
    stageNames: [TaskStageName.VideoGenerating],
    promptKey: 'demo.video_generate_agent.prompt',
    description: '调用视频模型生成单镜头短视频。',
  },
  {
    name: 'editing',
    displayName: '剪辑 Agent',
    stageNames: [TaskStageName.Editing],
    promptKey: 'demo.video_edit_agent.prompt',
    description: '将多镜头视频与音频合成为最终成片。',
  },
  {
    name: 'qaReviewing',
    displayName: 'QA 评审 Agent',
    stageNames: [
      TaskStageName.ImageQaReviewing,
      TaskStageName.VideoQaReviewing,
      TaskStageName.EditingQaReviewing,
    ],
    promptKey: 'demo.qa_review_agent.prompt',
    description: '对图像/视频/最终成片三道质检，按 target 决定本次评审对象。',
  },
];

export function findSubAgentByName(name: string): SubAgentMeta | undefined {
  return SUB_AGENT_REGISTRY.find((agent) => agent.name === name);
}
