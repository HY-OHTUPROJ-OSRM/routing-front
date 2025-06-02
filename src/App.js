import React, { useState, useEffect } from 'react';
import './App.css';
import { useDispatch } from 'react-redux';
import Header from './components/Header';
import SideBar from './components/SideBar';
import CopeSideBar from './components/CopeSideBar';
import IceRoadSidebar from './components/ToolsSidebar';
import SelectProfile from './components/SelectProfile';
import TempRoadSidebar from './components/ToolsSidebar';
import TempRoads from './components/TempRoad';
import Map_displayer from './components/Map_Displayer';
import { fetchPolygons } from './features/polygons/polygonsSlice';
import { AppProviders, ProfileContext } from './components/CoordinatesContext';
import Routing_form from "./components/RouteField";
import TimedAlert from "./components/TimedAlert";
import InfoModal from './components/InfoModal';

export default function App() {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(fetchPolygons());
  }, [dispatch]);

  const [sidebarType, setSidebarType] = useState(null); // 'list' | 'add' | 'TempRoad' | null
  const [editMode, setEditMode] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState({ display: "No profile", apiKey: null });
  const [showInfoModal, setShowInfoModal] = useState(false);

  const handleSidebarClick = (type) => {
    setSidebarType(prev => (prev === type ? null : type));
  };

  const handleAddClick = () => handleSidebarClick('add');
  const handleListClick = () => handleSidebarClick('list');
  const handleToolsClick = () => handleSidebarClick('TempRoad');
  const [visibleTempRoads, setVisibleTempRoads] = useState(new Set());

  const openListSidebar = () => {
    if (sidebarType === 'list') return; // jo auki → ei tehdä mitään
    setSidebarType('list');
  };

  const [showProfileModal, setShowProfileModal] = useState(false);
  const handleProfileSelect = (profileObj) => {
    setSelectedProfile(profileObj); 
    setShowProfileModal(false);
    console.log("Selected profile:", profileObj);
  }
  const closeSidebar = () => {
    setSidebarType(null);

  };

  return (
    <AppProviders>
      <ProfileContext.Provider value={{ selectedProfile, setSelectedProfile }}>
      <div className="app-layout">
        <Header
            onClickA={handleAddClick}
            onClickP={handleListClick}
            handleToolsClick={handleToolsClick}
            handleShowProfileModal={() => setShowProfileModal(true)}
            selectedProfile={selectedProfile}
            handleShowInfoModal={() => setShowInfoModal(true)}
          />
        <TimedAlert />

        <main className="main">
          <Map_displayer
            editMode={editMode}
            setEditMode={setEditMode}
            setSidebar={openListSidebar}
            isOpen={sidebarType === 'list'}
            visibleTempRoads={visibleTempRoads}
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
                toBeDisplayed={() => <TempRoads onVisibleRoadsChange={setVisibleTempRoads} />}
              />
            )}
          </aside>
      </div>
      <SelectProfile
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
        onSelect={handleProfileSelect}
      />
      <InfoModal
        isOpen={showInfoModal}
        onClose={() => setShowInfoModal(false)}
      />
      </ProfileContext.Provider>
    </AppProviders>
  );
}
