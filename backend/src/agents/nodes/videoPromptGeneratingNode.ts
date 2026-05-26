import { createStageNode } from '../taskGraph/createStageNode';
import { runVideoPromptGeneratingAgent } from '../subagents/videoPromptGeneratingAgent';

export function createVideoPromptGeneratingNode(taskRepository) {
  return createStageNode(taskRepository, 'video_prompt_generating', runVideoPromptGeneratingAgent);
}
