import type { FC } from 'react';
import './CanvasToolbar.css';

interface CanvasToolbarProps {
    onAddEntity: () => void;
}

export const CanvasToolbar: FC<CanvasToolbarProps> = ({ onAddEntity }) => {
    return (
        <div className="canvas-toolbar">
            <button
                className="toolbar-button add-entity-btn"
                onClick={onAddEntity}
                title="Add Table"
            >
                <span className="text">Add Table</span>
            </button>
        </div>
    );
};