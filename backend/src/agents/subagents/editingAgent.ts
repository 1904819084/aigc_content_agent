import { fornaxExecute } from '../../fornax/llm';
import type { EditingResult, ScriptResult, Task, VideoGeneratingResult } from '../../types';
import { tryParseAgentJson } from '../../utils/agentOutput';
import { AppError, toAppError } from '../../utils/appError';
import { getStageResult } from '../../utils/getStageResult';

const PROMPT_KEY = 'demo.video_edit_agent.prompt';

function buildEditingResultFromJson(value: unknown): EditingResult | null {
  if (!value || typeof value !== 'object') {
    return null;
  }
  const record = value as Record<string, unknown>;
  const video = typeof record.video === 'string' && record.video.trim() ? record.video.trim() : null;
  if (!video) {
    return null;
  }
  return {
    video,
  };
}

// 短视频分镜视频混剪成片agent
export async function runEditingAgent(task: Task) {
  const videoList = getStageResult<VideoGeneratingResult[]>(task, 'video_generating');
  const script = getStageResult<ScriptResult>(task, 'script_generating');

  try {
    const response = await fornaxExecute({
      promptKey: PROMPT_KEY,
      variables: {
        video_script: JSON.stringify(script, null, 2),
        videoList: JSON.stringify(videoList, null, 2),
      },
      callOptions: {},
    });

    const result =
      response.ok && response.text
        ? buildEditingResultFromJson(tryParseAgentJson(response.text))
        : null;

    if (!result) {
      throw new AppError('fornax_video_edit_result_invalid_schema', 502);
    }

    return {
      input: {
        video_script: script,
        videoList,
      },
      output: result,
    };
  } catch (error) {
    throw toAppError(error, 'fornax_video_edit_failed', 502);
  }
}
