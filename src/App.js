import React, { useState } from "react";

import { handleViewSidebar } from "./services/sidebarService";
import SideBar from "./components/SideBar";
import Header from "./components/Header";
import './App.css';
import CopeSideBar from "./components/CopeSideBar";
import Map_displayer from "./components/Map_Displayer";
import { AppProviders } from "./components/CoordinatesContext";
import Routing_form from "./components/RouteField";
import 'leaflet-draw/dist/leaflet.draw.css';
function App() {
  const [sidebarOpenP, setSidebarOpenP] = useState(false);
  const [sidebarOpenA, setSidebarOpenA] = useState(false);
  const toggleSidebarp = () => {
    if (sidebarOpenA) {
      setSidebarOpenA(false);
    }
    handleViewSidebar(sidebarOpenP, setSidebarOpenP);
  };

  const toggleSidebara = () => {
    if (sidebarOpenP) {
      setSidebarOpenP(false);
    }
    handleViewSidebar(sidebarOpenA, setSidebarOpenA);
  };

  return (
    <div>
      <AppProviders>
      <div className="App">
        <span>
          <Header onClickP={toggleSidebarp} onClickA={toggleSidebara} className="App-header" />
          
          <SideBar isOpen={sidebarOpenP} toggleSidebar={setSidebarOpenP} />
          <CopeSideBar isOpen={sidebarOpenA} toggleSidebar={setSidebarOpenA} />
        </span>
      </div>
      <div className="box">
        <Map_displayer/>
        
      </div>
      <Routing_form/>
      </AppProviders>
    </div>
  );
}

export default App;
