import React, { useState, useEffect, useContext } from 'react';
import { useDispatch } from 'react-redux';
import { 
  deleteTempRoadAsync,
  toggleTempRoadAsync
} from '../features/temproads/TempRoadsSlice';
import { changeMapView } from '../features/view/ViewSlice';
import { fetchRouteLine } from '../features/routes/routeSlice';
import { ProfileContext } from './CoordinatesContext';
import TempRoadForm from './TempRoadForm';
import './comp_styles.scss';

function TempRoadItem({
  road,
  selectedRoadId,
  editingRoadId,
  visibleRoads,
  showCoordinatesForRoad,
  nodeSelectionMode,
  onSelectRoad,
  onStartEdit,
  onCancelEdit,
  onVisibleRoadsChange,
  onShowCoordinates,
  onNodeSelectionModeChange,
  editFormData,
  setEditFormData
}) {
  const dispatch = useDispatch();
  const [isEditing, setIsEditing] = useState(false);
  const { selectedProfile } = useContext(ProfileContext);

  useEffect(() => {
    setIsEditing(editingRoadId === road.id);
  }, [editingRoadId, road.id]);

  const getDirectionDisplay = (direction) => {
    switch(direction) {
      case 2: return { text: 'Bidirectinal', icon: '↔️' };
      case 3: return { text: 'Backward', icon:'⬅️' };
      case 4: return { text: 'Forward', icon: '➡️' };
      default: return { text: 'Bidirectional', icon: '↔️' };
    }
  };

  const calculateCenter = (startCoords, endCoords) => {
    const centerLat = (startCoords.lat + endCoords.lat) / 2;
    const centerLng = (startCoords.lng + endCoords.lng) / 2;
    return [centerLat, centerLng];
  };

  const calculateZoomLevel = (startCoords, endCoords) => {
    const latDiff = Math.abs(startCoords.lat - endCoords.lat);
    const lngDiff = Math.abs(startCoords.lng - endCoords.lng);
    const maxDiff = Math.max(latDiff, lngDiff);
    if (maxDiff > 1) return 8;
    if (maxDiff > 0.5) return 10;
    if (maxDiff > 0.1) return 12;
    if (maxDiff > 0.01) return 14;
    return 16;
  };

  const getStartEndCoords = () => {
    if (!road.geom || !Array.isArray(road.geom.coordinates) || road.geom.coordinates.length < 2) return null;
    const [startLng, startLat] = road.geom.coordinates[0];
    const [endLng, endLat] = road.geom.coordinates[1];
    return {
      start: { lat: startLat, lng: startLng },
      end: { lat: endLat, lng: endLng }
    };
  };

  const flyToRoad = () => {
    console.log(`[Road ${road.id}] Initiating fly-to action`);
    const coords = getStartEndCoords();
    if (!coords) {
      console.error(`[Road ${road.id}] Invalid coordinates for fly-to`);
      alert('Unable to locate road on map. Invalid coordinates.');
      return;
    }
    const center = calculateCenter(coords.start, coords.end);
    const zoom = calculateZoomLevel(coords.start, coords.end);
    console.log(`[Road ${road.id}] Setting view to center: ${center}, zoom: ${zoom}`);
    dispatch(changeMapView({ center, zoom }));
  };

  const showCoordinates = () => {
    const newId = showCoordinatesForRoad === road.id ? null : road.id;
    console.log(`[Road ${road.id}] Toggling coordinates display. New state: ${newId ? 'show' : 'hide'}`);
    onShowCoordinates(newId);
  };

  const handleDelete = async (id) => {
    console.log(`[Road ${id}] Delete operation initiated`);
    if (window.confirm('Are you sure you want to delete this road segment?')) {
      try {
        console.log(`[Road ${id}] Dispatching delete request...`);
        await dispatch(deleteTempRoadAsync({ id: road.id, updated_at: road.updated_at }));
        
        console.log(`[Road ${id}] Delete successful. Recalculating routes...`);
        await dispatch(fetchRouteLine(undefined, selectedProfile));
        console.log(`[Road ${id}] Route recalculation complete`);
        
        onVisibleRoadsChange(prev => {
          const newSet = new Set(prev);
          newSet.delete(id);
          console.log(`[Road ${id}] Removed from visible roads set`);
          return newSet;
        });
        
        if (editingRoadId === id) {
          console.log(`[Road ${id}] Canceling edit mode for deleted road`);
          onCancelEdit();
        }
      } catch (error) {
        console.error(`[Road ${id}] Delete failed:`, error);
      }
    } else {
      console.log(`[Road ${id}] Delete operation canceled by user`);
    }
  };

  const handleToggle = async () => {
    const action = road.status ? 'deactivate' : 'activate';
    console.log(`[Road ${road.id}] Toggle operation initiated (${action})`);
    
    if (window.confirm(`Are you sure you want to ${action} this road segment?`)) {
      try {
        console.log(`[Road ${road.id}] Dispatching toggle request...`);
        await dispatch(toggleTempRoadAsync({ id: road.id, updated_at: road.updated_at }));
        
        console.log(`[Road ${road.id}] Toggle successful. Recalculating routes...`);
        await dispatch(fetchRouteLine(undefined, selectedProfile));
        console.log(`[Road ${road.id}] Route recalculation complete`);
      } catch (error) {
        console.error(`[Road ${road.id}] Toggle failed:`, error);
      }
    } else {
      console.log(`[Road ${road.id}] Toggle operation canceled by user`);
    }
  };

  const startEdit = () => {
    console.log(`[Road ${road.id}] Starting edit mode`);
    const coords = getStartEndCoords();
    const coordinatesToUse = coords ? {
      start_coordinates: coords.start,
      end_coordinates: coords.end
    } : {
      start_coordinates: road.start_coordinates || { lat: '', lng: '' },
      end_coordinates: road.end_coordinates || { lat: '', lng: '' }
    };

    setEditFormData({
      name: road.name || '',
      type: road.type || 'iceroad',
      direction: road.direction || 2,
      speed: road.speed?.toString() || '',
      length: road.length?.toString() || '',
      ...coordinatesToUse,
      description: road.description || ''
    });

    onStartEdit(road.id);
    onShowCoordinates(null);
  };

  const handleShowOnMap = () => {
    console.log(`[Road ${road.id}] Show on map action`);
    if (selectedRoadId !== road.id) {
      console.log(`[Road ${road.id}] Selecting road`);
      onSelectRoad(road.id);
    }
    console.log(`[Road ${road.id}] Adding to visible roads`);
    onVisibleRoadsChange(prev => new Set(prev).add(road.id));
    flyToRoad();
  };

  const getTypeDisplay = (type) => {
    switch(type) {
      case 'iceroad': return 'Ice Road';
      case 'speed_limit': return 'Speed Limit';
      case 'temporary': return 'Temporary';
      default: return type;
    }
  };

  const directionDisplay = getDirectionDisplay(road.direction);

  return (
    <div
      className={`temp-road-item ${isEditing ? 'editing' : ''} ${selectedRoadId === road.id ? 'selected' : ''}`}
      data-status={road.status ? 'active' : 'inactive'}
      onClick={() => onSelectRoad(road.id)}
    >
      {isEditing ? (
        <TempRoadForm
          mode="edit"
          road={road}
          formData={editFormData}
          setFormData={setEditFormData}
          nodeSelectionMode={nodeSelectionMode}
          setNodeSelectionMode={onNodeSelectionModeChange}
          onFormClose={onCancelEdit}
        />
      ) : (
        <>
          <div className="temp-road-header">
            <div className="road-type">{getTypeDisplay(road.type)}</div>
            <h4 className="road-name">{road.name}</h4>
            <div className="road-status-buttons">
              <span className={`status-badge ${road.status ? 'active' : 'inactive'}`}>
                {road.status ? 'Active' : 'Inactive'}
              </span>
              <div className="action-buttons">
                <button
                  className="temp-road-button small-button"
                  onClick={(e) => { e.stopPropagation(); startEdit(); }}
                  disabled={editingRoadId !== null}
                  title={editingRoadId !== null ? 'Another road is being edited' : 'Edit this road'}
                >
                  ✏️
                </button>
                <button
                  className="temp-road-button small-button"
                  onClick={(e) => { e.stopPropagation(); handleToggle(); }}
                  disabled={editingRoadId !== null}
                  title={road.status ? 'Deactivate' : 'Activate'}
                >
                  {road.status ? '⏸️' : '▶️'}
                </button>
                <button
                  className="temp-road-button small-button"
                  onClick={(e) => { e.stopPropagation(); handleDelete(road.id); }}
                  disabled={editingRoadId !== null}
                  title="Delete"
                >
                  🗑️
                </button>
              </div>
            </div>
          </div>

          <div className="road-info">
            {road.speed > 0 && <div className="speed-info">Speed limit: {road.speed} Km/h</div>}
            {road.length > 0 && <div className="length-info">Length: {road.length} km</div>}
            <div className="direction-info">
              Direction: <span className="direction-icon">{directionDisplay.icon}</span> {directionDisplay.text}
            </div>
          </div>

          <div className="action-buttons-group">
            <button
              className="temp-road-button show-toggle"
              onClick={(e) => { e.stopPropagation(); showCoordinates(); }}
              disabled={editingRoadId !== null}
            >
              {showCoordinatesForRoad === road.id ? 'Hide Coordinates' : 'Show Coordinates'}
            </button>
            <button
              className="temp-road-button map-toggle"
              onClick={(e) => { e.stopPropagation(); handleShowOnMap(); }}
              disabled={editingRoadId !== null}
              title="Show this road on the map and fly to it"
            >
              Show on map
            </button>
          </div>

          {showCoordinatesForRoad === road.id && (() => {
            const coords = getStartEndCoords();
            if (!coords) return null;
            return (
              <div className="coordinates-display">
                <div className="coordinates-header">Coordinates:</div>
                <div className="coordinates-body">
                  <div><strong>Start:</strong> Lat: {coords.start.lat.toFixed(6)}, Lng: {coords.start.lng.toFixed(6)}</div>
                  <div><strong>End:</strong> Lat: {coords.end.lat.toFixed(6)}, Lng: {coords.end.lng.toFixed(6)}</div>
                </div>
              </div>
            );
          })()}
        </>
      )}
    </div>
  );
}

export default TempRoadItem;