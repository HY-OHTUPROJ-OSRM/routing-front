import React, { useState } from 'react';
import './CreatePolygon.css';
import { addPolygon } from '../services/PolygonAddService';

function CreatePolygon() {
  const [formData, setFormData] = useState({
    name: '',
    type: 'roadblock',
    coordinates: [{ lat: '', long: '' }]
  });

  const handleChange = (index, e) => {
    const { name, value } = e.target;
    const newCoordinates = [...formData.coordinates];
    newCoordinates[index][name] = value;
    setFormData({ ...formData, coordinates: newCoordinates });
  };

  const handleAddField = () => {
    setFormData({
      ...formData,
      coordinates: [...formData.coordinates, { lat: '', long: '' }]
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    addPolygon(formData); // Service to write form data to data.json
    // Optionally, you can reset the form after submission
    setFormData({
      name: '',
      type: 'roadblock',
      coordinates: [{ lat: '', long: '' }]
    });
  };

  return (
    <div className="create-polygon">
      <h2>Create Polygon</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="name">Name:</label>
          <input type="text" id="name" name="name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
        </div>
        <div className="form-group">
          <label htmlFor="type">Type:</label>
          <select id="type" name="type" value={formData.type} onChange={(e) => setFormData({ ...formData, type: e.target.value })}>
            <option value="roadblock">Roadblock</option>
            <option value="traffic">Traffic</option>
          </select>
        </div>
        <div className="form-group">
          <label>Coordinates:</label>
          {formData.coordinates.map((coordinate, index) => (
            <div key={index}>
              <input type="text" name="lat" value={coordinate.lat} onChange={(e) => handleChange(index, e)} placeholder="Latitude" />
              <input type="text" name="long" value={coordinate.long} onChange={(e) => handleChange(index, e)} placeholder="Longitude" />
            </div>
          ))}
          <button type="button" onClick={handleAddField}>Add Coordinate</button>
        </div>
        <button type="submit">Submit</button>
      </form>
    </div>
  );
}

export default CreatePolygon;