import "./comp_styles.scss";
import React, { useState, useMemo } from "react";
import { useSelector, useDispatch } from 'react-redux';
import { addTempRoad, deleteTempRoadAsync } from '../features/temproads/TempRoadsSlice';
import { getDisconnections } from "../services/DisconnectionsService";

const DisconnectionModal = ({ isOpen, onClose, disconnectedRoadRef }) => {
  const [disconnections, setDisconnections] = useState([]);
  const [filteredDisconnections, setFilteredDisconnections] = useState([]);
  const tempRoads = useSelector(state => state.tempRoads.list);

  // Inputs
  const [minDist, setMinDist] = useState(0);
  const [maxDist, setMaxDist] = useState(6);
  const [isSameName, setIsSameName] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");

  const dispatch = useDispatch();
  const handleCreateTempRoad = async (disconnection) => {
    const node_id_a = disconnection.startNode.id
    const node_id_b = disconnection.endNode.id

    const getReadableName = (nameA, nameB) => {
      const clean = (name) =>
          name && name !== "(unnamed)" ? name : "unnamed";

        return `Temp road: ${clean(nameA)} → ${clean(nameB)}`;
      };
    const toRadians = (deg) => (deg * Math.PI) / 180;

    const calculateDistance = (lat1, lon1, lat2, lon2) => {
      const R = 6371000;
      const φ1 = toRadians(lat1);
      const φ2 = toRadians(lat2);
      const Δφ = toRadians(lat2 - lat1);
      const Δλ = toRadians(lon2 - lon1);

      const a =
        Math.sin(Δφ / 2) ** 2 +
        Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) ** 2;

      return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    };

    const length = calculateDistance(
      disconnection.a_lat,
      disconnection.a_lng,
      disconnection.b_lat,
      disconnection.b_lng
    );

    const payload = {
      start_node: parseInt(node_id_a),
      end_node: parseInt(node_id_b),
      name: getReadableName(disconnection.name_a, disconnection.name_b), // 👈
      type: "temporary",
      status: true,
      speed: 50,
      length: length,
      tags: ["from_disconnection_ui"],
      description: ""
    };

    try {
      const resultAction = await dispatch(addTempRoad(payload));
      if (addTempRoad.fulfilled.match(resultAction)) {
        console.log("✅ AddTempRoad called via disconnection list", resultAction.payload);
      } else {
        console.error("❌ Failed to call addTempRoad via disconnection list", resultAction);
      }
    } catch (err) {
      console.error("Error dispatching addTempRoad via disconnection list", err);
    }
  };

  const handleGetDisconnections = async () => {
    try {
      const response = await getDisconnections(minDist, maxDist, isSameName);
      const data = response.data;

      console.log("Fetched disconnections:", data);
      if (!Array.isArray(data)) {
        console.error("Expected an array but got:", data);
        setDisconnections([]);
        setFilteredDisconnections([]);
        return;
      }
      setDisconnections(data);
      setFilteredDisconnections(data);
    } catch (error) {
      console.error("Failed to get disconnections:", error);
      setDisconnections([]);
      setFilteredDisconnections([]);
    }

    // Reset search term and dropdown
    if (document.querySelector(".search-disconnections") != null) {
      setSearchTerm("");
      setFilterType("all");
      document.querySelector(".search-disconnections").value = "";
      document.querySelector(".filter-dropdown").value = "all";
    }
  };

  const applyFilters = (disconnections, searchTerm, filterType) => {
    return disconnections.filter((item) => {
      const matchesSearch = item.name_a.toLowerCase().includes(searchTerm) || item.name_b.toLowerCase().includes(searchTerm);
      const matchesFilter =
        filterType === "all" ||
        (filterType === "undefined" && item.isReal === undefined) ||
        (filterType === "real" && item.isReal) ||
        (filterType === "fake" && (item.isReal != undefined && !item.isReal));
      return matchesSearch && matchesFilter;
    });
  };

  const existingTempRoads = useMemo(() => {
    const map = {};
    tempRoads.forEach((r) => {
      if (r.tags?.includes("from_disconnection_ui")) {
        const key = `${r.start_node}-${r.end_node}`;
        map[key] = r.id;
      }
    });
    return map;
  }, [tempRoads]);

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="custom-modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{ width: disconnections.length > 0 ? "80vw" : "auto", maxHeight: "80vh", overflowY: "auto" }}
      >
        <button className="modal-close" onClick={onClose}>
          ×
        </button>
        <h3>Disconnected roads</h3>
        <p>This modal shows disconnected roads.</p>

        <div style={{ marginBottom: "1rem" }}>
          <label>
            Min Distance:
            <input
              type="number"
              value={minDist}
              onChange={(e) => setMinDist(Number(e.target.value))}
              style={{ marginLeft: "0.5rem", width: "80px" }}
            />
          </label>
          <br />
          <label>
            Max Distance:
            <input
              type="number"
              value={maxDist}
              onChange={(e) => setMaxDist(Number(e.target.value))}
              style={{ marginLeft: "0.5rem", width: "80px" }}
            />
          </label>
          <br />
          <label>
            Same Name:
            <input
              type="checkbox"
              checked={isSameName}
              onChange={(e) => setIsSameName(e.target.checked)}
              style={{ marginLeft: "0.5rem" }}
            />
          </label>
        </div>

        <div className="button-container">
          <button 
            onClick={handleGetDisconnections}
            className="disconnection-button"
          >
            Get disconnections
          </button>

          <button
            onClick={disconnectedRoadRef.current[1]}
            className="disconnection-button"
          >
            Delete disconnections
          </button>

          <button
            onClick={disconnectedRoadRef.current[2]}
            className="disconnection-button"
          >
            Set nodelist
          </button>
        </div>

        {disconnections.length > 0 && (
          <>
            <div className="search-container">
              <input
                type="text"
                placeholder="Search street names, counties, ..."
                className="search-disconnections"
                onChange={(e) => {
                  const newSearchTerm = e.target.value.toLowerCase();
                  setSearchTerm(newSearchTerm);
                  setFilteredDisconnections(applyFilters(disconnections, newSearchTerm, filterType));
                }}
                style={{
                  width: "100%",
                  marginTop: "1rem",
                  padding: "8px",
                  borderRadius: "6px",
                  border: "1px solid #ccc",
                  fontSize: "14px",
                }}
              />
              <select
                className="filter-dropdown"
                value={filterType}
                onChange={(e) => {
                  const newFilterType = e.target.value;
                  setFilterType(newFilterType);
                  setFilteredDisconnections(applyFilters(disconnections, searchTerm, newFilterType));
                }}
                style={{
                  marginLeft: "1rem",
                  padding: "8px",
                  borderRadius: "6px",
                  border: "1px solid #ccc",
                  fontSize: "14px",
                }}
              >
                <option value="all">Show All Types</option>
                <option value="undefined">Show Undefined Disconnections</option>
                <option value="real">Show Real Disconnections</option>
                <option value="fake">Show Fake Disconnections</option>
              </select>
            </div>
            <table
              style={{
                width: "100%",
                marginTop: "1rem",
                borderCollapse: "collapse",
                fontSize: "14px",
              }}
              >
              <thead>
                <tr>
                  {["Points", "Latitude", "Longitude", "Show", "Add"].map((header) => (
                    <th
                      key={header}
                      style={{
                        textAlign: "center",
                        borderBottom: "1px solid #ccc",
                        padding: "8px",
                      }}
                    >
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredDisconnections.map((item, index) => (
                  <tr key={index} style={{ borderBottom: "1px solid #eee" }}>
                    <td style={{ padding: "8px", textAlign: "center" }}>
                      <div>A: {item.startNode.id} {item.startNode.way_name}</div>
                      <div>B: {item.endNode.id} {item.endNode.way_name}</div>
                    </td>
                    <td style={{ padding: "8px", textAlign: "center" }}>
                      <div>{item.startNode.lat}</div>
                      <div>{item.endNode.lat}</div>
                    </td>
                    <td style={{ padding: "8px", textAlign: "center" }}>
                      <div>{item.startNode.lon}</div>
                      <div>{item.endNode.lon}</div>
                    </td>
                    <td style={{ padding: "8px", textAlign: "center" }}>
                      <button
                        className="disconnection-button"
                        onClick={() => {
                          disconnectedRoadRef.current[0]({
                          a_lat: item.startNode.lat,
                          a_lng: item.startNode.lon,
                          b_lat: item.endNode.lat,
                          b_lng: item.endNode.lon,
                          });
                        }}
                      >
                        Show on map
                      </button>
                    </td>
                    <td style={{ padding: "8px", textAlign: "center" }}>
                      {existingTempRoads[`${item.node_id_a}-${item.node_id_b}`] ? (
                        <button
                          className="disconnection-button"
                          onClick={() => dispatch(deleteTempRoadAsync(existingTempRoads[`${item.node_id_a}-${item.node_id_b}`]))}
                        >
                          Delete temporary
                        </button>
                      ) : (
                        <button
                          className="disconnection-button"
                          onClick={() => handleCreateTempRoad(item)}
                        >
                          Add temporary
                        </button>
                      )}
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
