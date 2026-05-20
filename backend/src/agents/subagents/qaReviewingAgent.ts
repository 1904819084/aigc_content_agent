import { fornaxExecute } from '../../fornax/llm';
import type { EditingResult, QaReviewResult, Task } from '../../types';
import { tryParseAgentJson } from '../../utils/agentOutput';
import { AppError, toAppError } from '../../utils/appError';
import { getStageResult } from '../../utils/getStageResult';

const PROMPT_KEY = 'demo.qa_review_agent.prompt';


function buildQaReviewResultFromJson(value: unknown): QaReviewResult | null {
  if (!value || typeof value !== 'object') {
    return null;
  }
  const record = value as Record<string, unknown>;
  const result = typeof record.result === 'string' && record.result.trim() ? record.result.trim() : null;
  const legal = typeof record.legal === 'string' && record.legal.trim() ? record.legal.trim() : null;
  const unlegal = typeof record.unlegal === 'string' && record.unlegal.trim() ? record.unlegal.trim() : null;
  const suggestion = typeof record.suggestion === 'string' && record.suggestion.trim() ? record.suggestion.trim() : null;
  if (!result || !legal || !unlegal || !suggestion) {
    return null;
  }
  return {
    result,
    legal,
    unlegal,
    suggestion,
  };
}

// 分镜视频质检agent
export async function runQaReviewingAgent(task: Task) {
  const video = getStageResult<EditingResult>(task, 'editing');

  try {
    const response = await fornaxExecute({
      promptKey: PROMPT_KEY,
      variables: {
        video: video,
      },
      callOptions: {},
    });

    const result =
      response.ok && response.text
        ? buildQaReviewResultFromJson(tryParseAgentJson(response.text))
        : null;

    if (!result) {
      throw new AppError('fornax_qa_review_result_invalid_schema', 502);
    }

    return {
      input: {
        video,
      },
      output: result,
    };
  } catch (error) {
    throw toAppError(error, 'fornax_qa_review_failed', 502);
  }
}
