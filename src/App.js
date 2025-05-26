// src/App.js
import React, { useState, useEffect } from 'react';
import './App.css';
import { useDispatch } from 'react-redux';
import Header from './components/Header';
import SideBar from './components/SideBar';
import CopeSideBar from './components/CopeSideBar';
import Map_displayer from './components/Map_Displayer';
import { fetchPolygons } from './features/polygons/polygonsSlice';
import { AppProviders } from './components/CoordinatesContext';
import Routing_form from "./components/RouteField";
import TimedAlert from "./components/TimedAlert";
import RouteList from "./components/RouteInfo";

function App() {
  const dispatch = useDispatch()
  const [sidebarOpenP, setSidebarOpenP] = useState(false);
  const [sidebarOpenA, setSidebarOpenA] = useState(false);
  const [editMode, setEditMode] = useState(false);

  const handleAddClick = () => {
    setSidebarState(prev => ({
      isOpen: prev.contentType !== 'add' ? true : !prev.isOpen,
      contentType: 'add'
    }));
  };

  // kartalta klikkauksen kautta avaa list‐sidebar ilman scrollin resettiä
  const openListSidebar = () => {
    setSidebarState(prev => {
     // jos ollaan jo list‐tilassa auki, älä päivitä tilaa → scroll säilyy
    if (prev.contentType === 'list' && prev.isOpen) return prev;
    return { isOpen: true, contentType: 'list' };
   });};

  const handleListClick = () => {
    setSidebarState(prev => ({
      isOpen: prev.contentType !== 'list' ? true : !prev.isOpen,
      contentType: 'list'
    }));
  };

  const { isOpen, contentType } = sidebarState;

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
  );
}

