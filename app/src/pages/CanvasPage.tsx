import { FC } from 'react';
import { Canvas } from '../components/Canvas';
import './CanvasPage.css';

export const CanvasPage: FC = () => {
    return (
        <div className="canvas-page">
            <Canvas />
        </div>
    );
};