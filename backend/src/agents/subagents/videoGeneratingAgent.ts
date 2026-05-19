import { getStageResult } from '../../utils/getStageResult';

export async function runVideoGeneratingAgent(task) {
  const images = getStageResult(task, 'image_generating');

  const result = images.map((image) => ({
    shotId: image.shotId,
    prompt: image.imagePrompt,
    imageURL: image.imageURL,
    duration: 5,
    status: 'ready',
    previewUrl: `https://example.com/mock-video/${image.shotId}.mp4`,
  }));

  return {
    input: {
      imageCount: images.length,
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
