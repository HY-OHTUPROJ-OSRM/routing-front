import React, { useState, useContext, useEffect } from 'react';
import './RouteField.css';
import { validateCoordinate } from '../services/FormValidationService';
import { RouteContext } from './CoordinatesContext';
import { useDispatch, useSelector } from 'react-redux';
import { fetchRouteLine } from '../features/routes/routeSlice';
import RouteList from './RouteInfo';
// Form for routing. Can receive coordinates from the map component when user has placed start and destination position. The form is validated and the route is fetched when the user clicks submit. The form is reset after submission.

function RoutingForm() {
  const dispatch = useDispatch();
  const [formData, setFormData] = useState({
    coordinates: [
      { lat: '', long: '', name: 'Starting Position' },
      { lat: '', long: '', name: 'Destination' }
    ]
  });

  const [errors, setErrors] = useState({});
  const { setRoute } = useContext(RouteContext);
  const startpos = useSelector(state => state.routeLine.startPosition);
  const destpos = useSelector(state => state.routeLine.endPosition);

  useEffect(() => {
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
    setFormData({ coordinates: newCoordinates });
    validateField(name, value, index);
    setRoute(newCoordinates.map(coord => ({ lat: coord.lat, long: coord.long })));
  };

  const validateField = (name, value, index) => {
    let errorMsg = '';
    if ((name === 'lat' || name === 'long') && !validateCoordinate(value)) {
      errorMsg = 'Invalid coordinate';
    }
    const coordinateErrors = errors.coordinates || [];
    coordinateErrors[index] = { ...coordinateErrors[index], [name]: errorMsg };
    setErrors({ coordinates: coordinateErrors });
  };

  const validateForm = () => {
    return formData.coordinates.every(
      coord => validateCoordinate(coord.lat) && validateCoordinate(coord.long)
    );
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
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

  return (
    <div className="new-component">
      <form className="form-horizontal" onSubmit={handleSubmit}>
        <div className="coordinate-group">
          <label>Starting Position</label>
          <input
            name="lat"
            value={formData.coordinates[0].lat}
            onChange={(e) => handleChange(0, e)}
            placeholder="Latitude"
          />
          <input
            name="long"
            value={formData.coordinates[0].long}
            onChange={(e) => handleChange(0, e)}
            placeholder="Longitude"
          />
        </div>

        <div className="coordinate-group">
          <label>Destination</label>
          <input
            name="lat"
            value={formData.coordinates[1].lat}
            onChange={(e) => handleChange(1, e)}
            placeholder="Latitude"
          />
          <input
            name="long"
            value={formData.coordinates[1].long}
            onChange={(e) => handleChange(1, e)}
            placeholder="Longitude"
          />
        </div>

        <button type="submit" disabled={!validateForm()} className={!validateForm() ? 'btn-disabled' : ''}>
          Route
        </button>
      </form>

      <div className="route-list-container">
        <RouteList />
      </div>
    </div>
  );
}

export default RoutingForm;