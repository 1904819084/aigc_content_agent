// 标准化各阶段输出
export function createStageOutputDocument(stageName, data) {
  return {
    stageName,
    version: 'v1',
    generatedAt: new Date().toISOString(),
    input: data.input,
    summary: data.summary,
    metrics: data.metrics,
    result: data.result,
  };
}

