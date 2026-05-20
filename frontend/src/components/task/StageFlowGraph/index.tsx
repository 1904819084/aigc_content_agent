import {
  Background,
  Position,
  ReactFlow,
  ReactFlowProvider,
  type EdgeTypes,
  type Edge,
  type Node,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Typography } from 'antd';
import { useMemo } from 'react';
import { useEdgeRouting } from 'reactflow-edge-routing';
import { TASK_STAGE_TAG_COLOR_MAP, TaskStageName, TaskStageStatus } from '../../../constants/task';
import type { Task } from '../../../types';
import { getTaskStageLabel, getTaskStageStatusLabel } from '../../../utils/task';
import { StatusIcon } from '../../common/StatusIcon';
import { StatusTag } from '../../common/StatusTag';
import { RoutedStageEdge } from './RoutedStageEdge';
import styles from './index.module.less';

const { Text } = Typography;
const EDGE_TYPES: EdgeTypes = {
  routed: RoutedStageEdge,
};

const STAGE_NODE_WIDTH = 164;
const STAGE_NODE_HEIGHT = 88;
const STAGE_NODE_GAP_X = 26;
const STAGE_NODE_GAP_Y = 68;
const STAGE_CANVAS_PADDING_X = 12;
const STAGE_CANVAS_PADDING_Y = 26;
const STAGE_NODE_X_STEP = STAGE_NODE_WIDTH + STAGE_NODE_GAP_X;
const STAGE_NODE_Y_STEP = STAGE_NODE_HEIGHT + STAGE_NODE_GAP_Y;
const STAGE_CANVAS_EXTRA_RIGHT = 72;

type StageLayout = {
  x: number;
  y: number;
  sourcePosition: Position;
  targetPosition: Position;
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

const STAGE_FLOW_DEPENDENCIES: Array<[TaskStageName, TaskStageName]> = [
  [TaskStageName.ScriptGenerating, TaskStageName.StoryboardGenerating],
  [TaskStageName.StoryboardGenerating, TaskStageName.ImagePromptGenerating],
  [TaskStageName.StoryboardGenerating, TaskStageName.VideoPromptGenerating],
  [TaskStageName.ImagePromptGenerating, TaskStageName.ImageGenerating],
  [TaskStageName.ImageGenerating, TaskStageName.VideoGenerating],
  [TaskStageName.VideoPromptGenerating, TaskStageName.VideoGenerating],
  [TaskStageName.VideoGenerating, TaskStageName.Editing],
  [TaskStageName.Editing, TaskStageName.QaReviewing],
];

function getStageColor(status: TaskStageStatus) {
  if (status === TaskStageStatus.Completed) {
    return {
      stroke: '#16a34a',
      softStroke: 'rgba(22, 163, 74, 0.2)',
      background: 'linear-gradient(180deg, rgba(240, 253, 244, 0.96) 0%, rgba(220, 252, 231, 0.84) 100%)',
      shadow: '0 18px 36px rgba(34, 197, 94, 0.12)',
      cardClassName: styles.nodeSuccess,
    };
  }

  if (status === TaskStageStatus.Failed) {
    return {
      stroke: '#dc2626',
      softStroke: 'rgba(220, 38, 38, 0.2)',
      background: 'linear-gradient(180deg, rgba(254, 242, 242, 0.98) 0%, rgba(254, 226, 226, 0.86) 100%)',
      shadow: '0 18px 36px rgba(239, 68, 68, 0.12)',
      cardClassName: styles.nodeFailure,
    };
  }

  return {
    stroke: '#94a3b8',
    softStroke: 'rgba(148, 163, 184, 0.22)',
    background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.98) 0%, rgba(241, 245, 249, 0.92) 100%)',
    shadow: '0 14px 30px rgba(148, 163, 184, 0.12)',
    cardClassName: styles.nodePending,
  };
}

function getStageLayout(stageName: TaskStageName): StageLayout {
  return STAGE_LAYOUT_MAP[stageName];
}

function getEdgeColor(sourceStatus: TaskStageStatus, targetStatus: TaskStageStatus) {
  if (sourceStatus === TaskStageStatus.Failed || targetStatus === TaskStageStatus.Failed) {
    return '#dc2626';
  }

  if (sourceStatus === TaskStageStatus.Completed && targetStatus === TaskStageStatus.Completed) {
    return '#16a34a';
  }

  return '#94a3b8';
}

function getCanvasSize(task: Task) {
  const layouts = task.stages.map((stage) => getStageLayout(stage.name));
  const maxX = Math.max(...layouts.map((layout) => layout.x), STAGE_CANVAS_PADDING_X);
  const maxY = Math.max(...layouts.map((layout) => layout.y), STAGE_CANVAS_PADDING_Y);

  return {
    width: maxX + STAGE_NODE_WIDTH + STAGE_CANVAS_PADDING_X + STAGE_CANVAS_EXTRA_RIGHT,
    height: maxY + STAGE_NODE_HEIGHT + STAGE_CANVAS_PADDING_Y,
  };
}

function buildStageFlowNodes(task: Task): Node[] {
  return task.stages.map((stage, index) => ({
    id: stage.name,
    position: getStageLayout(stage.name),
    sourcePosition: getStageLayout(stage.name).sourcePosition,
    targetPosition: getStageLayout(stage.name).targetPosition,
    draggable: false,
    selectable: false,
    data: {
      label: (
        <div
          className={[
            styles.stageNodeContent,
            getStageColor(stage.status).cardClassName,
            stage.status === TaskStageStatus.Running ? styles.nodeRunning : '',
          ].join(' ')}
        >
          <div className={styles.stageNodeHeader}>
            <span className={styles.stageIndex}>0{index + 1}</span>
            <StatusTag
              status={stage.status}
              color={TASK_STAGE_TAG_COLOR_MAP[stage.status]}
              className={styles.stageStatusTag}
            >
              {getTaskStageStatusLabel(stage.status)}
            </StatusTag>
          </div>
          <div className={styles.stageNodeBody}>
            <Text strong className={styles.stageNodeTitle}>
              {getTaskStageLabel(stage.name)}
            </Text>
          </div>
        </div>
      ),
    },
    style: {
      width: STAGE_NODE_WIDTH,
      minHeight: STAGE_NODE_HEIGHT,
      padding: 0,
      borderRadius: 24,
      border: `1px solid ${getStageColor(stage.status).softStroke}`,
      boxShadow: getStageColor(stage.status).shadow,
      background: getStageColor(stage.status).background,
    },
  }));
}

function buildStageFlowEdges(task: Task): Edge[] {
  const stageMap = new Map(task.stages.map((stage) => [stage.name, stage]));

  return STAGE_FLOW_DEPENDENCIES.flatMap(([sourceStageName, targetStageName]) => {
    const sourceStage = stageMap.get(sourceStageName);
    const targetStage = stageMap.get(targetStageName);

    if (!sourceStage || !targetStage) {
      return [];
    }

    const sourceLayout = getStageLayout(sourceStageName);
    const targetLayout = getStageLayout(targetStageName);
    const edgeColor = getEdgeColor(sourceStage.status, targetStage.status);
    return {
      id: `${sourceStageName}-${targetStageName}`,
      source: sourceStageName,
      target: targetStageName,
      type: 'routed',
      sourcePosition: sourceLayout.sourcePosition,
      targetPosition: targetLayout.targetPosition,
      animated:
        sourceStage.status === TaskStageStatus.Running || targetStage.status === TaskStageStatus.Running,
      style: {
        strokeWidth: 2.25,
        stroke: edgeColor,
        strokeDasharray: '6 6',
        opacity:
          sourceStage.status === TaskStageStatus.Pending || targetStage.status === TaskStageStatus.Pending
            ? 0.78
            : 1,
      },
    };
  });
}

interface StageFlowGraphProps {
  task: Task;
}

export function StageFlowGraph(props: StageFlowGraphProps) {
  const { task } = props;
  const canvasSize = getCanvasSize(task);
  const nodes = useMemo(() => buildStageFlowNodes(task), [task]);
  const edges = useMemo(() => buildStageFlowEdges(task), [task]);

  useEdgeRouting(nodes, edges, {
    connectorType: 'bezier',
    autoBestSideConnection: true,
    shouldSplitEdgesNearHandle: true,
    edgeToNodeSpacing: 14,
    edgeToEdgeSpacing: 6,
    stubSize: 12,
    edgeRounding: 20,
    routeOnlyWhenBlocked: false,
  });

  return (
    <div className={styles.flowWrap}>
      <div className={styles.flowHeader}>
        <div>
          <Text strong className={styles.flowTitle}>
            Agent Pipeline
          </Text>
          <Text className={styles.flowDescription}>按 DAG 依赖展示并发分叉与汇合，支持横向滚动查看完整链路</Text>
        </div>
        <div className={styles.legend}>
          <span className={styles.legendItem}>
            <StatusIcon status={TaskStageStatus.Completed} className={styles.legendIcon} />
            成功
          </span>
          <span className={styles.legendItem}>
            <StatusIcon status={TaskStageStatus.Failed} className={styles.legendIcon} />
            失败
          </span>
          <span className={styles.legendItem}>
            <StatusIcon status={TaskStageStatus.Pending} className={styles.legendIcon} />
            未开始
          </span>
          <span className={styles.legendItem}>
            <StatusIcon status={TaskStageStatus.Running} className={styles.legendIcon} />
            执行中
          </span>
        </div>
      </div>

      <div className={styles.flowViewport}>
        <div className={styles.flowViewportHint}>左右滚动查看完整流程</div>
        <div className={styles.flowCanvas}>
          <div
            className={styles.flowCanvasInner}
            style={{ width: canvasSize.width, height: canvasSize.height + 12 }}
          >
            <ReactFlowProvider>
              <ReactFlow
                nodes={nodes}
                edges={edges}
                edgeTypes={EDGE_TYPES}
                minZoom={1}
                maxZoom={1}
                defaultViewport={{ x: 0, y: 0, zoom: 1 }}
                nodesDraggable={false}
                nodesConnectable={false}
                elementsSelectable={false}
                zoomOnScroll={false}
                zoomOnPinch={false}
                panOnDrag={false}
                panOnScroll={false}
                preventScrolling={false}
                proOptions={{ hideAttribution: true }}
                className={styles.stageFlow}
              >
                <Background color="rgba(148, 163, 184, 0.12)" gap={24} size={1} />
              </ReactFlow>
            </ReactFlowProvider>
          </div>
        </div>
      </div>
    </div>
  );
}
