import type { FC } from 'react';
import { ExportButton } from './ExportButton';
import './CanvasToolbar.css';

interface CanvasToolbarProps {
    onAddEntity: () => void;
    getCanvasElement: () => HTMLElement | null;
}

export const CanvasToolbar: FC<CanvasToolbarProps> = ({ onAddEntity, getCanvasElement }) => {
    return (
        <div className="canvas-toolbar">
            <button
                className="toolbar-button add-entity-btn"
                onClick={onAddEntity}
                title="Add Table"
            >
                <span className="text">Add Table</span>
            </button>
            <ExportButton getCanvasElement={getCanvasElement} />
        </div>
    );
};