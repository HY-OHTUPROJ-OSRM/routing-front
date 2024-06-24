import React from "react";
import { useEffect } from "react";
import PolygonDisplay from "./PolygonDisplay";
import ModifiedPolygonDisplay from "./ModifiedPolygonDisplay";
import { useSelector } from 'react-redux';

function PolygonList({editMode, setEditMode, isOpen}) {
  //console.log("PolygonList editMode", editMode)
  const polygons = useSelector((state) => state.polygons);
  const modifiedPolygons = useSelector((state) => state.modifiedPolygons);
  //const listViewId = useSelector((state) => state.view.listView);
  //console.log("listcomp",isOpen)

  //<div key={polygon.properties.id} id={polygon.properties.id}>
  //</div>
  //console.log(modifiedPolygons);
  return (
    <div>
      {editMode && modifiedPolygons.polygons!={} ? (
        
        Object.values(modifiedPolygons.polygons).reverse().map((polygon, index) => (
          //console.log("polygon",polygon),
          <ModifiedPolygonDisplay key={polygon.properties.id} {...polygon} isOpen={isOpen}/>
        ))
      ) : (
        polygons.map((polygon, index) => (
          <PolygonDisplay key={polygon.properties.id} {...polygon} isOpen={isOpen}/>
        ))
      )}
    </div>
  );
}

export default PolygonList;