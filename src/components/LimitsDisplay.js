import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { 
  fetchLimits, 
  fetchVehicleConfig, 
  clearLimits, 
  addLimitToMap,
  clearMapLimits
} from "../features/limits/LimitsSlice";
import { changeMapView } from '../features/view/ViewSlice';
import LimitItem from "./Limits";
import "./comp_styles.scss";

const LimitsDisplay = ({ isOpen }) => {
  const dispatch = useDispatch();
  const { limits, vehicleConfig, loading, error, visibleLimitIds } = useSelector(state => state.limits);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [selectedVehicleClass, setSelectedVehicleClass] = useState(null);
  const [showCoordinatesForLimit, setShowCoordinatesForLimit] = useState(null);

  useEffect(() => {
    if (isOpen) {
      dispatch(fetchLimits());
      dispatch(fetchVehicleConfig());
    }
  }, [dispatch, isOpen]);

  const handleShowOnMap = (limit) => {
    dispatch(addLimitToMap(limit.id));
    
    if (limit.coordinates && limit.coordinates.length > 0) {
      let centerLat, centerLng, zoom = 16;

      if (limit.coordinates.length === 1) {
        const [lngStr, latStr] = limit.coordinates[0];
        const lng = parseFloat(lngStr);
        const lat = parseFloat(latStr);
        
        if (!isNaN(lng) && !isNaN(lat)) {
          centerLng = lng;
          centerLat = lat;
          zoom = 18; 
        } else {
          console.error('Invalid single point coordinates:', limit.coordinates[0]);
          return;
        }
      } else {
        try {
          const validCoords = limit.coordinates
            .map(coord => {
              if (Array.isArray(coord) && coord.length >= 2) {
                const lng = parseFloat(coord[0]);
                const lat = parseFloat(coord[1]);
                return [lng, lat];
              }
              return null;
            })
            .filter(coord => 
              coord !== null && 
              !isNaN(coord[0]) && 
              !isNaN(coord[1])
            );

          if (validCoords.length === 0) {
            console.error('No valid coordinates found for limit:', limit.id);
            return;
          }

          centerLat = validCoords.reduce((sum, coord) => sum + coord[1], 0) / validCoords.length;
          centerLng = validCoords.reduce((sum, coord) => sum + coord[0], 0) / validCoords.length;

          const latValues = validCoords.map(coord => coord[1]);
          const lngValues = validCoords.map(coord => coord[0]);
          const latRange = Math.max(...latValues) - Math.min(...latValues);
          const lngRange = Math.max(...lngValues) - Math.min(...lngValues);
          const maxRange = Math.max(latRange, lngRange);

          if (maxRange < 0.001) zoom = 18;
          else if (maxRange < 0.005) zoom = 16;
          else if (maxRange < 0.01) zoom = 15;
          else if (maxRange < 0.05) zoom = 14;
          else zoom = 13;
        } catch (error) {
          console.error('Error calculating center coordinates:', error);
          return;
        }
      }

      if (typeof centerLat !== 'number' || typeof centerLng !== 'number' || 
          isNaN(centerLat) || isNaN(centerLng)) {
        console.error('Invalid calculated coordinates for limit:', limit.id);
        return;
      }

      dispatch(changeMapView({
        center: [centerLat, centerLng],
        zoom: zoom,
        animationOptions: { 
          duration: 1.5, 
          easeLinearity: 0.1 
        },
        timestamp: Date.now()
      }));
    }
  };

  const handleVehicleClassSelect = (vehicleClass) => {
    if (selectedVehicleClass && selectedVehicleClass.id === vehicleClass.id) {
      setSelectedVehicleClass(null);
    } else {
      setSelectedVehicleClass(vehicleClass);
    }
  };

  const handleShowCoordinates = (limitId) => {
    setShowCoordinatesForLimit(limitId);
  };

  const checkLimitRestrictsVehicle = (limit, vehicleClass) => {
    if (!vehicleClass) return false;
    
    let isRestricted = false;
    
    if (limit.maxheight && vehicleClass.height_cutoff) {
      const limitHeight = parseFloat(limit.maxheight);
      const vehicleHeight = parseFloat(vehicleClass.height_cutoff);
      if (vehicleHeight > limitHeight) {
        isRestricted = true;
      }
    }
    
    if (limit.maxweight && vehicleClass.weight_cutoff) {
      const limitWeight = parseFloat(limit.maxweight);
      const vehicleWeightInTons = parseFloat(vehicleClass.weight_cutoff) / 1000;
      if (vehicleWeightInTons > limitWeight) {
        isRestricted = true;
      }
    }
    
    return isRestricted;
  };

  const filteredLimits = limits.filter(limit => {
    const matchesSearch = searchTerm === "" || 
      String(limit.id).toLowerCase().includes(searchTerm.toLowerCase()) ||
      (limit.maxheight && limit.maxheight.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (limit.maxweight && limit.maxweight.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesFilter = filterType === "all" ||
      (filterType === "height" && limit.maxheight) ||
      (filterType === "weight" && limit.maxweight);

    const matchesVehicleClass = !selectedVehicleClass || 
      checkLimitRestrictsVehicle(limit, selectedVehicleClass);

    return matchesSearch && matchesFilter && matchesVehicleClass;
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
          {visibleLimitIds.length > 0 && (
            <span style={{ color: '#28a745', fontWeight: 'bold' }}>
              {" "}({visibleLimitIds.length} shown on map)
            </span>
          )}
        </p>
      </div>

      {vehicleConfig.classes && vehicleConfig.classes.length > 0 && (
        <div className="vehicle-config-section">
          <h4>Vehicle Classes:</h4>
          <div className="vehicle-classes">
            {vehicleConfig.classes.map(vehicle => (
              <div 
                key={vehicle.id} 
                className={`vehicle-class-item ${selectedVehicleClass && selectedVehicleClass.id === vehicle.id ? 'selected' : ''}`}
                onClick={() => handleVehicleClassSelect(vehicle)}
                style={{
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  backgroundColor: selectedVehicleClass && selectedVehicleClass.id === vehicle.id ? '#ff6b35' : 'transparent',
                  color: selectedVehicleClass && selectedVehicleClass.id === vehicle.id ? 'white' : 'inherit',
                  border: '2px solid transparent',
                  borderRadius: '4px',
                  padding: '4px 8px',
                  borderColor: selectedVehicleClass && selectedVehicleClass.id === vehicle.id ? '#ff6b35' : '#ddd'
                }}
              >
                <span className="vehicle-name">{vehicle.name}</span>
                <span className="vehicle-limits">
                  H:{vehicle.height_cutoff} W:{(vehicle.weight_cutoff / 1000).toFixed(1)}
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
          onChange={(e) => setFilterType(e.target.value)}
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

        {visibleLimitIds.length > 0 && (
          <button
            onClick={() => dispatch(clearMapLimits())}
            className="clear-map-button"
            style={{
              backgroundColor: '#dc3545',
              color: 'white',
              border: 'none',
              padding: '8px 12px',
              borderRadius: '4px',
              marginLeft: '8px',
              cursor: 'pointer'
            }}
          >
            Clear Map ({visibleLimitIds.length})
          </button>
        )}
      </div>

      <div className="limits-list">
        {filteredLimits.length === 0 ? (
          <div className="empty-state">
            <p>No limits found matching your criteria.</p>
            {searchTerm && <p>Try clearing the search term: "{searchTerm}"</p>}
            {filterType !== "all" && <p>Try changing the filter from "{filterType}"</p>}
            {selectedVehicleClass && <p>Try clearing the vehicle class selection</p>}
          </div>
        ) : (
          filteredLimits.map(limit => (
            <LimitItem 
              key={limit.id} 
              limit={limit} 
              onShowOnMap={handleShowOnMap}
              isOnMap={visibleLimitIds.includes(limit.id)}
              selectedVehicleClass={selectedVehicleClass}
              showCoordinatesForLimit={showCoordinatesForLimit}
              onShowCoordinates={handleShowCoordinates}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default LimitsDisplay;