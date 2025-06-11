import React, { useState, useEffect, useContext, useRef } from 'react';
import './CreatePolygon.css';
import { CoordinatesContext, ProfileContext } from '../Map/CoordinatesContext';
import { validateName, validateType, validateCoordinate, validateEffectValue } from '../../services/FormValidationService';
import { CreatePolygon } from '../../services/PolygonService';
import { useDispatch } from 'react-redux';
import { fetchPolygons } from '../../features/polygons/polygonsSlice';
import { convertToGeoJSON } from '../../services/JSONToGeoJSON';
import { fetchRouteLine } from '../../features/routes/routeSlice';
import { generateName } from '../../services/nameGiverService';

// Form for creating polygons. Can receive coordinates from the map component when user draws a new polygon using the polygon icon displayed.
// The form is validated and the polygon is created when the user clicks submit. The form is reset after submission.
const CreatePolygons = () => {
  const dispatch = useDispatch();
  const { selectedProfile } = useContext(ProfileContext);
  const profileRef = useRef();
  profileRef.current = selectedProfile;
    const [formData, setFormData] = useState({
      name: generateName(),
      type: 'roadblock',
      effectValue: 0,
      coordinates: [{ lat: '', long: '' }]
    });
    const [errors, setErrors] = useState({});
    const { coordinates, setCoordinates } = useContext(CoordinatesContext);

  //Update form on given input

  const handleChange = (index, e) => {
    const { name, value } = e.target;
    const newCoordinates = [...formData.coordinates];
    newCoordinates[index][name] = value;
    setFormData({ ...formData, coordinates: newCoordinates });
    validateField(name, value, index);
  };

  //Add a new coordinate field to the form
  const handleAddField = () => {
    setFormData({
      ...formData,
      coordinates: [...formData.coordinates, { lat: '', long: '' }]
    });
  };
  //Submit the form and create a new polygon. Reset the form after submission. If given polygon is not valid it cannot be submitted
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validateForm()) {
      const copy = { ...formData };
      setFormData({
        name: generateName(),
        type: 'roadblock',
        effectValue: 0,
        coordinates: [{ lat: '', long: '' }]
      });

      await CreatePolygon(convertToGeoJSON(copy));
      setErrors({});

      //fetch from backend polygons and route line after creating a new polygon

      dispatch(fetchPolygons());
      dispatch(fetchRouteLine(undefined, profileRef.current));
    }
  };
  // Validate updated field. if not valid add an error to error list. If list is empty, the form can be submitted
  const validateField = (name, value, index = null) => {
    let errorMsg = '';
    if (name === 'name' && !validateName(value)) {
      errorMsg = 'Name must be 3-30 characters long and contain only letters or numbers.';
    } else if (name === 'type' && !validateType(value)) {
      errorMsg = 'Type must be one of the specified options.';
    } else if ((name === 'lat' || name === 'long') && !validateCoordinate(value)) {
      errorMsg = 'Coordinates must be a number between 0 and 90.';
    } else if (name === 'effectValue' && !validateEffectValue(value, formData.type)) {
      if (formData.type === 'factor') {
        errorMsg = 'Effect value must be a positive number.';
      } else {
      errorMsg = 'Effect value must be an integer.';
      }
    }

    let newErrors = { ...errors };

    if (index !== null) {
      const coordinateErrors = newErrors.coordinates || [];
      coordinateErrors[index] = { ...coordinateErrors[index], [name]: errorMsg };
      newErrors.coordinates = coordinateErrors;

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
      newErrors.type = 'Type must be one of the specified options.';
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
    if (formData.type !== 'roadblock' && !validateEffectValue(formData.effectValue, formData.type)) {
      newErrors.effectValue = 'Effect value must be valid for the selected type.';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  //Let user click submit only if form is valid

  const canClick = () => {
    if (!validateName(formData.name)) {
      return false;
    }
    if (!validateType(formData.type)) {
      return false;
    }
    if (formData.type !== 'roadblock' && !validateEffectValue(formData.effectValue, formData.type)) {
      return false;
    }
    for (let i = 0; i < formData.coordinates.length; i++) {
      const coordinate = formData.coordinates[i];
      if (!validateCoordinate(coordinate.lat) || !validateCoordinate(coordinate.long)) {
        return false;
      }
    }
    return true;
  };
  //useEffect to update form data when user draws a polygon in map component (not in editmode)
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
            <option value="cap">Speed Limit Cap</option>
            <option value="constant">Custom Speed</option>
            <option value="offset">Speed Change (km/h)</option>
            <option value="factor">Speed Change (%)</option>
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
              onChange={(e) => {
                setFormData({ ...formData, effectValue: e.target.value });
                validateField('effectValue', e.target.value);
              }}
              className={errors.effectValue ? 'input-error' : ''}
            />
            {errors.effectValue && <span className="error">{errors.effectValue}</span>}
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
        <button type="submit" disabled={!canClick()} className={!canClick() ? 'btn-disabled' : ''}>Submit</button>
      </form>
    </div>
  );
}

export default CreatePolygons;