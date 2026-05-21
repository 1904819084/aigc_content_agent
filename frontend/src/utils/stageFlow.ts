import { Position } from '@xyflow/react';
import { TaskStageName, TaskStageStatus } from '../constants/task';
import type { Task } from '../types';

const STAGE_NODE_WIDTH = 156;
const STAGE_NODE_HEIGHT = 82;
const STAGE_NODE_GAP_X = 62;
const STAGE_NODE_GAP_Y = 102;
const STAGE_CANVAS_PADDING_X = 20;
const STAGE_CANVAS_PADDING_Y = 30;
const STAGE_NODE_X_STEP = STAGE_NODE_WIDTH + STAGE_NODE_GAP_X;
const STAGE_NODE_Y_STEP = STAGE_NODE_HEIGHT + STAGE_NODE_GAP_Y;
const STAGE_CANVAS_EXTRA_RIGHT = 92;

export type StageLayout = {
  x: number;
  y: number;
  sourcePosition: Position;
  targetPosition: Position;
};

export type StageVisualTone = 'success' | 'failure' | 'pending' | 'running';

export type StageVisualStyle = {
  stroke: string;
  softStroke: string;
  background: string;
  shadow: string;
  tone: StageVisualTone;
};

const STAGE_LAYOUT_MAP: Record<TaskStageName, StageLayout> = {
  [TaskStageName.ScriptGenerating]: {
    x: STAGE_CANVAS_PADDING_X,
    y: STAGE_CANVAS_PADDING_Y + STAGE_NODE_Y_STEP,
    sourcePosition: Position.Right,
    targetPosition: Position.Left,
  },
  [TaskStageName.StoryboardGenerating]: {
    x: STAGE_CANVAS_PADDING_X + STAGE_NODE_X_STEP,
    y: STAGE_CANVAS_PADDING_Y + STAGE_NODE_Y_STEP,
    sourcePosition: Position.Right,
    targetPosition: Position.Left,
  },
  [TaskStageName.ImagePromptGenerating]: {
    x: STAGE_CANVAS_PADDING_X + STAGE_NODE_X_STEP * 2,
    y: STAGE_CANVAS_PADDING_Y,
    sourcePosition: Position.Right,
    targetPosition: Position.Left,
  },
  [TaskStageName.ImageGenerating]: {
    x: STAGE_CANVAS_PADDING_X + STAGE_NODE_X_STEP * 3,
    y: STAGE_CANVAS_PADDING_Y,
    sourcePosition: Position.Right,
    targetPosition: Position.Left,
  },
  [TaskStageName.VideoPromptGenerating]: {
    x: STAGE_CANVAS_PADDING_X + STAGE_NODE_X_STEP * 2,
    y: STAGE_CANVAS_PADDING_Y + STAGE_NODE_Y_STEP * 2,
    sourcePosition: Position.Right,
    targetPosition: Position.Left,
  },
  [TaskStageName.VideoGenerating]: {
    x: STAGE_CANVAS_PADDING_X + STAGE_NODE_X_STEP * 4,
    y: STAGE_CANVAS_PADDING_Y + STAGE_NODE_Y_STEP,
    sourcePosition: Position.Right,
    targetPosition: Position.Left,
  },
  [TaskStageName.Editing]: {
    x: STAGE_CANVAS_PADDING_X + STAGE_NODE_X_STEP * 5,
    y: STAGE_CANVAS_PADDING_Y + STAGE_NODE_Y_STEP,
    sourcePosition: Position.Right,
    targetPosition: Position.Left,
  },
  [TaskStageName.QaReviewing]: {
    x: STAGE_CANVAS_PADDING_X + STAGE_NODE_X_STEP * 6,
    y: STAGE_CANVAS_PADDING_Y + STAGE_NODE_Y_STEP,
    sourcePosition: Position.Right,
    targetPosition: Position.Left,
  },
};

export const STAGE_FLOW_DEPENDENCIES: Array<[TaskStageName, TaskStageName]> = [
  [TaskStageName.ScriptGenerating, TaskStageName.StoryboardGenerating],
  [TaskStageName.StoryboardGenerating, TaskStageName.ImagePromptGenerating],
  [TaskStageName.StoryboardGenerating, TaskStageName.VideoPromptGenerating],
  [TaskStageName.ImagePromptGenerating, TaskStageName.ImageGenerating],
  [TaskStageName.ImageGenerating, TaskStageName.VideoGenerating],
  [TaskStageName.VideoPromptGenerating, TaskStageName.VideoGenerating],
  [TaskStageName.VideoGenerating, TaskStageName.Editing],
  [TaskStageName.Editing, TaskStageName.QaReviewing],
];

export function getStageLayout(stageName: TaskStageName): StageLayout {
  return STAGE_LAYOUT_MAP[stageName];
}

export function getStageVisualStyle(status: TaskStageStatus): StageVisualStyle {
  if (status === TaskStageStatus.Completed) {
    return {
      stroke: '#16a34a',
      softStroke: 'rgba(34, 197, 94, 0.72)',
      background: 'linear-gradient(180deg, rgba(240, 253, 244, 1) 0%, rgba(220, 252, 231, 0.98) 58%, rgba(187, 247, 208, 0.94) 100%)',
      shadow: '0 18px 38px rgba(34, 197, 94, 0.18)',
      tone: 'success',
    };
  }

  if (status === TaskStageStatus.Failed) {
    return {
      stroke: '#dc2626',
      softStroke: 'rgba(239, 68, 68, 0.72)',
      background: 'linear-gradient(180deg, rgba(254, 242, 242, 1) 0%, rgba(254, 226, 226, 0.98) 58%, rgba(254, 202, 202, 0.92) 100%)',
      shadow: '0 18px 38px rgba(239, 68, 68, 0.18)',
      tone: 'failure',
    };
  }

  if (status === TaskStageStatus.Running) {
    return {
      stroke: '#f59e0b',
      softStroke: 'rgba(245, 158, 11, 0.72)',
      background: 'linear-gradient(180deg, rgba(255, 251, 235, 1) 0%, rgba(254, 243, 199, 0.98) 58%, rgba(253, 230, 138, 0.92) 100%)',
      shadow: '0 18px 38px rgba(245, 158, 11, 0.2)',
      tone: 'running',
    };
  }

  return {
    stroke: '#94a3b8',
    softStroke: 'rgba(148, 163, 184, 0.54)',
    background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.99) 0%, rgba(248, 250, 252, 0.98) 55%, rgba(226, 232, 240, 0.94) 100%)',
    shadow: '0 14px 32px rgba(148, 163, 184, 0.16)',
    tone: 'pending',
  };
}

export function getStageEdgeColor(sourceStatus: TaskStageStatus, targetStatus: TaskStageStatus) {
  if (sourceStatus === TaskStageStatus.Failed || targetStatus === TaskStageStatus.Failed) {
    return '#dc2626';
  }

  if (sourceStatus === TaskStageStatus.Running || targetStatus === TaskStageStatus.Running) {
    return '#f59e0b';
  }

  if (sourceStatus === TaskStageStatus.Completed && targetStatus === TaskStageStatus.Completed) {
    return '#16a34a';
  }

  return '#94a3b8';
}

export function getStageCanvasSize(task: Task) {
  const layouts = task.stages.map((stage) => getStageLayout(stage.name));
  const maxX = Math.max(...layouts.map((layout) => layout.x), STAGE_CANVAS_PADDING_X);
  const maxY = Math.max(...layouts.map((layout) => layout.y), STAGE_CANVAS_PADDING_Y);

  return {
    width: maxX + STAGE_NODE_WIDTH + STAGE_CANVAS_PADDING_X + STAGE_CANVAS_EXTRA_RIGHT,
    height: maxY + STAGE_NODE_HEIGHT + STAGE_CANVAS_PADDING_Y,
  };
}

export function getStageNodeSize() {
  return {
    width: STAGE_NODE_WIDTH,
    height: STAGE_NODE_HEIGHT,
  };
}
