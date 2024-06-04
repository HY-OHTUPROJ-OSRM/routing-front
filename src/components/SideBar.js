import React from "react";
import PolygonList from "./PolygonList";

const SideBar = props => {
  const sidebarClass = props.isOpen ? "sidebar open" : "sidebar";
  const componentToDisplay=props.toBeDisplayed;
  return (
    <div className={sidebarClass} style={{overflow: "auto"}}>
      <PolygonList />
    </div>
  );
};
export default SideBar;