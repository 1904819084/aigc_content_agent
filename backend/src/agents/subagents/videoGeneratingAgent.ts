import { getRequiredStageResult } from './stageAgentUtils';

export async function runVideoGeneratingAgent(task) {
  const storyboard = getRequiredStageResult(task, 'storyboard_generating');

  const result = storyboard.map((shot) => ({
    shotId: shot.shotId,
    prompt: `${shot.visual}，镜头运动：${shot.cameraMotion}，时长${shot.duration}秒`,
    duration: shot.duration,
    status: 'ready',
    previewUrl: `https://example.com/mock-video/${shot.shotId}.mp4`,
  }));

  return {
    input: {
      storyboardShotCount: storyboard.length,
    },
    summary: result.map((video) => ({
      label: video.shotId,
      value: `${video.duration} 秒，状态：${video.status}`,
    })),
    metrics: [
      { label: '生成视频', value: result.length },
      { label: '累计时长', value: `${result.reduce((sum, video) => sum + video.duration, 0)} 秒` },
    ],
    result,
  };
}

