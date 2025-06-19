import React, { useState, useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getNodeSelectionMode, setNodeSelectionMode } from '../AppContext';
import {
    addTempRoad,
    deleteTempRoadAsync,
    toggleTempRoadAsync,
    selectRoad,
} from '../../reducers/TempRoadsSlice';
import { fetchTempRoads } from '../../features/temproads/tempRoadsLoader';
import { setNodeSelectionHandler } from '../../reducers/NodeSelectionSlice';
import { setVisibleRoads } from '../../reducers/TempRoadsSlice';
import { changeMapView } from '../../reducers/ViewSlice';
import './Polygon.css';

const TempRoads = () => {
    const dispatch = useDispatch();

    const tempRoads = useSelector((state) => state.tempRoads.list);
    const visibleRoads = useSelector((state) => state.tempRoads.visibleRoads);
    const status = useSelector((state) => state.tempRoads.status);
    const selectedRoadId = useSelector((state) => state.tempRoads.selectedRoadId);

    const nodeSelectionMode = getNodeSelectionMode();
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState('all');

    const applyFilters = (tempRoads, searchTerm, filterType) => {
        return tempRoads.filter((item) => {
            const matchesSearch =
                searchTerm === '' ||
                item.tags.some((tag) => tag.toLowerCase().includes(searchTerm)) ||
                item.name.toLowerCase().includes(searchTerm) ||
                item.description.toLowerCase().includes(searchTerm);
            const matchesFilter =
                filterType === 'all' ||
                (filterType === 'temporary' && item.type === 'temporary') ||
                (filterType === 'iceroad' && item.type === 'iceroad') ||
                (filterType === 'speedlimit' && item.type === 'speedlimit');
            return matchesSearch && matchesFilter;
        });
    };

    const filteredTempRoads = useSelector((state) =>
        applyFilters(state.tempRoads.list, searchTerm, filterType)
    );

    const [showCoordinatesForRoad, setShowCoordinatesForRoad] = useState(null);
    const [nodeCoordinates, setNodeCoordinates] = useState({});

    const [showAddForm, setShowAddForm] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        type: 'iceroad',
        speed: '',
        length: '',
        start_node: '',
        end_node: '',
        description: '',
    });

    useEffect(() => {
        if (status === 'idle') {
            dispatch(fetchTempRoads());
        }
    }, [status, dispatch]);

    const onVisibleRoadsChange = useCallback((visibleRoads) => {
        dispatch(setVisibleRoads(visibleRoads));
    });
    useEffect(() => {
        onVisibleRoadsChange(visibleRoads);
    }, [visibleRoads, onVisibleRoadsChange]);

    const onNodeSelectionModeChange = useCallback((mode) => {
        setNodeSelectionMode(mode);
    });
    useEffect(() => {
        onNodeSelectionModeChange(nodeSelectionMode);
    }, [nodeSelectionMode, onNodeSelectionModeChange]);

    const handleNodeSelection = (nodeId, coordinates) => {
        console.log('Node selection - nodeId:', nodeId, 'mode:', nodeSelectionMode.selecting);

        if (nodeSelectionMode.selecting === 'start') {
            setFormData((prev) => ({ ...prev, start_node: nodeId.toString() }));
        } else if (nodeSelectionMode.selecting === 'end') {
            setFormData((prev) => ({ ...prev, end_node: nodeId.toString() }));
        }

        const mode = { active: false, selecting: null };
        setNodeSelectionMode(mode);
    };

    const onNodeSelectionHandler = useCallback((handler) => {
        dispatch(setNodeSelectionHandler(handler));
    });
    useEffect(() => {
        onNodeSelectionHandler(handleNodeSelection);
    }, [nodeSelectionMode, onNodeSelectionHandler]);

    // Get node coordinates from API
    const fetchNodeCoordinates = async (nodeId) => {
        try {
            // Return cached coordinates if available
            if (nodeCoordinates[nodeId]) {
                return nodeCoordinates[nodeId];
            }

            const response = await fetch(`http://localhost:3000/nodes/${nodeId}`);

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const contentType = response.headers.get('content-type');
            if (!contentType || !contentType.includes('application/json')) {
                throw new Error(`Expected JSON but got ${contentType}`);
            }

            const nodeData = await response.json();

            const coordinates = {
                lat: nodeData.lat,
                lng: nodeData.lng,
            };

            // Cache coordinates
            setNodeCoordinates((prev) => ({
                ...prev,
                [nodeId]: coordinates,
            }));

            return coordinates;
        } catch (error) {
            console.error('Error fetching node coordinates:', error);

            // Cache error to avoid repeated attempts
            setNodeCoordinates((prev) => ({
                ...prev,
                [nodeId]: { error: error.message },
            }));

            return null;
        }
    };

    // Calculate center and zoom level based on start and end coordinates
    const calculateCenter = (startCoords, endCoords) => {
        const centerLat = (startCoords.lat + endCoords.lat) / 2;
        const centerLng = (startCoords.lng + endCoords.lng) / 2;
        return [centerLat, centerLng];
    };

    const calculateZoomLevel = (startCoords, endCoords) => {
        const latDiff = Math.abs(startCoords.lat - endCoords.lat);
        const lngDiff = Math.abs(startCoords.lng - endCoords.lng);
        const maxDiff = Math.max(latDiff, lngDiff);

        if (maxDiff > 1) return 8;
        if (maxDiff > 0.5) return 10;
        if (maxDiff > 0.1) return 12;
        if (maxDiff > 0.01) return 14;
        return 16;
    };

    const flyToRoad = async (road) => {
        try {
            const startCoords = await fetchNodeCoordinates(road.start_node);
            const endCoords = await fetchNodeCoordinates(road.end_node);

            if (startCoords && endCoords && !startCoords.error && !endCoords.error) {
                const center = calculateCenter(startCoords, endCoords);
                const zoom = calculateZoomLevel(startCoords, endCoords);

                dispatch(
                    changeMapView({
                        center: center,
                        zoom: zoom,
                    })
                );
            } else {
                console.error('Could not get coordinates for road nodes');
                alert('Unable to locate road on map. Please check if the nodes are valid.');
            }
        } catch (error) {
            console.error('Error flying to road:', error);
            alert('Error locating road on map.');
        }
    };

    const showCoordinates = async (road) => {
        if (showCoordinatesForRoad === road.id) {
            setShowCoordinatesForRoad(null);
            return;
        }

        setShowCoordinatesForRoad(road.id);

        if (road.start_node && !nodeCoordinates[road.start_node]) {
            await fetchNodeCoordinates(road.start_node);
        }
        if (road.end_node && !nodeCoordinates[road.end_node]) {
            await fetchNodeCoordinates(road.end_node);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value,
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        const dataToSubmit = {
            ...formData,
            status: true,
            tags: [],
            length: parseFloat(formData.length) || 0,
            speed: parseFloat(formData.speed) || 0,
            start_node: parseInt(formData.start_node) || null,
            end_node: parseInt(formData.end_node) || null,
        };

        dispatch(addTempRoad(dataToSubmit));
        setShowAddForm(false);
        resetForm();
    };

    const resetForm = () => {
        setFormData({
            name: '',
            type: 'iceroad',
            speed: '',
            length: '',
            start_node: '',
            end_node: '',
            description: '',
        });
        const mode = { active: false, selecting: null };
        setNodeSelectionMode(mode);
    };

    const handleDelete = (roadId) => {
        if (window.confirm('Are you sure you want to delete this road segment?')) {
            dispatch(deleteTempRoadAsync(roadId));
            const newVisibleRoads = visibleRoads.delete(roadId);
            dispatch(setVisibleRoads(newVisibleRoads));
        }
    };

    const handleToggle = (roadId, currentStatus) => {
        const action = currentStatus ? 'deactivate' : 'activate';
        if (window.confirm(`Are you sure you want to ${action} this road segment?`)) {
            dispatch(toggleTempRoadAsync(roadId));
        }
    };

    const handleSelectRoad = (id) => {
        dispatch(selectRoad(id));
    };

    const showOnMap = (road) => {
        const newVisibleRoads = visibleRoads;
        const roadId = road.id;
        if (newVisibleRoads.has(roadId)) {
            newVisibleRoads.delete(roadId);
        } else {
            newVisibleRoads.add(roadId);
        }
        dispatch(setVisibleRoads(newVisibleRoads));

        dispatch(selectRoad(road.id));
    };

    const getTypeDisplay = (type) => {
        switch (type) {
            case 'iceroad':
                return 'Ice Road';
            case 'speed_limit':
                return 'Speed Limit';
            case 'temporary':
                return 'Temporary';
            default:
                return type;
        }
    };

    const startNodeSelection = (nodeType) => {
        const mode = { active: true, selecting: nodeType };
        setNodeSelectionMode(mode);
    };

    const cancelNodeSelection = () => {
        const mode = { active: false, selecting: null };
        setNodeSelectionMode(mode);
    };

    if (status === 'loading') {
        return <div style={{ padding: '20px', textAlign: 'center' }}>Loading...</div>;
    }

    return (
        <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            {/* Header with title and add button */}
            <div
                style={{
                    padding: '15px 20px',
                    borderBottom: '1px solid #e5e5e5',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    backgroundColor: '#f8f9fa',
                }}
            >
                <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '600', color: '#333' }}>
                    Temporary Roads
                </h3>
                <button
                    onClick={() => setShowAddForm(!showAddForm)}
                    style={{
                        background: '#4285f4',
                        color: 'white',
                        border: 'none',
                        padding: '8px 16px',
                        borderRadius: '4px',
                        fontSize: '14px',
                        cursor: 'pointer',
                        fontWeight: '500',
                    }}
                >
                    {showAddForm ? '×' : 'add new'}
                </button>
            </div>

            {/* Node Selection Mode Indicator */}
            {nodeSelectionMode.active && (
                <div
                    style={{
                        padding: '10px 20px',
                        backgroundColor: '#fff3cd',
                        borderBottom: '1px solid #ffeaa7',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                    }}
                >
                    <span style={{ fontSize: '14px', color: '#856404' }}>
                        📍 Click on the map to select {nodeSelectionMode.selecting} node
                    </span>
                    <button
                        onClick={cancelNodeSelection}
                        style={{
                            background: '#6c757d',
                            color: 'white',
                            border: 'none',
                            padding: '4px 8px',
                            borderRadius: '4px',
                            fontSize: '12px',
                            cursor: 'pointer',
                        }}
                    >
                        Cancel
                    </button>
                </div>
            )}

            {/* Add Form */}
            {showAddForm && (
                <div
                    style={{
                        padding: '20px',
                        borderBottom: '1px solid #e5e5e5',
                        backgroundColor: '#f8f9fa',
                    }}
                >
                    <form
                        onSubmit={handleSubmit}
                        style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}
                    >
                        <div>
                            <label
                                style={{
                                    fontSize: '14px',
                                    fontWeight: '500',
                                    marginBottom: '5px',
                                    display: 'block',
                                    color: '#555',
                                }}
                            >
                                Name:
                            </label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                required
                                style={{
                                    width: '100%',
                                    padding: '8px 12px',
                                    border: '1px solid #ddd',
                                    borderRadius: '4px',
                                    fontSize: '14px',
                                }}
                            />
                        </div>

                        <div>
                            <label
                                style={{
                                    fontSize: '14px',
                                    fontWeight: '500',
                                    marginBottom: '5px',
                                    display: 'block',
                                    color: '#555',
                                }}
                            >
                                Type:
                            </label>
                            <select
                                name="type"
                                value={formData.type}
                                onChange={handleChange}
                                style={{
                                    width: '100%',
                                    padding: '8px 12px',
                                    border: '1px solid #ddd',
                                    borderRadius: '4px',
                                    fontSize: '14px',
                                }}
                            >
                                <option value="iceroad">Ice Road</option>
                                <option value="speed_limit">Speed Limit</option>
                                <option value="temporary">Temporary</option>
                            </select>
                        </div>

                        <div style={{ display: 'flex', gap: '15px' }}>
                            <div style={{ flex: 1 }}>
                                <label
                                    style={{
                                        fontSize: '14px',
                                        fontWeight: '500',
                                        marginBottom: '5px',
                                        display: 'block',
                                        color: '#555',
                                    }}
                                >
                                    Speed (Km/h):
                                </label>
                                <input
                                    type="number"
                                    name="speed"
                                    value={formData.speed}
                                    onChange={handleChange}
                                    style={{
                                        width: '100%',
                                        padding: '8px 12px',
                                        border: '1px solid #ddd',
                                        borderRadius: '4px',
                                        fontSize: '14px',
                                    }}
                                />
                            </div>

                            <div style={{ flex: 1 }}>
                                <label
                                    style={{
                                        fontSize: '14px',
                                        fontWeight: '500',
                                        marginBottom: '5px',
                                        display: 'block',
                                        color: '#555',
                                    }}
                                >
                                    Length (km):
                                </label>
                                <input
                                    type="number"
                                    name="length"
                                    value={formData.length}
                                    onChange={handleChange}
                                    step="0.1"
                                    style={{
                                        width: '100%',
                                        padding: '8px 12px',
                                        border: '1px solid #ddd',
                                        borderRadius: '4px',
                                        fontSize: '14px',
                                    }}
                                />
                            </div>
                        </div>

                        {/* Enhanced Start Node Section */}
                        <div style={{ flex: 1 }}>
                            <label
                                style={{
                                    fontSize: '14px',
                                    fontWeight: '500',
                                    marginBottom: '5px',
                                    display: 'block',
                                    color: '#555',
                                }}
                            >
                                Start Node:
                            </label>
                            <div style={{ display: 'flex', gap: '8px' }}>
                                <input
                                    type="text"
                                    name="start_node"
                                    value={formData.start_node}
                                    onChange={handleChange}
                                    placeholder="Enter node ID or click map"
                                    style={{
                                        flex: 1,
                                        padding: '8px 12px',
                                        border: '1px solid #ddd',
                                        borderRadius: '4px',
                                        fontSize: '14px',
                                    }}
                                />
                                <button
                                    type="button"
                                    onClick={() => startNodeSelection('start')}
                                    disabled={nodeSelectionMode.active}
                                    style={{
                                        background:
                                            nodeSelectionMode.selecting === 'start'
                                                ? '#28a745'
                                                : '#17a2b8',
                                        color: 'white',
                                        border: 'none',
                                        padding: '8px 12px',
                                        borderRadius: '4px',
                                        fontSize: '12px',
                                        cursor: nodeSelectionMode.active
                                            ? 'not-allowed'
                                            : 'pointer',
                                        whiteSpace: 'nowrap',
                                        opacity:
                                            nodeSelectionMode.active &&
                                            nodeSelectionMode.selecting !== 'start'
                                                ? 0.5
                                                : 1,
                                    }}
                                >
                                    {nodeSelectionMode.selecting === 'start'
                                        ? 'Selecting...'
                                        : 'Select on Map'}
                                </button>
                            </div>
                        </div>

                        {/* Enhanced End Node Section */}
                        <div style={{ flex: 1 }}>
                            <label
                                style={{
                                    fontSize: '14px',
                                    fontWeight: '500',
                                    marginBottom: '5px',
                                    display: 'block',
                                    color: '#555',
                                }}
                            >
                                End Node:
                            </label>
                            <div style={{ display: 'flex', gap: '8px' }}>
                                <input
                                    type="text"
                                    name="end_node"
                                    value={formData.end_node}
                                    onChange={handleChange}
                                    placeholder="Enter node ID or click map"
                                    style={{
                                        flex: 1,
                                        padding: '8px 12px',
                                        border: '1px solid #ddd',
                                        borderRadius: '4px',
                                        fontSize: '14px',
                                    }}
                                />
                                <button
                                    type="button"
                                    onClick={() => startNodeSelection('end')}
                                    disabled={nodeSelectionMode.active}
                                    style={{
                                        background:
                                            nodeSelectionMode.selecting === 'end'
                                                ? '#28a745'
                                                : '#17a2b8',
                                        color: 'white',
                                        border: 'none',
                                        padding: '8px 12px',
                                        borderRadius: '4px',
                                        fontSize: '12px',
                                        cursor: nodeSelectionMode.active
                                            ? 'not-allowed'
                                            : 'pointer',
                                        whiteSpace: 'nowrap',
                                        opacity:
                                            nodeSelectionMode.active &&
                                            nodeSelectionMode.selecting !== 'end'
                                                ? 0.5
                                                : 1,
                                    }}
                                >
                                    {nodeSelectionMode.selecting === 'end'
                                        ? 'Selecting...'
                                        : 'Select on Map'}
                                </button>
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                            <button
                                type="submit"
                                disabled={nodeSelectionMode.active}
                                style={{
                                    background: nodeSelectionMode.active ? '#6c757d' : '#28a745',
                                    color: 'white',
                                    border: 'none',
                                    padding: '10px 20px',
                                    borderRadius: '4px',
                                    fontSize: '14px',
                                    cursor: nodeSelectionMode.active ? 'not-allowed' : 'pointer',
                                    fontWeight: '500',
                                    opacity: nodeSelectionMode.active ? 0.5 : 1,
                                }}
                            >
                                Add
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    setShowAddForm(false);
                                    resetForm();
                                }}
                                style={{
                                    background: '#6c757d',
                                    color: 'white',
                                    border: 'none',
                                    padding: '10px 20px',
                                    borderRadius: '4px',
                                    fontSize: '14px',
                                    cursor: 'pointer',
                                    fontWeight: '500',
                                }}
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Roads List */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '0' }}>
                {tempRoads.length === 0 ? (
                    <div
                        style={{
                            padding: '40px 20px',
                            textAlign: 'center',
                            color: '#999',
                            fontStyle: 'italic',
                            fontSize: '14px',
                        }}
                    >
                        No temporary roads yet
                    </div>
                ) : (
                    <>
                        <div>
                            <input
                                type="text"
                                placeholder="Filter by name or tag..."
                                className="search-temproads"
                                onChange={(e) => {
                                    setSearchTerm(e.target.value.toLowerCase());
                                }}
                            />
                            <select
                                className="filter-temproads"
                                value={filterType}
                                onChange={(e) => {
                                    setFilterType(e.target.value);
                                }}
                            >
                                <option value="all">Show All Types</option>
                                <option value="iceroad">Show Ice Roads</option>
                                <option value="speedlimit">Show Speed Limits</option>
                                <option value="temporary">Show Temporary Roads</option>
                            </select>
                        </div>
                        <div>
                            {filteredTempRoads.map((road) => (
                                <div
                                    key={road.id}
                                    style={{
                                        padding: '15px 20px',
                                        borderBottom: '1px solid #e5e5e5',
                                        backgroundColor:
                                            selectedRoadId === road.id ? '#e3f2fd' : 'white',
                                        borderLeft:
                                            selectedRoadId === road.id
                                                ? '4px solid #4285f4'
                                                : 'none',
                                        cursor: 'pointer',
                                        opacity: road.status === false ? 0.6 : 1,
                                    }}
                                    onClick={() => handleSelectRoad(road.id)}
                                >
                                    {/* Road Header */}
                                    <div
                                        style={{
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'flex-start',
                                            marginBottom: '8px',
                                        }}
                                    >
                                        <div
                                            style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '8px',
                                            }}
                                        >
                                            <h4
                                                style={{
                                                    margin: 0,
                                                    fontSize: '16px',
                                                    fontWeight: '600',
                                                    color: '#333',
                                                }}
                                            >
                                                {road.name}
                                            </h4>
                                            <span
                                                style={{
                                                    fontSize: '12px',
                                                    padding: '2px 6px',
                                                    borderRadius: '12px',
                                                    backgroundColor: road.status
                                                        ? '#d4edda'
                                                        : '#f8d7da',
                                                    color: road.status ? '#155724' : '#721c24',
                                                    fontWeight: '500',
                                                }}
                                            >
                                                {road.status ? 'Active' : 'Inactive'}
                                            </span>
                                        </div>
                                        <div style={{ display: 'flex', gap: '5px' }}>
                                            {visibleRoads.has(road.id) && (
                                                <span
                                                    style={{
                                                        color: '#28a745',
                                                        fontSize: '16px',
                                                        title: 'Visible on map',
                                                    }}
                                                ></span>
                                            )}
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleToggle(road.id, road.status);
                                                }}
                                                style={{
                                                    background: 'none',
                                                    border: 'none',
                                                    cursor: 'pointer',
                                                    padding: '4px',
                                                    color: road.status ? '#ffc107' : '#28a745',
                                                    fontSize: '16px',
                                                }}
                                                title={road.status ? 'Deactivate' : 'Activate'}
                                            >
                                                {road.status ? '⏸️' : '▶️'}
                                            </button>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleDelete(road.id);
                                                }}
                                                style={{
                                                    background: 'none',
                                                    border: 'none',
                                                    cursor: 'pointer',
                                                    padding: '4px',
                                                    color: '#dc3545',
                                                    fontSize: '16px',
                                                }}
                                                title="Delete"
                                            >
                                                🗑️
                                            </button>
                                        </div>
                                    </div>

                                    {/* Road Type */}
                                    <div
                                        style={{
                                            fontSize: '13px',
                                            color: '#6c757d',
                                            marginBottom: '8px',
                                        }}
                                    >
                                        {getTypeDisplay(road.type)}
                                    </div>

                                    {/* Speed Info */}
                                    {road.speed > 0 && (
                                        <div
                                            style={{
                                                fontSize: '13px',
                                                color: '#333',
                                                marginBottom: '8px',
                                                fontWeight: '500',
                                            }}
                                        >
                                            Speed limit: {road.speed} (Km/h)
                                        </div>
                                    )}

                                    {/* Length Info */}
                                    {road.length > 0 && (
                                        <div
                                            style={{
                                                fontSize: '13px',
                                                color: '#333',
                                                marginBottom: '8px',
                                            }}
                                        >
                                            Length: {road.length} km
                                        </div>
                                    )}

                                    {/* Action Buttons */}
                                    <div
                                        style={{
                                            display: 'flex',
                                            gap: '8px',
                                            marginTop: '12px',
                                            flexWrap: 'wrap',
                                        }}
                                    >
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                showCoordinates(road);
                                            }}
                                            style={{
                                                background:
                                                    showCoordinatesForRoad === road.id
                                                        ? '#dc3545'
                                                        : '#17a2b8',
                                                color: 'white',
                                                border: 'none',
                                                padding: '8px 12px',
                                                borderRadius: '4px',
                                                fontSize: '12px',
                                                cursor: 'pointer',
                                                flex: 1,
                                                fontWeight: '500',
                                            }}
                                        >
                                            {showCoordinatesForRoad === road.id
                                                ? 'Hide Coordinates'
                                                : 'Show Coordinates'}
                                        </button>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                flyToRoad(road);
                                            }}
                                            style={{
                                                background: '#28a745',
                                                color: 'white',
                                                border: 'none',
                                                padding: '8px 12px',
                                                borderRadius: '4px',
                                                fontSize: '12px',
                                                cursor: 'pointer',
                                                flex: 1,
                                                fontWeight: '500',
                                            }}
                                            title="Show this road on the map"
                                        >
                                            Show on map
                                        </button>
                                    </div>

                                    {showCoordinatesForRoad === road.id && (
                                        <div
                                            style={{
                                                marginTop: '12px',
                                                padding: '12px',
                                                backgroundColor: '#f8f9fa',
                                                borderRadius: '4px',
                                                border: '1px solid #dee2e6',
                                            }}
                                        >
                                            <div
                                                style={{
                                                    fontSize: '14px',
                                                    fontWeight: '600',
                                                    color: '#333',
                                                    marginBottom: '8px',
                                                }}
                                            ></div>
                                            <div
                                                style={{
                                                    display: 'flex',
                                                    flexDirection: 'column',
                                                    gap: '6px',
                                                }}
                                            >
                                                <div style={{ fontSize: '13px', color: '#555' }}>
                                                    <strong>Start Node ({road.start_node}):</strong>
                                                    {nodeCoordinates[road.start_node] ? (
                                                        nodeCoordinates[road.start_node].error ? (
                                                            <span
                                                                style={{
                                                                    marginLeft: '8px',
                                                                    color: '#dc3545',
                                                                    fontStyle: 'italic',
                                                                }}
                                                            >
                                                                Error:{' '}
                                                                {
                                                                    nodeCoordinates[road.start_node]
                                                                        .error
                                                                }
                                                            </span>
                                                        ) : (
                                                            <span
                                                                style={{
                                                                    marginLeft: '8px',
                                                                    color: '#333',
                                                                }}
                                                            >
                                                                Lat:{' '}
                                                                {nodeCoordinates[
                                                                    road.start_node
                                                                ].lat.toFixed(6)}
                                                                , Lng:{' '}
                                                                {nodeCoordinates[
                                                                    road.start_node
                                                                ].lng.toFixed(6)}
                                                            </span>
                                                        )
                                                    ) : (
                                                        <span
                                                            style={{
                                                                marginLeft: '8px',
                                                                color: '#999',
                                                                fontStyle: 'italic',
                                                            }}
                                                        >
                                                            Loading...
                                                        </span>
                                                    )}
                                                </div>
                                                <div style={{ fontSize: '13px', color: '#555' }}>
                                                    <strong>End Node ({road.end_node}):</strong>
                                                    {nodeCoordinates[road.end_node] ? (
                                                        nodeCoordinates[road.end_node].error ? (
                                                            <span
                                                                style={{
                                                                    marginLeft: '8px',
                                                                    color: '#dc3545',
                                                                    fontStyle: 'italic',
                                                                }}
                                                            >
                                                                Error:{' '}
                                                                {
                                                                    nodeCoordinates[road.end_node]
                                                                        .error
                                                                }
                                                            </span>
                                                        ) : (
                                                            <span
                                                                style={{
                                                                    marginLeft: '8px',
                                                                    color: '#333',
                                                                }}
                                                            >
                                                                Lat:{' '}
                                                                {nodeCoordinates[
                                                                    road.end_node
                                                                ].lat.toFixed(6)}
                                                                , Lng:{' '}
                                                                {nodeCoordinates[
                                                                    road.end_node
                                                                ].lng.toFixed(6)}
                                                            </span>
                                                        )
                                                    ) : (
                                                        <span
                                                            style={{
                                                                marginLeft: '8px',
                                                                color: '#999',
                                                                fontStyle: 'italic',
                                                            }}
                                                        >
                                                            Loading...
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default TempRoads;
