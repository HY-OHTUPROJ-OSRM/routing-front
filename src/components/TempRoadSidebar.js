import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  fetchTempRoads, 
  addTempRoad, 
  updateTempRoadAsync,
  deleteTempRoadAsync,
  selectRoad 
} from '../features/temproads/TempRoadsSlice';
import './TempRoadSidebar.css';

function TempRoadSidebar({ isOpen, toggleSidebar }) {
  const dispatch = useDispatch();
  const tempRoads = useSelector(state => state.tempRoads.list);
  const status = useSelector(state => state.tempRoads.status);
  const selectedRoadId = useSelector(state => state.tempRoads.selectedRoadId);
  
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingRoad, setEditingRoad] = useState(null);
  const [formData, setFormData] = useState({
    type: 'temporary',
    name: '',
    status: true,
    tags: '',
    start_node: '',
    end_node: '',
    length: '',
    speed: '',
    description: ''
  });

  useEffect(() => {
    if (status === 'idle') {
      dispatch(fetchTempRoads());
    }
  }, [status, dispatch]);

  const handleSelectRoad = (id) => {
    dispatch(selectRoad(id));
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const dataToSubmit = {
      ...formData,
      status: Boolean(formData.status),
      tags: formData.tags ? formData.tags.split(',').map(tag => tag.trim()) : [],
      length: parseFloat(formData.length),
      speed: parseFloat(formData.speed)
    };
    
    if (editingRoad) {
      dispatch(updateTempRoadAsync({ id: editingRoad.id, updates: dataToSubmit }));
    } else {
      dispatch(addTempRoad(dataToSubmit));
    }
    
    setShowAddForm(false);
    setEditingRoad(null);
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      type: 'temporary',
      name: '',
      status: true,
      tags: '',
      start_node: '',
      end_node: '',
      length: '',
      speed: '',
      description: ''
    });
  };

  const handleEdit = (road) => {
    setEditingRoad(road);
    setFormData({
      ...road,
      tags: road.tags ? road.tags.join(', ') : ''
    });
    setShowAddForm(true);
  };

  const handleDelete = (roadId) => {
    if (window.confirm('Are you sure you want to delete this temporary road?')) {
      dispatch(deleteTempRoadAsync(roadId));
    }
  };

  const handleCancel = () => {
    setShowAddForm(false);
    setEditingRoad(null);
    resetForm();
  };

  if (!isOpen) return null;

  return (
    <div className="temp-road-sidebar">
      <div className="sidebar-header">
        <h2>Temporary Roads</h2>
        <div className="header-buttons">
          <button 
            className="add-button"
            onClick={() => setShowAddForm(!showAddForm)}
          >
            {showAddForm ? 'cancel' : 'add new'}
          </button>
          <button 
            className="close-button"
            onClick={toggleSidebar}
          >
            ×
          </button>
        </div>
      </div>

      <div className="sidebar-content">
        {showAddForm && (
          <div className="add-form-section">
            <h3>{editingRoad ? 'Addit' : 'add new'}</h3>
            <form onSubmit={handleSubmit} className="temp-road-form">
              <div className="form-group">
                <label htmlFor="name">name:</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="start_node">start node:</label>
                  <input
                    type="text"
                    id="start_node"
                    name="start_node"
                    value={formData.start_node}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="end_node">end node:</label>
                  <input
                    type="text"
                    id="end_node"
                    name="end_node"
                    value={formData.end_node}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="length">length(km):</label>
                  <input
                    type="number"
                    id="length"
                    name="length"
                    value={formData.length}
                    onChange={handleChange}
                    step="0.1"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="speed">speed(km/h):</label>
                  <input
                    type="number"
                    id="speed"
                    name="speed"
                    value={formData.speed}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="description">description:</label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows="3"
                />
              </div>

              <div className="form-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    name="status"
                    checked={formData.status}
                    onChange={handleChange}
                  />
                  激活状态
                </label>
              </div>

              <div className="form-buttons">
                <button type="submit" className="submit-button">
                  {editingRoad ? 'update' : 'submit'}
                </button>
                <button type="button" onClick={handleCancel} className="cancel-button">
                  cancel
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="roads-list">
          {status === 'loading' && <div className="loading">loading...</div>}
          
          {tempRoads.length === 0 && status !== 'loading' ? (
            <p className="no-roads">No temporary roads yet</p>
          ) : (
            tempRoads.map(road => (
              <div 
                key={road.id} 
                className={`road-item ${selectedRoadId === road.id ? 'selected' : ''}`}
                onClick={() => handleSelectRoad(road.id)}
              >
                <div className="road-header">
                  <div className="road-actions">
                    <button 
                      className="edit-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEdit(road);
                      }}
                      title="edit"
                    >
                      ✏️
                    </button>
                    <button 
                      className="delete-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(road.id);
                      }}
                      title="delete"
                    >
                      🗑️
                    </button>
                  </div>
                  <h3 className="road-name">{road.name}</h3>
                </div>
                
                <div className="road-info">
                  <div className="info-item">
                    <span className="label">type:</span>
                    <span className="value">{road.type}</span>
                  </div>
                  <div className="info-item">
                    <span className="label">length:</span>
                    <span className="value">{road.length} km</span>
                  </div>
                  <div className="info-item">
                    <span className="label">speed:</span>
                    <span className="value">{road.speed} km/h</span>
                  </div>
                  <div className="info-item">
                    <span className="label">status:</span>
                    <span className={`value status ${road.status ? 'active' : 'inactive'}`}>
                      {road.status ? 'active' : 'inactive'}
                    </span>
                  </div>
                  {road.description && (
                    <div className="info-item description">
                      <span className="label">description:</span>
                      <span className="value">{road.description}</span>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default TempRoadSidebar;