import { memo, type FC } from 'react';
import {
    BaseEdge,
    EdgeLabelRenderer,
    getStraightPath,
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
    rotation: number; // Rotation in degrees, 0 = pointing right
    cardinality: Cardinality;
}

// Renders the Crow's Foot notation markers
// All markers are drawn as if pointing to the RIGHT (toward +X), then rotated
const CrowsFootMarker: FC<MarkerProps> = ({ x, y, rotation, cardinality }) => {
    const lineLength = 8;
    const footSpread = 10;

    // Positions relative to origin (0,0), will be transformed
    // Markers extend to the LEFT (negative X) away from the table
    // The table is at the RIGHT side (positive X direction after rotation)
    
    const renderZeroCircle = (offsetX: number) => (
        <circle
            cx={-offsetX}
            cy={0}
            r={5}
            fill="white"
            stroke="#555"
            strokeWidth={1.5}
        />
    );

    const renderOneLine = (offsetX: number) => (
        <line
            x1={-offsetX}
            y1={-lineLength}
            x2={-offsetX}
            y2={lineLength}
            stroke="#555"
            strokeWidth={1.5}
        />
    );

    // Crow's foot: three lines spreading toward the table (to the left)
    // Tip is at offsetX (closer to table), spreads out to the left
    const renderCrowsFoot = (tipOffsetX: number) => {
        const baseOffsetX = tipOffsetX + 12; // Base of the crow's foot (farther from table)
        return (
            <>
                {/* Center line */}
                <line
                    x1={-tipOffsetX}
                    y1={0}
                    x2={-baseOffsetX}
                    y2={0}
                    stroke="#555"
                    strokeWidth={1.5}
                />
                {/* Upper foot */}
                <line
                    x1={-tipOffsetX}
                    y1={-footSpread}
                    x2={-baseOffsetX}
                    y2={0}
                    stroke="#555"
                    strokeWidth={1.5}
                />
                {/* Lower foot */}
                <line
                    x1={-tipOffsetX}
                    y1={footSpread}
                    x2={-baseOffsetX}
                    y2={0}
                    stroke="#555"
                    strokeWidth={1.5}
                />
            </>
        );
    };

    const renderMarker = () => {
        switch (cardinality) {
            case 'zero-or-one':
                // Single line (closer to table) + Circle (farther)
                return (
                    <>
                        {renderOneLine(8)}
                        {renderZeroCircle(18)}
                    </>
                );
            
            case 'one':
                // Two parallel lines
                return (
                    <>
                        {renderOneLine(8)}
                        {renderOneLine(14)}
                    </>
                );
            
            case 'zero-or-many':
                // Crow's foot (closer, pointing away) + Circle (farther)
                return (
                    <>
                        {renderCrowsFoot(0)}
                        {renderZeroCircle(26)}
                    </>
                );
            
            case 'one-or-many':
                // Crow's foot (closer, pointing away) + Single line (farther)
                return (
                    <>
                        {renderCrowsFoot(0)}
                        {renderOneLine(24)}
                    </>
                );
            
            default:
                return null;
        }
    };

    return (
        <g 
            className="crows-foot-marker"
            transform={`translate(${x}, ${y}) rotate(${rotation})`}
        >
            {renderMarker()}
        </g>
    );
};

export const CrowsFootEdge: FC<EdgeProps<CrowsFootEdgeType>> = memo(({
    id,
    sourceX,
    sourceY,
    targetX,
    targetY,
    data,
    selected,
}) => {
    const sourceCardinality = data?.sourceCardinality || 'one';
    const targetCardinality = data?.targetCardinality || 'one-or-many';
    const label = data?.label;

    // Use straight path for cleaner notation alignment
    const [edgePath, labelX, labelY] = getStraightPath({
        sourceX,
        sourceY,
        targetX,
        targetY,
    });

    // Calculate the angle of the line (in degrees)
    const angle = Math.atan2(targetY - sourceY, targetX - sourceX) * (180 / Math.PI);

    // Source marker: rotation points toward target (table is behind, at source)
    // So rotation = angle (pointing toward target, markers extend backward toward source table)
    const sourceRotation = angle + 180; // Flip to point markers away from source table
    
    // Target marker: rotation points toward source (table is behind, at target)
    const targetRotation = angle; // Points toward source, markers extend backward toward target table

    return (
        <>
            <BaseEdge
                id={id}
                path={edgePath}
                className={`crows-foot-edge ${selected ? 'selected' : ''}`}
            />
            <g className="crows-foot-markers">
                <CrowsFootMarker
                    x={sourceX}
                    y={sourceY}
                    rotation={sourceRotation}
                    cardinality={sourceCardinality}
                />
                <CrowsFootMarker
                    x={targetX}
                    y={targetY}
                    rotation={targetRotation}
                    cardinality={targetCardinality}
                />
            </g>
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
