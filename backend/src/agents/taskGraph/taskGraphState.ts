import { Annotation } from '@langchain/langgraph';

export const TaskGraphState = Annotation.Root({
  taskId: Annotation(),
  currentStage: Annotation(),
  error: Annotation(),
});
