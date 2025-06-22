import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { removeLimitFromMap } from "../features/limits/LimitsSlice";
import "./comp_styles.scss";

const LimitItem = ({ limit, onShowOnMap }) => {
  const dispatch = useDispatch();
  const { visibleLimitIds } = useSelector(state => state.limits);
  const isOnMap = visibleLimitIds.includes(limit.id);

  const formatValue = (value) => {
    if (!value) return 'N/A';
    return value;
  };

  const hasLimits = limit.maxheight || limit.maxweight;

  if (!hasLimits) return null;

  return (
    <div className={`limit-item ${isOnMap ? 'on-map' : ''}`}>
      <div className="limit-item-header">
        <h4>Road ID: {limit.id}</h4>
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
      
      <div className="limit-details">
        {limit.maxheight && (
          <div className="limit-detail">
            <span className="limit-label">Max Height:</span>
            <span className="limit-value">{formatValue(limit.maxheight)}</span>
          </div>
        )}
        
        {limit.maxweight && (
          <div className="limit-detail">
            <span className="limit-label">Max Weight:</span>
            <span className="limit-value">{formatValue(limit.maxweight)}</span>
          </div>
        )}
        
        <div className="limit-detail">
          <span className="limit-label">Coordinates:</span>
          <span className="limit-value">
            {limit.coordinates?.length || 0} points
          </span>
        </div>
      </div>

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