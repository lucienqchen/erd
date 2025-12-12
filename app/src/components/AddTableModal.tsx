import { useState, useCallback, useEffect, useRef, type FC } from 'react';
import type { Attribute } from '../types';
import './AddTableModal.css';

interface AddTableModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (tableName: string, attributes: Omit<Attribute, 'id'>[]) => void;
    // Edit mode props
    editMode?: boolean;
    initialTableName?: string;
    initialAttributes?: Attribute[];
}

interface AttributeFormData {
    tempId: number;
    name: string;
    type: string;
    isPrimaryKey: boolean;
    isForeignKey: boolean;
}

const DATA_TYPES = [
    'INTEGER',
    'BIGINT',
    'SMALLINT',
    'DECIMAL',
    'NUMERIC',
    'FLOAT',
    'REAL',
    'VARCHAR',
    'CHAR',
    'TEXT',
    'DATE',
    'TIME',
    'TIMESTAMP',
    'BOOLEAN',
    'UUID',
    'JSON',
    'JSONB',
];

export const AddTableModal: FC<AddTableModalProps> = ({ 
    isOpen, 
    onClose, 
    onSubmit,
    editMode = false,
    initialTableName = '',
    initialAttributes,
}) => {
    const getInitialAttributes = useCallback((): AttributeFormData[] => {
        if (editMode && initialAttributes && initialAttributes.length > 0) {
            return initialAttributes.map((attr, index) => ({
                tempId: index + 1,
                name: attr.name,
                type: attr.type,
                isPrimaryKey: attr.isPrimaryKey || false,
                isForeignKey: attr.isForeignKey || false,
            }));
        }
        return [{ tempId: 1, name: 'id', type: 'INTEGER', isPrimaryKey: true, isForeignKey: false }];
    }, [editMode, initialAttributes]);

    const [tableName, setTableName] = useState(initialTableName);
    const [attributes, setAttributes] = useState<AttributeFormData[]>(getInitialAttributes);
    const [nextTempId, setNextTempId] = useState((initialAttributes?.length ?? 0) + 2);
    
    // Track previous isOpen state to detect when modal opens
    const prevIsOpenRef = useRef(false);

    // Reset form only when modal transitions from closed to open
    useEffect(() => {
        if (isOpen && !prevIsOpenRef.current) {
            // Modal just opened
            setTableName(initialTableName);
            setAttributes(getInitialAttributes());
            setNextTempId((initialAttributes?.length ?? 0) + 2);
        }
        prevIsOpenRef.current = isOpen;
    }, [isOpen, initialTableName, initialAttributes, getInitialAttributes]);

    const handleAddAttribute = useCallback(() => {
        setAttributes((prev) => [
            ...prev,
            { tempId: nextTempId, name: '', type: 'VARCHAR', isPrimaryKey: false, isForeignKey: false },
        ]);
        setNextTempId((id) => id + 1);
    }, [nextTempId]);

    const handleRemoveAttribute = useCallback((tempId: number) => {
        setAttributes((prev) => prev.filter((attr) => attr.tempId !== tempId));
    }, []);

    const handleAttributeChange = useCallback(
        (tempId: number, field: keyof AttributeFormData, value: string | boolean) => {
            setAttributes((prev) =>
                prev.map((attr) =>
                    attr.tempId === tempId ? { ...attr, [field]: value } : attr
                )
            );
        },
        []
    );

    const handleSubmit = useCallback(() => {
        if (!tableName.trim()) {
            alert('Please enter a table name');
            return;
        }

        const validAttributes = attributes.filter((attr) => attr.name.trim());
        if (validAttributes.length === 0) {
            alert('Please add at least one attribute');
            return;
        }

        onSubmit(
            tableName.trim(),
            validAttributes.map(({ name, type, isPrimaryKey, isForeignKey }) => ({
                name,
                type,
                isPrimaryKey,
                isForeignKey,
            }))
        );

        onClose();
    }, [tableName, attributes, onSubmit, onClose]);

    const handleCancel = useCallback(() => {
        onClose();
    }, [onClose]);

    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={handleCancel}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>{editMode ? 'Edit Table' : 'Add New Table'}</h2>
                    <button className="modal-close-btn" onClick={handleCancel}>
                        ×
                    </button>
                </div>

                <div className="modal-body">
                    <div className="form-group">
                        <label htmlFor="tableName">Table Name</label>
                        <input
                            id="tableName"
                            type="text"
                            value={tableName}
                            onChange={(e) => setTableName(e.target.value)}
                            placeholder="Enter table name"
                            autoFocus
                        />
                    </div>

                    <div className="attributes-section">
                        <div className="attributes-header">
                            <h3>Attributes</h3>
                            <button
                                type="button"
                                className="add-attribute-btn"
                                onClick={handleAddAttribute}
                            >
                                + Add Attribute
                            </button>
                        </div>

                        <div className="attributes-list">
                            <div className="attribute-row header-row">
                                <span className="attr-name-col">Column Name</span>
                                <span className="attr-type-col">Data Type</span>
                                <span className="attr-pk-col">PK</span>
                                <span className="attr-fk-col">FK</span>
                                <span className="attr-action-col"></span>
                            </div>

                            {attributes.map((attr) => (
                                <div key={attr.tempId} className="attribute-row">
                                    <input
                                        type="text"
                                        className="attr-name-col"
                                        value={attr.name}
                                        onChange={(e) =>
                                            handleAttributeChange(attr.tempId, 'name', e.target.value)
                                        }
                                        placeholder="Column name"
                                    />
                                    <select
                                        className="attr-type-col"
                                        value={attr.type}
                                        onChange={(e) =>
                                            handleAttributeChange(attr.tempId, 'type', e.target.value)
                                        }
                                    >
                                        {DATA_TYPES.map((type) => (
                                            <option key={type} value={type}>
                                                {type}
                                            </option>
                                        ))}
                                    </select>
                                    <input
                                        type="checkbox"
                                        className="attr-pk-col"
                                        checked={attr.isPrimaryKey}
                                        onChange={(e) =>
                                            handleAttributeChange(attr.tempId, 'isPrimaryKey', e.target.checked)
                                        }
                                        title="Primary Key"
                                    />
                                    <input
                                        type="checkbox"
                                        className="attr-fk-col"
                                        checked={attr.isForeignKey}
                                        onChange={(e) =>
                                            handleAttributeChange(attr.tempId, 'isForeignKey', e.target.checked)
                                        }
                                        title="Foreign Key"
                                    />
                                    <button
                                        type="button"
                                        className="attr-action-col remove-attr-btn"
                                        onClick={() => handleRemoveAttribute(attr.tempId)}
                                        title="Remove attribute"
                                    >
                                        ×
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="modal-footer">
                    <button className="cancel-btn" onClick={handleCancel}>
                        Cancel
                    </button>
                    <button className="submit-btn" onClick={handleSubmit}>
                        {editMode ? 'Save Changes' : 'Create Table'}
                    </button>
                </div>
            </div>
        </div>
    );
};
