import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useMap } from 'react-leaflet';
import L from 'leaflet';

const TempRoadDisplay = ({ visibleRoads = new Set() }) => {
  const map = useMap();
  const tempRoads = useSelector(state => state.tempRoads.list);
  const selectedRoadId = useSelector(state => state.tempRoads.selectedRoadId);

  const actualVisibleRoads = visibleRoads.size > 0 ? visibleRoads : new Set(selectedRoadId ? [selectedRoadId] : []);

  useEffect(() => {
    // Clear previous temp road layers
    map.eachLayer((layer) => {
      if (layer.options && layer.options.tempRoadId) {
        map.removeLayer(layer);
      }
    });

    // Render all active temporary roads
    for (const road of tempRoads) {
      if (road.status && road.geom && road.geom.type === 'LineString' && Array.isArray(road.geom.coordinates) && actualVisibleRoads.has(road.id)) {
        try {
          // Expecting [ [lng, lat], [lng, lat] ]
          const coords = road.geom.coordinates;
          if (coords.length < 2) continue;
          const [startLng, startLat] = coords[0];
          const [endLng, endLat] = coords[1];

          if ([startLat, startLng, endLat, endLng].some(v => isNaN(v))) {
            console.error(`Invalid coordinates for road ${road.id}`);
            continue;
          }

          // Create animated dashed polyline for better visibility
          const polyline = L.polyline([[startLat, startLng], [endLat, endLng]], {
            color: getColorByType(road.type),
            weight: selectedRoadId === road.id ? 10 : 8,
            opacity: 1,
            dashArray: '10, 10',
            className: 'temp-road-animated',
            tempRoadId: road.id
          });

          try {
            polyline.addTo(map);
          } catch (polylineError) {
            console.error('Error adding polyline:', polylineError);
          }

          // Add distinct start and end markers
          const startMarker = L.circleMarker([startLat, startLng], {
            radius: 10,
            color: '#2E7D32',
            fillColor: '#4CAF50',
            fillOpacity: 1,
            weight: 3,
            tempRoadId: road.id
          }).bindPopup(`
            <div style="background: #E8F5E8; padding: 8px; border: 2px solid #4CAF50; border-radius: 4px;">
              <strong style="color: #2E7D32;">🚩 Start Point</strong><br>
              <strong>Lat:</strong> ${startLat.toFixed(6)}<br>
              <strong>Lng:</strong> ${startLng.toFixed(6)}<br>
              <strong>Road:</strong> ${road.name}
            </div>
          `);

          const endMarker = L.marker([endLat, endLng], {
            icon: L.divIcon({
              className: 'custom-end-marker',
              html: '<div style="background: #D32F2F; border: 3px solid #fff; border-radius: 50%; width: 20px; height: 20px; position: relative;"><div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); color: white; font-weight: bold; font-size: 12px;">●</div></div>',
              iconSize: [20, 20],
              iconAnchor: [10, 10]
            }),
            tempRoadId: road.id
          }).bindPopup(`
            <div style="background: #FFEBEE; padding: 8px; border: 2px solid #F44336; border-radius: 4px;">
              <strong style="color: #D32F2F;">🏁 End Point</strong><br>
              <strong>Lat:</strong> ${endLat.toFixed(6)}<br>
              <strong>Lng:</strong> ${endLng.toFixed(6)}<br>
              <strong>Road:</strong> ${road.name}
            </div>
          `);

          try {
            startMarker.addTo(map);
            endMarker.addTo(map);
          } catch (markerError) {
            console.error('Error adding markers:', markerError);
          }
        } catch (error) {
          console.error(`Failed to render temporary road ${road.id}:`, error);
        }
      }
    }

    // Add CSS for animations if not already added
    if (!document.getElementById('temp-road-styles')) {
      const style = document.createElement('style');
      style.id = 'temp-road-styles';
      style.textContent = `
        .temp-road-animated {
          animation: dash 2s linear infinite;
        }
        @keyframes dash {
          to {
            stroke-dashoffset: -20;
          }
        }
      `;
      document.head.appendChild(style);
    }

  }, [map, tempRoads, selectedRoadId, actualVisibleRoads]);

  return null;
};

// Get color by road type - Using brighter colors for better visibility
const getColorByType = (type) => {
  const colors = {
    'iceroad': '#00FFFF',
    'speed_limit': '#FF0000',
    'temporary': '#FF6600',
    'default': '#FF00FF'
  };
  
  return colors[type] || colors.default;
};

export default TempRoadDisplay;
