import { createStageNode } from '../taskGraph/createStageNode';
import { runImagePromptGeneratingAgent } from '../subagents/imagePromptGeneratingAgent';

export function createImagePromptGeneratingNode(taskRepository) {
  return createStageNode(taskRepository, 'image_prompt_generating', runImagePromptGeneratingAgent);
}
