import { createRunStageNode } from './runStageNodeFactory';
import { runVideoPromptGeneratingAgent } from '../subagents/videoPromptGeneratingAgent';

export function createVideoPromptGeneratingNode(taskRepository) {
  return createRunStageNode(taskRepository, 'video_prompt_generating', runVideoPromptGeneratingAgent);
}
