import { END, START, StateGraph } from '@langchain/langgraph';
import type { TaskRepository } from '../../types';
import { createImageGeneratingNode } from '../nodes/imageGeneratingNode';
import { createImagePromptGeneratingNode } from '../nodes/imagePromptGeneratingNode';
import { createImageQaReviewingNode } from '../nodes/imageQaReviewingNode';
import { createScriptGeneratingNode } from '../nodes/scriptGeneratingNode';
import { TaskGraphState } from './taskGraphState';

const TASK_GRAPH_NODE = {
  ScriptGenerating: 'script_generating_node',
  ImagePromptGenerating: 'image_prompt_generating_node',
  ImageGenerating: 'image_generating_node',
  ImageQaReviewing: 'image_qa_reviewing_node',
};

// 图文Graph：复用短视频 graph 中已有的 4 个节点，节点内部按 task.brief.taskType 自适应输入。
export function createImageTextTaskGraph(taskRepository: TaskRepository) {
  return new StateGraph(TaskGraphState)
    .addNode(TASK_GRAPH_NODE.ScriptGenerating, createScriptGeneratingNode(taskRepository))
    .addNode(TASK_GRAPH_NODE.ImagePromptGenerating, createImagePromptGeneratingNode(taskRepository))
    .addNode(TASK_GRAPH_NODE.ImageGenerating, createImageGeneratingNode(taskRepository))
    .addNode(TASK_GRAPH_NODE.ImageQaReviewing, createImageQaReviewingNode(taskRepository))
    .addEdge(START, TASK_GRAPH_NODE.ScriptGenerating)
    .addEdge(TASK_GRAPH_NODE.ScriptGenerating, TASK_GRAPH_NODE.ImagePromptGenerating)
    .addEdge(TASK_GRAPH_NODE.ImagePromptGenerating, TASK_GRAPH_NODE.ImageGenerating)
    .addEdge(TASK_GRAPH_NODE.ImageGenerating, TASK_GRAPH_NODE.ImageQaReviewing)
    .addEdge(TASK_GRAPH_NODE.ImageQaReviewing, END)
    .compile();
}
