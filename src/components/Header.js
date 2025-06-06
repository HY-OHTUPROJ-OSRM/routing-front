import React, { useState } from "react";
import "./comp_styles.scss";

const Header = ({ onClickA, onClickP, onClickGuide, handleToolsClick, handleShowProfileModal, selectedProfile, handleShowDisconnectionModal }) => {
  const [selectedTool, setSelectedTool] = useState("None");
  const formattedProfile = selectedProfile.display.replace(/\s*,\s*/, " / ");

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
      handleShowDisconnectionModal();
    }
    else {
    }
  };

  return (
    <div className="header">
      <h2>Routing app</h2>
      <div className="profile-display">{formattedProfile}</div>
      <div className="header-icons">

        <label className="header-select-wrapper">
          <span className="tools-label">Tools ▾</span>
          <select className="header-select" value={selectedTool} onChange={handleChange}>
            <option disabled value="None">Tools ▾</option>

            <option value="select-profile">Select profile</option>
            <option value="info">Disconneted roads</option>
            <option value="temproad">Temporary roads</option>

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
