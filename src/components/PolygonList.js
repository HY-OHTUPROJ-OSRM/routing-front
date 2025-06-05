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

    const activeList = editMode
    ? Object.values(modifiedPolygons.polygons || {})
    : polygons || [];

  if (activeList.length === 0) {
    return <p className="empty-list-msg">No polygons to display.</p>;
  }

  return (
    <div>
      {editMode
        ? activeList.reverse().map((polygon) => (
            <ModifiedPolygonDisplay key={polygon.properties.id} {...polygon} isOpen={isOpen} />
          ))
        : activeList.map((polygon, index) => (
            <PolygonDisplay key={polygon.properties.id} {...polygon} isOpen={isOpen} index={index} />
          ))}
    </div>
  );
}

export default PolygonList;