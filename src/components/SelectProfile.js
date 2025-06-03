import React, { useState, useEffect } from "react";
import { ins } from "../api/api";
import "./comp_styles.scss";

/*
 * SelectProfile (Option A – dropdown includes "No profile")
 * --------------------------------------------------------------
 *   GET /vehicle_class_config → { classes: [ { id, name, weight_cutoff, height_cutoff } ] }
 */

const NO_PROFILE = { display: "No profile", apiKey: null };

const SelectProfile = ({ isOpen, onClose, onSelect }) => {
  const [vehicleClasses, setVehicleClasses] = useState([]);
  const [selectedVehicleId, setSelectedVehicleId] = useState("none"); // "none" = reset

  /* ------------------------------------------------------------
   *  Fetch vehicle classes whenever modal opens
   * ----------------------------------------------------------*/
  useEffect(() => {
    if (!isOpen) return;
    (async () => {
      try {
        const { data } = await ins.get("vehicle-config");
        setVehicleClasses(data.classes || []);
      } catch (err) {
        console.error("vehicle-config fetch failed", err);
      }
    })();
  }, [isOpen]);

  /* ------------------------------------------------------------
   *  Guard for closed modal
   * ----------------------------------------------------------*/
  if (!isOpen) return null;

  /* ------------------------------------------------------------
   *  Confirm handler
   * ----------------------------------------------------------*/
  const handleConfirm = () => {
    if (selectedVehicleId === "none") {
      onSelect(NO_PROFILE);
      onClose();
      return;
    }

    const cls = vehicleClasses.find((c) => String(c.id) === selectedVehicleId);
    if (!cls) return;
    onSelect({ display: cls.name, apiKey: cls.id });
    onClose();
  };

  /* ------------------------------------------------------------
   *  Helper: details for selected class (except "none")
   * ----------------------------------------------------------*/
  const clsDetails =
    selectedVehicleId !== "none"
      ? vehicleClasses.find((c) => String(c.id) === selectedVehicleId)
      : null;

  /* ------------------------------------------------------------
   *  Render
   * ----------------------------------------------------------*/
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="custom-modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>
          ×
        </button>
        <h3>Select profile</h3>

        <div className="profile-options">
          <label>
            Vehicle class:
            <select
              value={selectedVehicleId}
              onChange={(e) => setSelectedVehicleId(e.target.value)}
            >
              <option value="none">No profile</option>
              {vehicleClasses.map((cls) => (
                <option key={cls.id} value={cls.id}>
                  {cls.name}
                </option>
              ))}
            </select>
            {clsDetails && (
              <div className="cutoff-info">
                Weight cutoff&nbsp;{clsDetails.weight_cutoff}&nbsp;kg<br />
                Height cutoff&nbsp;{clsDetails.height_cutoff}&nbsp;m
              </div>
            )}
          </label>

          <button className="profile-button" onClick={handleConfirm}>
            Confirm selection
          </button>
        </div>
      </div>
    </div>
  );
};

export default SelectProfile;
