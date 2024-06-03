import React, { useState } from "react";
import "./Polygon.css"; // Import the CSS file
import { DeletePolygon, UpdatePolygon }  from "../services/PolygonService";
import { useDispatch } from "react-redux";
import { fetchPolygons } from "../features/polygons/polygonsSlice"

const PolygonDisplay = ({ name, type, coordinates, id }) => {
        const dispatch = useDispatch()

        const [isExpanded, setIsExpanded] = useState(false);
      
        const toggleExpansion = () => {
          setIsExpanded(!isExpanded);
        }

       const HandleDelete = async () => {
          await DeletePolygon(id);

          dispatch(fetchPolygons());
       }

        //const { editMode, post } = this.state;
        return (
          <div className="polygon">
            <h2>{name}</h2>
            <p>{type}</p>
            <button onClick={toggleExpansion}>
              {isExpanded ? "Hide" : "Show"} Coordinates
            </button>
            <img src="/trash.png" alt="Delete" onClick={HandleDelete} className="Delete icon" style={{height: '30px', width: '30px'}} />
            {isExpanded && (
              <ul>
                {coordinates.map((cord, index) => (
                  <li key={index}>
                    Latitude: {cord.lat.toFixed(3)}, Longitude: {cord.long.toFixed(3)}
                  </li>
                ))}
              </ul>
            )}

          </div>
        );
      }
      

export default PolygonDisplay;