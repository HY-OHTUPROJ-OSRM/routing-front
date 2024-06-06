import React, { useState } from "react";
import "./Polygon.css"; // Import the CSS file
import { useDispatch } from "react-redux";
import { modifyPolygon } from "../features/polygons/modifiedPolygonsSlice";

const ModifiedPolygonDisplay = (p) => {
  const dispatch = useDispatch();
  const [formData, setFormData] = useState({
    name: p.properties.name,
    type: p.properties.type,
    coordinates: p.geometry.coordinates[0].map(cord => ({
      lat: cord[1],
      long: cord[0],
    })),
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    const updatedFormData = { ...formData, [name]: value };
    setFormData(updatedFormData);

    // Create a new object for p with updated properties
    const updatedPolygon = {
      ...p,
      properties: {
        ...p.properties,
        [name]: value
      }
    };

    console.log("modified p", updatedPolygon);
    // Dispatch the updated p
    dispatch(modifyPolygon(updatedPolygon));
  };

  return (
    <div className="polygon">
      <h2>{formData.name}</h2>
      <form>
        <div className="form-group">
          <label htmlFor="name">Name:</label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
          />
        </div>
        <div className="form-group">
          <label htmlFor="type">Type:</label>
          <select
            id="type"
            name="type"
            value={formData.type}
            onChange={handleInputChange}
          >
            <option value="roadblock">Roadblock</option>
            <option value="traffic">Traffic</option>
          </select>
        </div>
        {formData.type === 'traffic' && (
          <div className="form-group">
            <label htmlFor="severity">Severity:</label>
            <input
              type="text"
              id="severity"
              name="severity"
              value={formData.traffic_multiplier}
              onChange={handleInputChange}
            />
          </div>
        )}
      </form>
    </div>
  );
};

export default ModifiedPolygonDisplay;