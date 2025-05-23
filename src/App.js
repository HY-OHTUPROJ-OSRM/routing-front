import React, { useState } from 'react';
import './App.css';
import Header from './components/Header';

function App() {
  const [sidebarState, setSidebarState] = useState({
    isOpen: true,
    contentType: 'add'
  });

  const handleAddClick = () => setSidebarState(prev => ({
    isOpen: prev.contentType !== 'add' ? true : !prev.isOpen,
    contentType: 'add'
  }));

  const handleListClick = () => setSidebarState(prev => ({
    isOpen: prev.contentType !== 'list' ? true : !prev.isOpen,
    contentType: 'list'
  }));

  return (
    <div className="app-layout">
      <Header onClickA={handleAddClick} onClickP={handleListClick} />
      <main className="main" />
      <aside className={`sidebar ${sidebarState.isOpen ? 'open' : ''}`}>
        {sidebarState.contentType === 'add' ? 'Add Content' : 'List Content'}
      </aside>
    </div>
  );
}

export default App;
