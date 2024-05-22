import React, { useState } from "react";
import "./Polygon.css"; // Import the CSS file

const PolygonDisplay = ({ name, type, cords }) => {
        const [isExpanded, setIsExpanded] = useState(false);
      
        const toggleExpansion = () => {
          setIsExpanded(!isExpanded);
        };
      
        return (
          <div className="polygon">
            <h2>Name: {name}</h2>
            <p>Type: {type}</p>
            <button onClick={toggleExpansion}>
              {isExpanded ? "Collapse" : "Expand"} Coordinates
            </button>
            {isExpanded && (
              <ul>
                {cords.map((cord, index) => (
                  <li key={index}>
                    Latitude: {cord.lat.toFixed(3)}, Longitude: {cord.lng.toFixed(3)}
                  </li>
                ))}
              </ul>
            )}
          </div>
        );
      };

export default PolygonDisplay;