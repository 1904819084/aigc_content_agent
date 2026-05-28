import type { QaReviewTargetStage, Task } from '../../types';
import { getStageResult } from '../../utils/getStageResult';
import { createLLMStageAgent } from '../SubAgentFactory/createLLMStageAgent';

const PROMPT_KEY = 'demo.qa_review_agent.prompt';

// 三种 QA stage 共用相同的 zod schema（QaReviewResult），但工厂仍然要求一个具体 stageName。
// QA 由 graph 中三个独立 node 触发，stageName 在 createQaReviewingAgent 工厂入口指定。
type QaStageName = 'image_qa_reviewing' | 'video_qa_reviewing' | 'editing_qa_reviewing';

const QA_STAGE_BY_TARGET: Record<QaReviewTargetStage, QaStageName> = {
  image_generating: 'image_qa_reviewing',
  video_generating: 'video_qa_reviewing',
  editing: 'editing_qa_reviewing',
};

// 按目标阶段读取本次需要质检的产物，一次只针对一种内容进行质检。
function getReviewContent(task: Task, target: QaReviewTargetStage) {
  if (target === 'image_generating') {
    return getStageResult(task, 'image_generating');
  }
  if (target === 'video_generating') {
    return getStageResult(task, 'video_generating');
  }
  return getStageResult(task, 'editing');
}

function buildQaReviewingAgent(target: QaReviewTargetStage) {
  return createLLMStageAgent({
    stageName: QA_STAGE_BY_TARGET[target],
    promptKey: PROMPT_KEY,
    getInput: (task: Task) => {
      const content = getReviewContent(task, target);
      if (task.brief.taskType === 'short_video' && target === 'image_generating') {
        return { ShortVideo_ImageList: content };
      }
      if (task.brief.taskType === 'image_text' && target === 'image_generating') {
        return { ImageText_ImageList: content };
      }
      if (target === 'video_generating') {
        return { videoList: content };
      }
      return { video: content };
    },
    // QA 的 fornax variables 与 input 字段同名，无需 stringify。
    getVariables: (input) => input,
    invalidSchemaError: 'fornax_qa_review_result_invalid_schema',
    executeError: 'fornax_qa_review_failed',
  });
}

// 内容质检 agent：一次调用只接收一种产物，由调用方传入 target 决定本次质检对象。
export const runQaReviewingAgent = (task: Task, target: QaReviewTargetStage) =>
  buildQaReviewingAgent(target)(task);

// 工厂模式：方便 graph 在不同质检点固定一个目标阶段，避免每次调用都重建工厂实例。
export function createQaReviewingAgent(target: QaReviewTargetStage) {
  const agent = buildQaReviewingAgent(target);
  return (task: Task) => agent(task);
}
