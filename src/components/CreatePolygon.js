import React, { useState, useEffect, useContext } from 'react';
import './CreatePolygon.css';
import { addPolygon } from '../services/PolygonAddService';
import { CoordinatesContext } from './CoordinatesContext';
import { validateName, validateType, validateCoordinate, validateSeverity } from '../services/FormValidationService';

function CreatePolygons() {
  const [formData, setFormData] = useState({
    name: '',
    type: 'roadblock',
    severity: 'mild',
    coordinates: [{ lat: '', long: '' }]
  });
  const [errors, setErrors] = useState({});
  const { coordinates, setCoordinates } = useContext(CoordinatesContext);

  const handleChange = (index, e) => {
    const { name, value } = e.target;
    const newCoordinates = [...formData.coordinates];
    newCoordinates[index][name] = value;
    setFormData({ ...formData, coordinates: newCoordinates });
    validateField(name, value, index);
  };

  const handleAddField = () => {
    setFormData({
      ...formData,
      coordinates: [...formData.coordinates, { lat: '', long: '' }]
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      addPolygon(formData); // set to CreatePolygon on backend connection
      setFormData({
        name: '',
        type: 'roadblock',
        severity: 'mild',
        coordinates: [{ lat: '', long: '' }]
      });
      setErrors({});
    }
  };

  const validateField = (name, value, index = null) => {
    let errorMsg = '';
    if (name === 'name' && !validateName(value)) {
      errorMsg = 'Name must be 3-30 characters long and contain only letters or numbers.';
    } else if (name === 'type' && !validateType(value)) {
      errorMsg = 'Type must be either "roadblock" or "traffic".';
    } else if ((name === 'lat' || name === 'long') && !validateCoordinate(value)) {
      errorMsg = 'Coordinates must be a number between 0 and 90.';
    } else if (name === 'severity' && !validateSeverity(value)) {
      errorMsg = 'Severity must be one of "mild", "average", or "severe".';
    }
    
    let newErrors = { ...errors };

    if (index !== null) {
      const coordinateErrors = newErrors.coordinates || [];
      coordinateErrors[index] = { ...coordinateErrors[index], [name]: errorMsg };
      newErrors.coordinates = coordinateErrors;

      // Remove coordinate errors if no error message
      if (!errorMsg) {
        delete coordinateErrors[index][name];
        if (Object.keys(coordinateErrors[index]).length === 0) {
          coordinateErrors.splice(index, 1);
        }
      }
    } else {
      if (errorMsg) {
        newErrors[name] = errorMsg;
      } else {
        delete newErrors[name];
      }
    }

    setErrors(newErrors);
  };

  const validateForm = () => {
    const newErrors = {};
    if (!validateName(formData.name)) {
      newErrors.name = 'Name must be 3-30 characters long and contain only letters or numbers.';
    }
    if (!validateType(formData.type)) {
      newErrors.type = 'Type must be either "roadblock" or "traffic".';
    }
    formData.coordinates.forEach((coordinate, index) => {
      const coordErrors = {};
      if (!validateCoordinate(coordinate.lat)) {
        coordErrors.lat = 'Latitude must be a number between 0 and 90.';
      }
      if (!validateCoordinate(coordinate.long)) {
        coordErrors.long = 'Longitude must be a number between 0 and 90.';
      }
      if (Object.keys(coordErrors).length > 0) {
        if (!newErrors.coordinates) {
          newErrors.coordinates = [];
        }
        newErrors.coordinates[index] = coordErrors;
      }
    });
    if (formData.type === 'traffic' && !validateSeverity(formData.severity)) {
      newErrors.severity = 'Severity must be one of "mild", "average", or "severe".';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const can_click = () => {
    console.log("can_click");
    
    if (!validateName(formData.name)) {
      return 0;
    }
    if (!validateType(formData.type)) {
      return 0;
    }
  
    for (let i = 0; i < formData.coordinates.length; i++) {
      const coordinate = formData.coordinates[i];
      if (!validateCoordinate(coordinate.lat) || !validateCoordinate(coordinate.long)) {
        return 0;
      }
    }
    
    console.log('now can click');
    return 1;
  };


  useEffect(() => {
    if (coordinates.length > 0) {
      setFormData({ ...formData, coordinates: coordinates });
      setCoordinates([]); // Reset coordinates after updating formData
    }
  }, [coordinates, setCoordinates]);

  return (
    <div className="create-polygons">
      <h2>Create Polygon</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="name">Name:</label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={(e) => {
              setFormData({ ...formData, name: e.target.value });
              validateField('name', e.target.value);
            }}
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
            onChange={(e) => {
              setFormData({ ...formData, type: e.target.value });
              validateField('type', e.target.value);
            }}
            className={errors.type ? 'input-error' : ''}
          >
            <option value="roadblock">Roadblock</option>
            <option value="traffic">Traffic</option>
          </select>
          {errors.type && <span className="error">{errors.type}</span>}
        </div>
        {formData.type === 'traffic' && (
          <div className="form-group">
            <label htmlFor="severity">Severity:</label>
            <select
              id="severity"
              name="severity"
              value={formData.severity}
              onChange={(e) => {
                setFormData({ ...formData, severity: e.target.value });
                validateField('severity', e.target.value);
              }}
              className={errors.severity ? 'input-error' : ''}
            >
              <option value="mild">Mild</option>
              <option value="average">Average</option>
              <option value="severe">Severe</option>
            </select>
            {errors.severity && <span className="error">{errors.severity}</span>}
          </div>
        )}
        <div className="form-group">
          <label>Coordinates:</label>
          {formData.coordinates.map((coordinate, index) => (
            <div key={index} className="coordinate-group">
              <input
                type="text"
                name="lat"
                value={coordinate.lat}
                onChange={(e) => handleChange(index, e)}
                placeholder="Latitude"
                className={errors.coordinates && errors.coordinates[index] && errors.coordinates[index].lat ? 'input-error' : ''}
              />
              {errors.coordinates && errors.coordinates[index] && errors.coordinates[index].lat && <span className="error">{errors.coordinates[index].lat}</span>}
              <input
                type="text"
                name="long"
                value={coordinate.long}
                onChange={(e) => handleChange(index, e)}
                placeholder="Longitude"
                className={errors.coordinates && errors.coordinates[index] && errors.coordinates[index].long ? 'input-error' : ''}
              />
              {errors.coordinates && errors.coordinates[index] && errors.coordinates[index].long && <span className="error">{errors.coordinates[index].long}</span>}
            </div>
          ))}
          <button type="button" onClick={handleAddField}>
            Add Coordinate
          </button>
        </div>
        <button type="submit" disabled={!can_click()} className={!can_click() ? 'btn-disabled' : ''}>Submit</button>
      </form>
    </div>
  );
}

export default CreatePolygons;