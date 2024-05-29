import React, { useState } from "react";
import "./Polygon.css"; // Import the CSS file
import { DeletePolygon, UpdatePolygon }  from "../services/PolygonService";

const PolygonDisplay = ({ name, type, cords }) => {
        const [isExpanded, setIsExpanded] = useState(false);
      
        const toggleExpansion = () => {
          setIsExpanded(!isExpanded);
        }

       const HandleDelete = () => {
          DeletePolygon(name);
       }
        //const { editMode, post } = this.state;
        return (
          <div className="polygon">
            <h2>{name}</h2>
            <p>{type}</p>
            <button onClick={toggleExpansion}>
              {isExpanded ? "Collapse" : "Expand"} Coordinates
            </button>
            <img src="/trash.png" alt="Delete" onClick={HandleDelete} className="Delete icon" style={{height: '30px', width: '30px'}} />
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
      }
      

export default PolygonDisplay;