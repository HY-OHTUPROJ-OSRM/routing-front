import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchLimits, fetchVehicleConfig, clearLimits } from "../features/limits/LimitsSlice";
import LimitItem from "./Limits";
import "./comp_styles.scss";

const LimitsDisplay = ({ isOpen }) => {
  const dispatch = useDispatch();
  const { limits, vehicleConfig, loading, error } = useSelector(state => state.limits);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all"); // all, height, weight

  useEffect(() => {
    if (isOpen) {
      dispatch(fetchLimits());
      dispatch(fetchVehicleConfig());
    }
    
    return () => {
      // dispatch(clearLimits());
    };
  }, [dispatch, isOpen]);

  const handleShowOnMap = (limit) => {
    console.log('Show on map:', limit);
    // TODO
    alert(`Show Road ${limit.id} on map (TODO)`);
  };

  const filteredLimits = limits.filter(limit => {
    const matchesSearch = searchTerm === "" || 
      String(limit.id).toLowerCase().includes(searchTerm.toLowerCase()) ||
      (limit.maxheight && limit.maxheight.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (limit.maxweight && limit.maxweight.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesFilter = filterType === "all" ||
      (filterType === "height" && limit.maxheight) ||
      (filterType === "weight" && limit.maxweight);

    return matchesSearch && matchesFilter;
  });

  if (loading) {
    return (
      <div className="limits-display">
        <div className="limits-header">
          <h3>Weight & Height Limits</h3>
        </div>
        <div className="loading-state">
          <p>Loading limits data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="limits-display">
        <div className="limits-header">
          <h3>Weight & Height Limits</h3>
        </div>
        <div className="error-state">
          <p>Error loading limits: {error}</p>
          <button 
            className="retry-button"
            onClick={() => {
              dispatch(fetchLimits());
              dispatch(fetchVehicleConfig());
            }}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="limits-display">
      <div className="limits-header">
        <h3>Weight & Height Limits</h3>
        <p className="limits-count">
          Found {filteredLimits.length} roads with limits
          {filterType !== "all" && (
            <span style={{ color: '#007bff', fontWeight: 'bold' }}>
              {" "}(filtered by {filterType})
            </span>
          )}
        </p>
      </div>

      {vehicleConfig.classes && vehicleConfig.classes.length > 0 && (
        <div className="vehicle-config-section">
          <h4>Vehicle Classes:</h4>
          <div className="vehicle-classes">
            {vehicleConfig.classes.map(vehicle => (
              <div key={vehicle.id} className="vehicle-class-item">
                <span className="vehicle-name">{vehicle.name}</span>
                <span className="vehicle-limits">
                  H:{vehicle.height_cutoff} W:{vehicle.weight_cutoff}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="limits-controls">
        <input
          type="text"
          placeholder="Search by Road ID, height, or weight..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
        
        <select 
          value={filterType}
          onChange={(e) => {
            console.log('Filter changed to:', e.target.value);
            setFilterType(e.target.value);
          }}
          className="filter-select"
          style={{ 
            minWidth: '120px',
            height: '36px',
            backgroundColor: 'white',
            border: '2px solid #007bff'
          }}
        >
          <option value="all">All Limits</option>
          <option value="height">Height Only</option>
          <option value="weight">Weight Only</option>
        </select>
      </div>

      <div className="limits-list">
        {filteredLimits.length === 0 ? (
          <div className="empty-state">
            <p>No limits found matching your criteria.</p>
            {searchTerm && <p>Try clearing the search term: "{searchTerm}"</p>}
            {filterType !== "all" && <p>Try changing the filter from "{filterType}"</p>}
          </div>
        ) : (
          filteredLimits.map(limit => (
            <LimitItem 
              key={limit.id} 
              limit={limit} 
              onShowOnMap={handleShowOnMap}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default LimitsDisplay;