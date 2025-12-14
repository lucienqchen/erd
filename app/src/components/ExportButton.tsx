import { useState, useCallback, useRef, useEffect, type FC } from 'react';
import { toPng, toJpeg, toSvg } from 'html-to-image';
import { jsPDF } from 'jspdf';
import './ExportButton.css';

type ExportFormat = 'png' | 'jpg' | 'svg' | 'pdf';

interface ExportButtonProps {
    getCanvasElement: () => HTMLElement | null;
}

export const ExportButton: FC<ExportButtonProps> = ({ getCanvasElement }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [isExporting, setIsExporting] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const downloadFile = (dataUrl: string, filename: string) => {
        const link = document.createElement('a');
        link.download = filename;
        link.href = dataUrl;
        link.click();
    };

    const getTimestamp = () => {
        const now = new Date();
        return now.toISOString().slice(0, 19).replace(/[T:]/g, '-');
    };

    const exportAs = useCallback(async (format: ExportFormat) => {
        const element = getCanvasElement();
        if (!element) {
            alert('Could not find canvas element');
            return;
        }

        setIsExporting(true);
        setIsOpen(false);

        try {
            const timestamp = getTimestamp();
            const filename = `erd-diagram-${timestamp}`;

            // Common options for better quality
            const options = {
                quality: 1,
                pixelRatio: 2,
                backgroundColor: '#ffffff',
            };

            switch (format) {
                case 'png': {
                    const dataUrl = await toPng(element, options);
                    downloadFile(dataUrl, `${filename}.png`);
                    break;
                }
                case 'jpg': {
                    const dataUrl = await toJpeg(element, options);
                    downloadFile(dataUrl, `${filename}.jpg`);
                    break;
                }
                case 'svg': {
                    const dataUrl = await toSvg(element, options);
                    downloadFile(dataUrl, `${filename}.svg`);
                    break;
                }
                case 'pdf': {
                    const dataUrl = await toPng(element, { ...options, pixelRatio: 3 });
                    
                    // Get element dimensions
                    const imgWidth = element.offsetWidth;
                    const imgHeight = element.offsetHeight;
                    
                    // Create PDF with proper orientation
                    const orientation = imgWidth > imgHeight ? 'landscape' : 'portrait';
                    const pdf = new jsPDF({
                        orientation,
                        unit: 'px',
                        format: [imgWidth, imgHeight],
                    });
                    
                    pdf.addImage(dataUrl, 'PNG', 0, 0, imgWidth, imgHeight);
                    pdf.save(`${filename}.pdf`);
                    break;
                }
            }
        } catch (error) {
            console.error('Export failed:', error);
            alert('Export failed. Please try again.');
        } finally {
            setIsExporting(false);
        }
    }, [getCanvasElement]);

    return (
        <div className="export-button-container" ref={dropdownRef}>
            <button
                className="toolbar-button export-btn"
                onClick={() => setIsOpen(!isOpen)}
                disabled={isExporting}
                title="Export Diagram"
            >
                <span className="text">{isExporting ? 'Exporting...' : 'Export'}</span>
                <span className="dropdown-arrow">▾</span>
            </button>
            
            {isOpen && (
                <div className="export-dropdown">
                    <button 
                        className="export-option" 
                        onClick={() => exportAs('png')}
                    >
                        <span className="format-info">
                            <span className="format-name">PNG</span>
                            <span className="format-desc">High quality image</span>
                        </span>
                    </button>
                    <button 
                        className="export-option" 
                        onClick={() => exportAs('jpg')}
                    >
                        <span className="format-info">
                            <span className="format-name">JPG</span>
                            <span className="format-desc">Compressed image</span>
                        </span>
                    </button>
                    <button 
                        className="export-option" 
                        onClick={() => exportAs('svg')}
                    >
                        <span className="format-info">
                            <span className="format-name">SVG</span>
                            <span className="format-desc">Scalable vector</span>
                        </span>
                    </button>
                    <button 
                        className="export-option" 
                        onClick={() => exportAs('pdf')}
                    >
                        <span className="format-info">
                            <span className="format-name">PDF</span>
                            <span className="format-desc">Document format</span>
                        </span>
                    </button>
                </div>
            )}
        </div>
    );
};
