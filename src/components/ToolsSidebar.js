import React from "react";
import TempRoads from "./TempRoad"; // Import the updated TempRoad component

const ToolsSidebar = (props) => {
  const sidebarClass = props.isOpen ? "sidebar open" : "sidebar";

  return (
    <div className={sidebarClass} style={{ overflow: "hidden", display: "flex", flexDirection: "column" }}>
      {/* Check if toBeDisplayed function exists and use it, otherwise use default TempRoads */}
      {props.toBeDisplayed ? props.toBeDisplayed() : <TempRoads />}
    </div>
  );
};

export default ToolsSidebar;
