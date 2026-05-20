import {
  Background,
  MarkerType,
  Position,
  ReactFlow,
  ReactFlowProvider,
  type Edge,
  type Node,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Typography } from 'antd';
import { TASK_STAGE_TAG_COLOR_MAP, TaskStageStatus } from '../../../constants/task';
import type { Task } from '../../../types';
import { getTaskStageLabel, getTaskStageStatusLabel } from '../../../utils/task';
import { StatusTag } from '../../common/StatusTag';
import styles from './index.module.less';

const { Text } = Typography;

const STAGE_NODE_WIDTH = 192;
const STAGE_NODE_HEIGHT = 110;
const STAGE_NODE_GAP_X = 46;
const STAGE_NODE_GAP_Y = 86;
const STAGE_ROW_COUNT = 2;
const STAGE_COLUMNS_PER_ROW = 4;
const STAGE_CANVAS_PADDING_X = 28;
const STAGE_CANVAS_PADDING_Y = 26;
const STAGE_NODE_X_STEP = STAGE_NODE_WIDTH + STAGE_NODE_GAP_X;
const STAGE_NODE_Y_STEP = STAGE_NODE_HEIGHT + STAGE_NODE_GAP_Y;

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

function getStagePosition(index: number) {
  const row = Math.floor(index / STAGE_COLUMNS_PER_ROW);
  const rawColumn = index % STAGE_COLUMNS_PER_ROW;
  const column = row % STAGE_ROW_COUNT === 0 ? rawColumn : STAGE_COLUMNS_PER_ROW - 1 - rawColumn;

  return {
    x: STAGE_CANVAS_PADDING_X + column * STAGE_NODE_X_STEP,
    y: STAGE_CANVAS_PADDING_Y + row * STAGE_NODE_Y_STEP,
    row,
    column,
  };
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

function buildStageFlowNodes(task: Task): Node[] {
  return task.stages.map((stage, index) => ({
    id: stage.name,
    position: getStagePosition(index),
    sourcePosition:
      getStagePosition(index).row % STAGE_ROW_COUNT === 0 ? Position.Right : Position.Left,
    targetPosition:
      getStagePosition(index).row % STAGE_ROW_COUNT === 0 ? Position.Left : Position.Right,
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
          </div>
          <div className={styles.stageNodeBody}>
            <div className={styles.stageStatusMeta}>
              <StatusTag
                status={stage.status}
                color={TASK_STAGE_TAG_COLOR_MAP[stage.status]}
                className={styles.stageStatusTag}
              >
                {getTaskStageStatusLabel(stage.status)}
              </StatusTag>
            </div>
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
  return task.stages.slice(0, -1).map((stage, index) => {
    const nextStage = task.stages[index + 1];
    const currentPosition = getStagePosition(index);
    const nextPosition = getStagePosition(index + 1);
    const edgeColor = getEdgeColor(stage.status, nextStage.status);
    const isVerticalTurn =
      currentPosition.row !== nextPosition.row && currentPosition.column === nextPosition.column;

    return {
      id: `${stage.name}-${nextStage.name}`,
      source: stage.name,
      target: nextStage.name,
      type: 'smoothstep',
      sourcePosition:
        currentPosition.row % STAGE_ROW_COUNT === 0 ? Position.Right : Position.Left,
      targetPosition:
        nextPosition.row % STAGE_ROW_COUNT === 0 ? Position.Left : Position.Right,
      animated: stage.status === TaskStageStatus.Running || nextStage.status === TaskStageStatus.Running,
      pathOptions: {
        borderRadius: 18,
        offset: isVerticalTurn ? 22 : 26,
      },
      markerEnd: {
        type: MarkerType.ArrowClosed,
        width: 16,
        height: 16,
        color: edgeColor,
      },
      style: {
        strokeWidth: 2.5,
        stroke: edgeColor,
        strokeDasharray:
          stage.status === TaskStageStatus.Pending || nextStage.status === TaskStageStatus.Pending
            ? '6 6'
            : undefined,
      },
    };
  });
}

interface StageFlowGraphProps {
  task: Task;
}

export function StageFlowGraph(props: StageFlowGraphProps) {
  const { task } = props;
  const rowCount = Math.ceil(task.stages.length / STAGE_COLUMNS_PER_ROW);
  const canvasHeight = STAGE_CANVAS_PADDING_Y * 2 + rowCount * STAGE_NODE_HEIGHT + Math.max(rowCount - 1, 0) * STAGE_NODE_GAP_Y;

  return (
    <div className={styles.flowWrap}>
      <div className={styles.flowHeader}>
        <div>
          <Text strong className={styles.flowTitle}>
            Agent Pipeline
          </Text>
          <Text className={styles.flowDescription}>按阶段串联生成内容，颜色直接表达执行结果</Text>
        </div>
        <div className={styles.legend}>
          <span className={styles.legendItem}>
            <span className={[styles.legendDot, styles.legendSuccess].join(' ')} />
            成功
          </span>
          <span className={styles.legendItem}>
            <span className={[styles.legendDot, styles.legendFailure].join(' ')} />
            失败
          </span>
          <span className={styles.legendItem}>
            <span className={[styles.legendDot, styles.legendPending].join(' ')} />
            未开始 / 执行中
          </span>
        </div>
      </div>

      <div className={styles.flowCanvas} style={{ height: canvasHeight + 12 }}>
        <ReactFlowProvider>
          <ReactFlow
            nodes={buildStageFlowNodes(task)}
            edges={buildStageFlowEdges(task)}
            fitView
            fitViewOptions={{ padding: 0.08, minZoom: 0.92, maxZoom: 1 }}
            minZoom={0.92}
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
  );
}
