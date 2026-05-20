import { fornaxExecute } from '../../fornax/llm';
import type { ScriptResult, StoryboardShotResult, Task } from '../../types';
import { tryParseAgentJson } from '../../utils/agentOutput';
import { AppError, toAppError } from '../../utils/appError';
import { getStageResult } from '../../utils/getStageResult';

const PROMPT_KEY = 'demo.stotyboard_generate_agent.prompt';

function isStoryboardShot(value: unknown): value is StoryboardShotResult {
  if (!value || typeof value !== 'object') {
    return false;
  }
  const record = value as Record<string, unknown>;
  return (
    typeof record.shotId === 'string' &&
    typeof record.duration === 'number' &&
    Number.isFinite(record.duration) &&
    typeof record.shotType === 'string' &&
    typeof record.visual === 'string' &&
    typeof record.narration === 'string' &&
    typeof record.subtitle === 'string' &&
    typeof record.cameraMotion === 'string'
  );
}


function buildStoryboardResultFromJson(value: unknown): StoryboardShotResult[] | null {
  const record = value && typeof value === 'object' ? (value as Record<string, unknown>) : null;
  const nestedShots = Array.isArray(record?.shots) ? record.shots : null;
  const shotsValue = Array.isArray(value)
    ? value.filter(isStoryboardShot)
    : nestedShots
      ? nestedShots.filter(isStoryboardShot)
      : [];

  if (shotsValue.length === 0) {
    return null;
  }

  return shotsValue.map((shot, index) => ({
    shotId: shot.shotId.trim() || `shot_${index + 1}`,
    duration: Math.max(1, Math.round(shot.duration)),
    shotType: shot.shotType.trim(),
    visual: shot.visual.trim(),
    narration: shot.narration.trim(),
    subtitle: shot.subtitle.trim(),
    cameraMotion: shot.cameraMotion.trim(),
  }));
}

// 分镜脚本生成agent
export async function runStoryboardGeneratingAgent(task: Task) {
  const script = getStageResult(task, 'script_generating') as ScriptResult;

  try {
    const response = await fornaxExecute({
      promptKey: PROMPT_KEY,
      variables: {
        video_script: JSON.stringify(script, null, 2),
      },
      callOptions: {},
    });

    if (!response.ok || !response.text) {
      throw new AppError(
        typeof response.error === 'string' && response.error ? response.error : 'fornax_execute_failed',
        502,
      );
    }

    const result =
      buildStoryboardResultFromJson(tryParseAgentJson(response.text)) 

    if (result.length === 0) {
      throw new AppError('fornax_storyboard_result_invalid_schema', 502);
    }

    return {
      input: {
        script,
      },
      output:result,
    };
  } catch (error) {
    throw toAppError(error, 'fornax_storyboard_generating_failed', 502);
  }
}
