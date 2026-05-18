import { createRunStageNode } from './runStageNodeFactory';
import { runStoryboardGeneratingAgent } from '../subagents/storyboardGeneratingAgent';

export function createStoryboardGeneratingNode(taskRepository) {
  return createRunStageNode(taskRepository, 'storyboard_generating', runStoryboardGeneratingAgent);
}
