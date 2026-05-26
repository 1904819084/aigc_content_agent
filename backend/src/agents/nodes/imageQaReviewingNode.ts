import { createStageNode } from '../taskGraph/createStageNode';
import { createQaReviewingAgent } from '../subagents/qaReviewingAgent';

export function createImageQaReviewingNode(taskRepository) {
  return createStageNode(
    taskRepository,
    'image_qa_reviewing',
    createQaReviewingAgent('image_generating'),
  );
}
