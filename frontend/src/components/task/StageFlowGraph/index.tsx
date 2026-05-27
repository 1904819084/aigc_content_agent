import {
  Background,
  ReactFlow,
  ReactFlowProvider,
  type EdgeTypes,
  type Edge,
  type Node,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Typography } from 'antd';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useEdgeRouting } from 'reactflow-edge-routing';
import { TASK_STAGE_TAG_COLOR_MAP, TaskStageStatus, TaskType } from '../../../constants/task';
import type { Task } from '../../../types';
import { getTaskStageLabel, getTaskStageStatusLabel } from '../../../utils/task';
import {
  getStageCanvasSize,
  getStageDependencies,
  getStageEdgeColor,
  getStageLayout,
  getStageNodeSize,
  getStageVisualStyle,
} from '../../../utils/stageFlow';
import { StatusIcon } from '../../common/StatusIcon';
import { StatusTag } from '../../common/StatusTag';
import { RoutedStageEdge } from './RoutedStageEdge';
import styles from './index.module.less';

const { Text } = Typography;
const EDGE_TYPES: EdgeTypes = {
  routed: RoutedStageEdge,
};
const STAGE_NODE_STYLE_CLASS_MAP = {
  success: styles.nodeSuccess,
  failure: styles.nodeFailure,
  pending: styles.nodePending,
  running: styles.nodeRunningTone,
} as const;

function buildStageFlowNodes(task: Task): Node[] {
  const stageNodeSize = getStageNodeSize();
  const taskType = task.brief?.taskType ?? TaskType.ShortVideo;

  return task.stages.map((stage, index) => ({
    id: stage.name,
    position: getStageLayout(taskType, stage.name),
    sourcePosition: getStageLayout(taskType, stage.name).sourcePosition,
    targetPosition: getStageLayout(taskType, stage.name).targetPosition,
    draggable: false,
    selectable: false,
    data: {
      label: (
        <div
          className={[
            styles.stageNodeContent,
            STAGE_NODE_STYLE_CLASS_MAP[getStageVisualStyle(stage.status).tone],
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
              {getTaskStageLabel(stage.name, taskType)}
            </Text>
            {stage.attempts > 0 ? (
              <span className={styles.stageRetryBadge} title="QA 失败回溯重试次数">
                重试 {stage.attempts}
              </span>
            ) : null}
          </div>
        </div>
      ),
    },
    style: {
      width: stageNodeSize.width,
      minHeight: stageNodeSize.height,
      padding: 0,
      borderRadius: 24,
      border: `1px solid ${getStageVisualStyle(stage.status).softStroke}`,
      boxShadow: getStageVisualStyle(stage.status).shadow,
      background: getStageVisualStyle(stage.status).background,
    },
  }));
}

function buildStageFlowEdges(task: Task): Edge[] {
  const stageMap = new Map(task.stages.map((stage) => [stage.name, stage]));
  const taskType = task.brief?.taskType ?? TaskType.ShortVideo;

  return getStageDependencies(taskType).flatMap(([sourceStageName, targetStageName]) => {
    const sourceStage = stageMap.get(sourceStageName);
    const targetStage = stageMap.get(targetStageName);

    if (!sourceStage || !targetStage) {
      return [];
    }

    const sourceLayout = getStageLayout(taskType, sourceStageName);
    const targetLayout = getStageLayout(taskType, targetStageName);
    const edgeColor = getStageEdgeColor(sourceStage.status, targetStage.status);
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
  const canvasSize = getStageCanvasSize(task);
  const nodes = useMemo(() => buildStageFlowNodes(task), [task]);
  const edges = useMemo(() => buildStageFlowEdges(task), [task]);
  const canvasRef = useRef<HTMLDivElement | null>(null);
  const [hasOverflow, setHasOverflow] = useState(false);

  useEffect(() => {
    const canvasEl = canvasRef.current;
    if (!canvasEl) {
      return;
    }
    const updateOverflow = () => {
      setHasOverflow(canvasEl.scrollWidth - canvasEl.clientWidth > 1);
    };
    updateOverflow();
    const observer = new ResizeObserver(updateOverflow);
    observer.observe(canvasEl);
    return () => observer.disconnect();
  }, [canvasSize.width]);

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
            Agent 运行流程
          </Text>
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
        {hasOverflow ? (
          <div className={styles.flowViewportHint}>左右滚动查看完整流程</div>
        ) : null}
        <div className={styles.flowCanvas} ref={canvasRef}>
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
