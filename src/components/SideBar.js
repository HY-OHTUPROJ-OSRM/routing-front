import React from "react";
import PolygonList from "./PolygonList";
const SideBar = props => {
  const sidebarClass = props.isOpen ? "sidebar open" : "sidebar";
  return (
    <div className={sidebarClass}>
      <PolygonList />
    </div>
  );
};
export default SideBar;