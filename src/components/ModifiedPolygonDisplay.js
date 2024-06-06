import React, { useState } from "react";
import "./Polygon.css"; // Import the CSS file
import { DeletePolygon, UpdatePolygon } from "../services/PolygonService";
import { useDispatch } from "react-redux";
import { fetchPolygons } from "../features/polygons/polygonsSlice";

const ModifiedPolygonDisplay = ({ type, geometry, properties }) => {
  const dispatch = useDispatch();

  const [isExpanded, setIsExpanded] = useState(false);

  const toggleExpansion = () => {
    setIsExpanded(!isExpanded);
  }

  return (
    <div className="polygon">
      <h2>{properties.name} (Modified)</h2>
      <p>{properties.type}</p>
      <button onClick={toggleExpansion}>
        {isExpanded ? "Hide" : "Show"} Coordinates
      </button>
      {isExpanded && (
        <ul>
          {geometry.coordinates[0].map((cord, index) => (
            <li key={index}>
              Latitude: {cord[1].toFixed(3)}, Longitude: {cord[0].toFixed(3)}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default ModifiedPolygonDisplay;