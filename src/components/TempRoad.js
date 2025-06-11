import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  fetchTempRoads, 
  selectRoad 
} from '../features/temproads/TempRoadsSlice';
import { changeMapView } from '../features/view/ViewSlice';
import TempRoadForm from './TempRoadForm';
import TempRoadItem from './TempRoadItem';
import { calculateDistanceBetweenNodes } from '../services/TempRoadService';
import './Polygon.css';

function TempRoads(props) {
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
        (filterType === "speedlimit" && item.type === "speedlimit");
      return matchesSearch && matchesFilter;
    });
  };

  const filteredTempRoads = useSelector(state => applyFilters(state.tempRoads.list, searchTerm, filterType));

  const [showCoordinatesForRoad, setShowCoordinatesForRoad] = useState(null);
  const [nodeCoordinates, setNodeCoordinates] = useState({});
  
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingRoadId, setEditingRoadId] = useState(null);

  const [nodeSelectionMode, setNodeSelectionMode] = useState({
    active: false,
    selecting: null,
    isEditMode: false
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

  useEffect(() => {
    if (props.onNodeSelectionModeChange) {
      props.onNodeSelectionModeChange(nodeSelectionMode);
    }
  }, [nodeSelectionMode, props.onNodeSelectionModeChange]);

  // Add states for form data management
  const [addFormData, setAddFormData] = useState({
    name: '',
    type: 'iceroad',
    speed: '',
    length: '',
    start_node: '',
    end_node: '',
    description: ''
  });

  const [editFormData, setEditFormData] = useState({
    name: '',
    type: 'iceroad',
    speed: '',
    length: '',
    start_node: '',
    end_node: '',
    description: ''
  });

  const handleNodeSelection = async (nodeId, coordinates) => {
    console.log('Node selection - nodeId:', nodeId, 'mode:', nodeSelectionMode.selecting, 'isEditMode:', nodeSelectionMode.isEditMode);
    
    if (!nodeSelectionMode.active) return;
    
    if (nodeSelectionMode.isEditMode) {
      // Handle node selection for edit mode
      if (nodeSelectionMode.selecting === 'start') {
        setEditFormData(prev => ({ ...prev, start_node: nodeId.toString() }));
        if (editFormData.end_node) {
          await calculateAndSetLength(nodeId, editFormData.end_node, setEditFormData);
        }
      } else if (nodeSelectionMode.selecting === 'end') {
        setEditFormData(prev => ({ ...prev, end_node: nodeId.toString() }));
        if (editFormData.start_node) {
          await calculateAndSetLength(editFormData.start_node, nodeId, setEditFormData);
        }
      }
    } else {
      // Handle node selection for add mode
      if (nodeSelectionMode.selecting === 'start') {
        setAddFormData(prev => ({ ...prev, start_node: nodeId.toString() }));
        if (addFormData.end_node) {
          await calculateAndSetLength(nodeId, addFormData.end_node, setAddFormData);
        }
      } else if (nodeSelectionMode.selecting === 'end') {
        setAddFormData(prev => ({ ...prev, end_node: nodeId.toString() }));
        if (addFormData.start_node) {
          await calculateAndSetLength(addFormData.start_node, nodeId, setAddFormData);
        }
      }
    }
    
    setNodeSelectionMode({ active: false, selecting: null, isEditMode: false });
  };
  
  // Function to calculate distance between two nodes and set the length in the form data
  const calculateAndSetLength = async (startNodeId, endNodeId, setFormData) => {
    try {
      const distance = await calculateDistanceBetweenNodes(startNodeId, endNodeId);

      setFormData(prev => ({ ...prev, length: distance.toString() }));
      console.log(`Calculated distance between nodes ${startNodeId} and ${endNodeId}: ${distance} km`);
    } catch (error) {
      console.error(`Failed to calculate distance between nodes ${startNodeId} and ${endNodeId}:`, error);
    }
  };

  useEffect(() => {
    if (props.onNodeSelectionHandler) {
      props.onNodeSelectionHandler(handleNodeSelection);
    }
  }, [nodeSelectionMode]);

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
      start_node: '',
      end_node: '',
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
      start_node: '',
      end_node: '',
      description: ''
    });
    setNodeSelectionMode({ active: false, selecting: null, isEditMode: false });
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
                <option value="speedlimit">Show Speed Limits</option>
                <option value="temporary">Show Temporary Roads</option>
              </select>
            </div>
            <div>
              {filteredTempRoads.map(road => (
                <div 
                  key={road.id}
                  style={{
                    padding: '15px 20px',
                    borderBottom: '1px solid #e5e5e5',
                    backgroundColor: selectedRoadId === road.id ? '#e3f2fd' : 'white',
                    borderLeft: selectedRoadId === road.id ? '4px solid #4285f4' : 'none',
                    cursor: 'pointer',
                    opacity: road.status === false ? 0.6 : 1
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
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <h4 style={{ 
                        margin: 0, 
                        fontSize: '16px', 
                        fontWeight: '600',
                        color: '#333'
                      }}>
                        {road.name}
                      </h4>
                      <span style={{
                        fontSize: '12px',
                        padding: '2px 6px',
                        borderRadius: '12px',
                        backgroundColor: road.status ? '#d4edda' : '#f8d7da',
                        color: road.status ? '#155724' : '#721c24',
                        fontWeight: '500'
                      }}>
                        {road.status ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    <div style={{ display: 'flex', gap: '5px' }}>
                      {visibleRoads.has(road.id) && (
                        <span style={{ 
                          color: '#28a745', 
                          fontSize: '16px',
                          title: 'Visible on map'
                        }}>
                        </span>
                      )}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggle(road.id, road.status);
                        }}
                        style={{
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          padding: '4px',
                          color: road.status ? '#ffc107' : '#28a745',
                          fontSize: '16px'
                        }}
                        title={road.status ? 'Deactivate' : 'Activate'}
                      >
                        {road.status ? '⏸️' : '▶️'}
                      </button>
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

                  {/* Speed Info */}
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

                  {/* Length Info */}
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
                  <div style={{ display: 'flex', gap: '8px', marginTop: '12px', flexWrap: 'wrap' }}>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        showCoordinates(road);
                      }}
                      style={{
                        background: showCoordinatesForRoad === road.id ? '#dc3545' : '#17a2b8',
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
                      {showCoordinatesForRoad === road.id ? 'Hide Coordinates' : 'Show Coordinates'}
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        flyToRoad(road);
                      }}
                      style={{
                        background: '#28a745',
                        color: 'white',
                        border: 'none',
                        padding: '8px 12px',
                        borderRadius: '4px',
                        fontSize: '12px',
                        cursor: 'pointer',
                        flex: 1,
                        fontWeight: '500'
                      }}
                      title="Show this road on the map"
                    >
                      Show on map
                    </button>
                  </div>

                  {showCoordinatesForRoad === road.id && (
                    <div style={{
                      marginTop: '12px',
                      padding: '12px',
                      backgroundColor: '#f8f9fa',
                      borderRadius: '4px',
                      border: '1px solid #dee2e6'
                    }}>
                      <div style={{
                        fontSize: '14px',
                        fontWeight: '600',
                        color: '#333',
                        marginBottom: '8px'
                      }}>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <div style={{ fontSize: '13px', color: '#555' }}>
                          <strong>Start Node ({road.start_node}):</strong>
                          {nodeCoordinates[road.start_node] ? (
                            nodeCoordinates[road.start_node].error ? (
                              <span style={{ marginLeft: '8px', color: '#dc3545', fontStyle: 'italic' }}>
                                Error: {nodeCoordinates[road.start_node].error}
                              </span>
                            ) : (
                              <span style={{ marginLeft: '8px', color: '#333' }}>
                                Lat: {nodeCoordinates[road.start_node].lat.toFixed(6)}, 
                                Lng: {nodeCoordinates[road.start_node].lng.toFixed(6)}
                              </span>
                            )
                          ) : (
                            <span style={{ marginLeft: '8px', color: '#999', fontStyle: 'italic' }}>
                              Loading...
                            </span>
                          )}
                        </div>
                        <div style={{ fontSize: '13px', color: '#555' }}>
                          <strong>End Node ({road.end_node}):</strong>
                          {nodeCoordinates[road.end_node] ? (
                            nodeCoordinates[road.end_node].error ? (
                              <span style={{ marginLeft: '8px', color: '#dc3545', fontStyle: 'italic' }}>
                                Error: {nodeCoordinates[road.end_node].error}
                              </span>
                            ) : (
                              <span style={{ marginLeft: '8px', color: '#333' }}>
                                Lat: {nodeCoordinates[road.end_node].lat.toFixed(6)}, 
                                Lng: {nodeCoordinates[road.end_node].lng.toFixed(6)}
                              </span>
                            )
                            ) : (
                            <span style={{ marginLeft: '8px', color: '#999', fontStyle: 'italic' }}>
                              Loading...
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </>
          tempRoads.map(road => (
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
                if (road) {
                  setEditFormData({
                    name: road.name || '',
                    type: road.type || 'iceroad',
                    speed: road.speed?.toString() || '',
                    length: road.length?.toString() || '',
                    start_node: road.start_node?.toString() || '',
                    end_node: road.end_node?.toString() || '',
                    description: road.description || ''
                  });
                }
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
          ))
        )}
      </div>
    </div>
  );
}

export default TempRoads;
