import { getRequiredStageResult } from './stageAgentUtils';

export async function runImageGeneratingAgent(task) {
  const storyboard = getRequiredStageResult(task, 'storyboard_generating');

  const result = storyboard.map((shot) => ({
    shotId: shot.shotId,
    prompt: `${shot.visual}，${shot.shotType}，电影感光影，统一角色和服装风格`,
    status: 'ready',
    imageUrl: `https://placehold.co/720x1280?text=${shot.shotId}`,
  }));

  return {
    input: {
      storyboardShotCount: storyboard.length,
    },
    summary: result.map((image) => ({
      label: image.shotId,
      value: image.prompt,
    })),
    metrics: [
      { label: '生成图片', value: result.length },
      { label: '就绪状态', value: result.every((image) => image.status === 'ready') ? '全部就绪' : '部分处理中' },
    ],
    result,
  };
}

