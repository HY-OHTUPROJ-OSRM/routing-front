import React from "react";
import "./comp_styles.scss";

const Header = ({ onClickA, onClickP, onClickTempRoad }) => {
  return (
    <div className="header">
      <h2>Routing app</h2>
      <div className="header-icons">
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
        <div 
          className="temp-road-icon"
          onClick={onClickTempRoad}
          title="Temporary Roads"
        >
          🛣️
        </div>
      </div>
    </div>
  );
};

export default Header;
