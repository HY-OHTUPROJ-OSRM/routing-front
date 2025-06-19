import React from 'react';
import { getModalType, setModalType } from '../AppContext';
import DisconnectionsModal from './DisconnectionsModal';
import SelectProfile from './SelectProfile';

const Modals = () => {
    const modalType = getModalType();
    const handleClose = () => {
        setModalType(null);
    };

    return (
        <div className={`modal-overlay ${modalType ? 'active' : ''}`}>
            <button className="close-button" onClick={handleClose}>
                X
            </button>
            {modalType === 'disconnection' && <DisconnectionsModal onClose={handleClose} />}
            {modalType === 'profile' && <SelectProfile onClose={handleClose} />}
        </div>
    );
};

export default Modals;
