import React, { useState, useContext, useEffect } from 'react';
import './RouteField.css';
import { validateCoordinate } from '../services/FormValidationService';
import { RouteContext } from './CoordinatesContext';
import { getRoute } from '../services/RouteService';
import { useDispatch } from 'react-redux';
import { fetchRouteLine } from '../features/routes/routeSlice';
import { fetchSegments } from '../features/segments/segmentSlice';
import { useSelector } from 'react-redux';
function Routing_form() {
  const dispatch = useDispatch();
  const [formData, setFormData] = useState({
    coordinates: [
      { lat: '', long: '', name: 'Starting Position' },
      { lat: '', long: '', name: 'Destination' }
    ]
  });
  const [errors, setErrors] = useState({});
  const { route, setRoute } = useContext(RouteContext);
  const startpos=useSelector((state) => state.routeLine.startPosition);
  const destpos=useSelector((state) => state.routeLine.endPosition);
  
  useEffect(() => {
    //console.log('startpos', startpos, destpos);
    if (startpos && destpos) {
      setFormData({
        coordinates: [
          { lat: startpos.lat, long: startpos.long, name: 'Starting Position' },
          { lat: destpos.lat, long: destpos.long, name: 'Destination' }
        ]
      });
    }
  }, [startpos, destpos]);

  const handleChange = (index, e) => {
    const { name, value } = e.target;
    const newCoordinates = [...formData.coordinates];
    newCoordinates[index][name] = value;
    setFormData({ ...formData, coordinates: newCoordinates });
    validateField(name, value, index);
    setRoute(newCoordinates.map(coord => ({ lat: coord.lat, long: coord.long })));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      console.log('Form submitted successfully:', formData);
      dispatch(fetchRouteLine(formData.coordinates));
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

  const handleGetBlockedSegments = () => {
    //console.log('Get Blocked Segments button clicked');
    dispatch(fetchSegments());
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
    for (let i = 0; i < formData.coordinates.length; i++) {
      const coordinate = formData.coordinates[i];
      if (!validateCoordinate(coordinate.lat) || !validateCoordinate(coordinate.long)) {
        return 0;
      }
    }
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
              id="lat"
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
              id="long"
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