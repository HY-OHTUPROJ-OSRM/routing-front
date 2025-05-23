import React, { useState } from 'react';
import './App.css';
import Header from './components/Header';

function App() {
  const [addSidebarOpen, setAddSidebarOpen] = useState(false);
  const [listSidebarOpen, setListSidebarOpen] = useState(false);

  const handleAddClick = () => {
    setListSidebarOpen(false);
    setAddSidebarOpen(!addSidebarOpen);
  };

  const handleListClick = () => {
    setAddSidebarOpen(false);
    setListSidebarOpen(!listSidebarOpen);
  };

  return (
    <div className="app-layout">
      <Header onClickA={handleAddClick} onClickP={handleListClick} />
      <main className="main">
      </main>
      <aside className="sidebar">
        {addSidebarOpen ? "Add Content" : listSidebarOpen ? "List Content" : null}
      </aside>
    </div>
  );
}

export default App;
