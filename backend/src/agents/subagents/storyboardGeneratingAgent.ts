import { getRequiredStageResult } from './stageAgentUtils';

export async function runStoryboardGeneratingAgent(task) {
  const brief = task.brief;
  const script = getRequiredStageResult(task, 'script_generating');

  const result = script.sections.map((section, index) => ({
    shotId: `shot_${index + 1}`,
    duration: index === 0 ? 4 : 6,
    shotType: index === 0 ? '特写' : '中景',
    visual: `围绕商品“${brief.productName}”设计电商带货画面，突出${section.heading}`,
    narration: section.narration,
    subtitle: `${section.heading}：${brief.productName}`,
    cameraMotion: index === 0 ? '快速推进' : '轻微平移',
  }));

  return {
    input: {
      productName: brief.productName,
      scriptSectionCount: script.sections.length,
    },
    summary: result.map((shot) => ({
      label: shot.shotId,
      value: `${shot.shotType} ${shot.duration} 秒，${shot.cameraMotion}`,
    })),
    metrics: [
      { label: '镜头数量', value: result.length },
      { label: '预计总时长', value: `${result.reduce((sum, shot) => sum + shot.duration, 0)} 秒` },
    ],
    result,
  };
}

