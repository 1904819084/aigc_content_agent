import { END, START, StateGraph } from '@langchain/langgraph';
import type { TaskRepository } from '../../types';
import { createEditingNode } from '../nodes/editingNode';
import { createImageGeneratingNode } from '../nodes/imageGeneratingNode';
import { createImagePromptGeneratingNode } from '../nodes/imagePromptGeneratingNode';
import { createQaReviewingNode } from '../nodes/qaReviewingNode';
import { createScriptGeneratingNode } from '../nodes/scriptGeneratingNode';
import { createStoryboardGeneratingNode } from '../nodes/storyboardGeneratingNode';
import { createVideoPromptGeneratingNode } from '../nodes/videoPromptGeneratingNode';
import { createVideoGeneratingNode } from '../nodes/videoGeneratingNode';
import { TaskGraphState } from './taskGraphState';

const TASK_GRAPH_NODE = {
  ScriptGenerating: 'script_generating_node',
  StoryboardGenerating: 'storyboard_generating_node',
  ImagePromptGenerating: 'image_prompt_generating_node',
  ImageGenerating: 'image_generating_node',
  VideoPromptGenerating: 'video_prompt_generating_node',
  VideoGenerating: 'video_generating_node',
  Editing: 'editing_node',
  QaReviewing: 'qa_reviewing_node',
};

export function createTaskGraph(taskRepository: TaskRepository) {
  return new StateGraph(TaskGraphState)
    .addNode(TASK_GRAPH_NODE.ScriptGenerating, createScriptGeneratingNode(taskRepository))
    .addNode(TASK_GRAPH_NODE.StoryboardGenerating, createStoryboardGeneratingNode(taskRepository))
    .addNode(TASK_GRAPH_NODE.ImagePromptGenerating, createImagePromptGeneratingNode(taskRepository))
    .addNode(TASK_GRAPH_NODE.ImageGenerating, createImageGeneratingNode(taskRepository))
    .addNode(TASK_GRAPH_NODE.VideoPromptGenerating, createVideoPromptGeneratingNode(taskRepository))
    .addNode(TASK_GRAPH_NODE.VideoGenerating, createVideoGeneratingNode(taskRepository))
    .addNode(TASK_GRAPH_NODE.Editing, createEditingNode(taskRepository))
    .addNode(TASK_GRAPH_NODE.QaReviewing, createQaReviewingNode(taskRepository))
    .addEdge(START, TASK_GRAPH_NODE.ScriptGenerating)
    .addEdge(TASK_GRAPH_NODE.ScriptGenerating, TASK_GRAPH_NODE.StoryboardGenerating)
    // Storyboard 产出后，并发分叉生成分镜图提示词和分镜视频提示词。
    .addEdge(TASK_GRAPH_NODE.StoryboardGenerating, TASK_GRAPH_NODE.ImagePromptGenerating)
    .addEdge(TASK_GRAPH_NODE.StoryboardGenerating, TASK_GRAPH_NODE.VideoPromptGenerating)
    .addEdge(TASK_GRAPH_NODE.ImagePromptGenerating, TASK_GRAPH_NODE.ImageGenerating)
    // 视频生成依赖分镜图和分镜视频提示词双输入，必须等待两条分支都完成。
    .addEdge(
      [TASK_GRAPH_NODE.ImageGenerating, TASK_GRAPH_NODE.VideoPromptGenerating],
      TASK_GRAPH_NODE.VideoGenerating,
    )
    .addEdge(TASK_GRAPH_NODE.VideoGenerating, TASK_GRAPH_NODE.Editing)
    .addEdge(TASK_GRAPH_NODE.Editing, TASK_GRAPH_NODE.QaReviewing)
    .addEdge(TASK_GRAPH_NODE.QaReviewing, END)
    .compile();
}
