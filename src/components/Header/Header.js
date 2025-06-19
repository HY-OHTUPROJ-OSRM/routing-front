import React, { useState } from 'react';
import { useSelector } from 'react-redux';

import { setModalType, setSidebarType } from '../AppContext';
import '../comp_styles.scss';

const Header = () => {
    const selectedProfile = useSelector((state) => state.profile.selectedProfile);

    const [selectedTool, setSelectedTool] = useState('None');
    const formattedProfile = selectedProfile.display.replace(/\s*,\s*/, ' / ');

    const handleChange = (e) => {
        const value = e.target.value;
        setSelectedTool('None');

        if (value === 'temproad') {
            setSidebarType('temproad');
        }
        if (value === 'select-profile') {
            setModalType('profile');
        }
        if (value === 'disconnected-roads') {
            setModalType('disconnection');
        }
    };

    return (
        <div className="header">
            <h2>Routing app</h2>
            <div className="profile-display">{formattedProfile}</div>
            <div className="header-icons">
                <label className="header-select-wrapper">
                    <span className="tools-label">Tools ▾</span>
                    <select className="header-select" value={selectedTool} onChange={handleChange}>
                        <option disabled value="None">
                            Tools ▾
                        </option>
                        <option value="select-profile">Select profile</option>
                        <option value="disconnected-roads">Disconneted roads</option>
                        <option value="temproad">Temporary roads</option>
                    </select>
                </label>

                <img
                    src="/add.png"
                    alt="Add"
                    onClick={() => setSidebarType('add')}
                    className="header-icon"
                />
                <img
                    src="/menu.png"
                    alt="List"
                    onClick={() => setSidebarType('list')}
                    className="header-icon"
                />
                <img
                    src="/guide.png"
                    alt="Guide"
                    onClick={() => setSidebarType('guide')}
                    className="header-icon"
                />
            </div>
        </div>
    );
};

export default Header;
