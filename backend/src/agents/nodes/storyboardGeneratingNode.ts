import { createStageNode } from '../taskGraph/createStageNode';
import { runStoryboardGeneratingAgent } from '../subagents/storyboardGeneratingAgent';

export function createStoryboardGeneratingNode(taskRepository) {
  return createStageNode(taskRepository, 'storyboard_generating', runStoryboardGeneratingAgent);
}
