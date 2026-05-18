import { createRunStageNode } from './runStageNodeFactory';
import { runQaReviewingAgent } from '../subagents/qaReviewingAgent';

export function createQaReviewingNode(taskRepository) {
  return createRunStageNode(taskRepository, 'qa_reviewing', runQaReviewingAgent);
}
