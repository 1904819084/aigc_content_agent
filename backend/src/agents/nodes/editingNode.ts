import { createRunStageNode } from './runStageNodeFactory';
import { runEditingAgent } from '../subagents/editingAgent';

export function createEditingNode(taskRepository) {
  return createRunStageNode(taskRepository, 'editing', runEditingAgent);
}
