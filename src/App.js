import React, { useEffect, useState} from "react";

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
import RouteList from "./components/RouteInfo";
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
    setSidebarOpenP(!sidebarOpenP);
  };

  const toggleSidebara = () => {
    if (sidebarOpenP) {
      setSidebarOpenP(false);
    }
    setSidebarOpenA(!sidebarOpenA);
  };

  
  return (
    <div>
      <AppProviders>
      <div className="App" style={{overflow: "clip", overflowClipMargin: "10px"}}>
      
        <div style={{zIndex: "10", marginBottom: "40px"}}>
          <TimedAlert />
          <Header onClickP={toggleSidebarp} onClickA={toggleSidebara} className="App-header"  />
          
          <SideBar isOpen={sidebarOpenP} toggleSidebar={setSidebarOpenP} editMode={editMode} setEditMode={setEditMode}/>
          <CopeSideBar isOpen={sidebarOpenA} toggleSidebar={setSidebarOpenA} />
        </div>
        
      </div>
      <div className="box" style={{zIndex: "0"}}>
        <Map_displayer editMode={editMode} setEditMode={setEditMode} setSidebar={toggleSidebarp} isOpen={sidebarOpenP}/>
        
      </div>
      <div >
      <Routing_form/>
      <RouteList/>
      </div>
      </AppProviders>
    </div>
    
  );
}

export default App;
