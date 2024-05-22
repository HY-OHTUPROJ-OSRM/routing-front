import React from "react";
import HeadLine from "./HeadLine";
import "./comp_styles.scss";
const Header = props => {
  return (
    <header>
      <HeadLine />
      <img src="/menu.png" alt="Menu" onClick={props.onClick} className="menu-icon" />
    </header>
  );
};
export default Header;