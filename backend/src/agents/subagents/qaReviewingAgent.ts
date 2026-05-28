import type {
  QaReviewDecision,
  QaReviewResult,
  QaReviewTargetStage,
  Task,
} from '../../types';
import { getStageResult } from '../../utils/getStageResult';
import { buildJsonResultParser, createLLMStageAgent } from '../SubAgentFactory/createLLMStageAgent';

const PROMPT_KEY = 'demo.qa_review_agent.prompt';

// 三种 QA stage 的输出类型在 StageOutputMap 中均为 QaReviewResult，故工厂可用联合类型 S。
type QaStageName = 'image_qa_reviewing' | 'video_qa_reviewing' | 'editing_qa_reviewing';

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

function buildQaReviewResultFromJson(value: unknown): QaReviewResult | null {
  if (!value || typeof value !== 'object') {
    return null;
  }
  const record = value as Record<string, unknown>;
  const decision = record.decision;
  const targetStage = record.targetStage;
  const score = typeof record.score === 'number' && Number.isFinite(record.score) ? record.score : null;
  const reasons = typeof record.reasons === 'string' ? record.reasons.trim() : '';
  const suggestions = typeof record.suggestions === 'string' ? record.suggestions.trim() : '';

  // 白名单守卫：避免 LLM 返回非法字符串导致路由分支崩溃。
  const isValidDecision = decision === 'pass' || decision === 'fail';
  const isValidTarget =
    targetStage === 'image_generating' ||
    targetStage === 'video_generating' ||
    targetStage === 'editing';

  if (!isValidDecision || !isValidTarget || score === null) {
    return null;
  }

  return {
    decision: decision as QaReviewDecision,
    targetStage: targetStage as QaReviewTargetStage,
    score,
    reasons,
    suggestions,
  };
}

// 内部工厂实例：通过 ctx 接收 QA 目标阶段，把目标阶段相关的「取产物 → 选 prompt 变量名」收敛进 getInput。
const runQaReviewingAgentInternal = createLLMStageAgent<QaStageName, QaReviewTargetStage>({
  promptKey: PROMPT_KEY,
  getInput: (task, target) => {
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
  parseResult: buildJsonResultParser<QaStageName, QaReviewTargetStage>(buildQaReviewResultFromJson),
  invalidSchemaError: 'fornax_qa_review_result_invalid_schema',
  executeError: 'fornax_qa_review_failed',
});

// 内容质检 agent：可对短视频分镜图、短视频分镜视频、短视频最终成片，图文配图 四选一进行质检，
// 一次调用只接收一种产物，由调用方传入 target 决定本次质检对象。
export const runQaReviewingAgent = (task: Task, target: QaReviewTargetStage) =>
  runQaReviewingAgentInternal(task, target);

// 工厂模式：方便上游 node 在不同质检点固定一个目标阶段。
export function createQaReviewingAgent(target: QaReviewTargetStage) {
  return (task: Task) => runQaReviewingAgentInternal(task, target);
}
