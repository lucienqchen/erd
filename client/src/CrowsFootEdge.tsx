import React from 'react';
import { BaseEdge, EdgeLabelRenderer, EdgeProps, Position, getSmoothStepPath } from 'reactflow';

const pathColor = '#000000';

const CrowsFootEdge: React.FC<EdgeProps> = ({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  data,
}) => {
  const [edgePath] = getSmoothStepPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
    borderRadius: 0,
  });

  const relationType = data?.type || 'one-to-many';

  // Determine marker orientation based on source/target position (pointing away from table)
  const getMarkerRotation = (position?: Position) => {
    switch (position) {
      case Position.Right:
        return 0; // point to the right
      case Position.Left:
        return 180; // point to the left
      case Position.Bottom:
        return 90; // point down
      case Position.Top:
        return -90; // point up
      default:
        return 0;
    }
  };

  const sourceRotation = getMarkerRotation(sourcePosition);
  const targetRotation = getMarkerRotation(targetPosition);

  // Compute a point offset away from a node edge so the symbol won't be covered
  const pointAway = (x: number, y: number, position: Position | undefined, distance: number) => {
    switch (position) {
      case Position.Right:
        return { x: x + distance, y };
      case Position.Left:
        return { x: x - distance, y };
      case Position.Top:
        return { x, y: y - distance };
      case Position.Bottom:
        return { x, y: y + distance };
      default:
        return { x, y };
    }
  };

  // Map relationship type to source/target end markers
  type EndKind = 'one' | 'many' | 'zero-or-one' | 'zero-or-many' | 'one-or-more' | 'one-and-only-one';
  const splitRelation = (t: string): { source: EndKind; target: EndKind } => {
    switch (t) {
      case 'one-to-one':
        return { source: 'one', target: 'one' };
      case 'one-to-many':
        return { source: 'one', target: 'many' };
      case 'many-to-many':
        return { source: 'many', target: 'many' };
      case 'zero-or-one':
        return { source: 'one', target: 'zero-or-one' };
      case 'zero-or-many':
        return { source: 'one', target: 'zero-or-many' };
      case 'one-or-more':
        return { source: 'one', target: 'one-or-more' };
      case 'one-and-only-one':
        return { source: 'one', target: 'one-and-only-one' };
      case 'many':
        return { source: 'one', target: 'many' };
      default:
        return { source: 'one', target: 'many' };
    }
  };
  const { source: sourceKind, target: targetKind } = splitRelation(relationType);

  // Source-side symbol SVG (drawn pointing to +X, we rotate container)
  const SourceSymbol = ({ kind }: { kind: EndKind }) => (
    <svg width={36} height={24} viewBox="0 0 36 24" style={{ overflow: 'visible' }}>
      {kind === 'one' && (
        <line x1={20} y1={4} x2={20} y2={22} stroke={pathColor} strokeWidth={2} />
      )}
      {kind === 'many' && (
        <>
          <line x1={10} y1={12} x2={22} y2={4} stroke={pathColor} strokeWidth={2} />
          <line x1={10} y1={12} x2={22} y2={12} stroke={pathColor} strokeWidth={2} />
          <line x1={10} y1={12} x2={22} y2={20} stroke={pathColor} strokeWidth={2} />
        </>
      )}
      {kind === 'zero-or-one' && (
        <>
          <circle cx={20} cy={12} r={5} fill="none" stroke={pathColor} strokeWidth={2} />
          <line x1={10} y1={4} x2={10} y2={20} stroke={pathColor} strokeWidth={2} />
        </>
      )}
      {kind === 'zero-or-many' && (
        <>
          <circle cx={26} cy={12} r={5} fill="none" stroke={pathColor} strokeWidth={2} />
          <line x1={10} y1={12} x2={22} y2={4} stroke={pathColor} strokeWidth={2} />
          <line x1={10} y1={12} x2={22} y2={12} stroke={pathColor} strokeWidth={2} />
          <line x1={10} y1={12} x2={22} y2={20} stroke={pathColor} strokeWidth={2} />
        </>
      )}
      {kind === 'one-or-more' && (
        <>
          <line x1={22} y1={4} x2={22} y2={20} stroke={pathColor} strokeWidth={2} />
          <line x1={10} y1={12} x2={22} y2={4} stroke={pathColor} strokeWidth={2} />
          <line x1={10} y1={12} x2={22} y2={12} stroke={pathColor} strokeWidth={2} />
          <line x1={10} y1={12} x2={22} y2={20} stroke={pathColor} strokeWidth={2} />
        </>
      )}
      {kind === 'one-and-only-one' && (
        <>
          <line x1={10} y1={4} x2={10} y2={20} stroke={pathColor} strokeWidth={2} />
          <line x1={14} y1={4} x2={14} y2={20} stroke={pathColor} strokeWidth={2} />
        </>
      )}
    </svg>
  );

  // Target-side symbol SVG (same shapes, rotated to point away from target)
  const TargetSymbol = ({ kind }: { kind: EndKind }) => (
    <svg width={36} height={24} viewBox="0 0 36 24" style={{ overflow: 'visible' }}>
      {kind === 'one' && (
        <line x1={12} y1={4} x2={12} y2={20} stroke={pathColor} strokeWidth={2} />
      )}
      {kind === 'many' && (
        <>
          <line x1={11} y1={4} x2={22} y2={13} stroke={pathColor} strokeWidth={2} />
          <line x1={11} y1={24} x2={22} y2={14} stroke={pathColor} strokeWidth={2} />
        </>
      )}
      {kind === 'zero-or-one' && (
        <>
          <circle cx={20} cy={12} r={5} fill="none" stroke={pathColor} strokeWidth={2} />
          <line x1={10} y1={4} x2={10} y2={20} stroke={pathColor} strokeWidth={2} />
        </>
      )}
      {kind === 'zero-or-many' && (
        <>
          <circle cx={26} cy={12} r={5} fill="none" stroke={pathColor} strokeWidth={2} />
          <line x1={10} y1={12} x2={22} y2={4} stroke={pathColor} strokeWidth={2} />
          <line x1={10} y1={12} x2={22} y2={12} stroke={pathColor} strokeWidth={2} />
          <line x1={10} y1={12} x2={22} y2={20} stroke={pathColor} strokeWidth={2} />
        </>
      )}
      {kind === 'one-or-more' && (
        <>
          <line x1={22} y1={4} x2={22} y2={20} stroke={pathColor} strokeWidth={2} />
          <line x1={10} y1={12} x2={22} y2={4} stroke={pathColor} strokeWidth={2} />
          <line x1={10} y1={12} x2={22} y2={12} stroke={pathColor} strokeWidth={2} />
          <line x1={10} y1={12} x2={22} y2={20} stroke={pathColor} strokeWidth={2} />
        </>
      )}
      {kind === 'one-and-only-one' && (
        <>
          <line x1={10} y1={4} x2={10} y2={20} stroke={pathColor} strokeWidth={2} />
          <line x1={14} y1={4} x2={14} y2={20} stroke={pathColor} strokeWidth={2} />
        </>
      )}
    </svg>
  );

  const sourceOffset = 3;
  const targetOffset = 3;
  const sPoint = pointAway(sourceX, sourceY, sourcePosition, sourceOffset);
  const tPoint = pointAway(targetX, targetY, targetPosition, targetOffset);

  return (
    <>
      <BaseEdge id={id} path={edgePath} style={style} />

      {/* Render symbols ABOVE nodes to avoid being covered */}
      <EdgeLabelRenderer>
        <div
          style={{
            position: 'absolute',
            transform: `translate(-50%, -50%) translate(${sPoint.x}px, ${sPoint.y}px) rotate(${sourceRotation}deg)`,
            pointerEvents: 'none',
          }}
        >
          <SourceSymbol kind={sourceKind} />
        </div>

        <div
          style={{
            position: 'absolute',
            transform: `translate(-50%, -50%) translate(${tPoint.x}px, ${tPoint.y}px) rotate(${targetRotation}deg)`,
            pointerEvents: 'none',
          }}
        >
          <TargetSymbol kind={targetKind} />
        </div>
      </EdgeLabelRenderer>
    </>
  );
};

export default CrowsFootEdge;
