import React, { useState, useContext } from "react";
import { AppContext } from "../AppContext";
import "../comp_styles.scss";

const Header = () => {
  const { dispatch } = useContext(AppContext);

  const [selectedTool, setSelectedTool] = useState("None");
  const formattedProfile = selectedProfile.display.replace(/\s*,\s*/, " / ");

  const handleChange = (e) => {
    const value = e.target.value;
    setSelectedTool("None");

    if (value === "temproad") {
      dispatch({ type: 'SET_SIDEBAR_TYPE', payload: 'temproad' });
    }
    if (value === 'select-profile') {
      dispatch({ type: 'SET_MODAL_TYPE', payload: 'profile' });
    }
    if (value === 'disconnected-roads') {
      dispatch({ type: 'SET_MODAL_TYPE', payload: 'disconnection' });
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
            <option value="disconnected-roads">Disconneted roads</option>
            <option value="temproad">Temporary roads</option>
          </select>
        </label>

        <img 
          src="/add.png"
          alt="Add"
          onClick={() => dispatch({ type: 'SET_SIDEBAR_TYPE', payload: 'add' })}
          className="header-icon"
        />
        <img 
          src="/menu.png"
          alt="List"
          onClick={() => dispatch({ type: 'SET_SIDEBAR_TYPE', payload: 'list' })}
          className="header-icon"
        />
        <img
          src="/guide.png"
          alt="Guide"
          onClick={() => dispatch({ type: 'SET_SIDEBAR_TYPE', payload: 'guide' })}
          className="header-icon"
        />
      </div>
    </div>
  );
};

export default Header;
