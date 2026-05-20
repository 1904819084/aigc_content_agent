import { BaseEdge, type Edge, type EdgeProps } from '@xyflow/react';
import { useRoutedEdgePath } from 'reactflow-edge-routing';

type RoutedStageEdgeType = Edge<Record<string, never>, 'routed'>;

export function RoutedStageEdge({
  id,
  source,
  target,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  markerStart,
  style,
}: EdgeProps<RoutedStageEdgeType>) {
  const [edgePath, labelX, labelY] = useRoutedEdgePath({
    id,
    source,
    target,
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
    connectorType: 'bezier',
  });

  return (
    <BaseEdge
      id={id}
      path={edgePath}
      labelX={labelX}
      labelY={labelY}
      markerStart={markerStart}
      style={style}
    />
  );
}
