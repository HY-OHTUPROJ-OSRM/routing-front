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

        <main className="main">
          <Map_displayer
            editMode={editMode}
            setEditMode={setEditMode}
            setSidebar={handleListClick}
            isOpen={isOpen && contentType === 'list'}
          />
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

