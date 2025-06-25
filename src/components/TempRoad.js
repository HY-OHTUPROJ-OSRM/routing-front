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
import './comp_styles.scss';
import { getNearestNodeCoordinates, calculateDistanceBetweenCoords } from '../services/TempRoadService';

function TempRoads({
  onVisibleRoadsChange,
  onNodeSelectionModeChange,
  onNodeSelectionHandler,
  nodeSelectionMode,
  setNodeSelectionMode
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
    if (!nodeSelectionMode.active) return;
    try {
      const nearestCoords = await getNearestNodeCoordinates(coordinates[0], coordinates[1]);
      let updateFormFn = nodeSelectionMode.isEditMode ? setEditFormData : setAddFormData;
      const coordKey = nodeSelectionMode.selecting === 'start' ? 'start_coordinates' : 'end_coordinates';
      updateFormFn(prev => {
        const updated = { ...prev, [coordKey]: { lat: nearestCoords[0], lng: nearestCoords[1] } };
        if (updated.start_coordinates?.lat && updated.end_coordinates?.lat) {
          try {
            updated.length = calculateDistanceBetweenCoords(
              [parseFloat(updated.start_coordinates.lat), parseFloat(updated.start_coordinates.lng)],
              [parseFloat(updated.end_coordinates.lat), parseFloat(updated.end_coordinates.lng)]
            );
          } catch (e) {
            window.alert('Failed to calculate distance: ' + (e?.message || e || 'Unknown error'));
          }
        }
        return updated;
      });
      setNodeSelectionMode({ active: false, selecting: null, isEditMode: false });
    } catch (error) {
      window.alert('Failed to get nearest node coordinates: ' + (error?.message || error || 'Unknown error'));
      setNodeSelectionMode({ active: false, selecting: null, isEditMode: false });
    }
  };

  useEffect(() => {
    if (onNodeSelectionHandler) onNodeSelectionHandler(handleNodeSelectionInternal);
  }, [onNodeSelectionHandler, handleNodeSelectionInternal]);

  useEffect(() => {
    if (status === 'idle') dispatch(fetchTempRoads());
  }, [status, dispatch]);

  useEffect(() => {
    if (onVisibleRoadsChange) onVisibleRoadsChange(visibleRoads);
  }, [visibleRoads, onVisibleRoadsChange]);

  useEffect(() => {
    if (onNodeSelectionModeChange) onNodeSelectionModeChange(nodeSelectionMode);
  }, [nodeSelectionMode, onNodeSelectionModeChange]);

  const [addFormData, setAddFormData] = useState({ 
    name: '', 
    type: 'iceroad', 
    direction: 2,
    speed: '', 
    length: '', 
    start_coordinates: { lat: '', lng: '' }, 
    end_coordinates: { lat: '', lng: '' }, 
    description: '' 
  });
  
  const [editFormData, setEditFormData] = useState({ 
    name: '', 
    type: 'iceroad', 
    direction: 2,
    speed: '', 
    length: '', 
    start_coordinates: { lat: '', lng: '' }, 
    end_coordinates: { lat: '', lng: '' }, 
    description: '' 
  });

  const getStartEndCoordsFromRoad = (road) => {
    if (!road.geom || !Array.isArray(road.geom.coordinates) || road.geom.coordinates.length < 2) {
      return {
        start_coordinates: road.start_coordinates || { lat: '', lng: '' },
        end_coordinates: road.end_coordinates || { lat: '', lng: '' }
      };
    }
    const [startLng, startLat] = road.geom.coordinates[0];
    const [endLng, endLat] = road.geom.coordinates[1];
    return {
      start_coordinates: { lat: startLat, lng: startLng },
      end_coordinates: { lat: endLat, lng: endLng }
    };
  };

  const handleSelectRoad = (id) => dispatch(selectRoad(id));

  const showOnMap = (road) => {
    setVisibleRoads(prev => {
      const newSet = new Set(prev);
      newSet.has(road.id) ? newSet.delete(road.id) : newSet.add(road.id);
      return newSet;
    });
    dispatch(selectRoad(road.id));
  };

  const cancelNodeSelection = () => setNodeSelectionMode({ active: false, selecting: null, isEditMode: false });
  
  const cancelEdit = () => {
    setEditingRoadId(null);
    setEditFormData({ 
      name: '', 
      type: 'iceroad', 
      direction: 2, 
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
      direction: 2, 
      speed: '', 
      length: '', 
      start_coordinates: { lat: '', lng: '' }, 
      end_coordinates: { lat: '', lng: '' }, 
      description: '' 
    });
    setNodeSelectionMode({ active: false, selecting: null, isEditMode: false });
  };

  if (status === 'loading') return <div className="loading">Loading...</div>;

  return (
    <div className="temp-roads-container">
      <div className="temp-roads-header">
        <h3>Temporary Roads</h3>
        <button
          onClick={() => {
            setShowAddForm(!showAddForm);
            if (!showAddForm) cancelEdit();
          }}
          disabled={editingRoadId !== null}
          className="add-button"
        >
          {showAddForm ? '×' : 'add new'}
        </button>
      </div>

      {nodeSelectionMode.active && (
        <div className="node-selection-indicator">
          <span>
            📍 Click on the map to select {nodeSelectionMode.selecting} node
            {nodeSelectionMode.isEditMode && ' (editing mode)'}
          </span>
          <button onClick={cancelNodeSelection}>Cancel</button>
        </div>
      )}

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

      <div className="temp-roads-list">
        {Array.isArray(tempRoads) && tempRoads.length === 0 ? (
          <div className="no-roads">No temporary roads yet</div>
        ) : (
          <>
            <div className="temp-roads-filter">
              <input
                type="text"
                placeholder="Filter by name or tag..."
                className="search-temproads"
                onChange={(e) => setSearchTerm(e.target.value.toLowerCase())}
              />
              <select
                className="filter-temproads"
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
              >
                <option value="all">Show All Types</option>
                <option value="iceroad">Show Ice Roads</option>
                <option value="speed_limit">Show Speed Limits</option>
                <option value="temporary">Show Temporary Roads</option>
              </select>
            </div>
            <div>
              {Array.isArray(filteredTempRoads) && filteredTempRoads.length > 0 ? (
                filteredTempRoads.map(road => (
                  road && (
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
                        const road = tempRoads.find(r => r.id === roadId);
                        if (!road) return;
                        
                        // 修复：正确获取坐标信息
                        const coordinates = getStartEndCoordsFromRoad(road);
                        
                        setEditFormData({
                          name: road.name || '',
                          type: road.type || 'iceroad',
                          direction: road.direction || 2,
                          speed: road.speed?.toString() || '',
                          length: road.length?.toString() || '',
                          ...coordinates,
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
                  )
                ))
              ) : (
                <div className="no-roads">No roads to display</div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default TempRoads;