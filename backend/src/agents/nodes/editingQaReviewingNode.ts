import { createStageNode } from '../taskGraph/createStageNode';
import { createQaReviewingAgent } from '../subagents/qaReviewingAgent';

export function createEditingQaReviewingNode(taskRepository) {
  return createStageNode(
    taskRepository,
    'editing_qa_reviewing',
    createQaReviewingAgent('editing'),
  );
}
