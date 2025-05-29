import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  fetchTempRoads, 
  addTempRoad, 
  deleteTempRoadAsync,
  selectRoad 
} from '../features/temproads/TempRoadsSlice';
import './Polygon.css';

function TempRoads(props) {
  const dispatch = useDispatch();
  const tempRoads = useSelector(state => state.tempRoads.list);
  const status = useSelector(state => state.tempRoads.status);
  const selectedRoadId = useSelector(state => state.tempRoads.selectedRoadId);
  const [visibleRoads, setVisibleRoads] = useState(new Set());
  
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    type: 'iceroad',
    speed: '',
    length: '',
    start_node: '',
    end_node: '',
    description: ''
  });

  useEffect(() => {
    if (status === 'idle') {
      dispatch(fetchTempRoads());
    }
  }, [status, dispatch]);

  useEffect(() => {
    if (props.onVisibleRoadsChange) {
      props.onVisibleRoadsChange(visibleRoads);
    }
  }, [visibleRoads, props.onVisibleRoadsChange]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const dataToSubmit = {
      ...formData,
      status: true,
      tags: [],
      length: parseFloat(formData.length) || 0,
      speed: parseFloat(formData.speed) || 0,
      start_node: parseInt(formData.start_node) || null,
      end_node: parseInt(formData.end_node) || null
    };
    
    dispatch(addTempRoad(dataToSubmit));
    setShowAddForm(false);
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      name: '',
      type: 'iceroad',
      speed: '',
      length: '',
      start_node: '',
      end_node: '',
      description: ''
    });
  };

  const handleDelete = (roadId) => {
    if (window.confirm('Are you sure you want to delete this road segment?')) {
      dispatch(deleteTempRoadAsync(roadId));
      setVisibleRoads(prev => {
        const newSet = new Set(prev);
        newSet.delete(roadId);
        return newSet;
      });
    }
  };

  const handleSelectRoad = (id) => {
    dispatch(selectRoad(id));
  };

  const showCoordinates = (road) => {
    alert(`Coordinates for ${road.name}: Start: ${road.start_node}, End: ${road.end_node}`);
  };

  const showOnMap = (road) => {
    setVisibleRoads(prev => {
      const newSet = new Set(prev);
      const roadId = road.id;
      
      if (newSet.has(roadId)) {
        newSet.delete(roadId);
      } else {
        newSet.add(roadId);
      }
      
      return newSet;
    });
    
    dispatch(selectRoad(road.id));
  };

  const getTypeDisplay = (type) => {
    switch(type) {
      case 'iceroad': return 'Ice Road';
      case 'speed_limit': return 'Speed Limit';
      case 'temporary': return 'Temporary';
      default: return type;
    }
  };

  if (status === 'loading') {
    return <div style={{ padding: '20px', textAlign: 'center' }}>Loading...</div>;
  }

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Header with title and add button */}
      <div style={{ 
        padding: '15px 20px', 
        borderBottom: '1px solid #e5e5e5',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#f8f9fa'
      }}>
        <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '600', color: '#333' }}>
          Temporary Roads
        </h3>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          style={{
            background: '#4285f4',
            color: 'white',
            border: 'none',
            padding: '8px 16px',
            borderRadius: '4px',
            fontSize: '14px',
            cursor: 'pointer',
            fontWeight: '500'
          }}
        >
          {showAddForm ? '×' : 'add new'}
        </button>
      </div>

      {/* Add Form */}
      {showAddForm && (
        <div style={{ 
          padding: '20px', 
          borderBottom: '1px solid #e5e5e5',
          backgroundColor: '#f8f9fa'
        }}>
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

            <div style={{ display: 'flex', gap: '15px' }}>
              <div style={{ flex: 1 }}>
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
              
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: '14px', fontWeight: '500', marginBottom: '5px', display: 'block', color: '#555' }}>
                  Length (km):
                </label>
                <input
                  type="number"
                  name="length"
                  value={formData.length}
                  onChange={handleChange}
                  step="0.1"
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

            <div style={{ display: 'flex', gap: '15px' }}>
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: '14px', fontWeight: '500', marginBottom: '5px', display: 'block', color: '#555' }}>
                  Start Node:
                </label>
                <input
                  type="text"
                  name="start_node"
                  value={formData.start_node}
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

              <div style={{ flex: 1 }}>
                <label style={{ fontSize: '14px', fontWeight: '500', marginBottom: '5px', display: 'block', color: '#555' }}>
                  End Node:
                </label>
                <input
                  type="text"
                  name="end_node"
                  value={formData.end_node}
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
            </div>

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
                Add
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowAddForm(false);
                  resetForm();
                }}
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
      )}

      {/* Roads List */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '0' }}>
        {tempRoads.length === 0 ? (
          <div style={{ 
            padding: '40px 20px', 
            textAlign: 'center', 
            color: '#999',
            fontStyle: 'italic',
            fontSize: '14px'
          }}>
            No temporary roads yet
          </div>
        ) : (
          tempRoads.map(road => (
            <div 
              key={road.id}
              style={{
                padding: '15px 20px',
                borderBottom: '1px solid #e5e5e5',
                backgroundColor: selectedRoadId === road.id ? '#e3f2fd' : 'white',
                borderLeft: selectedRoadId === road.id ? '4px solid #4285f4' : 'none',
                cursor: 'pointer'
              }}
              onClick={() => handleSelectRoad(road.id)}
            >
              {/* Road Header */}
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'flex-start',
                marginBottom: '8px'
              }}>
                <h4 style={{ 
                  margin: 0, 
                  fontSize: '16px', 
                  fontWeight: '600',
                  color: '#333'
                }}>
                  {road.name}
                </h4>
                <div style={{ display: 'flex', gap: '5px' }}>
                  {/* Visibility indicator */}
                  {visibleRoads.has(road.id) && (
                    <span style={{ 
                      color: '#28a745', 
                      fontSize: '16px',
                      title: 'Visible on map'
                    }}>
                      👁️
                    </span>
                  )}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(road.id);
                    }}
                    style={{
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      padding: '4px',
                      color: '#dc3545',
                      fontSize: '16px'
                    }}
                    title="Delete"
                  >
                    🗑️
                  </button>
                </div>
              </div>

              {/* Road Type */}
              <div style={{ 
                fontSize: '13px', 
                color: '#6c757d',
                marginBottom: '8px'
              }}>
                {getTypeDisplay(road.type)}
              </div>

              {/* Speed Info (if applicable) */}
              {road.speed > 0 && (
                <div style={{ 
                  fontSize: '13px', 
                  color: '#333',
                  marginBottom: '8px',
                  fontWeight: '500'
                }}>
                  Speed limit: {road.speed} (Km/h)
                </div>
              )}

              {/* Length Info (if applicable) */}
              {road.length > 0 && (
                <div style={{ 
                  fontSize: '13px', 
                  color: '#333',
                  marginBottom: '8px'
                }}>
                  Length: {road.length} km
                </div>
              )}

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    showCoordinates(road);
                  }}
                  style={{
                    background: '#17a2b8',
                    color: 'white',
                    border: 'none',
                    padding: '8px 12px',
                    borderRadius: '4px',
                    fontSize: '12px',
                    cursor: 'pointer',
                    flex: 1,
                    fontWeight: '500'
                  }}
                >
                  Show Coordinates
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    showOnMap(road);
                  }}
                  style={{
                    background: visibleRoads.has(road.id) ? '#dc3545' : '#28a745',
                    color: 'white',
                    border: 'none',
                    padding: '8px 12px',
                    borderRadius: '4px',
                    fontSize: '12px',
                    cursor: 'pointer',
                    flex: 1,
                    fontWeight: '500'
                  }}
                >
                  {visibleRoads.has(road.id) ? 'Hide from map' : 'Show on map'}
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default TempRoads;