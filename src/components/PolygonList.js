import React, { useState } from "react";
import PolygonDisplay from "./PolygonDisplay";
import ModifiedPolygonDisplay from "./ModifiedPolygonDisplay";
import { useSelector, useDispatch } from 'react-redux';
import { DeletePolygon, BatchDeletePolygons } from "../services/PolygonService";
import { fetchPolygons } from "../features/polygons/polygonsSlice";
import { fetchRouteLine } from "../features/routes/routeSlice";

function PolygonList({ editMode, setEditMode, isOpen }) {
  const polygons = useSelector((state) => state.polygons);
  const modifiedPolygons = useSelector((state) => state.modifiedPolygons);
  const dispatch = useDispatch();
  
  const [batchMode, setBatchMode] = useState(false);
  const [selectedPolygons, setSelectedPolygons] = useState(new Set());
  const [isDeleting, setIsDeleting] = useState(false);

  const handleToggleBatchMode = () => {
    setBatchMode(!batchMode);
    setSelectedPolygons(new Set());
  };

  const handleSelectPolygon = (polygonId, isSelected) => {
    const newSelected = new Set(selectedPolygons);
    if (isSelected) {
      newSelected.add(polygonId);
    } else {
      newSelected.delete(polygonId);
    }
    setSelectedPolygons(newSelected);
  };

  const handleSelectAll = () => {
    const allIds = polygons.map(p => p.properties.id);
    if (selectedPolygons.size === allIds.length) {
      setSelectedPolygons(new Set());
    } else {
      setSelectedPolygons(new Set(allIds));
    }
  };

  const handleBatchDelete = async () => {
    if (selectedPolygons.size === 0) {
      alert("Please select at least one polygon to delete");
      return;
    }

    const selectedPolygonsList = polygons.filter(p => selectedPolygons.has(p.properties.id));
    const selectedNames = selectedPolygonsList.map(p => p.properties.name).join(", ");

    const confirmMessage = `Are you sure you want to delete ${selectedPolygons.size} polygon(s)?\n\nSelected items:\n${selectedNames}`;
    
    if (!window.confirm(confirmMessage)) {
      return;
    }

    setIsDeleting(true);
    
    try {
      // Convert Set to Array for the API call
      const polygonIds = Array.from(selectedPolygons);
      
      // Validate IDs
      const invalidIds = polygonIds.filter(id => 
        id === null || id === undefined || (typeof id === 'string' && id.trim() === '')
      );
      
      if (invalidIds.length > 0) {
        throw new Error(`Invalid IDs found: ${JSON.stringify(invalidIds)}`);
      }
      
      await BatchDeletePolygons(polygonIds);
      
      // Refresh the data
      await dispatch(fetchPolygons());
      await dispatch(fetchRouteLine());
      
      // Reset state
      setSelectedPolygons(new Set());
      setBatchMode(false);
      
    } catch (error) {
      // Check if partial success occurred
      if (error.message && error.message.includes('Partially successful')) {
        // Partial success - still refresh data
        await dispatch(fetchPolygons());
        await dispatch(fetchRouteLine());
        setSelectedPolygons(new Set());
      } else {
        // Complete failure
        let errorMessage = "Something went wrong while deleting polygons. Please try again.";
        
        if (error.message) {
          errorMessage = `Delete failed: ${error.message}`;
        } else if (error.response?.data?.message) {
          errorMessage = `Server error: ${error.response.data.message}`;
        }
        
        alert(errorMessage);
      }
    } finally {
      setIsDeleting(false);
    }
  };

  // Validate data structure
  if (!Array.isArray(polygons)) {
    return <div>Error: Invalid polygon data</div>;
  }

  return (
    <div>
      {/* Batch operation controls */}
      {!editMode && polygons.length > 0 && (
        <div className="batch-controls">
          <button 
            onClick={handleToggleBatchMode}
            className={`batch-toggle ${batchMode ? 'active' : ''}`}
          >
            {batchMode ? 'Exit Batch Mode' : 'Batch Select'}
          </button>
          
          {batchMode && (
            <div className="batch-actions">
              <button 
                onClick={handleSelectAll}
                className="select-all-btn"
              >
                {selectedPolygons.size === polygons.length ? 'Deselect All' : 'Select All'}
              </button>
              
              <span className="selection-count">
                Selected: {selectedPolygons.size}/{polygons.length}
              </span>
              
              <button 
                onClick={handleBatchDelete}
                disabled={selectedPolygons.size === 0 || isDeleting}
                className="batch-delete-btn"
              >
                {isDeleting ? 'Deleting...' : `Delete Selected (${selectedPolygons.size})`}
              </button>
            </div>
          )}
        </div>
      )}

      {/* Polygon list */}
      {editMode && modifiedPolygons.polygons && Object.keys(modifiedPolygons.polygons).length > 0 ? (
        Object.values(modifiedPolygons.polygons).reverse().map((polygon, index) => (
          <ModifiedPolygonDisplay key={polygon.properties.id} {...polygon} isOpen={isOpen}/>
        ))
      ) : (
        polygons.map((polygon, index) => (
          <PolygonDisplay 
            key={polygon.properties.id} 
            {...polygon} 
            isOpen={isOpen} 
            index={index}
            batchMode={batchMode}
            isSelected={selectedPolygons.has(polygon.properties.id)}
            onSelect={handleSelectPolygon}
          />
        ))
      )}
      
      {/* Empty state */}
      {!editMode && polygons.length === 0 && (
        <div style={{ padding: '20px', textAlign: 'center', color: '#666' }}>
          No polygons found
        </div>
      )}
    </div>
  );
}

export default PolygonList;
