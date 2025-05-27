import React from "react";
import "./comp_styles.scss";

const InfoModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="custom-modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>×</button>
        <h3>Disconneted roads</h3>
        <p>This modal shoes disconneted roads.</p>
            <img
            src="/goal.jpg"
            alt="test"
            />
      </div>
    </div>
  );
};

export default InfoModal;
