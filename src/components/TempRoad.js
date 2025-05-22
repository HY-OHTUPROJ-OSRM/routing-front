import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchTempRoads, addTempRoad, selectRoad } from '../features/temproads/TempRoadsSlice';
import './Polygon.css';

function TempRoads() {
  const dispatch = useDispatch();
  const tempRoads = useSelector(state => state.tempRoads.list);
  const status = useSelector(state => state.tempRoads.status);
  const selectedRoadId = useSelector(state => state.tempRoads.selectedRoadId);
  
  const [showAddForm, setShowAddForm] = useState(false);
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
      status: Boolean(formData.status),
      tags: formData.tags ? formData.tags.split(',').map(tag => tag.trim()) : [],
      length: parseFloat(formData.length),
      speed: parseFloat(formData.speed)
    };
    
    dispatch(addTempRoad(dataToSubmit));
    setShowAddForm(false);
    
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

  if (status === 'loading') {
    return <div>loading...</div>;
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2>Temporary Roads</h2>
        <button 
          onClick={() => setShowAddForm(!showAddForm)}
          style={{ 
            padding: '8px 16px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          {showAddForm ? 'cancel' : 'add new'}
        </button>
      </div>

      {showAddForm ? (
        <div className="create-polygons">
          <h3>Add temporary roads</h3>
          <form onSubmit={handleSubmit}>
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

            <div className="form-group">
              <label htmlFor="start_node">startnode:</label>
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
              <label htmlFor="end_node">endnode:</label>
              <input
                type="text"
                id="end_node"
                name="end_node"
                value={formData.end_node}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="length">length(km):</label>
              <input
                type="number"
                id="length"
                name="length"
                value={formData.length}
                onChange={handleChange}
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

            <div className="form-group">
              <label htmlFor="description">description:</label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
              />
            </div>

            <button type="submit">submit</button>
          </form>
        </div>
      ) : (
        <div>
          {tempRoads.length === 0 ? (
            <p>No temporary routes found</p>
          ) : (
            tempRoads.map(road => (
              <div 
                key={road.id} 
                className={`polygon ${selectedRoadId === road.id ? 'highlight' : ''}`}
                onClick={() => handleSelectRoad(road.id)}
              >
                <h3>{road.name}</h3>
                <p>Type: {road.type}</p>
                <p>Startnode: {road.start_node}</p>
                <p>Endnode: {road.end_node}</p>
                <p>Length: {road.length} km</p>
                <p>Speed: {road.speed} km/h</p>
                <p>Status: {road.status ? 'activated' : 'inactivated'}</p>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

export default TempRoads;