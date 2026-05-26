import { createStageNode } from '../taskGraph/createStageNode';
import { runVideoGeneratingAgent } from '../subagents/videoGeneratingAgent';

export function createVideoGeneratingNode(taskRepository) {
  return createStageNode(taskRepository, 'video_generating', runVideoGeneratingAgent);
}
