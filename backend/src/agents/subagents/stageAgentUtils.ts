export function getRequiredStageResult(task, stageName) {
  const stageOutput = task.outputs?.[stageName];

  if (!stageOutput) {
    throw new Error(`Missing stage output: ${stageName}`);
  }

  return stageOutput.result;
}

