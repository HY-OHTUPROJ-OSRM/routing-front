import React from "react";
import HeadLine from "./HeadLine";
import "./comp_styles.scss";

const Header = props => {
  return (
    <header>
      <HeadLine />

      <div className="image-container">
        <img src="/add.png" alt="Add" onClick={props.onClickA} className="menu-iconone" />
        <img src="/menu.png" alt="List" onClick={props.onClickP} className="menu-icontwo" />
        
      </div>
    </header>
  );
};

export default Header;
