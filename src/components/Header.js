import React, { useState } from "react";
import "./comp_styles.scss";

const Header = ({ onClickA, onClickP, onClickGuide, handleToolsClick, handleShowProfileModal, selectedProfile, handleShowInfoModal }) => {
  const [selectedTool, setSelectedTool] = useState("None");

  const handleChange = (e) => {
    const value = e.target.value;
    setSelectedTool("None");

    if (value === "temproad") {
      handleToolsClick();
    }
    if (value === 'select-profile') {
      handleShowProfileModal();
    }
    if (value === 'info') {
      handleShowInfoModal();
    }
    else {
    }
  };

  return (
    <div className="header">
      <h2>Routing app</h2>
      <div className="profile-display">{selectedProfile}</div>
      <div className="header-icons">

        <label className="header-select-wrapper">
          <span className="tools-label">Tools ▾</span>
          <select className="header-select" value={selectedTool} onChange={handleChange}>
            <option disabled value="None">Tools ▾</option>

            <option value="iceroad">Ice roads</option>
            <option value="select-profile">Select profile</option>
            <option value="info">Disconneted roads</option>
            <option value="export">example2</option>

            <option value="temproad">Temporary roads</option>
            <option value="elevation">Elevation</option>
            <option value="export">Export</option>

          </select>
        </label>

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
