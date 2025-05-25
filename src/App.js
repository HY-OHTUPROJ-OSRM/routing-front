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
import RouteList from "./components/RouteInfo";
import TimedAlert from "./components/TimedAlert";

export default function App() {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(fetchPolygons());
  }, [dispatch]);

  const [sidebarState, setSidebarState] = useState({
    isOpen: false,
    contentType: 'add'
  });
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
    <AppProviders>
      <div className="app-layout">
        <Header onClickA={handleAddClick} onClickP={handleListClick} />
        <TimedAlert />

        <main className="main">
          <Map_displayer
            editMode={editMode}
            setEditMode={setEditMode}
            setSidebar={openListSidebar}
            isOpen={isOpen && contentType === 'list'}
          />
          <Routing_form/>
          <RouteList/>
        </main>

        <aside className={`inner ${isOpen ? 'open' : ''}`}>     
          {contentType === 'list'
            ? <SideBar
                isOpen={isOpen}
                editMode={editMode}
                setEditMode={setEditMode}
                // kutsu toggleSidebar sisäisistä komponenteista
                toggleSidebar={() => setSidebarState(s => ({ ...s, isOpen: false }))}
              />
            : <CopeSideBar
                isOpen={isOpen}
                toggleSidebar={() => setSidebarState(s => ({ ...s, isOpen: false }))}
              />
          }
        </aside>
      </div>
    </AppProviders>
  );
}

