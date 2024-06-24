import React from "react";
import HeadLine from "./HeadLine";
import "./comp_styles.scss";
import TimedAlert from "./TimedAlert";
const Header = props => {
  return (
    <header style={{position: "fixed", marginBottom: "100px"}}>
      <HeadLine />
      
      <div className="image-container" >
      
        <img id="openadd"src={`${process.env.PUBLIC_URL}/add.png`} alt="Add" onClick={props.onClickA} className="menu-iconone" />
        <img id="openlist" src={`${process.env.PUBLIC_URL}/menu.png`} alt="List" onClick={props.onClickP} className="menu-icontwo" />
      </div>
    </header>
  );
};

export default Header;
