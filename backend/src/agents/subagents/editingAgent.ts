import { getStageResult } from '../../utils/getStageResult';

export async function runEditingAgent(task) {
  const brief = task.brief;
  const clips = getStageResult(task, 'video_generating');

  const totalDuration = clips.reduce((sum, clip) => sum + clip.duration, 0);
  const result = {
    ratio: '9:16',
    totalDuration,
    bgm: `${brief.productName}带货节奏背景音乐`,
    subtitleStyle: '白字黑底高可读性字幕',
    clips: clips.map((clip, index) => ({
      shotId: clip.shotId,
      order: index + 1,
      duration: clip.duration,
      transition: index === 0 ? 'cut' : 'fade',
    })),
  };

  return {
    input: {
      productName: brief.productName,
      clipCount: clips.length,
    },
    summary: [
      { label: '成片比例', value: result.ratio },
      { label: '背景音乐', value: result.bgm },
      { label: '字幕风格', value: result.subtitleStyle },
    ],
    metrics: [
      { label: '轨道片段', value: result.clips.length },
      { label: '成片时长', value: `${result.totalDuration} 秒` },
    ],
    result,
  };
}
