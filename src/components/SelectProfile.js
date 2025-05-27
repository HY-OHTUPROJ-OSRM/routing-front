import React, { useState } from "react";
import "./comp_styles.scss";

const weightOptions = ["Light", "Medium", "Heavy"];
const heightOptions = ["Low", "Standard", "Tall"];

const SelectProfile = ({ isOpen, onClose, onSelect }) => {
  const [selectedWeight, setSelectedWeight] = useState("");
  const [selectedHeight, setSelectedHeight] = useState("");

  if (!isOpen) return null;

  const handleConfirm = () => {
    if (!selectedWeight || !selectedHeight) return;
    const profile = `${selectedWeight} / ${selectedHeight}`;
    onSelect(profile);
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="custom-modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>×</button>
        <h3>Select profile</h3>

        <div className="profile-options">
          <label>
            Weight class:
            <select value={selectedWeight} onChange={(e) => setSelectedWeight(e.target.value)}>
              <option value="">Select weight</option>
              {weightOptions.map(opt => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          </label>

          <label>
            Height class:
            <select value={selectedHeight} onChange={(e) => setSelectedHeight(e.target.value)}>
              <option value="">Select height</option>
              {heightOptions.map(opt => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          </label>

          <button
            className="profile-button"
            onClick={handleConfirm}
            disabled={!selectedWeight || !selectedHeight}
          >
            Confirm selection
          </button>
        </div>
      </div>
    </div>
  );
};

export default SelectProfile;
