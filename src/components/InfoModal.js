import "./comp_styles.scss";
import React, { useState } from "react";
import { useDispatch } from 'react-redux';
import { addTempRoad } from '../features/temproads/TempRoadsSlice';
import { getDisconnections } from "../services/DisconnectionsService";

const InfoModal = ({ isOpen, onClose, disconnectedRoadRef }) => {

  const dispatch = useDispatch();

  const handleCreateTempRoad = async (disconnection) => {
  const { osm_id_a, osm_id_b } = disconnection;

  const payload = {
    start_node: parseInt(osm_id_a),
    end_node: parseInt(osm_id_b),
    name: "Temporary connection",
    type: "temporary",
    status: true,
    speed: 100,
    length: 0,
    tags: [],
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

  const [disconnections, setDisconnections] = useState([]);

  // Inputs
  const [minDist, setMinDist] = useState(0);
  const [maxDist, setMaxDist] = useState(6);
  const [isSameName, setIsSameName] = useState(false);

  const handleGetDisconnections = async () => {
    try {
      const response = await getDisconnections(minDist, maxDist, isSameName);
      const data = response.data;

      console.log("Fetched disconnections:", data);
      if (!Array.isArray(data)) {
        console.error("Expected an array but got:", data);
        setDisconnections([]);
        return;
      }
      setDisconnections(data);
    } catch (error) {
      console.error("Failed to get disconnections:", error);
      setDisconnections([]);
    }
  };

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

        <div style={{ marginBottom: "1rem", display: "flex", gap: "8px", justifyContent: "center" }}>
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
          {disconnections.map((item, index) => (
            <tr key={index} style={{ borderBottom: "1px solid #eee" }}>
              <td style={{ padding: "8px", textAlign: "center" }}>
                <div>A: {item.name_a}</div>
                <div>B: {item.name_b}</div>
              </td>
              <td style={{ padding: "8px", textAlign: "center" }}>
                <div>{item.a_lat}</div>
                <div>{item.b_lat}</div>
              </td>
              <td style={{ padding: "8px", textAlign: "center" }}>
                <div>{item.a_lng}</div>
                <div>{item.b_lng}</div>
              </td>
              <td style={{ padding: "8px", textAlign: "center" }}>
                <button
                  className="disconnection-button"
                  onClick={() => {
                    disconnectedRoadRef.current[0]({
                      a_lat: item.a_lat,
                      a_lng: item.a_lng,
                      b_lat: item.b_lat,
                      b_lng: item.b_lng,
                    });
                  }}
                >
                  Show on map
                </button>
              </td>
              <td style={{ padding: "8px", textAlign: "center" }}>
                <button
                  className="disconnection-button"
                  onClick={() => handleCreateTempRoad(item)}
                >
                  Add temporary
                </button>
              </td>
            </tr>
          ))}
        </tbody>
        </table>
        )}
      </div>
    </div>
  );
};

export default InfoModal;
