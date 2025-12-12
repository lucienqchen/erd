import { memo, type FC } from 'react';
import {
    BaseEdge,
    EdgeLabelRenderer,
    getBezierPath,
    type EdgeProps,
    type Edge,
} from '@xyflow/react';
import './CrowsFootEdge.css';

// Cardinality types for Crow's Foot notation
export type Cardinality = 'zero-or-one' | 'one' | 'zero-or-many' | 'one-or-many';

export type CrowsFootEdgeData = {
    sourceCardinality: Cardinality;
    targetCardinality: Cardinality;
    label?: string;
    [key: string]: unknown;
};

export type CrowsFootEdgeType = Edge<CrowsFootEdgeData, 'crowsFootEdge'>;

interface MarkerProps {
    x: number;
    y: number;
    angle: number;
    cardinality: Cardinality;
    position: 'source' | 'target';
}

// Renders the Crow's Foot notation markers
const CrowsFootMarker: FC<MarkerProps> = ({ x, y, angle, cardinality, position }) => {
    // Offset from the edge endpoint
    const offset = position === 'source' ? 15 : -15;
    const secondOffset = position === 'source' ? 25 : -25;
    
    // Convert angle to radians for calculations
    const rad = (angle * Math.PI) / 180;
    
    // Calculate marker positions along the edge
    const markerX1 = x + offset * Math.cos(rad);
    const markerY1 = y + offset * Math.sin(rad);
    const markerX2 = x + secondOffset * Math.cos(rad);
    const markerY2 = y + secondOffset * Math.sin(rad);
    
    // Perpendicular offset for the lines/crow's foot
    const perpRad = rad + Math.PI / 2;
    const lineLength = 8;

    const renderZeroCircle = (cx: number, cy: number) => (
        <circle
            cx={cx}
            cy={cy}
            r={5}
            fill="white"
            stroke="#555"
            strokeWidth={1.5}
        />
    );

    const renderOneLine = (mx: number, my: number) => (
        <line
            x1={mx + lineLength * Math.cos(perpRad)}
            y1={my + lineLength * Math.sin(perpRad)}
            x2={mx - lineLength * Math.cos(perpRad)}
            y2={my - lineLength * Math.sin(perpRad)}
            stroke="#555"
            strokeWidth={1.5}
        />
    );

    const renderCrowsFoot = (mx: number, my: number, tipX: number, tipY: number) => {
        const footSpread = 10;
        return (
            <>
                {/* Center line to tip */}
                <line
                    x1={mx}
                    y1={my}
                    x2={tipX}
                    y2={tipY}
                    stroke="#555"
                    strokeWidth={1.5}
                />
                {/* Upper foot */}
                <line
                    x1={mx + footSpread * Math.cos(perpRad)}
                    y1={my + footSpread * Math.sin(perpRad)}
                    x2={tipX}
                    y2={tipY}
                    stroke="#555"
                    strokeWidth={1.5}
                />
                {/* Lower foot */}
                <line
                    x1={mx - footSpread * Math.cos(perpRad)}
                    y1={my - footSpread * Math.sin(perpRad)}
                    x2={tipX}
                    y2={tipY}
                    stroke="#555"
                    strokeWidth={1.5}
                />
            </>
        );
    };

    switch (cardinality) {
        case 'zero-or-one':
            // Circle (zero) + single line (one)
            return (
                <g className="crows-foot-marker">
                    {renderZeroCircle(markerX2, markerY2)}
                    {renderOneLine(markerX1, markerY1)}
                </g>
            );
        
        case 'one':
            // Two parallel lines (exactly one, mandatory)
            return (
                <g className="crows-foot-marker">
                    {renderOneLine(markerX1, markerY1)}
                    {renderOneLine(markerX2, markerY2)}
                </g>
            );
        
        case 'zero-or-many':
            // Circle (zero) + crow's foot (many)
            return (
                <g className="crows-foot-marker">
                    {renderZeroCircle(markerX2, markerY2)}
                    {renderCrowsFoot(markerX1, markerY1, x, y)}
                </g>
            );
        
        case 'one-or-many':
            // Single line (one) + crow's foot (many)
            return (
                <g className="crows-foot-marker">
                    {renderOneLine(markerX2, markerY2)}
                    {renderCrowsFoot(markerX1, markerY1, x, y)}
                </g>
            );
        
        default:
            return null;
    }
};

export const CrowsFootEdge: FC<EdgeProps<CrowsFootEdgeType>> = memo(({
    id,
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
    data,
    selected,
}) => {
    const sourceCardinality = data?.sourceCardinality || 'one';
    const targetCardinality = data?.targetCardinality || 'one-or-many';
    const label = data?.label;

    // Get the bezier path and calculate angles at endpoints
    const [edgePath, labelX, labelY] = getBezierPath({
        sourceX,
        sourceY,
        sourcePosition,
        targetX,
        targetY,
        targetPosition,
    });

    // Calculate angle at source (pointing away from source node)
    const sourceAngle = Math.atan2(targetY - sourceY, targetX - sourceX) * (180 / Math.PI);
    
    // Calculate angle at target (pointing away from target node)
    const targetAngle = Math.atan2(sourceY - targetY, sourceX - targetX) * (180 / Math.PI);

    return (
        <>
            <BaseEdge
                id={id}
                path={edgePath}
                className={`crows-foot-edge ${selected ? 'selected' : ''}`}
            />
            <svg className="crows-foot-markers">
                <CrowsFootMarker
                    x={sourceX}
                    y={sourceY}
                    angle={sourceAngle}
                    cardinality={sourceCardinality}
                    position="source"
                />
                <CrowsFootMarker
                    x={targetX}
                    y={targetY}
                    angle={targetAngle}
                    cardinality={targetCardinality}
                    position="target"
                />
            </svg>
            {label && (
                <EdgeLabelRenderer>
                    <div
                        className="crows-foot-edge-label"
                        style={{
                            transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`,
                        }}
                    >
                        {label}
                    </div>
                </EdgeLabelRenderer>
            )}
        </>
    );
});

CrowsFootEdge.displayName = 'CrowsFootEdge';
