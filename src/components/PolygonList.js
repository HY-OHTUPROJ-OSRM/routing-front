import React, { useState, useEffect } from "react";
import PolygonDisplay from "./PolygonDisplay";
import fetchPolygons from "../services/PolygonListService";
function PolygonList() {
  const [polygons, setPolygons] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const data = await fetchPolygons();
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