import React from "react";
import { getDisconnections } from "../services/DisconnectionsService";
//poorly made component due to lack of knowledge on props :))))
const ToolSideBar = props => {
  const sidebarClass = props.isOpen ? "sidebar open" : "sidebar";
  return (
    <div className={sidebarClass}>
      <button onClick={() => {getDisconnections(100, 5000, false)}}>Get disconnections</button>
    </div>
  );
};
export default ToolSideBar;
