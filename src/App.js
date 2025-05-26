import React, { useState, useEffect } from 'react';
import './App.css';
import { useDispatch } from 'react-redux';
import Header from './components/Header';
import SideBar from './components/SideBar';
import CopeSideBar from './components/CopeSideBar';
import TempRoadSidebar from './components/TempRoadSidebar';
import Map_displayer from './components/Map_Displayer';
import { fetchPolygons } from './features/polygons/polygonsSlice';
import { AppProviders } from './components/CoordinatesContext';
import Routing_form from "./components/RouteField";
import TimedAlert from "./components/TimedAlert";

export default function App() {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(fetchPolygons());
  }, [dispatch]);

  const [sidebarType, setSidebarType] = useState(null); // 'list' | 'add' | null
  const [editMode, setEditMode] = useState(false);

  const handleAddClick = () => {
    setSidebarType(prev => (prev === 'add' ? null : 'add'));
  };

  const handleListClick = () => {
    setSidebarType(prev => (prev === 'list' ? null : 'list'));
  };

  const handleTempRoadClick = () => {
    setSidebarType(prev => (prev === 'tempRoad' ? null : 'tempRoad'));
  };

  const openListSidebar = () => {
    if (sidebarType === 'list') return; // jo auki → ei tehdä mitään
    setSidebarType('list');
  };

  const closeSidebar = () => {
    setSidebarType(null);
  };

  return (
    <AppProviders>
      <div className="app-layout">
        <Header onClickA={handleAddClick} onClickP={handleListClick} onClickTempRoad={handleTempRoadClick} />
        <TimedAlert />

        <main className="main">
          <Map_displayer
            editMode={editMode}
            setEditMode={setEditMode}
            setSidebar={openListSidebar}
            isOpen={sidebarType === 'list'}
          />
          <Routing_form />
        </main>

        <aside className={`inner ${(sidebarType === 'list' || sidebarType === 'add') ? 'open' : ''}`}>
          {sidebarType === 'list' && (
            <SideBar
              isOpen={true}
              editMode={editMode}
              setEditMode={setEditMode}
              toggleSidebar={closeSidebar}
            />
          )}
          {sidebarType === 'add' && (
            <CopeSideBar
              isOpen={true}
              toggleSidebar={closeSidebar}
            />
          )}
        </aside>

        <TempRoadSidebar
          isOpen={sidebarType === 'tempRoad'}
          toggleSidebar={closeSidebar}
        />
      </div>
    </AppProviders>
  );
}
