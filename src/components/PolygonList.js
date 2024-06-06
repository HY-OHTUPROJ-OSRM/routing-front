import React from "react";
import PolygonDisplay from "./PolygonDisplay";
import ModifiedPolygonDisplay from "./ModifiedPolygonDisplay";
import { useSelector } from 'react-redux';

function PolygonList({editMode, setEditMode}) {
  console.log("PolygonList editMode", editMode)
  const polygons = useSelector((state) => state.polygons);
  const modifiedPolygons = useSelector((state) => state.modifiedPolygons);

  console.log(modifiedPolygons);
  return (
    <div>
      {editMode && modifiedPolygons.polygons!={} ? (
        
        Object.values(modifiedPolygons.polygons).map((polygon, index) => (
          console.log("polygon",polygon),
          <ModifiedPolygonDisplay key={polygon.properties.id} {...polygon} />
        ))
      ) : (
        polygons.map((polygon, index) => (
          <PolygonDisplay key={polygon.properties.id} {...polygon} />
        ))
      )}
    </div>
  );
}

export default PolygonList;