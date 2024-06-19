import React, { useState, useEffect } from "react";
import "./Polygon.css"; // Import the CSS file
import { DeletePolygon, UpdatePolygon }  from "../services/PolygonService";
import { useDispatch } from "react-redux";
import { fetchPolygons } from "../features/polygons/polygonsSlice"
import { fetchRouteLine } from "../features/routes/routeSlice"
import { useSelector } from 'react-redux';
import { getCentroid, zoomFit } from "../services/Intersect_self";
import {changeMapView} from "../features/view/ViewSlice";
const PolygonDisplay = ({ type, geometry, properties, isOpen }) => {
  const [highlightedId, setHighlightedId] = useState(null);
  const listViewId = useSelector((state) => state.view.listView);
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

      const flyOver = () => {
        console.log("flyOver", geometry);
        const centroid = getCentroid(geometry);
        console.log(zoomFit(geometry))
        dispatch(changeMapView({ center: [centroid[1], centroid[0]], zoom: zoomFit(geometry) }))
      }

       const scrollToElement = () => {
        console.log("scrollToElement", listViewId)
        if (listViewId) {
          const element = document.getElementById(listViewId);
          console.log("isopen",isOpen)
          if (element && isOpen) {
            setHighlightedId(listViewId);
            element.scrollIntoView({ behavior: "smooth" });
          }
        }
      };
    
      useEffect(() => {
        scrollToElement();
      }, [listViewId]);
        //const { editMode, post } = this.state;
        //console.log("publicurl",process.env.PUBLIC_URL)
        return (
          <div  className={highlightedId === properties.id ? 'highlight' : 'polygon'} id={properties.id}>
            <h2>{properties.name}</h2>
            <p>{properties.type}</p>
            {properties.type !== 'roadblock' && <p>{properties.effectValue}</p>}
            <button onClick={toggleExpansion} className="clickable-icon">
              {isExpanded ? "Hide" : "Show"} Coordinates
            </button>
            <button onClick={flyOver} className="clickable-icon">
              Show on map
            </button>
            <img 
            src={`${process.env.PUBLIC_URL}/trash.png`} 
            alt="Delete" 
            onClick={HandleDelete} 
            className="clickable-icon" 
            style={{ height: '30px', width: '30px', marginLeft: '10px', marginTop: '10px' }} 
          />
            {isExpanded && (
              <ul>
                {geometry.coordinates[0].map((cord, index) => (
                  console.log(cord),
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