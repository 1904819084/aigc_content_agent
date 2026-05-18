import { createRunStageNode } from './runStageNodeFactory';
import { runScriptGeneratingAgent } from '../subagents/scriptGeneratingAgent';

export function createScriptGeneratingNode(taskRepository) {
  return createRunStageNode(taskRepository, 'script_generating', runScriptGeneratingAgent);
}
