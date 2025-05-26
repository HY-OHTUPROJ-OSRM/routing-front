import React, { useState, useEffect } from 'react';
import './App.css';
import { useDispatch } from 'react-redux';
import Header from './components/Header';
import SideBar from './components/SideBar';
import CopeSideBar from './components/CopeSideBar';
import IceRoadSidebar from './components/ToolsSidebar';
import SelectProfile from './components/SelectProfile';
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

  const [sidebarType, setSidebarType] = useState(null); // 'list' | 'add' | 'temproad' | null
  const [editMode, setEditMode] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState("No profile");


  const handleSidebarClick = (type) => {
    setSidebarType(prev => (prev === type ? null : type));
  };

  const handleAddClick = () => handleSidebarClick('add');
  const handleListClick = () => handleSidebarClick('list');
  const handleToolsClick = () => handleSidebarClick('iceRoad');

  const openListSidebar = () => {
    if (sidebarType === 'list') return; // jo auki → ei tehdä mitään
    setSidebarType('list');
  };

  const [showProfileModal, setShowProfileModal] = useState(false);
  const handleProfileSelect = (profile) => {
    setSelectedProfile(profile);
    setShowProfileModal(false);
    console.log("Selected profile:", profile);
  };

  return (
    <AppProviders>
      <div className="app-layout">
        <Header
            onClickA={handleAddClick}
            onClickP={handleListClick}
            handleToolsClick={handleToolsClick}
            handleShowProfileModal={() => setShowProfileModal(true)}
            selectedProfile={selectedProfile}
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

            {sidebarType === 'iceRoad' && (
              <IceRoadSidebar
                isOpen={true}
                toBeDisplayed={() => <div>Ice road content placeholder</div>}
              />
            )}
          </aside>
      </div>
      <SelectProfile
      isOpen={showProfileModal}
      onClose={() => setShowProfileModal(false)}
      onSelect={handleProfileSelect}
    />
    </AppProviders>
  );
}
