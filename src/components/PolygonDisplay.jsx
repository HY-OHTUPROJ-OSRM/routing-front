import React, { useState } from "react";
import "./Polygon.css"; // Import the CSS file
import { DeletePolygon, UpdatePolygon }  from "../services/PolygonService";
import { useDispatch } from "react-redux";
import { fetchPolygons } from "../features/polygons/polygonsSlice"
import { fetchRouteLine } from "../features/routes/routeSlice"
const PolygonDisplay = ({ type, geometry, properties }) => {
        //console.log(type, geometry, properties)
        const dispatch = useDispatch()

        const [isExpanded, setIsExpanded] = useState(false);
      
        const toggleExpansion = () => {
          setIsExpanded(!isExpanded);
        }

       const HandleDelete = async () => {
          await DeletePolygon(properties.id);

          dispatch(fetchPolygons());
          dispatch(fetchRouteLine());
       }

        //const { editMode, post } = this.state;
        return (
          <div className="polygon">
            <h2>{properties.name}</h2>
            <p>{properties.type}</p>
            <button onClick={toggleExpansion}>
              {isExpanded ? "Hide" : "Show"} Coordinates
            </button>
            <img src="/trash.png" alt="Delete" onClick={HandleDelete} className="Delete icon" style={{height: '30px', width: '30px'}} />
            {isExpanded && (
              <ul>
                {geometry.coordinates[0].map((cord, index) => (
                  console.log(cord),
                  <li key={index}>
                    Latitude: {cord[1].toFixed(3)}, Longitude: {cord[0].toFixed(3)}
                  </li>
                ))}
              </ul>
            )}

          </div>
        );
      }
      

export default PolygonDisplay;