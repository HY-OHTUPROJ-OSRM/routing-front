// src/App.js
import React, { useState } from 'react';
import './App.css';
import Header from './components/Header';
import SideBar from './components/SideBar';          // list‐puoli
import CopeSideBar from './components/CopeSideBar';  // add‐puoli
import { AppProviders } from './components/CoordinatesContext'; // vanhan frontin context

export default function App() {
  const [sidebarState, setSidebarState] = useState({
    isOpen: false,
    contentType: 'add'   // 'add' näyttää CopeSideBar, 'list' näyttää SideBar
  });
  const [editMode, setEditMode] = useState(false);

  const handleAddClick = () => {
    setSidebarState(prev => ({
      isOpen: prev.contentType !== 'add' ? true : !prev.isOpen,
      contentType: 'add'
    }));
  };

  const handleListClick = () => {
    setSidebarState(prev => ({
      isOpen: prev.contentType !== 'list' ? true : !prev.isOpen,
      contentType: 'list'
    }));
  };

  // kun halutaan sisäisestä napista sulkea
  const toggleSidebar = () => {
    setSidebarState(s => ({ ...s, isOpen: false }));
  };

  const { isOpen, contentType } = sidebarState;

  return (
    <AppProviders>
      <div className="app-layout">
        <Header onClickA={handleAddClick} onClickP={handleListClick} />

        <main className="main">
          {/* Kartta ym. siirretään tänne myöhemmin */}
        </main>

        <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
          {contentType === 'list' ? (
            <SideBar
              isOpen={isOpen}
              toggleSidebar={toggleSidebar}
              editMode={editMode}
              setEditMode={setEditMode}
            />
          ) : (
            <CopeSideBar
              isOpen={isOpen}
              toggleSidebar={toggleSidebar}
            />
          )}
        </aside>
      </div>
    </AppProviders>
  );
}
