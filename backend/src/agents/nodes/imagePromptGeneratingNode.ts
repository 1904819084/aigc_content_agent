import { createRunStageNode } from './runStageNodeFactory';
import { runImagePromptGeneratingAgent } from '../subagents/imagePromptGeneratingAgent';

export function createImagePromptGeneratingNode(taskRepository) {
  return createRunStageNode(taskRepository, 'image_prompt_generating', runImagePromptGeneratingAgent);
}
