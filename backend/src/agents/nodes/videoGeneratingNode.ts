import { createRunStageNode } from './runStageNodeFactory';
import { runVideoGeneratingAgent } from '../subagents/videoGeneratingAgent';

export function createVideoGeneratingNode(taskRepository) {
  return createRunStageNode(taskRepository, 'video_generating', runVideoGeneratingAgent);
}
