import React, { useState, useEffect } from "react";
import PolygonDisplay from "./PolygonDisplay";
import fetchPolygons from "../services/PolygonListService";
//import { getPolygons } from '../services/PolygonService';

function PolygonList() {
  const [polygons, setPolygons] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      // const data = await getPolygons(); with backend
      const data = await fetchPolygons();// with frontend only
      setPolygons(data);
    };
    fetchData();
  }, []);

  return (
    <div>
      {polygons.map((polygon, index) => (
        <PolygonDisplay key={index} {...polygon} />
      ))}
    </div>
  );
}

export default PolygonList;