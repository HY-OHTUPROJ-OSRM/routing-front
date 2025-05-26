import React, { useState, useEffect } from 'react';
import './App.css';
import { useDispatch } from 'react-redux';
import Header from './components/Header';
import SideBar from './components/SideBar';
import CopeSideBar from './components/CopeSideBar';
import TempRoadSidebar from './components/ToolsSidebar';
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

  const [sidebarType, setSidebarType] = useState(null); // 'list' | 'add' | 'TempRoad' | null
  const [editMode, setEditMode] = useState(false);

  const handleSidebarClick = (type) => {
    setSidebarType(prev => (prev === type ? null : type));
  };

  const handleAddClick = () => handleSidebarClick('add');
  const handleListClick = () => handleSidebarClick('list');
  const handleToolsClick = () => handleSidebarClick('TempRoad');

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
        <Header
            onClickA={handleAddClick}
            onClickP={handleListClick}
            handleToolsClick={handleToolsClick}
          />
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
          <aside className={`inner ${sidebarType ? 'open' : ''}`}>
            {sidebarType === 'list' && (
              <SideBar
                isOpen={true}
                editMode={editMode}
                setEditMode={setEditMode}
                toggleSidebar={() => setSidebarType(null)}
              />
            )}

            {sidebarType === 'add' && (
              <CopeSideBar
                isOpen={true}
                toggleSidebar={() => setSidebarType(null)}
              />
            )}

            {sidebarType === 'TempRoad' && (
              <TempRoadSidebar
                isOpen={true}
                toBeDisplayed={() => <div>Temp road content placeholder</div>}
              />
            )}
          </aside>
      </div>
    </AppProviders>
  );
}
