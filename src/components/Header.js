import React, { useState } from "react";
import "./comp_styles.scss";

const Header = ({ onClickA, onClickP, onClickGuide }) => {
  const [selectedTool, setSelectedTool] = useState("None");
  const [showTools, setShowTools] = useState(false);

  const tools = ["Measure", "Elevation", "Export"];

  const toggleToolsMenu = () => setShowTools(prev => !prev);
  const handleToolSelect = (tool) => {
    setSelectedTool(tool);
    setShowTools(false);
  };

  return (
    <div className="header">
      <h2>Routing app</h2>
      <div className="header-icons">
        <select
          className="header-icon"
          value={selectedTool}
          onChange={(e) => setSelectedTool(e.target.value)}
        >
          <option disabled value="None">Tools ▾</option>
          <option value="Measure">Measure</option>
          <option value="Elevation">Elevation</option>
          <option value="Export">Export</option>
        </select>

        <img 
          src="/add.png"
          alt="Add"
          onClick={onClickA}
          className="header-icon"
        />
        <img 
          src="/menu.png"
          alt="List"
          onClick={onClickP}
          className="header-icon"
        />
        <img
          onClick={onClickGuide}
          className="header-icon"
          src="/guide.png"
          alt="Guide"
        />

        
      </div>
    </div>
  );
};

export default Header;
