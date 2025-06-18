import React from "react";
import "./comp_styles.scss";

const LimitItem = ({ limit, onShowOnMap }) => {
  const formatValue = (value) => {
    if (!value) return 'N/A';
    return value;
  };

  const hasLimits = limit.maxheight || limit.maxweight;

  if (!hasLimits) return null;

  return (
    <div className="limit-item">
      <div className="limit-item-header">
        <h4>Road ID: {limit.id}</h4>
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
        
        <button 
          className="action-button show-on-map-btn"
          onClick={() => onShowOnMap && onShowOnMap(limit)}
        >
          Show on Map
        </button>
      </div>
    </div>
  );
};

export default LimitItem;