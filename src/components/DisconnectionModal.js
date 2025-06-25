import "./comp_styles.scss";
import React, { useState, useMemo, useEffect } from "react";
import { useSelector, useDispatch } from 'react-redux';
import { addTempRoad, deleteTempRoadAsync, fetchTempRoads } from '../features/temproads/TempRoadsSlice';
import { getDisconnections, attachTempRoadToDisconnection, toggleHideStatus } from "../services/DisconnectionsService";

const DisconnectionModal = ({ isOpen, onClose, disconnectedRoadRef }) => {
  const [disconnections, setDisconnections] = useState([]);
  const [filteredDisconnections, setFilteredDisconnections] = useState([]);
  const [sortConfig, setSortConfig] = useState({ key: "startId", dir: "asc" });
  const [hasMapDisconnections, setHasMapDisconnections] = useState(false);

  // Inputs
  const defaultMin = 0;
  const defaultMax = 6;
  const [minDist, setMinDist] = useState(defaultMin);
  const [maxDist, setMaxDist] = useState(defaultMax);
  const [isSameName, setIsSameName] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");

  const dispatch = useDispatch();
  const tempRoads = useSelector(state => state.tempRoads.list);
  const tempRoadsStatus = useSelector(state => state.tempRoads.status);

  useEffect(() => {
    if (isOpen && tempRoadsStatus === 'idle') {
      dispatch(fetchTempRoads());
    }
  }, [isOpen, tempRoadsStatus, dispatch]);

  // Fetch list
  const handleGetDisconnections = async () => {
    try {
      const response = await getDisconnections(minDist, maxDist, isSameName);
      const data = response.data;
      setDisconnections(Array.isArray(data) ? data : []);
      setFilteredDisconnections(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to get disconnections:", err);
      setDisconnections([]);
      setFilteredDisconnections([]);
    }
  };

  // Create temp road
  const handleCreateTempRoad = async (disc) => {
    const payload = {
      geom: {
        type: 'LineString',
        coordinates: [
          [disc.startNode.lon, disc.startNode.lat],
          [disc.endNode.lon, disc.endNode.lat]
        ]
      },
      name: `Temp road: ${disc.startNode.way_name || 'unnamed'} → ${disc.endNode.way_name || 'unnamed'}`,
      type: "temporary",
      status: true,
      speed: 50,
      length: Number((parseFloat(disc.distance) / 1000).toFixed(3)),
      tags: ["from_disconnection_ui"],
      description: ""
    };

    const result = await dispatch(addTempRoad(payload));
    if (addTempRoad.fulfilled.match(result)) {
      const newId = result.payload.id;
      try {
        await attachTempRoadToDisconnection(disc.id, newId, disc.updated_at);
        await handleGetDisconnections();
      } catch (linkErr) {
        if (linkErr?.response?.status === 409) {
          alert("Conflict: This disconnection was modified by another user. Please refresh and try again.");
        } else {
          console.error("Failed to attach temp road:", linkErr);
        }
      }
    }
  };

  // Delete temp road
  const handleDeleteTempRoad = async (disc) => {
    const found = tempRoads.find(r => r.id === disc.temp_road_id);
    if (!found) {
      alert("Temporary road not found in state.");
      return;
    }
    const result = await dispatch(deleteTempRoadAsync({ id: found.id, updated_at: found.updated_at }));
    if (deleteTempRoadAsync.fulfilled.match(result)) {
      await handleGetDisconnections();
    }
  };

  // Toggle hide status
  const handleToggleHideStatus = async (disc) => {
    try {
      await toggleHideStatus(disc.id, disc.updated_at);
      await handleGetDisconnections();
    } catch (err) {
      if (err?.response?.status === 409) {
        alert("Conflict: This disconnection was modified by another user. Please refresh and try again.");
      } else {
        console.error("toggleHideStatus failed:", err);
      }
    }
  };

  // Handlers for non-negative min/max
  const onMinChange = e => {
    const val = parseFloat(e.target.value);
    setMinDist(!isNaN(val) && val >= 0 ? val : defaultMin);
  };
  const onMaxChange = e => {
    const val = parseFloat(e.target.value);
    setMaxDist(!isNaN(val) && val >= 0 ? val : defaultMax);
  };

  // Filtering & sorting
  const applyFilters = (items, term, type) => {
    return items.filter(item => {
      const lc = term.toLowerCase();
      const matchesSearch = item.startNode.way_name.toLowerCase().includes(lc)
        || item.endNode.way_name.toLowerCase().includes(lc)
        || item.county_name.toLowerCase().includes(lc);
      let matchesFilter = (type === "all");
      if (type === "undefined") matchesFilter = !item.hide_status && !item.temp_road_id;
      if (type === "actual")    matchesFilter = item.hide_status;
      if (type === "patched")   matchesFilter = !!item.temp_road_id;
      return matchesSearch && matchesFilter;
    });
  };

  const handleSort = (key) => {
    setSortConfig(prev => ({
      key,
      dir: prev.key === key && prev.dir === "asc" ? "desc" : "asc"
    }));
  };

  const getValue = (item, key) => {
    switch (key) {
      case "startId":  return item.startNode.id;
      case "endId":    return item.endNode.id;
      case "lat":      return item.startNode.lat;
      case "lon":      return item.startNode.lon;
      case "distance": return item.distance || 0;
      case "county":   return item.county_name || "";
      default:         return "";
    }
  };

  const sortedDisconnections = useMemo(() => {
    const arr = [...filteredDisconnections];
    return arr.sort((a, b) => {
      const vA = getValue(a, sortConfig.key);
      const vB = getValue(b, sortConfig.key);
      if (vA < vB) return sortConfig.dir === "asc" ? -1 : 1;
      if (vA > vB) return sortConfig.dir === "asc" ? 1 : -1;
      return 0;
    });
  }, [filteredDisconnections, sortConfig]);

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="custom-modal-content"
        onClick={e => e.stopPropagation()}
        style={{ maxHeight: "80vh", width: disconnections.length > 0 ? "80vw" : "auto" }}
      >
        <button className="modal-close" onClick={onClose}>×</button>
        <h3 className="modal-title">Disconnected roads</h3>
        <p className="modal-description">This modal shows disconnected roads.</p>

        <div className="modal-filters">
          <label>
            Min Distance:
            <input
              type="number"
              value={minDist}
              placeholder={defaultMin}
              onChange={onMinChange}
              className="modal-input small"
              min={0}
            />
          </label>
          <label>
            Max Distance:
            <input
              type="number"
              value={maxDist}
              placeholder={defaultMax}
              onChange={onMaxChange}
              className="modal-input small"
              min={0}
            />
          </label>
          <label>
            Same Name:
            <input
              type="checkbox"
              checked={isSameName}
              onChange={e => setIsSameName(e.target.checked)}
              className="modal-checkbox"
            />
          </label>
        </div>

        <div className="button-container">
          <button onClick={handleGetDisconnections} className="disconnection-button">Get disconnections</button>
          <button
            onClick={() => {
              disconnectedRoadRef.current?.[1]();
              setHasMapDisconnections(false);
            }}
            className={`disconnection-button${!hasMapDisconnections ? ' disabled' : ''}`}
            disabled={!hasMapDisconnections}
          >
            Clear disconnections from map
          </button>
        </div>

        {disconnections.length > 0 && (
          <>
            <div className="search-container">
              <input
                type="text"
                className="search-disconnections"
                placeholder="Search street names, municipalities, ..."
                value={searchTerm}
                onChange={e => {
                  const t = e.target.value.toLowerCase();
                  setSearchTerm(t);
                  setFilteredDisconnections(applyFilters(disconnections, t, filterType));
                }}
              />
              <select
                className="filter-dropdown"
                value={filterType}
                onChange={e => {
                  const ft = e.target.value;
                  setFilterType(ft);
                  setFilteredDisconnections(applyFilters(disconnections, searchTerm, ft));
                }}
              >
                <option value="all">Show All Types</option>
                <option value="undefined">Undefined</option>
                <option value="actual">Actual disconnections</option>
                <option value="patched">Patched (temp road added)</option>
              </select>
            </div>

            <table className="disconnection-table">
              <thead>
                <tr>
                  <th onClick={() => handleSort("startId")}>Points {sortConfig.key==="startId"?(sortConfig.dir==="asc"?"▲":"▼"):null}</th>
                  <th onClick={() => handleSort("lat")}>Latitude {sortConfig.key==="lat"?(sortConfig.dir==="asc"?"▲":"▼"):null}</th>
                  <th onClick={() => handleSort("lon")}>Longitude {sortConfig.key==="lon"?(sortConfig.dir==="asc"?"▲":"▼"):null}</th>
                  <th onClick={() => handleSort("distance")}>Distance (m) {sortConfig.key==="distance"?(sortConfig.dir==="asc"?"▲":"▼"):null}</th>
                  <th onClick={() => handleSort("county")}>Municipality {sortConfig.key==="county"?(sortConfig.dir==="asc"?"▲":"▼"):null}</th>
                  <th>Show</th><th>Add</th><th>Hide</th>
                </tr>
              </thead>
              <tbody>
                {sortedDisconnections.map((item, idx) => (
                  <tr key={idx}>
                    <td>
                      <div>A: {item.startNode.id} {item.startNode.way_name}</div>
                      <div>B: {item.endNode.id} {item.endNode.way_name}</div>
                    </td>
                    <td>{item.startNode.lat}</td>
                    <td>{item.startNode.lon}</td>
                    <td>{Number(item.distance).toFixed(1)} m</td>
                    <td>{item.county_name}</td>
                    <td>
                      <button
                        className="disconnection-button"
                        onClick={() => {
                          disconnectedRoadRef.current[0]({
                            a_lat: item.startNode.lat,
                            a_lng: item.startNode.lon,
                            b_lat: item.endNode.lat,
                            b_lng: item.endNode.lon
                          });
                          setHasMapDisconnections(true);
                        }}
                      >
                        Show on map
                      </button>
                    </td>
                    <td>
                      {item.temp_road_id
                        ? <button className="disconnection-button delete-temp" onClick={() => handleDeleteTempRoad(item)}>Delete temporary</button>
                        : item.hide_status
                          ? <button className="disconnection-button disabled" disabled>Actual disconnection</button>
                          : <button className="disconnection-button" onClick={() => handleCreateTempRoad(item)}>Add temporary</button>
                      }
                    </td>
                    <td>
                      {item.temp_road_id
                        ? (
                          <button className="disconnection-button disabled" disabled>
                            Patched
                          </button>
                        )
                        : (
                          <button
                            className={`disconnection-button ${item.hide_status ? 'delete-temp' : ''}`}
                            onClick={() => handleToggleHideStatus(item)}
                          >
                            {item.hide_status ? "Show" : "Hide"}
                          </button>
                        )
                      }
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}
      </div>
    </div>
  );
};

export default DisconnectionModal;
