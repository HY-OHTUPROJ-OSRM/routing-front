// src/App.js
import React, { useState, useEffect } from 'react';
import './App.css';
import { useDispatch } from 'react-redux';
import Header from './components/Header';
import SideBar from './components/SideBar';
import CopeSideBar from './components/CopeSideBar';
import { fetchPolygons } from './features/polygons/polygonsSlice';
import { AppProviders } from './components/CoordinatesContext';

export default function App() {
  const dispatch = useDispatch();

  // Ladataan listapuolen polygonit heti, ilman että “add”-puolta pitää käyttää ensin
  useEffect(() => {
    dispatch(fetchPolygons());
  }, [dispatch]);

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

  const toggleSidebar = () => {
    setSidebarState(s => ({ ...s, isOpen: false }));
  };

  const { isOpen, contentType } = sidebarState;

  return (
    <AppProviders>
      <div className="app-layout">
        <Header onClickA={handleAddClick} onClickP={handleListClick} />

        <main className="main">
          {/* Kartta siirretään tänne myöhemmin */}
        </main>

        <aside className={isOpen ? 'open' : ''}>
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
