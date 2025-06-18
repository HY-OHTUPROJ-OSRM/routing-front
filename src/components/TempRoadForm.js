import React from 'react';
import { useDispatch } from 'react-redux';
import { addTempRoad, updateTempRoadAsync } from '../features/temproads/TempRoadsSlice';

function TempRoadForm({ 
  mode = 'add', 
  road = null,
  formData,
  setFormData,
  onFormClose,
  onMapPointSelected
}) {
  const dispatch = useDispatch();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.geom) {
      alert("Please select two points on the map to define geometry.");
      return;
    }

    const dataToSubmit = {
      ...formData,
      length: parseFloat(formData.length) || 0,
      speed: parseFloat(formData.speed) || 0
    };

    if (mode === 'add') {
      const newRoadData = {
        ...dataToSubmit,
        status: true,
        tags: []
      };
      dispatch(addTempRoad(newRoadData));
    } else {
      dispatch(updateTempRoadAsync({ 
        id: road.id, 
        updates: { 
          ...dataToSubmit, 
          updated_at: road.updated_at
        } 
      }));
    }

    onFormClose();
  };

  const resetForm = () => {
    setFormData({
      name: '',
      type: 'iceroad',
      speed: '',
      length: '',
      geom: '',
      description: ''
    });
  };

  const handleCancel = () => {
    onFormClose();
  };

  const formTitle = mode === 'edit' ? `Editing: ${road?.name}` : 'Add New Road';
  const submitButtonText = mode === 'edit' ? 'Save Changes' : 'Add';

  const pointCount = formData._pointList?.length || 0;

  return (
    <div style={{ 
      padding: '20px', 
      borderBottom: '1px solid #e5e5e5',
      backgroundColor: mode === 'edit' ? '#f0f8ff' : '#f8f9fa'
    }}>
      {mode === 'edit' && (
        <div style={{ 
          fontSize: '14px', 
          fontWeight: '600', 
          color: '#17a2b8', 
          marginBottom: '15px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          ✏️ {formTitle}
        </div>
      )}
      
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        <div>
          <label style={{ fontSize: '14px', fontWeight: '500', marginBottom: '5px', display: 'block', color: '#555' }}>
            Name:
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            style={{
              width: '100%',
              padding: '8px 12px',
              border: '1px solid #ddd',
              borderRadius: '4px',
              fontSize: '14px'
            }}
          />
        </div>

        <div>
          <label style={{ fontSize: '14px', fontWeight: '500', marginBottom: '5px', display: 'block', color: '#555' }}>
            Type:
          </label>
          <select
            name="type"
            value={formData.type}
            onChange={handleChange}
            style={{
              width: '100%',
              padding: '8px 12px',
              border: '1px solid #ddd',
              borderRadius: '4px',
              fontSize: '14px'
            }}
          >
            <option value="iceroad">Ice Road</option>
            <option value="speed_limit">Speed Limit</option>
            <option value="temporary">Temporary</option>
          </select>
        </div>

        {/* Geometry (from map) */}
        <div>
          <label style={{ fontSize: '14px', fontWeight: '500', marginBottom: '5px', display: 'block', color: '#555' }}>
            Geometry:
          </label>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <button
              type="button"
              onClick={onMapPointSelected}
              disabled={pointCount >= 2}
              style={{
                background: '#17a2b8',
                color: 'white',
                border: 'none',
                padding: '8px 12px',
                borderRadius: '4px',
                fontSize: '14px',
                cursor: pointCount >= 2 ? 'not-allowed' : 'pointer',
                opacity: pointCount >= 2 ? 0.5 : 1
              }}
            >
              {pointCount < 2 ? 'Select Point on Map' : '2 Points Selected'}
            </button>
            <span style={{ fontSize: '13px', color: '#666' }}>
              {formData.geom || 'No geometry defined'}
            </span>
          </div>
        </div>

        {/* Speed and Length */}
        <div style={{ display: 'flex', gap: '15px', alignItems: 'flex-end' }}>
          <div style={{ flex: 0.8 }}>
            <label style={{ fontSize: '14px', fontWeight: '500', marginBottom: '5px', display: 'block', color: '#555' }}>
              Speed (Km/h):
            </label>
            <input
              type="number"
              name="speed"
              value={formData.speed}
              onChange={handleChange}
              style={{
                width: '100%',
                padding: '8px 12px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '14px'
              }}
            />
          </div>
          
          <div style={{ flex: 1.2 }}>
            <label style={{ fontSize: '14px', fontWeight: '500', marginBottom: '5px', display: 'block', color: '#555' }}>
              Length (km):
            </label>
            <input
              type="number"
              name="length"
              value={formData.length}
              onChange={handleChange}
              step="0.01"
              style={{
                width: '100%',
                padding: '8px 12px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '14px'
              }}
            />
          </div>
        </div>

        {/* Description */}
        <div>
          <label style={{ fontSize: '14px', fontWeight: '500', marginBottom: '5px', display: 'block', color: '#555' }}>
            Description:
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={3}
            style={{
              width: '100%',
              padding: '8px 12px',
              border: '1px solid #ddd',
              borderRadius: '4px',
              fontSize: '14px',
              resize: 'vertical'
            }}
          />
        </div>

        {/* Buttons */}
        <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
          <button
            type="submit"
            style={{
              background: '#28a745',
              color: 'white',
              border: 'none',
              padding: '10px 20px',
              borderRadius: '4px',
              fontSize: '14px',
              cursor: 'pointer',
              fontWeight: '500'
            }}
          >
            {submitButtonText}
          </button>
          <button
            type="button"
            onClick={handleCancel}
            style={{
              background: '#6c757d',
              color: 'white',
              border: 'none',
              padding: '10px 20px',
              borderRadius: '4px',
              fontSize: '14px',
              cursor: 'pointer',
              fontWeight: '500'
            }}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

export default TempRoadForm;
