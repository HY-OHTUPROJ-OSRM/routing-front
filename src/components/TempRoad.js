import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  fetchTempRoads, 
  selectRoad 
} from '../features/temproads/TempRoadsSlice';
import { changeMapView } from '../features/view/ViewSlice';
import TempRoadForm from './TempRoadForm';
import TempRoadItem from './TempRoadItem';
import './Polygon.css';
import { getNearestNodeCoordinates } from '../services/TempRoadService';

// Remove local nodeSelectionMode and handler, accept as props
function TempRoads({
  onVisibleRoadsChange,
  onNodeSelectionModeChange,
  onNodeSelectionHandler,
  nodeSelectionMode,
  setNodeSelectionMode,
  handleNodeSelection
}) {
  const dispatch = useDispatch();
  const tempRoads = useSelector(state => state.tempRoads.list);
  const status = useSelector(state => state.tempRoads.status);
  const selectedRoadId = useSelector(state => state.tempRoads.selectedRoadId);
  const [visibleRoads, setVisibleRoads] = useState(new Set());
  
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');

  const applyFilters = (tempRoads, searchTerm, filterType) => {
    return tempRoads.filter((item) => {
      const matchesSearch =
        searchTerm === "" ||
        item.tags.some(tag => tag.toLowerCase().includes(searchTerm)) ||
        item.name.toLowerCase().includes(searchTerm) ||
        item.description.toLowerCase().includes(searchTerm);
      const matchesFilter =
        filterType === "all" ||
        (filterType === "temporary" && item.type === "temporary") ||
        (filterType === "iceroad" && item.type === "iceroad") ||
        (filterType === "speed_limit" && item.type === "speed_limit");
      return matchesSearch && matchesFilter;
    });
  };

  const filteredTempRoads = useSelector(state => applyFilters(state.tempRoads.list, searchTerm, filterType));

  const [showCoordinatesForRoad, setShowCoordinatesForRoad] = useState(null);
  const [nodeCoordinates, setNodeCoordinates] = useState({});
  
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingRoadId, setEditingRoadId] = useState(null);

  const handleNodeSelectionInternal = async (_unusedNodeId, coordinates) => {
    if (!nodeSelectionMode.active) {
      return;
    }
    try {
      // coordinates: [lat, lng] from map click
      const nearestCoords = await getNearestNodeCoordinates(coordinates[0], coordinates[1]);
      if (nodeSelectionMode.isEditMode) {
        if (nodeSelectionMode.selecting === 'start') {
          setEditFormData(prev => ({
            ...prev,
            start_coordinates: { lat: nearestCoords[0], lng: nearestCoords[1] }
          }));
        } else if (nodeSelectionMode.selecting === 'end') {
          setEditFormData(prev => ({
            ...prev,
            end_coordinates: { lat: nearestCoords[0], lng: nearestCoords[1] }
          }));
        }
      } else {
        if (nodeSelectionMode.selecting === 'start') {
          setAddFormData(prev => ({
            ...prev,
            start_coordinates: { lat: nearestCoords[0], lng: nearestCoords[1] }
          }));
        } else if (nodeSelectionMode.selecting === 'end') {
          setAddFormData(prev => ({
            ...prev,
            end_coordinates: { lat: nearestCoords[0], lng: nearestCoords[1] }
          }));
        }
      }
      setNodeSelectionMode({ active: false, selecting: null, isEditMode: false });
    } catch (error) {
      // Show error message if nearest node lookup fails
      window.alert(
        'Failed to get nearest node coordinates: ' + (error?.message || error || 'Unknown error')
      );
      setNodeSelectionMode({ active: false, selecting: null, isEditMode: false });
    }
  };
  
  // Register the handler with parent on mount
  useEffect(() => {
    if (onNodeSelectionHandler) {
      onNodeSelectionHandler(handleNodeSelectionInternal);
    }
  }, [onNodeSelectionHandler, handleNodeSelectionInternal]);

  useEffect(() => {
    if (status === 'idle') {
      dispatch(fetchTempRoads());
    }
  }, [status, dispatch]);

  useEffect(() => {
    if (onVisibleRoadsChange) {
      onVisibleRoadsChange(visibleRoads);
    }
  }, [visibleRoads, onVisibleRoadsChange]);

  useEffect(() => {
    if (onNodeSelectionModeChange) {
      onNodeSelectionModeChange(nodeSelectionMode);
    }
  }, [nodeSelectionMode, onNodeSelectionModeChange]);

  // Add states for form data management
  const [addFormData, setAddFormData] = useState({
    name: '',
    type: 'iceroad',
    speed: '',
    length: '',
    start_coordinates: { lat: '', lng: '' },
    end_coordinates: { lat: '', lng: '' },
    description: ''
  });

  const [editFormData, setEditFormData] = useState({
    name: '',
    type: 'iceroad',
    speed: '',
    length: '',
    start_coordinates: { lat: '', lng: '' },
    end_coordinates: { lat: '', lng: '' },
    description: ''
  });

  const handleSelectRoad = (id) => {
    dispatch(selectRoad(id));
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

  const cancelNodeSelection = () => {
    setNodeSelectionMode({ active: false, selecting: null, isEditMode: false });
  };

  const cancelEdit = () => {
    setEditingRoadId(null);
    setEditFormData({
      name: '',
      type: 'iceroad',
      speed: '',
      length: '',
      start_coordinates: { lat: '', lng: '' },
      end_coordinates: { lat: '', lng: '' },
      description: ''
    });
    setNodeSelectionMode({ active: false, selecting: null, isEditMode: false });
  };

  const resetAddForm = () => {
    setAddFormData({
      name: '',
      type: 'iceroad',
      speed: '',
      length: '',
      start_coordinates: { lat: '', lng: '' },
      end_coordinates: { lat: '', lng: '' },
      description: ''
    });
    setNodeSelectionMode({ active: false, selecting: null, isEditMode: false });
  };

  if (status === 'loading') {
    return <div style={{ padding: '20px', textAlign: 'center' }}>Loading...</div>;
  }

  // Roads List
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
          onClick={() => {
            setShowAddForm(!showAddForm);
            if (!showAddForm) {
              cancelEdit();
            }
          }}
          disabled={editingRoadId !== null}
          style={{
            background: editingRoadId !== null ? '#6c757d' : '#4285f4',
            color: 'white',
            border: 'none',
            padding: '8px 16px',
            borderRadius: '4px',
            fontSize: '14px',
            cursor: editingRoadId !== null ? 'not-allowed' : 'pointer',
            fontWeight: '500',
            opacity: editingRoadId !== null ? 0.5 : 1
          }}
        >
          {showAddForm ? '×' : 'add new'}
        </button>
      </div>

      {/* Node Selection Mode Indicator */}
      {nodeSelectionMode.active && (
        <div style={{ 
          padding: '10px 20px',
          backgroundColor: '#fff3cd',
          borderBottom: '1px solid #ffeaa7',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <span style={{ fontSize: '14px', color: '#856404' }}>
            📍 Click on the map to select {nodeSelectionMode.selecting} node
            {nodeSelectionMode.isEditMode && ' (editing mode)'}
          </span>
          <button
            onClick={cancelNodeSelection}
            style={{
              background: '#6c757d',
              color: 'white',
              border: 'none',
              padding: '4px 8px',
              borderRadius: '4px',
              fontSize: '12px',
              cursor: 'pointer'
            }}
          >
            Cancel
          </button>
        </div>
      )}

      {/* Add Form */}
      {showAddForm && (
        <TempRoadForm 
          mode="add"
          formData={addFormData}
          setFormData={setAddFormData}
          nodeSelectionMode={nodeSelectionMode}
          setNodeSelectionMode={setNodeSelectionMode}
          onFormClose={() => {
            setShowAddForm(false);
            resetAddForm();
          }}
        />
      )}

      {/* Roads List */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '0' }}>
        {Array.isArray(tempRoads) && tempRoads.length === 0 ? (
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
          <>
            <div>
               <input
                type="text"
                placeholder="Filter by name or tag..."
                className="search-temproads"
                onChange={(e) => {
                  setSearchTerm(e.target.value.toLowerCase());
                }}
              />
              <select
                className="filter-temproads"
                value={filterType}
                onChange={(e) => {
                  setFilterType(e.target.value);
                }}
              >
                <option value="all">Show All Types</option>
                <option value="iceroad">Show Ice Roads</option>
                <option value="speed_limit">Show Speed Limits</option>
                <option value="temporary">Show Temporary Roads</option>
              </select>
            </div>
            <div>
              {Array.isArray(filteredTempRoads) && filteredTempRoads.length > 0 ? (
                filteredTempRoads.map(road => {
                  if (!road) {
                    return null;
                  }
                  return (
                    <TempRoadItem
                      key={road.id}
                      road={road}
                      selectedRoadId={selectedRoadId}
                      editingRoadId={editingRoadId}
                      visibleRoads={visibleRoads}
                      showCoordinatesForRoad={showCoordinatesForRoad}
                      nodeCoordinates={nodeCoordinates}
                      nodeSelectionMode={nodeSelectionMode}
                      onSelectRoad={handleSelectRoad}
                      onStartEdit={(roadId) => {
                        setEditingRoadId(roadId);
                        // Initialize edit form with road data
                        const road = tempRoads.find(r => r.id === roadId);
                        if (!road) {
                          console.error('[TempRoads] Could not find road with id', roadId, 'in tempRoads:', tempRoads);
                          return;
                        }
                        setEditFormData({
                          name: road.name || '',
                          type: road.type || 'iceroad',
                          speed: road.speed?.toString() || '',
                          length: road.length?.toString() || '',
                          start_coordinates: road.start_coordinates || { lat: '', lng: '' },
                          end_coordinates: road.end_coordinates || { lat: '', lng: '' },
                          description: road.description || ''
                        });
                        setShowCoordinatesForRoad(null);
                      }}
                      editFormData={editFormData}
                      setEditFormData={setEditFormData}
                      onCancelEdit={cancelEdit}
                      onVisibleRoadsChange={setVisibleRoads}
                      onShowCoordinates={setShowCoordinatesForRoad}
                      onNodeCoordinatesChange={setNodeCoordinates}
                      onNodeSelectionModeChange={setNodeSelectionMode}
                    />
                  );
                })
              ) : (
                <div style={{ padding: '20px', color: '#999' }}>No roads to display</div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default TempRoads;
