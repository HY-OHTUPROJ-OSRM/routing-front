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

  const openListSidebar = () => {
    if (sidebarType === 'list') return; // jo auki → ei tehdä mitään
    setSidebarType('list');
  };

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
        </aside>
      </div>
    </AppProviders>
  );
}
