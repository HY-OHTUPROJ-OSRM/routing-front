import React from "react";
import CreatePolygons from "./CreatePolygon";
//poorly made component due to lack of knowledge on props :))))
const CopeSideBar = props => {
  const sidebarClass = props.isOpen ? "sidebar open" : "sidebar";
  return (
    <div className={sidebarClass}>
      <CreatePolygons />
    </div>
  );
};
export default CopeSideBar;
