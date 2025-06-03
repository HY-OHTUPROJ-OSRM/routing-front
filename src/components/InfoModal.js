import "./comp_styles.scss";
import React, { useState } from "react";
import { getDisconnections } from "../services/DisconnectionsService";

const InfoModal = ({ isOpen, onClose }) => {
  const [disconnections, setDisconnections] = useState([]);

  // Inputs
  const [minDist, setMinDist] = useState(100);
  const [maxDist, setMaxDist] = useState(5000);
  const [isSameName, setIsSameName] = useState(false);

  const handleGetDisconnections = async () => {
    try {
      let data = await getDisconnections(minDist, maxDist, isSameName);
      data = data.data;
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
      <div className="custom-modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>
          ×
        </button>
        <h3>Disconneted roads</h3>
        <p>This modal shows disconneted roads.</p>
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

      <button onClick={handleGetDisconnections}>Get disconnections</button>

      <ul>
        {disconnections.map((item, index) => (
          <li key={index}>
            {"A=" + item.name_a + "; B=" + item.name_b}
            <ul>
              <li>{"A lat=" + item.a_closest_lat + ", lon=" + item.a_closest_lon}</li>
              <li>{"B lat=" + item.b_closest_lat + ", lon=" + item.b_closest_lon}</li>
            </ul>
          </li>
        ))}
      </ul>
      </div>
    </div>
  );
};

export default InfoModal;
