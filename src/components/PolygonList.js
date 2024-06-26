import React from "react";
import PolygonDisplay from "./PolygonDisplay";
import ModifiedPolygonDisplay from "./ModifiedPolygonDisplay";
import { useSelector } from 'react-redux';

/*
A list component which displays all polygons in a list form. If in editmode uses ModifiedPolygon display and if not uses PolygonDisplay
*/
function PolygonList({editMode, setEditMode, isOpen}) {
  const polygons = useSelector((state) => state.polygons);
  const modifiedPolygons = useSelector((state) => state.modifiedPolygons);

  return (
    <div>
      {editMode && modifiedPolygons.polygons!={} ? (
        
        Object.values(modifiedPolygons.polygons).reverse().map((polygon, index) => (
          <ModifiedPolygonDisplay key={polygon.properties.id} {...polygon} isOpen={isOpen}/>
        ))
      ) : (
        polygons.map((polygon, index) => (
          <PolygonDisplay key={polygon.properties.id} {...polygon} isOpen={isOpen} index={index}/>
        ))
      )}
    </div>
  );
}

export default PolygonList;