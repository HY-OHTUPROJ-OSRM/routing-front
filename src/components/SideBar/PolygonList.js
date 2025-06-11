import React, { useContext } from "react";
import PolygonDisplay from "./PolygonDisplay";
import ModifiedPolygonDisplay from "./ModifiedPolygonDisplay";
import { useSelector } from 'react-redux';

/*
A list component which displays all polygons in a list form. If in editmode uses ModifiedPolygon display and if not uses PolygonDisplay
*/
const PolygonList = () => {
  const { dispatch, state } = useContext(AppContext);

  const polygons = useSelector((state) => state.polygons);
  const modifiedPolygons = useSelector((state) => state.modifiedPolygons);

  const activeList = state.editMode
    ? Object.values(modifiedPolygons.polygons || {})
    : polygons || []
  ;

  if (activeList.length === 0) {
    return <p className="empty-list-msg">No polygons to display.</p>;
  }

  return (
    <div>
      {state.editMode
        ? activeList.reverse().map((polygon) => (
            <ModifiedPolygonDisplay key={polygon.properties.id} {...polygon} />
          ))
        : activeList.map((polygon, index) => (
            <PolygonDisplay key={polygon.properties.id} {...polygon} index={index} />
          ))}
    </div>
  );
}

export default PolygonList;
