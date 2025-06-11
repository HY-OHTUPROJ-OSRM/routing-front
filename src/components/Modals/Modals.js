import React, { useContext } from 'react';
import { AppContext } from '../AppContext';
import DisconnectionsModal from './DisconnectionsModal';
import SelectProfile from './SelectProfile';

const Modals = () => {
  const { state, dispatch } = useContext(AppContext);

  const handleClose = () => {
    dispatch({ type: 'SET_MODAL_TYPE', payload: null });
  };

  return (
    <div className={`modal-overlay ${state.modalType ? 'active' : ''}`}>
        <button className="close-button" onClick={handleClose}>X</button>
        {state.modalType === 'disconnection' && <DisconnectionsModal onClose={handleClose} />}
        {state.modalType === 'profile' && <SelectProfile onClose={handleClose} />}
    </div>
  );
}

export default SideBar;
