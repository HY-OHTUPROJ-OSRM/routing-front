import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { 
  deleteTempRoadAsync,
  toggleTempRoadAsync
} from '../features/temproads/TempRoadsSlice';
import { changeMapView } from '../features/view/ViewSlice';
import TempRoadForm from './TempRoadForm';

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

  useEffect(() => {
    setIsEditing(editingRoadId === road.id);
  }, [editingRoadId, road.id]);

  // Calculate center and zoom level based on start and end coordinates
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
    // GeoJSON: [ [lng, lat], [lng, lat] ]
    const [startLng, startLat] = road.geom.coordinates[0];
    const [endLng, endLat] = road.geom.coordinates[1];
    return {
      start: { lat: startLat, lng: startLng },
      end: { lat: endLat, lng: endLng }
    };
  };

  const flyToRoad = () => {
    const coords = getStartEndCoords();
    if (!coords) {
      alert('Unable to locate road on map. Invalid coordinates.');
      return;
    }
    const center = calculateCenter(coords.start, coords.end);
    const zoom = calculateZoomLevel(coords.start, coords.end);
    dispatch(changeMapView({ 
      center: center, 
      zoom: zoom 
    }));
  };

  const showCoordinates = () => {
    if (showCoordinatesForRoad === road.id) {
      onShowCoordinates(null);
      return;
    }

    onShowCoordinates(road.id);
  };

  const handleDelete = (roadId) => {
    if (window.confirm('Are you sure you want to delete this road segment?')) {
      dispatch(deleteTempRoadAsync({ id: road.id, updated_at: road.updated_at }));
      onVisibleRoadsChange(prev => {
        const newSet = new Set(prev);
        newSet.delete(roadId);
        return newSet;
      });

      // Cancel edit if deleting currently edited road
      if (editingRoadId === roadId) {
        onCancelEdit();
      }
    }
  };

  const handleToggle = (roadId, currentStatus) => {
    const action = currentStatus ? 'deactivate' : 'activate';
    if (window.confirm(`Are you sure you want to ${action} this road segment?`)) {
      dispatch(toggleTempRoadAsync(roadId));
    }
  };

  const startEdit = (road) => {
    onStartEdit(road.id);
    onShowCoordinates(null);
  };

  const handleEditFormClose = () => {
    onCancelEdit();
  };

  const handleShowOnMap = () => {
    if (selectedRoadId !== road.id) {
      onSelectRoad(road.id);
    }
  
    onVisibleRoadsChange(prev => {
      const newSet = new Set(prev);
      newSet.add(road.id);
      return newSet;
    });
    
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

  return (
    <div 
      style={{
        padding: '15px 20px',
        borderBottom: '1px solid #e5e5e5',
        backgroundColor: isEditing 
          ? '#f0f8ff' // Light blue background for editing
          : selectedRoadId === road.id 
            ? '#e3f2fd' 
            : 'white',
        borderLeft: selectedRoadId === road.id 
          ? '4px solid #4285f4' 
          : isEditing 
            ? '4px solid #17a2b8' // Blue border for editing
            : 'none',
        cursor: 'pointer',
        opacity: road.status === false ? 0.6 : 1
      }}
      onClick={() => onSelectRoad(road.id)}
    >
      {/* Show edit form if this road is being edited */}
      {isEditing ? (
        <TempRoadForm 
          mode="edit"
          road={road}
          formData={editFormData}
          setFormData={setEditFormData}
          nodeSelectionMode={nodeSelectionMode}
          setNodeSelectionMode={onNodeSelectionModeChange}
          onFormClose={handleEditFormClose}
        />
      ) : (
        // Normal road display (when not editing)
        <>
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
              {/* Edit Button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  startEdit(road);
                }}
                disabled={editingRoadId !== null}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: editingRoadId !== null ? 'not-allowed' : 'pointer',
                  padding: '4px',
                  color: editingRoadId !== null ? '#999' : '#17a2b8',
                  fontSize: '16px',
                  opacity: editingRoadId !== null ? 0.5 : 1
                }}
                title={editingRoadId !== null ? 'Another road is being edited' : 'Edit this road'}
              >
                ✏️
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleToggle(road.id, road.status);
                }}
                disabled={editingRoadId !== null}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: editingRoadId !== null ? 'not-allowed' : 'pointer',
                  padding: '4px',
                  color: road.status ? '#ffc107' : '#28a745',
                  fontSize: '16px',
                  opacity: editingRoadId !== null ? 0.5 : 1
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
                disabled={editingRoadId !== null}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: editingRoadId !== null ? 'not-allowed' : 'pointer',
                  padding: '4px',
                  color: editingRoadId !== null ? '#999' : '#dc3545',
                  fontSize: '16px',
                  opacity: editingRoadId !== null ? 0.5 : 1
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
                showCoordinates();
              }}
              disabled={editingRoadId !== null}
              style={{
                background: editingRoadId !== null 
                  ? '#6c757d' 
                  : showCoordinatesForRoad === road.id 
                    ? '#dc3545' 
                    : '#17a2b8',
                color: 'white',
                border: 'none',
                padding: '8px 12px',
                borderRadius: '4px',
                fontSize: '12px',
                cursor: editingRoadId !== null ? 'not-allowed' : 'pointer',
                flex: 1,
                fontWeight: '500',
                opacity: editingRoadId !== null ? 0.5 : 1
              }}
            >
              {showCoordinatesForRoad === road.id ? 'Hide Coordinates' : 'Show Coordinates'}
            </button>
            {/* Show on map */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleShowOnMap();
              }}
              disabled={editingRoadId !== null}
              style={{
                background: editingRoadId !== null ? '#6c757d' : '#28a745',
                color: 'white',
                border: 'none',
                padding: '8px 12px',
                borderRadius: '4px',
                fontSize: '12px',
                cursor: editingRoadId !== null ? 'not-allowed' : 'pointer',
                flex: 1,
                fontWeight: '500',
                opacity: editingRoadId !== null ? 0.5 : 1
              }}
              title="Show this road on the map and fly to it"
            >
              Show on map
            </button>
          </div>

          {/* Coordinates Display */}
          {showCoordinatesForRoad === road.id && (() => {
            const coords = getStartEndCoords();
            if (!coords) return null;
            return (
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
                  Coordinates:
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <div style={{ fontSize: '13px', color: '#555' }}>
                    <strong>Start:</strong>
                    <span style={{ marginLeft: '8px', color: '#333' }}>
                      Lat: {coords.start.lat.toFixed(6)}, Lng: {coords.start.lng.toFixed(6)}
                    </span>
                  </div>
                  <div style={{ fontSize: '13px', color: '#555' }}>
                    <strong>End:</strong>
                    <span style={{ marginLeft: '8px', color: '#333' }}>
                      Lat: {coords.end.lat.toFixed(6)}, Lng: {coords.end.lng.toFixed(6)}
                    </span>
                  </div>
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
