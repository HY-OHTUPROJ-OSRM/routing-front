import React, { useEffect, useState } from "react";

import { handleViewSidebar } from "./services/sidebarService";
import SideBar from "./components/SideBar";
import Header from "./components/Header";
import './App.css';
import CopeSideBar from "./components/CopeSideBar";
import Map_displayer from "./components/Map_Displayer";
import { AppProviders } from "./components/CoordinatesContext";
import Routing_form from "./components/RouteField";
import 'leaflet-draw/dist/leaflet.draw.css';
import 'leaflet/dist/leaflet.css';
import { useDispatch } from "react-redux";
import { fetchPolygons } from "./features/polygons/polygonsSlice";
import TimedAlert from "./components/TimedAlert";
import { Provider } from 'react-redux';
import { configureStore } from "@reduxjs/toolkit";
import tempButton from "./components/tempButton";
function App() {
  const dispatch = useDispatch()
  const [sidebarOpenP, setSidebarOpenP] = useState(false);
  const [sidebarOpenA, setSidebarOpenA] = useState(false);
  const [editMode, setEditMode] = useState(false);
  useEffect(() => {
    dispatch(fetchPolygons())
  }, [dispatch])

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
      
        <span style={{zIndex: "10"}}>
          <TimedAlert />
          <Header onClickP={toggleSidebarp} onClickA={toggleSidebara} className="App-header" />
          
          <SideBar isOpen={sidebarOpenP} toggleSidebar={setSidebarOpenP} ediMode={editMode} setEditMode={setEditMode}/>
          <CopeSideBar isOpen={sidebarOpenA} toggleSidebar={setSidebarOpenA} />
        </span>
        
      </div>
      <div className="box" style={{zIndex: "0"}}>
        <Map_displayer ediMode={editMode} setEditMode={setEditMode}/>
        
      </div>
      <Routing_form/>
      </AppProviders>
    </div>
    
  );
}

export default App;
