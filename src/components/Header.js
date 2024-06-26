import React from "react";
import HeadLine from "./HeadLine";
import "./comp_styles.scss";

// Header component. Headline given its own component if three.js is added to the project for cool 3d modelling on headline
//Responsible for the menu icons and their functionalities
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
