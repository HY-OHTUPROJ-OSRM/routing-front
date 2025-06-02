import { ins } from "../api/api";
import React, { useState, useEffect } from "react";   
import "./comp_styles.scss";

const weightOptions = ["Light", "Medium", "Heavy"];
const heightOptions = ["Low", "Standard", "Tall"];

const weightKey = { Light: "weightLow", Medium: "weightMedium", Heavy: "weightHigh" };
const heightKey = { Low: "heightLow", Standard: "heightMedium", Tall: "heightHigh" };


const SelectProfile = ({ isOpen, onClose, onSelect }) => {
  const [selectedWeight, setSelectedWeight] = useState("");
  const [selectedHeight, setSelectedHeight] = useState("");
  const [cutoffs, setCutoffs] = useState({ weight: {}, height: {} });

  useEffect(() => {
  if (!isOpen) return;
  (async () => {
    try {
      const { data } = await ins.get("/vehicle-config");
      setCutoffs({
        weight: Object.fromEntries(
          data.weight_classes.map(c => [c.name, c.cutoff])
        ),
        height: Object.fromEntries(
          data.height_classes.map(c => [c.name, c.cutoff])
        ),
      });
    } catch (err) {
      console.error("vehicle-config fetch failed", err);
    }
    })();
  }, [isOpen]);


  if (!isOpen) return null;

  const handleConfirm = () => {
    if (!selectedWeight || !selectedHeight) return;

    const display = `${selectedWeight}, ${selectedHeight}`;

    const apiKey = `${weightKey[selectedWeight]},${heightKey[selectedHeight]}`;

    onSelect({ display, apiKey });
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
            {selectedWeight && (
            <div className="cutoff-info">
              Weight cutoff: {cutoffs.weight[weightKey[selectedWeight]] ?? "–"}
            </div>
          )}
          </label>

          <label>
            Height class:
            <select value={selectedHeight} onChange={(e) => setSelectedHeight(e.target.value)}>
              <option value="">Select height</option>
              {heightOptions.map(opt => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
            {selectedHeight && (
            <div className="cutoff-info">
              Height cutoff: {cutoffs.height[heightKey[selectedHeight]] ?? "–"}
            </div>
          )}
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
