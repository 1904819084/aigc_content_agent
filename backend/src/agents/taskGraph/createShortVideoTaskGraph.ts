import { END, START, StateGraph } from '@langchain/langgraph';
import type { MongoDBSaver } from '@langchain/langgraph-checkpoint-mongodb';
import type { TaskRepository } from '../../types';
import { createEditingNode } from '../nodes/editingNode';
import { createEditingQaReviewingNode } from '../nodes/editingQaReviewingNode';
import { createImageGeneratingNode } from '../nodes/imageGeneratingNode';
import { createImagePromptGeneratingNode } from '../nodes/imagePromptGeneratingNode';
import { createImageQaReviewingNode } from '../nodes/imageQaReviewingNode';
import { createScriptGeneratingNode } from '../nodes/scriptGeneratingNode';
import { createStoryboardGeneratingNode } from '../nodes/storyboardGeneratingNode';
import { createVideoPromptGeneratingNode } from '../nodes/videoPromptGeneratingNode';
import { createVideoGeneratingNode } from '../nodes/videoGeneratingNode';
import { createVideoQaReviewingNode } from '../nodes/videoQaReviewingNode';
import { createQaConditionalRouter } from './createStageNode';
import { TaskGraphState } from './taskGraphState';

const TASK_GRAPH_NODE = {
  ScriptGenerating: 'script_generating_node',
  StoryboardGenerating: 'storyboard_generating_node',
  ImagePromptGenerating: 'image_prompt_generating_node',
  ImageGenerating: 'image_generating_node',
  ImageQaReviewing: 'image_qa_reviewing_node',
  // 汇聚 image_qa pass 路由的 sink，使 VideoGenerating 的入边全部为静态边，
  // 从而 LangGraph 可以对 [SinkAfterImageQaPass, VideoPromptGenerating] 做 AND-join。
  SinkAfterImageQaPass: 'sink_after_image_qa_pass',
  VideoPromptGenerating: 'video_prompt_generating_node',
  VideoGenerating: 'video_generating_node',
  VideoQaReviewing: 'video_qa_reviewing_node',
  Editing: 'editing_node',
  EditingQaReviewing: 'editing_qa_reviewing_node',
};

// noop sink：仅用于把条件边汇成静态边出口，触达即透传，无副作用。
async function noopSinkNode() {
  return {};
}

// 短视频Graph
export function createShortVideoTaskGraph(
  taskRepository: TaskRepository,
  checkpointer: MongoDBSaver,
) {
  return new StateGraph(TaskGraphState)
    .addNode(TASK_GRAPH_NODE.ScriptGenerating, createScriptGeneratingNode(taskRepository))
    .addNode(TASK_GRAPH_NODE.StoryboardGenerating, createStoryboardGeneratingNode(taskRepository))
    .addNode(TASK_GRAPH_NODE.ImagePromptGenerating, createImagePromptGeneratingNode(taskRepository))
    .addNode(TASK_GRAPH_NODE.ImageGenerating, createImageGeneratingNode(taskRepository))
    .addNode(TASK_GRAPH_NODE.ImageQaReviewing, createImageQaReviewingNode(taskRepository))
    .addNode(TASK_GRAPH_NODE.SinkAfterImageQaPass, noopSinkNode)
    .addNode(TASK_GRAPH_NODE.VideoPromptGenerating, createVideoPromptGeneratingNode(taskRepository))
    .addNode(TASK_GRAPH_NODE.VideoGenerating, createVideoGeneratingNode(taskRepository))
    .addNode(TASK_GRAPH_NODE.VideoQaReviewing, createVideoQaReviewingNode(taskRepository))
    .addNode(TASK_GRAPH_NODE.Editing, createEditingNode(taskRepository))
    .addNode(TASK_GRAPH_NODE.EditingQaReviewing, createEditingQaReviewingNode(taskRepository))
    .addEdge(START, TASK_GRAPH_NODE.ScriptGenerating)
    .addEdge(TASK_GRAPH_NODE.ScriptGenerating, TASK_GRAPH_NODE.StoryboardGenerating)
    // Storyboard 完成后双链路并发：分镜图链路（prompt → 生图 → 质检）与分镜视频提示词生成同时启动。
    .addEdge(TASK_GRAPH_NODE.StoryboardGenerating, TASK_GRAPH_NODE.ImagePromptGenerating)
    .addEdge(TASK_GRAPH_NODE.StoryboardGenerating, TASK_GRAPH_NODE.VideoPromptGenerating)
    .addEdge(TASK_GRAPH_NODE.ImagePromptGenerating, TASK_GRAPH_NODE.ImageGenerating)
    .addEdge(TASK_GRAPH_NODE.ImageGenerating, TASK_GRAPH_NODE.ImageQaReviewing)
    // 分镜图质检：pass → 进入 Sink（再静态边汇入视频生成）；fail → 回溯到 image_generating。
    .addConditionalEdges(
      TASK_GRAPH_NODE.ImageQaReviewing,
      createQaConditionalRouter({
        taskRepository,
        qaStageName: 'image_qa_reviewing',
        resetStageNames: ['image_generating', 'image_qa_reviewing'],
      }),
      {
        pass: TASK_GRAPH_NODE.SinkAfterImageQaPass,
        fail: TASK_GRAPH_NODE.ImageGenerating,
      },
    )
    // Sink + VideoPromptGenerating 通过纯静态边数组语义汇入 VideoGenerating，
    // 只有数组中所有上游节点都到达后才会触发 VideoGenerating（真正的 AND-join）。
    .addEdge(
      [TASK_GRAPH_NODE.SinkAfterImageQaPass, TASK_GRAPH_NODE.VideoPromptGenerating],
      TASK_GRAPH_NODE.VideoGenerating,
    )
    .addEdge(TASK_GRAPH_NODE.VideoGenerating, TASK_GRAPH_NODE.VideoQaReviewing)
    // 分镜视频质检：pass → 进入混剪；fail → 回溯到 video_generating 重新生成分镜视频。
    .addConditionalEdges(
      TASK_GRAPH_NODE.VideoQaReviewing,
      createQaConditionalRouter({
        taskRepository,
        qaStageName: 'video_qa_reviewing',
        resetStageNames: ['video_generating', 'video_qa_reviewing'],
      }),
      {
        pass: TASK_GRAPH_NODE.Editing,
        fail: TASK_GRAPH_NODE.VideoGenerating,
      },
    )
    // 成片完成后再做一次整体质检。
    .addEdge(TASK_GRAPH_NODE.Editing, TASK_GRAPH_NODE.EditingQaReviewing)
    // 成片质检：pass → 结束；fail → 回溯到 editing 重做混剪。
    .addConditionalEdges(
      TASK_GRAPH_NODE.EditingQaReviewing,
      createQaConditionalRouter({
        taskRepository,
        qaStageName: 'editing_qa_reviewing',
        resetStageNames: ['editing', 'editing_qa_reviewing'],
      }),
      {
        pass: END,
        fail: TASK_GRAPH_NODE.Editing,
      },
    )
    .compile({ checkpointer });
}
