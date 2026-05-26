import { createStageNode } from '../taskGraph/createStageNode';
import { runScriptGeneratingAgent } from '../subagents/scriptGeneratingAgent';

export function createScriptGeneratingNode(taskRepository) {
  return createStageNode(taskRepository, 'script_generating', runScriptGeneratingAgent);
}
