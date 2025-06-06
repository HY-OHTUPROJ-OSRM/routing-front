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
  nodeCoordinates,
  nodeSelectionMode,
  onSelectRoad,
  onStartEdit,
  onCancelEdit,
  onVisibleRoadsChange,
  onShowCoordinates,
  onNodeCoordinatesChange,
  onNodeSelectionModeChange,
  editFormData,
  setEditFormData
}) {
  const dispatch = useDispatch();
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    setIsEditing(editingRoadId === road.id);
  }, [editingRoadId, road.id]);

  // Get node coordinates from API
  const fetchNodeCoordinates = async (nodeId) => {
    try {
      // Return cached coordinates if available
      if (nodeCoordinates[nodeId]) {
        return nodeCoordinates[nodeId];
      }
      
      const response = await fetch(`http://localhost:3000/nodes/${nodeId}`);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error(`Expected JSON but got ${contentType}`);
      }
      
      const nodeData = await response.json();
      
      const coordinates = {
        lat: nodeData.lat,
        lng: nodeData.lng
      };
      
      // Cache coordinates
      onNodeCoordinatesChange(prev => ({
        ...prev,
        [nodeId]: coordinates
      }));
      
      return coordinates;
    } catch (error) {
      console.error('Error fetching node coordinates:', error);
      
      // Cache error to avoid repeated attempts
      onNodeCoordinatesChange(prev => ({
        ...prev,
        [nodeId]: { error: error.message }
      }));
      
      return null;
    }
  };
  
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

  const flyToRoad = async (road) => {
    try {
      const startCoords = await fetchNodeCoordinates(road.start_node);
      const endCoords = await fetchNodeCoordinates(road.end_node);
      
      if (startCoords && endCoords && !startCoords.error && !endCoords.error) {
        const center = calculateCenter(startCoords, endCoords);
        const zoom = calculateZoomLevel(startCoords, endCoords);
        
        dispatch(changeMapView({ 
          center: center, 
          zoom: zoom 
        }));
      } else {
        console.error('Could not get coordinates for road nodes');
        alert('Unable to locate road on map. Please check if the nodes are valid.');
      }
    } catch (error) {
      console.error('Error flying to road:', error);
      alert('Error locating road on map.');
    }
  };

  const showCoordinates = async (road) => {
    if (showCoordinatesForRoad === road.id) {
      onShowCoordinates(null);
      return;
    }

    onShowCoordinates(road.id);
    
    if (road.start_node && !nodeCoordinates[road.start_node]) {
      await fetchNodeCoordinates(road.start_node);
    }
    if (road.end_node && !nodeCoordinates[road.end_node]) {
      await fetchNodeCoordinates(road.end_node);
    }
  };

  const handleDelete = (roadId) => {
    if (window.confirm('Are you sure you want to delete this road segment?')) {
      dispatch(deleteTempRoadAsync(roadId));
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

  const handleShowOnMap = async (road) => {
    if (selectedRoadId !== road.id) {
      onSelectRoad(road.id);
    }
  
    onVisibleRoadsChange(prev => {
      const newSet = new Set(prev);
      newSet.add(road.id);
      return newSet;
    });
    
    await flyToRoad(road);
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
              {visibleRoads.has(road.id) && (
                <span style={{ 
                  color: '#28a745', 
                  fontSize: '16px',
                  title: 'Visible on map'
                }}>
                  👁️
                </span>
              )}
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
                showCoordinates(road);
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
                handleShowOnMap(road);
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
                Node Coordinates:
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
        </>
      )}
    </div>
  );
}

export default TempRoadItem;
