import { getRequiredStageResult } from './stageAgentUtils';

export async function runQaReviewingAgent(task) {
  const brief = task.brief;
  const timeline = getRequiredStageResult(task, 'editing');

  const result = {
    summary: '基础质检通过，可进入人工审阅。',
    checks: [
      { name: '视频时长', result: `${timeline.totalDuration}秒，符合短视频范围` },
      { name: '商品聚焦', result: `画面主线已围绕 ${brief.productName} 的卖点展开` },
      { name: '商品素材', result: `当前任务已接入 ${brief.productImages?.length ?? 0} 张商品图` },
      {
        name: 'Prompt 适配',
        result: brief.videoPrompt
          ? `已融合用户自定义 Prompt：${brief.videoPrompt}`
          : '未提供额外 Prompt，已按默认带货策略生成',
      },
      { name: '风险提示', result: '当前为 mock 结果，正式接真实模型后需补充内容安全审核' },
    ],
  };

  return {
    input: {
      productName: brief.productName,
      totalDuration: `${timeline.totalDuration} 秒`,
    },
    summary: [
      { label: '质检结论', value: result.summary },
      ...result.checks.map((check) => ({ label: check.name, value: check.result })),
    ],
    metrics: [
      { label: '检查项数量', value: result.checks.length },
      { label: '任务素材数', value: brief.productImages?.length ?? 0 },
    ],
    result,
  };
}

