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
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default TempRoads;
