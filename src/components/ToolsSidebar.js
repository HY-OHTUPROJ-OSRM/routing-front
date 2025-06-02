import React from "react";

const IceRoadSidebar = (props) => {
  const sidebarClass = props.isOpen ? "sidebar open" : "sidebar";
  const ComponentToDisplay = props.toBeDisplayed;

  return (
    <div className={sidebarClass} style={{ overflow: "auto" }}>
      <ComponentToDisplay />
    </div>
  );
};

export default IceRoadSidebar;