import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { removeLimitFromMap } from "../features/limits/LimitsSlice";
import "./comp_styles.scss";

const LimitItem = ({ limit, onShowOnMap, selectedVehicleClass }) => {
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
      const vehicleWeightInTons = parseFloat(selectedVehicleClass.weight_cutoff) / 1000; // Convert vehicle weight from kg to tons
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

  return (
    <div className={`limit-item ${isOnMap ? 'on-map' : ''} ${restrictions ? 'restricted' : ''}`}>
      <div className="limit-item-header">
        <h4>Road ID: {limit.id}</h4>
        <div className="header-indicators">
          {restrictions && (
            <span className="restriction-indicator" style={{
              background: '#dc3545',
              color: 'white',
              padding: '2px 6px',
              borderRadius: '10px',
              fontSize: '10px',
              fontWeight: 'bold',
              marginRight: '4px'
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
            {restrictions && restrictions.find(r => r.type === 'height') && (
              <span className="restriction-detail" style={{
                color: '#dc3545',
                fontSize: '11px',
                marginLeft: '8px',
                fontWeight: 'bold'
              }}>
                (Vehicle: {restrictions.find(r => r.type === 'height').vehicleValue} m, 
                Exceeds by: {restrictions.find(r => r.type === 'height').difference} m)
              </span>
            )}
          </div>
        )}
        
        {limit.maxweight && (
          <div className="limit-detail">
            <span className="limit-label">Max Weight:</span>
            <span className="limit-value">{formatValue(limit.maxweight, 'weight')}</span>
            {restrictions && restrictions.find(r => r.type === 'weight') && (
              <span className="restriction-detail" style={{
                color: '#dc3545',
                fontSize: '11px',
                marginLeft: '8px',
                fontWeight: 'bold'
              }}>
                (Vehicle: {restrictions.find(r => r.type === 'weight').vehicleValue} t, 
                Exceeds by: {restrictions.find(r => r.type === 'weight').difference} t)
              </span>
            )}
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
          fontSize: '12px'
        }}>
          <strong style={{ color: '#856404' }}>
            ⚠️ This road restricts {selectedVehicleClass.name}:
          </strong>
          <ul style={{ margin: '4px 0', paddingLeft: '16px', color: '#856404' }}>
            {restrictions.map((restriction, index) => (
              <li key={index}>
                {restriction.type === 'height' ? 'Height' : 'Weight'} limit exceeded by {restriction.difference}
                {restriction.type === 'height' ? ' m' : ' t'}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="limit-actions">
        <button 
          className="action-button show-coordinates-btn"
          onClick={() => {
            console.log('Coordinates:', limit.coordinates);
            alert(`Coordinates for Road ${limit.id}:\n${JSON.stringify(limit.coordinates, null, 2)}`);
          }}
        >
          Show Coordinates
        </button>
        
        {!isOnMap ? (
          <button 
            className="action-button show-on-map-btn"
            onClick={() => onShowOnMap && onShowOnMap(limit)}
          >
            Show on Map
          </button>
        ) : (
          <button 
            className="action-button remove-from-map-btn"
            onClick={() => dispatch(removeLimitFromMap(limit.id))}
            style={{
              backgroundColor: '#dc3545',
              color: 'white'
            }}
          >
            Remove from Map
          </button>
        )}
      </div>
    </div>
  );
};

export default LimitItem;