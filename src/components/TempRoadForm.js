import React, { useContext, useRef, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { addTempRoad, updateTempRoadAsync } from '../features/temproads/TempRoadsSlice';
import { fetchRouteLine } from "../features/routes/routeSlice";
import { ProfileContext } from './CoordinatesContext';
import './comp_styles.scss';

function TempRoadForm({ 
  mode = 'add', 
  road = null,
  formData,
  defaultSpeed = 50,
  setFormData,
  nodeSelectionMode, 
  setNodeSelectionMode,
  onFormClose
}) {
  const dispatch = useDispatch();
  const { selectedProfile } = useContext(ProfileContext);
  const profileRef = useRef(selectedProfile);

  useEffect(() => {
    profileRef.current = selectedProfile;
  }, [selectedProfile]);

  const directionOptions = [
    { value: 2, label: 'Bidirectional', icon: '↔️'},
    { value: 0, label: 'Forward', icon: '➡️'},
    { value: 1, label: 'Backward', icon: '⬅️'}
  ];

  const handleCoordChange = (type, field, value) => {
    setFormData(prev => ({
      ...prev,
      [type]: {
        ...prev[type],
        [field]: value
      }
    }));
  };

  const handleChange = e => {
    const { name, value } = e.target;
    if (name === 'start_lat' || name === 'start_lng') {
      handleCoordChange('start_coordinates', name.endsWith('lat') ? 'lat' : 'lng', value);
    } else if (name === 'end_lat' || name === 'end_lng') {
      handleCoordChange('end_coordinates', name.endsWith('lat') ? 'lat' : 'lng', value);
    } else if (name === 'direction') { 
      setFormData({ ...formData, [name]: parseInt(value) });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async e => {
    e.preventDefault();
    console.log('Form submit started', { mode });

    const rawSpeed = parseFloat(formData.speed) || defaultSpeed;
    const rawLength = parseFloat(formData.length) || 0;
    const speed = Math.round(rawSpeed * 10) / 10;
    const length = Math.round(rawLength * 1000) / 1000;

    const geom = {
      type: 'LineString',
      coordinates: [
        [parseFloat(formData.start_coordinates.lng), parseFloat(formData.start_coordinates.lat)],
        [parseFloat(formData.end_coordinates.lng), parseFloat(formData.end_coordinates.lat)]
      ]
    };

    const dataToSubmit = {
      ...formData,
      speed,
      length,
      direction: formData.direction !== undefined ? formData.direction : 2,
      start_coordinates: {
        lat: parseFloat(formData.start_coordinates.lat),
        lng: parseFloat(formData.start_coordinates.lng)
      },
      end_coordinates: {
        lat: parseFloat(formData.end_coordinates.lat),
        lng: parseFloat(formData.end_coordinates.lng)
      },
      geom
    };

    try {
      if (mode === 'add') {
        console.log('Adding temp road…');
        await dispatch(addTempRoad({ ...dataToSubmit, status: true, tags: [] }));
        console.log('Temp road added successfully ✅'); 
        
        console.log('Start recalculating route line…');
        await dispatch(fetchRouteLine(undefined, profileRef.current));
        console.log('Route recalculated successfully ✅');
      } else {
        console.log('Update temp road…', road.id);
        await dispatch(updateTempRoadAsync({ 
          id: road.id, 
          updates: { ...dataToSubmit, updated_at: road.updated_at } 
        }));
        console.log('Road update dispatched ✅');
        
        console.log('Start recalculating route line…');
        await dispatch(fetchRouteLine(undefined, profileRef.current));
        console.log('Route recalculated successfully ✅');
      }
    } catch (error) {
      console.error('❌ Failed:', error);
    } finally {
      onFormClose();
    }
  };

  const handleCancel = () => {
    onFormClose();
  };

  const startNodeSelection = nodeType => {
    setNodeSelectionMode({ active: true, selecting: nodeType, isEditMode: mode === 'edit' });
  };

  const formTitle = mode === 'edit' ? `Editing: ${road?.name}` : 'Add New Road';
  const submitText = mode === 'edit' ? 'Save Changes' : 'Add';

  return (
    <div className="temp-road-form">
      {mode === 'edit' && <h4 className="form-title">✏️ {formTitle}</h4>}
      <form className="form-body" onSubmit={handleSubmit}>
        <label htmlFor="name-input">Name</label>
        <input
          id="name-input"
          className="temp-road-input"
          type="text"
          name="name"
          placeholder="Enter road name"
          value={formData.name}
          onChange={handleChange}
          required
        />

        <label htmlFor="type-select">Type</label>
        <select
          id="type-select"
          className="filter-dropdown"
          name="type"
          value={formData.type}
          onChange={handleChange}
        >
          <option value="temporary">Temporary</option>
          <option value="iceroad">Ice Road</option>
          <option value="bridge">Temporary Bridge</option>
        </select>

        <label htmlFor="direction-select">Direction</label>
        <div className="direction-selector">
          {directionOptions.map(option => (
            <label key={option.value} className="direction-option">
              <input
                type="radio"
                name="direction"
                value={option.value}
                checked={formData.direction === option.value}
                onChange={handleChange}
              />
              <span className="direction-icon">{option.icon}</span>
              <span className="direction-label">
                {option.label}
              </span>
            </label>
          ))}
        </div>

        <fieldset className="coord-group">
          <legend>Start Coordinates</legend>
          <input
            className="temp-road-input coord-input"
            type="number"
            name="start_lat"
            value={formData.start_coordinates.lat}
            onChange={handleChange}
            placeholder="Latitude"
          />
          <input
            className="temp-road-input coord-input"
            type="number"
            name="start_lng"
            value={formData.start_coordinates.lng}
            onChange={handleChange}
            placeholder="Longitude"
          />
          <button
            className="temp-road-button coord-select-button"
            type="button"
            onClick={() => startNodeSelection('start')}
            disabled={nodeSelectionMode.active}
          >
            {(nodeSelectionMode.selecting === 'start' && nodeSelectionMode.isEditMode === (mode === 'edit'))
              ? 'Selecting…'
              : 'Select on Map'}
          </button>
        </fieldset>

        <fieldset className="coord-group">
          <legend>End Coordinates</legend>
          <input
            className="temp-road-input coord-input"
            type="number"
            name="end_lat"
            value={formData.end_coordinates.lat}
            onChange={handleChange}
            placeholder="Latitude"
          />
          <input
            className="temp-road-input coord-input"
            type="number"
            name="end_lng"
            value={formData.end_coordinates.lng}
            onChange={handleChange}
            placeholder="Longitude"
          />
          <button
            className="temp-road-button coord-select-button"
            type="button"
            onClick={() => startNodeSelection('end')}
            disabled={nodeSelectionMode.active}
          >
            {(nodeSelectionMode.selecting === 'end' && nodeSelectionMode.isEditMode === (mode === 'edit'))
              ? 'Selecting…'
              : 'Select on Map'}
          </button>
        </fieldset>

        <label htmlFor="speed-input">Speed (Km/h)</label>
        <input
          id="speed-input"
          className="temp-road-input"
          type="number"
          name="speed"
          value={formData.speed}
          placeholder={defaultSpeed}
          onChange={handleChange}
          min={0}
          step="any"
        />

        <label htmlFor="length-input">Length (km)</label>
        <input
          id="length-input"
          className="temp-road-input"
          type="number"
          name="length"
          value={formData.length}
          onChange={handleChange}
          min={0}
          step="any"
        />

        <div className="form-actions">
          <button
            className="temp-road-button"
            type="submit"
            disabled={nodeSelectionMode.active}
          >
            {submitText}
          </button>
          <button
            className="temp-road-button"
            type="button"
            onClick={handleCancel}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

export default TempRoadForm;