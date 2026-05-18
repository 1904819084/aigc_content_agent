import { createRunStageNode } from './runStageNodeFactory';
import { runImageGeneratingAgent } from '../subagents/imageGeneratingAgent';

export function createImageGeneratingNode(taskRepository) {
  return createRunStageNode(taskRepository, 'image_generating', runImageGeneratingAgent);
}
