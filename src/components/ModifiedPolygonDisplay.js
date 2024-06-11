import React, { useState, useEffect } from "react";
import "./Polygon.css"; // Import the CSS file
import { useDispatch } from "react-redux";
import { modifyPolygon, setFaults, setCanceledits } from "../features/polygons/modifiedPolygonsSlice";
import { validateName, validateType, validateSeverity } from "../services/FormValidationService"; // Import the validation functions
import { convertToGeoJSON } from "../services/JSONToGeoJSON";
import { UpdatePolygon } from "../services/PolygonService";
const ModifiedPolygonDisplay = (p) => {
  const dispatch = useDispatch();
  const [hasChanged, sethasChanged] = useState(false);
  const [isDeleted, setIsDeleted] = useState(false);
  const [formData, setFormData] = useState({
    name: p.properties.name,
    type: p.properties.type,

    coordinates: p.geometry.coordinates[0].map(cord => ({
      lat: cord[1],
      long: cord[0],
    })),
    severity: p.properties.severity || '', // Add severity to formData
  });

  const [errors, setErrors] = useState({});

  const validateField = (name, value) => {
    sethasChanged(true);
    let errorMsg = '';
    if (name === 'name' && !validateName(value)) {
      errorMsg = 'Name must be 3-30 characters long and contain only letters or numbers.';
    } else if (name === 'type' && !validateType(value)) {
      errorMsg = 'Type must be either "roadblock" or "traffic".';
    } else if (name === 'severity' && !validateSeverity(value)) {
      errorMsg = 'Severity must be a valid speed effect (e.g., +10km/h or -10%).';
    }

    let newErrors = { ...errors };
    if (errorMsg) {
      newErrors[name] = errorMsg;
    } else {
      delete newErrors[name];
    }
    console.log("newErrors", newErrors);
    if (Object.keys(newErrors).length === 0) {
      console.log("deleteFaults");
      dispatch(setFaults({ id: p.properties.id, type: 0 }));
    } else {
      console.log("setFaults");
      dispatch(setFaults({ id: p.properties.id, type: 1 }));
    }
    setErrors(newErrors);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    const updatedFormData = { ...formData, [name]: value };
    setFormData(updatedFormData);

    // Create a new object for p with updated properties
    const updatedPolygon = {
      ...p,
      properties: {
        ...p.properties,
        [name]: value
      }
    };
    validateField(name, value);
    console.log("modified p", updatedPolygon, errors);
  };

  useEffect(() => {
    console.log("useEffect", errors);
    if (!errors.name && !errors.type && !errors.severity && hasChanged) {
      const updatedPolygon = {
        ...p,
        properties: {
          ...p.properties,
          name: formData.name,
          type: formData.type,
          severity: formData.severity,
        },
      };

      if (!errors.name && !errors.type && !errors.severity) {
        console.log("dispatching", updatedPolygon);
        dispatch(modifyPolygon(updatedPolygon));
      }
    }
  }, [errors]);

  const hasErrors = Object.keys(errors).length > 0;

  const handleDeleteClick = () => {
    setIsDeleted(true);
    dispatch(setCanceledits({id: p.properties.id, add: 1}))
  };

  const handleUndoClick = () => {
    setIsDeleted(false);
    dispatch(setCanceledits({id: p.properties.id, add: 0}))
  };

  return (
    <div className={`polygon ${hasErrors ? 'polygon-error' : ''}`}>
      {isDeleted ? (
        <div>
          <h2>{formData.name}</h2>
          <p>Set to be deleted</p>
          <button onClick={handleUndoClick}>Undo</button>
        </div>
      ) : (
        <div>
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
                <option value="traffic">Traffic</option>
              </select>
              {errors.type && <span className="error">{errors.type}</span>}
            </div>
            {formData.type === 'traffic' && (
              <div className="form-group">
                <label htmlFor="severity">Speed effect:</label>
                <input
                  type="text"
                  id="severity"
                  name="severity"
                  value={formData.severity}
                  onChange={handleInputChange}
                  className={errors.severity ? 'input-error' : ''}
                />
                {errors.severity && <span className="error">{errors.severity}</span>}
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