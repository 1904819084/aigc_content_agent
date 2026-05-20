import { Annotation } from '@langchain/langgraph';

export const TaskGraphState = Annotation.Root({
  _id: Annotation(),
  currentStage: Annotation(),
  error: Annotation(),
});
