import { createStageNode } from '../taskGraph/createStageNode';
import { runEditingAgent } from '../subagents/editingAgent';

export function createEditingNode(taskRepository) {
  return createStageNode(taskRepository, 'editing', runEditingAgent);
}
