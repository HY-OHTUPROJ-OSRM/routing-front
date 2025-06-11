import React, { useContext } from 'react';
import { AppContext } from '../AppContext';
import ListSideBar from './ListSideBar';
import AddSideBar from './AddSideBar';
import GuideSideBar from './GuideSideBar';
import TempRoadSideBar from './TempRoadSideBar';
import './Sidebar.scss';

const SideBar = () => {
  const { state, dispatch } = useContext(AppContext);

  const handleClose = () => {
    dispatch({ type: 'SET_SIDEBAR_TYPE', payload: null });
  };

  return (
    <div className={`sidebar ${state.sidebarType} : 'open' ? ''`}>
        <button className="close-button" onClick={handleClose}>X</button>
        {state.sidebarType === 'list' && <ListSideBar />}
        {state.sidebarType === 'add' && <AddSideBar />}
        {state.sidebarType === 'guide' && <GuideSideBar />}
        {state.sidebarType === 'temproad' && <TempRoadSideBar />}
    </div>
  );
}

export default SideBar;
