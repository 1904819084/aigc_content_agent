import { createStageNode } from '../taskGraph/createStageNode';
import { createQaReviewingAgent } from '../subagents/qaReviewingAgent';

export function createVideoQaReviewingNode(taskRepository) {
  return createStageNode(
    taskRepository,
    'video_qa_reviewing',
    createQaReviewingAgent('video_generating'),
  );
}
