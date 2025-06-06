import React, { useState, useEffect, useRef, useCallback } from 'react';
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
  const disconnectedRoadRef = useRef(null);
  const [visibleTempRoads, setVisibleTempRoads] = useState(new Set());

  // New state for node selection functionality
  const [nodeSelectionMode, setNodeSelectionMode] = useState({
    active: false,
    selecting: null // 'start' or 'end'
  });
  const [nodeSelectionHandler, setNodeSelectionHandler] = useState(null);

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

  const [showProfileModal, setShowProfileModal] = useState(false);
  const handleProfileSelect = (profileObj) => {
    setSelectedProfile(profileObj); 
    setShowProfileModal(false);
    console.log("Selected profile:", profileObj);
  }
  const closeSidebar = () => {
    setSidebarType(null);

  };

  // Callback to handle changes in visible temp roads
  const handleVisibleRoadsChange = useCallback((visibleRoads) => {
    setVisibleTempRoads(visibleRoads);
  }, []);

  // Callback to handle node selection mode changes from TempRoads
  const handleNodeSelectionModeChange = useCallback((mode) => {
    setNodeSelectionMode(mode);
  }, []);

  // Callback to store the node selection handler from TempRoads
  const handleNodeSelectionHandlerRegistration = useCallback((handler) => {
    setNodeSelectionHandler(() => handler);
  }, []);

  // Function to handle node selection from map clicks
  const handleNodeSelectionFromMap = useCallback((nodeId, coordinates) => {
    if (nodeSelectionHandler) {
      nodeSelectionHandler(nodeId, coordinates);
    }
  }, [nodeSelectionHandler]);

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

        {/* Node Selection Mode Indicator */}
        {nodeSelectionMode.active && (
          <div style={{
            position: 'fixed',
            top: '80px', // Adjust based on your header height
            left: '50%',
            transform: 'translateX(-50%)',
            backgroundColor: '#fff3cd',
            border: '1px solid #ffeaa7',
            borderRadius: '8px',
            padding: '12px 20px',
            zIndex: 2000,
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            fontSize: '14px',
            color: '#856404',
            fontWeight: '500'
          }}>
            <span>📍</span>
            <span>
              Click on the map to select {nodeSelectionMode.selecting} node for temporary road
            </span>
            <button
              onClick={() => setNodeSelectionMode({ active: false, selecting: null })}
              style={{
                background: 'none',
                border: 'none',
                color: '#856404',
                cursor: 'pointer',
                fontSize: '16px',
                padding: '0 4px'
              }}
              title="Cancel selection"
            >
              ×
            </button>
          </div>
        )}

        <main className="main">
          <Map_displayer
            editMode={editMode}
            setEditMode={setEditMode}
            setSidebar={openListSidebar}
            isOpen={sidebarType === 'list'}
            visibleTempRoads={visibleTempRoads}
            disconnectedRoadRef={disconnectedRoadRef}
            nodeSelectionMode={nodeSelectionMode}
            onNodeSelection={handleNodeSelectionFromMap}
            nodeSelectionHandler={nodeSelectionHandler}
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
                toBeDisplayed={() => (
                  <TempRoads 
                    onVisibleRoadsChange={handleVisibleRoadsChange}
                    onNodeSelectionModeChange={handleNodeSelectionModeChange}
                    onNodeSelectionHandler={handleNodeSelectionHandlerRegistration}
                  />
                )}
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
        disconnectedRoadRef={disconnectedRoadRef}
      />
      </ProfileContext.Provider>
    </AppProviders>
  );
}
