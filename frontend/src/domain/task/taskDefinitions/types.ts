import { Position } from '@xyflow/react';
import { TaskStageName, TaskType } from '../../../constants/task';
import type { StageLayout } from '../../../utils/stageFlow';

/**
 * 单个阶段的前端定义：把「阶段名 + 任务文案 + 流程图坐标」绑成单一事实源，
 * 替代分散在 stageFlow.ts / constants/task.ts / utils/task.ts 的三处维护。
 */
export type FrontendStageDefinition = {
  name: TaskStageName;
  /** 任务详情、流程图节点上展示的中文 label */
  label: string;
  /** 流程图坐标。用 (col, row) 网格位置抽象，由布局工具换算成像素。 */
  layout: { col: number; row: number };
};

/**
 * 任务定义：声明阶段顺序、依赖图与每个阶段的网格位置。
 */
export type FrontendTaskDefinition = {
  taskType: TaskType;
  stages: FrontendStageDefinition[];
  /** 阶段间依赖（[from, to]），驱动 ReactFlow 边的渲染与 AND-join 视觉。 */
  dependencies: Array<[TaskStageName, TaskStageName]>;
};

/**
 * 把 (col, row) 网格位置换算成像素坐标。layout 常量与原 stageFlow.ts 对齐。
 */
const STAGE_NODE_WIDTH = 156;
const STAGE_NODE_HEIGHT = 82;
const STAGE_NODE_GAP_X = 62;
const STAGE_NODE_GAP_Y = 102;
const STAGE_CANVAS_PADDING_X = 20;
const STAGE_CANVAS_PADDING_Y = 30;

const STAGE_NODE_X_STEP = STAGE_NODE_WIDTH + STAGE_NODE_GAP_X;
const STAGE_NODE_Y_STEP = STAGE_NODE_HEIGHT + STAGE_NODE_GAP_Y;

export function gridToStageLayout(col: number, row: number): StageLayout {
  return {
    x: STAGE_CANVAS_PADDING_X + STAGE_NODE_X_STEP * col,
    y: STAGE_CANVAS_PADDING_Y + STAGE_NODE_Y_STEP * row,
    sourcePosition: Position.Right,
    targetPosition: Position.Left,
  };
}
