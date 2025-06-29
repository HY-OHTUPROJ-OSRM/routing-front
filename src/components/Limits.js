import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { removeLimitFromMap } from "../features/limits/LimitsSlice";
import "./comp_styles.scss";

const LimitItem = ({ 
  limit, 
  onShowOnMap, 
  selectedVehicleClass, 
  showCoordinatesForLimit, 
  onShowCoordinates,
  isHighlighted = false,
  onLimitClick
}) => {
  const dispatch = useDispatch();
  const { visibleLimitIds } = useSelector(state => state.limits);
  const isOnMap = visibleLimitIds.includes(limit.id);

  const formatValue = (value, type) => {
    if (!value) return 'N/A';
    
    // Add units for display
    if (type === 'height') {
      return `${value} m`;
    } else if (type === 'weight') {
      return `${value} t`;
    }
    return value;
  };

  const getVehicleRestrictionInfo = () => {
    if (!selectedVehicleClass) return null;

    const restrictions = [];
    
    if (limit.maxheight && selectedVehicleClass.height_cutoff) {
      const limitHeight = parseFloat(limit.maxheight);
      const vehicleHeight = parseFloat(selectedVehicleClass.height_cutoff);
      if (vehicleHeight > limitHeight) {
        restrictions.push({
          type: 'height',
          vehicleValue: vehicleHeight,
          limitValue: limitHeight,
          difference: (vehicleHeight - limitHeight).toFixed(1)
        });
      }
    }
    
    if (limit.maxweight && selectedVehicleClass.weight_cutoff) {
      const limitWeight = parseFloat(limit.maxweight);
      // Convert vehicle weight from kg to tons for comparison
      const vehicleWeightInTons = parseFloat(selectedVehicleClass.weight_cutoff) / 1000;
      if (vehicleWeightInTons > limitWeight) {
        restrictions.push({
          type: 'weight',
          vehicleValue: vehicleWeightInTons,
          limitValue: limitWeight,
          difference: (vehicleWeightInTons - limitWeight).toFixed(1)
        });
      }
    }
    
    return restrictions.length > 0 ? restrictions : null;
  };

  const hasLimits = limit.maxheight || limit.maxweight;
  const restrictions = getVehicleRestrictionInfo();

  if (!hasLimits) return null;

  const getHighlightStyle = () => {
    if (!isHighlighted) return {};
    
    return {
      backgroundColor: '#fff3cd',
      border: '3px solid #ffc107',
      borderRadius: '8px',
      boxShadow: '0 0 15px rgba(255, 193, 7, 0.5)',
      transform: 'scale(1.02)',
      transition: 'all 0.3s ease'
    };
  };

  return (
    <div 
      id={`limit-item-${limit.id}`} 
      className={`limit-item ${isOnMap ? 'on-map' : ''} ${restrictions ? 'restricted' : ''} ${isHighlighted ? 'highlighted' : ''}`}
      style={{
        ...getHighlightStyle(),
        cursor: 'pointer'
      }}
      onClick={() => onLimitClick && onLimitClick(limit.id)}
    >
      <div className="limit-item-header">
        {/* First row: Road ID */}
        <h4 style={{ margin: '0 0 8px 0' }}>Road ID: {limit.id}</h4>
        
        {/* Second row: Indicators */}
        <div className="header-indicators" style={{
          display: 'flex',
          gap: '6px',
          flexWrap: 'wrap',
          alignItems: 'center'
        }}>
          {isHighlighted && (
            <span className="highlight-indicator" style={{
              background: '#ffc107',
              color: '#212529',
              padding: '2px 6px',
              borderRadius: '10px',
              fontSize: '10px',
              fontWeight: 'bold',
              animation: 'pulse 1s infinite'
            }}>
              ⭐ SELECTED
            </span>
          )}
          {restrictions && (
            <span className="restriction-indicator" style={{
              background: '#dc3545',
              color: 'white',
              padding: '2px 6px',
              borderRadius: '10px',
              fontSize: '10px',
              fontWeight: 'bold'
            }}>
              RESTRICTED
            </span>
          )}
          {isOnMap && (
            <span className="on-map-indicator" style={{
              background: '#28a745',
              color: 'white',
              padding: '2px 6px',
              borderRadius: '10px',
              fontSize: '10px',
              fontWeight: 'bold'
            }}>
              ON MAP
            </span>
          )}
        </div>
      </div>
      
      <div className="limit-details">
        {limit.maxheight && (
          <div className="limit-detail">
            <span className="limit-label">Max Height:</span>
            <span className="limit-value">{formatValue(limit.maxheight, 'height')}</span>
          </div>
        )}
        
        {limit.maxweight && (
          <div className="limit-detail">
            <span className="limit-label">Max Weight:</span>
            <span className="limit-value">{formatValue(limit.maxweight, 'weight')}</span>
          </div>
        )}
        
        <div className="limit-detail">
          <span className="limit-label">Coordinates:</span>
          <span className="limit-value">
            {limit.coordinates?.length || 0} points
          </span>
        </div>
      </div>

      {restrictions && (
        <div className="vehicle-restriction-summary" style={{
          backgroundColor: '#fff3cd',
          border: '1px solid #ffeaa7',
          borderRadius: '4px',
          padding: '8px',
          marginTop: '8px',
          marginBottom: '12px',
          fontSize: '12px'
        }}>
          {restrictions.map((restriction, index) => (
            <div key={index}>
              <strong style={{ color: '#856404', whiteSpace: 'nowrap' }}>
                ⚠️ {selectedVehicleClass.name}: {restriction.vehicleValue}{restriction.type === 'height' ? ' m' : ' t'}
              </strong>
              <div style={{ marginTop: '4px', color: '#856404', whiteSpace: 'nowrap' }}>
                {restriction.type === 'height' ? 'Height' : 'Weight'} limit exceeded by: {restriction.difference}
                {restriction.type === 'height' ? ' m' : ' t'}
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="limit-actions">
        <button 
          className="action-button show-coordinates-btn"
          onClick={(e) => {
            e.stopPropagation();
            if (onShowCoordinates) {
              onShowCoordinates(showCoordinatesForLimit === limit.id ? null : limit.id);
            }
          }}
        >
          {showCoordinatesForLimit === limit.id ? 'Hide Coordinates' : 'Show Coordinates'}
        </button>
        
        {!isOnMap ? (
          <button 
            className="action-button show-on-map-btn"
            onClick={(e) => {
              e.stopPropagation();
              onShowOnMap && onShowOnMap(limit);
            }}
          >
            Show on Map
          </button>
        ) : (
          <button 
            className="action-button remove-from-map-btn"
            onClick={(e) => {
              e.stopPropagation();
              dispatch(removeLimitFromMap(limit.id));
            }}
            style={{
              backgroundColor: '#dc3545',
              color: 'white'
            }}
          >
            Remove from Map
          </button>
        )}
      </div>

      {/* Coordinates Display */}
      {showCoordinatesForLimit === limit.id && limit.coordinates && (
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
            Coordinates ({limit.coordinates.length} points):
          </div>
          <div style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            gap: '4px',
            maxHeight: '200px',
            overflowY: 'auto'
          }}>
            {limit.coordinates.map((coord, index) => {
              let lat, lng;
              if (Array.isArray(coord) && coord.length >= 2) {
                [lng, lat] = coord;
              } else if (coord.lat !== undefined && coord.lng !== undefined) {
                // Object format {lat: x, lng: y}
                lat = coord.lat;
                lng = coord.lng;
              } else {
                return (
                  <div key={index} style={{ fontSize: '13px', color: '#dc3545' }}>
                    Point {index + 1}: Invalid coordinate format
                  </div>
                );
              }

              return (
                <div key={index} style={{ fontSize: '13px', color: '#555' }}>
                  <strong>Point {index + 1}:</strong>
                  <span style={{ marginLeft: '8px', color: '#333' }}>
                    Lat: {parseFloat(lat).toFixed(6)}, Lng: {parseFloat(lng).toFixed(6)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default LimitItem;