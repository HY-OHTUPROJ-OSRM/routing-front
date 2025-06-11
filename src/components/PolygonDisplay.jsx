import React, { useState, useEffect, useContext, useRef } from "react";
import { ProfileContext } from './CoordinatesContext'; // varmista että polku on oikea
import "./Polygon.css"; // Import the CSS file
import { DeletePolygon, UpdatePolygon }  from "../services/PolygonService";
import { useDispatch } from "react-redux";
import { fetchPolygons } from "../features/polygons/polygonsSlice"
import { fetchRouteLine } from "../features/routes/routeSlice"
import { useSelector } from 'react-redux';
import { getCentroid, zoomFit } from "../services/Intersect_self";
import {changeMapView} from "../features/view/ViewSlice";

/**
 * List component used to display info of all created polygons while outside of edit mode
 */
const PolygonDisplay = ({ type, geometry, properties, isOpen, index, isSelected = false, onSelect, batchMode = false }) => {
  const [highlightedId, setHighlightedId] = useState(null);
  const listViewId = useSelector((state) => state.view.listView);
  const dispatch = useDispatch()

        const [isExpanded, setIsExpanded] = useState(false);
      
        const toggleExpansion = () => {
          setIsExpanded(!isExpanded);
        }
      const { selectedProfile } = useContext(ProfileContext);
      const profileRef = useRef();
      profileRef.current = selectedProfile;

      const HandleDelete = async () => {
        await DeletePolygon(properties.id);
        dispatch(fetchPolygons());
        dispatch(fetchRouteLine(undefined, profileRef.current));
       }

  const handleCheckboxChange = (e) => {
    e.stopPropagation();
    if (onSelect) {
      onSelect(properties.id, e.target.checked);
    }
  };

  const translator = {
    "cap": "Speed limit (Km/h)", 
    "roadblock": "roadblock", 
    "constant": "Custom speed", 
    "offset": "Modified speed +-(Km/h)", 
    "factor": "Modified speed (multiplier)"
  };

  const flyOver = () => {
    const centroid = getCentroid(geometry);
    dispatch(changeMapView({ center: [centroid[1], centroid[0]], zoom: zoomFit(geometry) }))
  }

  const scrollToElement = () => {
    if (listViewId) {
      const element = document.getElementById(listViewId);
      if (element && isOpen) {
        setHighlightedId(listViewId);
        element.scrollIntoView({ behavior: "smooth" });
      }
    }
  };

  useEffect(() => {
    scrollToElement();
  }, [listViewId]);

  return (
    <div className={`${highlightedId === properties.id ? 'highlight' : 'polygon'} ${isSelected ? 'selected' : ''}`} id={properties.id}>
      {/* Batch mode checkbox */}
      {batchMode && (
        <div className="checkbox-container">
          <input
            type="checkbox"
            className="polygon-checkbox"
            checked={isSelected}
            onChange={handleCheckboxChange}
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
      
      <h2>{properties.name}</h2>
      <p>{translator[properties.type]}</p>
      {properties.type !== 'roadblock' && (
        <p>
          {properties.effect_value}
          {properties.type === 'factor' ? ' (multiplier)' : ' (Km/h)'}
        </p>
      )}
      
      <div className="polygon-actions">
        <button onClick={toggleExpansion} className="clickable-icon">
          {isExpanded ? "Hide" : "Show"} Coordinates
        </button>
        <button onClick={flyOver} className="clickable-icon">
          Show on map
        </button>
        {/* Hide individual delete button in batch mode */}
        {!batchMode && (
          <img 
            src={`${process.env.PUBLIC_URL}/trash.png`} 
            alt="Delete" 
            onClick={HandleDelete} 
            id={`del${index}`}
            className="clickable-icon" 
            style={{ height: '30px', width: '30px', marginLeft: '10px', marginTop: '10px' }} 
          />
        )}
      </div>
      
      {isExpanded && (
        <ul>
          {geometry.coordinates[0].map((cord, index) => (
            <li key={index}>
              Latitude: {cord[1].toFixed(6)}, Longitude: {cord[0].toFixed(6)}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default PolygonDisplay;