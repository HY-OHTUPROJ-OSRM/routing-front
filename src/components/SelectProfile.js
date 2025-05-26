import React from "react";
import "./comp_styles.scss";

const profiles = ["Standard", "Säiliö", "Ambulance", "Fire Truck", "Police Car", "Custom"];

const SelectProfile = ({ isOpen, onClose, onSelect }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="custom-modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>×</button>
        <h3>Select profile</h3>
        <div className="profile-options">
          {profiles.map(profile => (
            <button
              key={profile}
              className="profile-button"
              onClick={() => {
                onSelect(profile);
                onClose();
              }}
            >
              {profile}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SelectProfile;
