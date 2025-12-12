import { useState, useCallback, useEffect, useRef, type FC } from 'react';
import type { Cardinality } from './CrowsFootEdge';
import './RelationshipModal.css';

interface RelationshipModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (sourceCardinality: Cardinality, targetCardinality: Cardinality, label?: string) => void;
    sourceName?: string;
    targetName?: string;
    // Edit mode props
    editMode?: boolean;
    initialSourceCardinality?: Cardinality;
    initialTargetCardinality?: Cardinality;
    initialLabel?: string;
}

interface CardinalityOption {
    value: Cardinality;
    label: string;
    description: string;
    symbol: string;
}

const CARDINALITY_OPTIONS: CardinalityOption[] = [
    {
        value: 'zero-or-one',
        label: 'Zero or One',
        description: 'Optional, at most one',
        symbol: '○─│',
    },
    {
        value: 'one',
        label: 'One (exactly)',
        description: 'Mandatory, exactly one',
        symbol: '│─│',
    },
    {
        value: 'zero-or-many',
        label: 'Zero or Many',
        description: 'Optional, any number',
        symbol: '○─<',
    },
    {
        value: 'one-or-many',
        label: 'One or Many',
        description: 'Mandatory, at least one',
        symbol: '│─<',
    },
];

export const RelationshipModal: FC<RelationshipModalProps> = ({
    isOpen,
    onClose,
    onSubmit,
    sourceName = 'Source',
    targetName = 'Target',
    editMode = false,
    initialSourceCardinality = 'one',
    initialTargetCardinality = 'one-or-many',
    initialLabel = '',
}) => {
    const [sourceCardinality, setSourceCardinality] = useState<Cardinality>(initialSourceCardinality);
    const [targetCardinality, setTargetCardinality] = useState<Cardinality>(initialTargetCardinality);
    const [label, setLabel] = useState(initialLabel);
    
    // Track previous isOpen state to detect when modal opens
    const prevIsOpenRef = useRef(false);

    // Reset form only when modal transitions from closed to open
    useEffect(() => {
        if (isOpen && !prevIsOpenRef.current) {
            // Modal just opened
            setSourceCardinality(initialSourceCardinality);
            setTargetCardinality(initialTargetCardinality);
            setLabel(initialLabel);
        }
        prevIsOpenRef.current = isOpen;
    }, [isOpen, initialSourceCardinality, initialTargetCardinality, initialLabel]);

    const handleSubmit = useCallback(() => {
        onSubmit(sourceCardinality, targetCardinality, label || undefined);
        onClose();
    }, [sourceCardinality, targetCardinality, label, onSubmit, onClose]);

    const handleCancel = useCallback(() => {
        onClose();
    }, [onClose]);

    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={handleCancel}>
            <div className="modal-content relationship-modal" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>{editMode ? 'Edit Relationship' : 'Define Relationship'}</h2>
                    <button className="modal-close-btn" onClick={handleCancel}>
                        ×
                    </button>
                </div>

                <div className="modal-body">
                    <div className="relationship-preview">
                        <span className="entity-name">{sourceName}</span>
                        <span className="relationship-arrow">
                            <span className="cardinality-symbol">
                                {CARDINALITY_OPTIONS.find(o => o.value === sourceCardinality)?.symbol}
                            </span>
                            ────
                            <span className="cardinality-symbol">
                                {CARDINALITY_OPTIONS.find(o => o.value === targetCardinality)?.symbol}
                            </span>
                        </span>
                        <span className="entity-name">{targetName}</span>
                    </div>

                    <div className="cardinality-selectors">
                        <div className="cardinality-selector">
                            <h4>{sourceName} cardinality</h4>
                            <p className="selector-description">
                                How many {sourceName} records can relate to one {targetName}?
                            </p>
                            <div className="cardinality-options">
                                {CARDINALITY_OPTIONS.map((option) => (
                                    <label
                                        key={`source-${option.value}`}
                                        className={`cardinality-option ${sourceCardinality === option.value ? 'selected' : ''}`}
                                    >
                                        <input
                                            type="radio"
                                            name="sourceCardinality"
                                            value={option.value}
                                            checked={sourceCardinality === option.value}
                                            onChange={() => setSourceCardinality(option.value)}
                                        />
                                        <div className="option-content">
                                            <span className="option-symbol">{option.symbol}</span>
                                            <span className="option-label">{option.label}</span>
                                            <span className="option-description">{option.description}</span>
                                        </div>
                                    </label>
                                ))}
                            </div>
                        </div>

                        <div className="cardinality-selector">
                            <h4>{targetName} cardinality</h4>
                            <p className="selector-description">
                                How many {targetName} records can relate to one {sourceName}?
                            </p>
                            <div className="cardinality-options">
                                {CARDINALITY_OPTIONS.map((option) => (
                                    <label
                                        key={`target-${option.value}`}
                                        className={`cardinality-option ${targetCardinality === option.value ? 'selected' : ''}`}
                                    >
                                        <input
                                            type="radio"
                                            name="targetCardinality"
                                            value={option.value}
                                            checked={targetCardinality === option.value}
                                            onChange={() => setTargetCardinality(option.value)}
                                        />
                                        <div className="option-content">
                                            <span className="option-symbol">{option.symbol}</span>
                                            <span className="option-label">{option.label}</span>
                                            <span className="option-description">{option.description}</span>
                                        </div>
                                    </label>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="form-group">
                        <label htmlFor="relationshipLabel">Relationship Label (optional)</label>
                        <input
                            id="relationshipLabel"
                            type="text"
                            value={label}
                            onChange={(e) => setLabel(e.target.value)}
                            placeholder="e.g., 'has', 'belongs to', 'contains'"
                        />
                    </div>
                </div>

                <div className="modal-footer">
                    <button className="cancel-btn" onClick={handleCancel}>
                        Cancel
                    </button>
                    <button className="submit-btn" onClick={handleSubmit}>
                        {editMode ? 'Save Changes' : 'Create Relationship'}
                    </button>
                </div>
            </div>
        </div>
    );
};
