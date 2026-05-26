import { createStageNode } from '../taskGraph/createStageNode';
import { runImageGeneratingAgent } from '../subagents/imageGeneratingAgent';

export function createImageGeneratingNode(taskRepository) {
  return createStageNode(taskRepository, 'image_generating', runImageGeneratingAgent);
}
