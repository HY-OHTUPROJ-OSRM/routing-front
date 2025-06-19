import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import './Polygon.css';
import {
    modifyPolygon,
    setFaults,
    setCanceledits,
} from '../../features/polygons/modifiedPolygonsSlice';
import { validateName, validateType, validateEffectValue } from '../../features/view/FormValidator';

/*
Another version of polygon list component used in editmode. enables the editing of names, types and values of drawn polygons
Uses similar validation functions as the CreatePolygon component

*/
const ModifiedPolygonDisplay = (p) => {
    const dispatch = useDispatch();
    const listViewId = useSelector((state) => state.view.listView);

    const [highlightedId, setHighlightedId] = useState(null);
    const [hasChanged, setHasChanged] = useState(false);
    const [isDeleted, setIsDeleted] = useState(false);
    const [formData, setFormData] = useState({
        name: p.properties.name,
        type: p.properties.type,
        id: p.properties.id,
        effectValue: p.properties.effect_value,
        coordinates: p.geometry.coordinates[0].map((cord) => ({
            lat: cord[1],
            long: cord[0],
        })),
        severity: p.properties.severity || '', // Severity is optional and replaced by effectValue in the form
    });

    const [errors, setErrors] = useState({});

    const scrollToElement = () => {
        if (listViewId) {
            const element = document.getElementById(listViewId);
            if (element) {
                setHighlightedId(listViewId);
                element.scrollIntoView({ behavior: 'smooth' });
            }
        }
    };
    useEffect(() => {
        scrollToElement();
    }, [listViewId]);

    const validateField = (updated, name, value) => {
        console.log(updated, value, name);
        setHasChanged(true);
        const type = updated.properties.type;
        let errorMsg = '';
        if (!validateName(updated.properties.name)) {
            errorMsg = 'Name must be 3-30 characters long and contain only letters or numbers.';
        } else if (!validateType(updated.properties.type)) {
            errorMsg = 'Type must be one of the specified options.';
        } else {
            console.log('yoooooo', type, value);
            if (type === 'factor') {
                if (!validateEffectValue(updated.properties.effectValue, type)) {
                    name = 'effectValue';
                    errorMsg = 'Effect value must be a positive number.';
                }
            } else if (
                type !== 'roadblock' &&
                !validateEffectValue(updated.properties.effectValue, type)
            ) {
                errorMsg = 'Effect value must be an integer.';
                name = 'effectValue';
            }
        }

        const newErrors = { ...errors };
        console.log('before del newErrors', newErrors);
        if (type === 'roadblock') {
            delete newErrors['effectValue'];
            dispatch(setFaults({ id: p.properties.id, type: 0 }));
        }
        console.log('newErrors', newErrors);
        if (errorMsg !== '') {
            newErrors[name] = errorMsg;
        } else {
            delete newErrors[name];
        }
        if (Object.keys(newErrors).length === 0) {
            dispatch(setFaults({ id: p.properties.id, type: 0 }));
        } else {
            dispatch(setFaults({ id: p.properties.id, type: 1 }));
        }
        setErrors(newErrors);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        const updatedFormData = { ...formData, [name]: value };
        setFormData(updatedFormData);

        const updatedPolygon = {
            ...p,
            properties: {
                ...p.properties,
                [name]: value,
            },
        };
        validateField(updatedPolygon, name, value);
    };

    useEffect(() => {
        if (!errors.name && !errors.type && !errors.effectValue && hasChanged) {
            const updatedPolygon = {
                ...p,
                properties: {
                    ...p.properties,
                    name: formData.name,
                    type: formData.type,
                    effectValue: formData.effectValue,
                },
            };
            console.log('dispatching');
            dispatch(modifyPolygon(updatedPolygon));
        }
    }, [errors]);

    const hasErrors = Object.keys(errors).length > 0;

    const handleDeleteClick = () => {
        setIsDeleted(true);
        dispatch(setCanceledits({ id: p.properties.id, add: 1 }));
    };

    const handleUndoClick = () => {
        setIsDeleted(false);
        dispatch(setCanceledits({ id: p.properties.id, add: 0 }));
    };

    return (
        <div className={`polygon ${hasErrors ? 'polygon-error' : ''}`}>
            {isDeleted ? (
                <div
                    className={highlightedId === p.properties.id ? 'highlight' : 'polygon'}
                    id={formData.id}
                >
                    <h2>{formData.name}</h2>
                    <p>Set to be deleted</p>
                    <button onClick={handleUndoClick}>Undo</button>
                </div>
            ) : (
                <div
                    className={highlightedId === p.properties.id ? 'highlight' : 'polygon'}
                    id={formData.id}
                >
                    <h2>{formData.name}</h2>
                    <form>
                        <div className="form-group">
                            <label htmlFor="name">Name:</label>
                            <input
                                type="text"
                                id="name"
                                name="name"
                                value={formData.name}
                                onChange={handleInputChange}
                                className={errors.name ? 'input-error' : ''}
                            />
                            {errors.name && <span className="error">{errors.name}</span>}
                        </div>
                        <div className="form-group">
                            <label htmlFor="type">Type:</label>
                            <select
                                id="type"
                                name="type"
                                value={formData.type}
                                onChange={handleInputChange}
                                className={errors.type ? 'input-error' : ''}
                            >
                                <option value="roadblock">Roadblock</option>
                                <option value="cap">Speed Limit Cap (km/h)</option>
                                <option value="constant">Custom Speed (km/h)</option>
                                <option value="offset">Speed Change (km/h)</option>
                                <option value="factor">Speed Change (multiplier)</option>
                            </select>
                            {errors.type && <span className="error">{errors.type}</span>}
                        </div>
                        {formData.type !== 'roadblock' && (
                            <div className="form-group">
                                <label htmlFor="effectValue">Effect Value:</label>
                                <input
                                    type="text"
                                    id="effectValue"
                                    name="effectValue"
                                    value={formData.effectValue}
                                    onChange={handleInputChange}
                                    className={errors.effectValue ? 'input-error' : ''}
                                />
                                {errors.effectValue && (
                                    <span className="error">{errors.effectValue}</span>
                                )}
                            </div>
                        )}
                    </form>
                    <button onClick={handleDeleteClick}>Set to be deleted</button>
                </div>
            )}
        </div>
    );
};

export default ModifiedPolygonDisplay;
