import React from "react";
import PolygonDisplay from "./PolygonDisplay";
import ModifiedPolygonDisplay from "./ModifiedPolygonDisplay"; // Import the new component
import { useSelector } from 'react-redux';

function PolygonList({editMode, setEditMode}) {
  console.log("PolygonList editMode", editMode)
  const polygons = useSelector((state) => state.polygons);
  const modifiedPolygons = useSelector((state) => state.modifiedPolygons);

  console.log(polygons);
  return (
    <div>
      {editMode ? (
        modifiedPolygons.map((polygon, index) => (
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