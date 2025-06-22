import React from 'react';
import { useDispatch } from 'react-redux';
import { 
  addTempRoad, 
  updateTempRoadAsync 
} from '../features/temproads/TempRoadsSlice';
import { calculateDistanceBetweenNodes } from '../services/TempRoadService';

function TempRoadForm({ 
  mode = 'add', 
  road = null,
  formData,
  setFormData,
  nodeSelectionMode, 
  setNodeSelectionMode,
  onFormClose
}) {
  const dispatch = useDispatch();

  const handleChange = async (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });

    if (name === 'start_node' || name === 'end_node') {
      const startNode = name === 'start_node' ? value : formData.start_node;
      const endNode = name === 'end_node' ? value : formData.end_node;

      if (startNode && endNode && startNode !== endNode) {
        try {
          const distance = await calculateDistanceBetweenNodes(startNode, endNode);
          setFormData(prev => ({
            ...prev,
            length: distance.toString()
          }));
          console.log(`Automatically calculate length: ${distance} km (from ${startNode} to ${endNode})`);
        } catch (error) {
          console.error('Error calculating road length :', error);
        }
      }
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const dataToSubmit = {
      ...formData,
      length: parseFloat(formData.length) || 0,
      speed: parseFloat(formData.speed) || 0,
      start_node: parseInt(formData.start_node) || null,
      end_node: parseInt(formData.end_node) || null
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
    const initialFormData = {
      name: '',
      type: 'iceroad',
      speed: '',
      length: '',
      start_node: '',
      end_node: '',
      description: ''
    };
    setFormData(initialFormData);
    setNodeSelectionMode({ active: false, selecting: null, isEditMode: false });
  };

  const handleCancel = () => {
    onFormClose();
  };

  const startNodeSelection = (nodeType) => {
    setNodeSelectionMode({
      active: true,
      selecting: nodeType,
      isEditMode: mode === 'edit'
    });
  };

  const formTitle = mode === 'edit' ? `Editing: ${road?.name}` : 'Add New Road';
  const submitButtonText = mode === 'edit' ? 'Save Changes' : 'Add';

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

        {/* Start Node Section */}
        <div>
          <label style={{ fontSize: '14px', fontWeight: '500', marginBottom: '5px', display: 'block', color: '#555' }}>
            Start Node:
          </label>
          <div style={{ display: 'flex', gap: '8px' }}>
            <input
              type="text"
              name="start_node"
              value={formData.start_node}
              onChange={handleChange}
              placeholder="Enter node ID or click map"
              style={{
                flex: 1,
                padding: '8px 12px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '14px'
              }}
            />
            <button
              type="button"
              onClick={() => startNodeSelection('start')}
              disabled={nodeSelectionMode.active}
              style={{
                background: (nodeSelectionMode.selecting === 'start' && 
                           nodeSelectionMode.isEditMode === (mode === 'edit')) ? '#28a745' : '#17a2b8',
                color: 'white',
                border: 'none',
                padding: '8px 12px',
                borderRadius: '4px',
                fontSize: '12px',
                cursor: nodeSelectionMode.active ? 'not-allowed' : 'pointer',
                whiteSpace: 'nowrap',
                opacity: nodeSelectionMode.active && 
                        !(nodeSelectionMode.selecting === 'start' && 
                          nodeSelectionMode.isEditMode === (mode === 'edit')) ? 0.5 : 1
              }}
            >
              {(nodeSelectionMode.selecting === 'start' && 
                nodeSelectionMode.isEditMode === (mode === 'edit')) ? 'Selecting...' : 'Select on Map'}
            </button>
          </div>
        </div>

        {/* End Node Section */}
        <div>
          <label style={{ fontSize: '14px', fontWeight: '500', marginBottom: '5px', display: 'block', color: '#555' }}>
            End Node:
          </label>
          <div style={{ display: 'flex', gap: '8px' }}>
            <input
              type="text"
              name="end_node"
              value={formData.end_node}
              onChange={handleChange}
              placeholder="Enter node ID or click map"
              style={{
                flex: 1,
                padding: '8px 12px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '14px'
              }}
            />
            <button
              type="button"
              onClick={() => startNodeSelection('end')}
              disabled={nodeSelectionMode.active}
              style={{
                background: (nodeSelectionMode.selecting === 'end' && 
                           nodeSelectionMode.isEditMode === (mode === 'edit')) ? '#28a745' : '#17a2b8',
                color: 'white',
                border: 'none',
                padding: '8px 12px',
                borderRadius: '4px',
                fontSize: '12px',
                cursor: nodeSelectionMode.active ? 'not-allowed' : 'pointer',
                whiteSpace: 'nowrap',
                opacity: nodeSelectionMode.active && 
                        !(nodeSelectionMode.selecting === 'end' && 
                          nodeSelectionMode.isEditMode === (mode === 'edit')) ? 0.5 : 1
              }}
            >
              {(nodeSelectionMode.selecting === 'end' && 
                nodeSelectionMode.isEditMode === (mode === 'edit')) ? 'Selecting...' : 'Select on Map'}
            </button>
          </div>
        </div>

        {/* Speed and Length Section */}
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

        <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
          <button
            type="submit"
            disabled={nodeSelectionMode.active}
            style={{
              background: nodeSelectionMode.active ? '#6c757d' : '#28a745',
              color: 'white',
              border: 'none',
              padding: '10px 20px',
              borderRadius: '4px',
              fontSize: '14px',
              cursor: nodeSelectionMode.active ? 'not-allowed' : 'pointer',
              fontWeight: '500',
              opacity: nodeSelectionMode.active ? 0.5 : 1
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
