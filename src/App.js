import React, { useState } from "react";
import MyMap from './components/my-map';
import { handleViewSidebar } from "./services/sidebarService";
import SideBar from "./components/SideBar";
import Header from "./components/Header";
import CreatePolygon from "./components/CreatePolygon";
import './App.css';

function App() {
  const [sidebarOpen, setSideBarOpen] = useState(false);

  const toggleSidebar = () => {
    handleViewSidebar(sidebarOpen, setSideBarOpen);
  };
  return (
    <div>
    <div className="App">
      
      <span>
        <Header onClick={toggleSidebar} />
        <SideBar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />
      </span>
    </div>
    <div className="MapAndForm">

      <div className="first"> <MyMap /> </div>
      <div className="second"> <CreatePolygon /> </div>
        
      </div>
    </div>
  );
}

export default App;
