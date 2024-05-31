import React, { useState, useContext, useEffect } from 'react';
import './RouteField.css';
import { validateCoordinate } from '../services/FormValidationService';
import { RouteContext } from './CoordinatesContext';
import {getRoute} from '../services/RouteService';
function Routing_form() {
  const [formData, setFormData] = useState({
    coordinates: [
      { lat: '', long: '', name: 'Starting Position' },
      { lat: '', long: '', name: 'Destination' }
    ]
  });
  const [errors, setErrors] = useState({});
  const { route, setRoute } = useContext(RouteContext);

  useEffect(() => {
    console.log(route)
    if (route && route.length === 2 && route[1]!==null && route[0]!==null) {
      setFormData({
        coordinates: [
          { lat: route[0].lat, long: route[0].lng, name: 'Starting Position' },
          { lat: route[1].lat, long: route[1].lng, name: 'Destination' }
        ]
      });
    }
  }, [route]);


  const handleChange = (index, e) => {
    const { name, value } = e.target;
    const newCoordinates = [...formData.coordinates];
    newCoordinates[index][name] = value;
    setFormData({ ...formData, coordinates: newCoordinates });
    validateField(name, value, index);
    setRoute(newCoordinates.map(coord => ({ lat: coord.lat, lng: coord.long })));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      console.log('Form submitted successfully:', formData);
      getRoute(formData.coordinates);
      setFormData({
        coordinates: [
            { lat: '', long: '', name: 'Starting Position' },
            { lat: '', long: '', name: 'Destination' }
        ]
      });
      setErrors({});
      setRoute([]);
    }
  };

  const validateField = (name, value, index) => {
    let errorMsg = '';
    if ((name === 'lat' || name === 'long') && !validateCoordinate(value)) {
      errorMsg = 'Coordinates must be a number between 0 and 90.';
    }
    const coordinateErrors = errors.coordinates || [];
    coordinateErrors[index] = { ...coordinateErrors[index], [name]: errorMsg };
    setErrors({ ...errors, coordinates: coordinateErrors });
  };

  const validateForm = () => {
    const newErrors = {};
    let errCount = 0;
    formData.coordinates.forEach((coordinate, index) => {
      const coordErrors = {};
      if (!validateCoordinate(coordinate.lat)) {
        errCount++;
        coordErrors.lat = 'Latitude must be a number between 0 and 90.';
      }
      if (!validateCoordinate(coordinate.long)) {
        errCount++;
        coordErrors.long = 'Longitude must be a number between 0 and 90.';
      }
      if (Object.keys(coordErrors).length > 0) {
        if (!newErrors.coordinates) {
          newErrors.coordinates = [];
        }
        newErrors.coordinates[index] = coordErrors;
      }
    });
    setErrors(newErrors);
    return errCount === 0;
  };

  const can_click = () => {
    //console.log("can_click");
    for (let i = 0; i < formData.coordinates.length; i++) {
      const coordinate = formData.coordinates[i];
      if (!validateCoordinate(coordinate.lat) || !validateCoordinate(coordinate.long)) {
        return 0;
      }
    }
    
    //console.log('now can click');
    return 1;
  };


  return (
    <div className="new-component">
      <h2>Routing form</h2>
      <form onSubmit={handleSubmit}>
        {formData.coordinates.map((coordinate, index) => (
          <div key={index} className="form-group">
            <label>{coordinate.name}:</label>
            <input
              type="text"
              name="lat"
              value={coordinate.lat}
              onChange={(e) => handleChange(index, e)}
              placeholder="Latitude"
              className={errors.coordinates && errors.coordinates[index] && errors.coordinates[index].lat ? 'input-error' : ''}
            />
            {errors.coordinates && errors.coordinates[index] && errors.coordinates[index].lat && (
              <span className="error">{errors.coordinates[index].lat}</span>
            )}
            <input
              type="text"
              name="long"
              value={coordinate.long}
              onChange={(e) => handleChange(index, e)}
              placeholder="Longitude"
              className={errors.coordinates && errors.coordinates[index] && errors.coordinates[index].long ? 'input-error' : ''}
            />
            {errors.coordinates && errors.coordinates[index] && errors.coordinates[index].long && (
              <span className="error">{errors.coordinates[index].long}</span>
            )}
          </div>
        ))}
        <button type="submit" disabled={!can_click()} className={!can_click() ? 'btn-disabled' : ''}>
          Route
        </button>
      </form>
    </div>
  );
}

export default Routing_form;