import { MapContainer, FeatureGroup, Polygon, Tooltip, Polyline, GeoJSON, useMapEvent, Marker } from 'react-leaflet';
import React, { useRef, useEffect, useState, useContext } from 'react';
import { EditControl } from 'react-leaflet-draw';
import { CoordinatesContext, RouteContext, ProfileContext } from './CoordinatesContext';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import icon from 'leaflet/dist/images/marker-icon.png';
import { fetchRouteLine, setStartPosition as setStartDispatchPosition, setEndPosition as setDestinationDispatchPosition } from '../features/routes/routeSlice';
import { useDispatch, useSelector } from 'react-redux';
import 'leaflet-editable';
import ReactLeafletEditable from 'react-leaflet-editable';
import { setModifiedPolygons, addPolygon, modifyPolygon, setFaults } from '../features/polygons/modifiedPolygonsSlice';
import { v4 as uuidv4 } from 'uuid';
import { ChangePolygons } from '../services/PolygonService';
import { fetchPolygons } from '../features/polygons/polygonsSlice';
import "./Polygon.css"
import { generateName } from '../services/nameGiverService';
import { showTimedAlert } from '../Utils/dispatchUtility';
import { intersectSelf } from '../services/Intersect_self';
import { getColorAndOpacity } from '../services/PolygonVisualService';
import {startti_icon, desti_icon, dis_icon} from './leafletHTMLIcon';
import { changeListView } from '../features/view/ViewSlice';
import VectorTileLayer from "react-leaflet-vector-tile-layer";
import roadStyle from '../roadStyle';
import { refreshTileLayer } from '../features/map/tileLayerSlice';
import TempRoadDisplay from './TempRoadDisplay';
import { getNodeList } from '../services/nodelist_service';

/* 
Massive component handling all map functionalities. 
*/

const Map_Displayer = ({editMode, setEditMode, setSidebar, isOpen, visibleTempRoads, disconnectedRoadRef, nodeSelectionMode, onNodeSelection}) => {
    const dispatch = useDispatch()
    const { selectedProfile } = useContext(ProfileContext)
    const profileRef = useRef(selectedProfile)
    useEffect(() => { profileRef.current = selectedProfile }, [selectedProfile])

    const initialState = {
        long: 24.955,
        lat: 60.205,
        zoom: 15
    };
    
    // Variable for tracking if user is hovering over the edit button. Used to prevent marker placement when edit button is clicked
    const [editHover, setEditHover] = useState(false)
    
    // Track if polygon drawing is in progress
    const [isDrawingPolygon, setIsDrawingPolygon] = useState(false);
    
    // Variable containing geometry of the generated route(s)
    const routedata = useSelector((state) => state.routeLine.routeLine);
    
    // Variable used to make sure polygons set to be deleted are not re created on when save is clicked
    const calcelEditIds = useSelector((state) => state.modifiedPolygons.cancelSendIds);
    
    // Variable used to make sure all changes are valid before saving, if not save cannot be clicked
    const cansave = useSelector((state) => state.modifiedPolygons.faultval)
    
    // Initial position of the map view
    const position = [initialState.lat, initialState.long];
    
    // Variable for tracking if user is in editing mode
    const [editing, setEditing] = useState(false)
    
    // Variable containing all polygons received from the backend
    const polygons = useSelector((state) => state.polygons)
    
    // Currently not used. Could be used if user want to see all segments on the map affected by polygons
    const segments = useSelector((state) => state.segments)
    
    // Same as polygon but used in editmode
    const modifiedPolygons = useSelector((state) => state.modifiedPolygons.polygons)
    
    // Variable for tracking all polygon to be sent to backend when save is clicked
    const sendIds = useSelector((state) => state.modifiedPolygons.sendIds)
    
    // Variable for tracking all polygon to be deleted when save is clicked
    const deleteIds = useSelector((state) => state.modifiedPolygons.deleteIds)
    
    // Variable used to track amount of markers placed on the map. Used to track whether placed marker should be start or end position and if both already exist no marker should be placed
    const [markerCount, setMarkerCount] = useState(0);
    
    // Variable for tracking if user is drawing lines or polygons
    const [Lines, setLines] = useState(0);
    
    // Reference to the leaflet edit functionalities
    const editRef = useRef();
    
    // Reference to the map component of leaflet
    const mapRef = useRef();
    
    // Reference to the polygons drawn on the map outside of editmode
    const zonesRef = useRef(null);
    
    // Reference to the polygons drawn on the map inside of editmode
    const editingZonesRef = useRef(null);
    
    // Context replaced by redux in most places, but may still be used in some spots
    const { setCoordinates } = useContext(CoordinatesContext);
    const { route, setRoute } = useContext(RouteContext);
    
    // Variable for changing map view when new view is requested from list component
    const mapView = useSelector((state) => state.view.mapView);
    
    // For refreshing the VectorTileLayer
    const tileLayer = useSelector((state) => state.tileLayer)
    
    // Reference to the selected polygon when user clicks on a polygon
    const [selectedPolygon, setSelectedPolygon] = useState(null);
    const [showEditButton, setShowEditButton] = useState(false);

    // Reference to the limits from redux store
    const { limits, visibleLimitIds } = useSelector(state => state.limits);
    
    let mountingHelper = 0
    let maphelp = null
    let originalLatLngs = 0;
    
    const [updateFlag, setUpdateFlag] = useState(false);
    const [popupPosition, setPopupPosition] = useState(null);
    const [popupCoordinates, setPopupCoordinates] = useState(null);
    const popupContainer = useRef(null);
    
    // Alternative start icon replaced with html marker
    const start_icon = new L.Icon({
        iconUrl: require('../img/amb.webp'),
        iconSize: [60, 60],
        iconAnchor: [30, 40],
        popupAnchor: [0, -30],
    });
    
    // Alternative destination icon replaced with html marker
    const destination_icon = new L.Icon({
        iconUrl: require('../img/goal.png'),
        iconSize: [40, 40],
        iconAnchor: [11, 38],
        popupAnchor: [0, -30],
    });
    
    const placehold_icon = new L.Icon({
        iconUrl: icon,
        iconSize: [25, 41],
        iconAnchor: [13, 40],
        popupAnchor: [0, -30],
    });

    // Node selection marker icon
    const nodeSelectionIcon = new L.Icon({
        iconUrl: icon,
        iconSize: [25, 41],
        iconAnchor: [13, 40],
        popupAnchor: [0, -30],
        className: 'node-selection-marker'
    });

    const createLimitIcon = (limit) => {
        const iconHtml = `
            <div style="
                background: ${limit.maxheight ? '#ff6b6b' : '#4ecdc4'};
                color: white;
                border-radius: 50%;
                width: 30px;
                height: 30px;
                display: flex;
                align-items: center;
                justify-content: center;
                font-weight: bold;
                font-size: 12px;
                border: 2px solid white;
                box-shadow: 0 2px 4px rgba(0,0,0,0.3);
            ">
                ${limit.maxheight ? 'H' : 'W'}
            </div>
        `;

        return L.divIcon({
            html: iconHtml,
            className: 'limit-marker',
            iconSize: [30, 30],
            iconAnchor: [15, 15],
            popupAnchor: [0, -15]
        });
    };

    const renderLimits = () => {
        const visibleLimits = limits.filter(limit => visibleLimitIds.includes(limit.id));
        
        return visibleLimits.map(limit => {
            if (!limit.coordinates || limit.coordinates.length === 0) {
                return null;
            }

            if (limit.coordinates.length === 1) {
                const [lng, lat] = limit.coordinates[0];
                return (
                    <Marker
                        key={`limit-marker-${limit.id}`}
                        position={[lat, lng]}
                        icon={createLimitIcon(limit)}
                        eventHandlers={{
                            click: () => {
                                console.log('Clicked limit:', limit);
                            }
                        }}
                    >
                        <Tooltip>
                            <div>
                                <strong>Road ID: {limit.id}</strong><br/>
                                {limit.maxheight && <span>Max Height: {limit.maxheight}<br/></span>}
                                {limit.maxweight && <span>Max Weight: {limit.maxweight}</span>}
                            </div>
                        </Tooltip>
                    </Marker>
                );
            }

            const positions = limit.coordinates.map(coord => [coord[1], coord[0]]);
            const limitColor = limit.maxheight ? '#ff6b6b' : '#4ecdc4';

            const isClosedPolygon = positions.length > 2 && 
                positions[0][0] === positions[positions.length - 1][0] && 
                positions[0][1] === positions[positions.length - 1][1];

            if (isClosedPolygon) {
                return (
                    <Polygon
                        key={`limit-polygon-${limit.id}`}
                        positions={positions}
                        pathOptions={{
                            color: limitColor,
                            fillColor: limitColor,
                            fillOpacity: 0.3,
                            weight: 3,
                            opacity: 0.8
                        }}
                        eventHandlers={{
                            click: () => {
                                console.log('Clicked limit polygon:', limit);
                            }
                        }}
                    >
                        <Tooltip>
                            <div>
                                <strong>Road ID: {limit.id}</strong><br/>
                                {limit.maxheight && <span>Max Height: {limit.maxheight}<br/></span>}
                                {limit.maxweight && <span>Max Weight: {limit.maxweight}</span>}
                            </div>
                        </Tooltip>
                    </Polygon>
                );
            } else {
                return (
                    <Polyline
                        key={`limit-line-${limit.id}`}
                        positions={positions}
                        pathOptions={{
                            color: limitColor,
                            weight: 4,
                            opacity: 0.8
                        }}
                        eventHandlers={{
                            click: () => {
                                console.log('Clicked limit line:', limit);
                            }
                        }}
                    >
                        <Tooltip>
                            <div>
                                <strong>Road ID: {limit.id}</strong><br/>
                                {limit.maxheight && <span>Max Height: {limit.maxheight}<br/></span>}
                                {limit.maxweight && <span>Max Weight: {limit.maxweight}</span>}
                            </div>
                        </Tooltip>
                    </Polyline>
                );
            }
        });
    };

    // A single coordinate class to handle all coordinates
    const Coordinates = class {
        constructor(dispatchCoordinatesSetter, routeUpdater, iconCoordinatesSetter) {
            this._lat = null;
            this._lng = null;

            this._setDispatchCoordinates = dispatchCoordinatesSetter;
            this._updateRoute = routeUpdater;
            this._setIconCoordinates = iconCoordinatesSetter;
        }

        setCoordinates({ lat, lng }) {
            this._lat = lat;
            this._lng = lng;

            this._setIconCoordinates(this);

            dispatch(this._setDispatchCoordinates(this));

            this._updateRoute();
        }

        // Make sure that we don't break stuff
        get lat() {
            return this._lat;
        }
        get lng() {
            return this._lng;
        }
        get long() {
            return this._lng;
        }
        set lat(value) {
            this.setCoordinates({ lat: value, lng: this.lng });
        }
        set lng(value) {
            this.setCoordinates({ lat: this.lat, lng: value });
        }
        set long(value) {
            this.setCoordinates({ lat: this.lat, lng: value });
        }
    }

    const Router = class {
        constructor() {
            this.startMarker = new Marker('Start position', startti_icon);
            this.destinationMarker = new Marker('Destination', desti_icon);
        }

        createStartMarker(coords) {
            const startCoords = new Coordinates(
                setStartDispatchPosition,
                this.updateRoute.bind(this),
                this.startMarker.setMarkerPosition.bind(this.startMarker)
            );
            this.startMarker.createMarker(startCoords);
            this.startMarker.position.setCoordinates(coords);

            return this.startMarker
        }

        createDestinationMarker(coords) {
            const destinationCoords = new Coordinates(
                setDestinationDispatchPosition,
                this.updateRoute.bind(this),
                this.destinationMarker.setMarkerPosition.bind(this.destinationMarker)
            );
            this.destinationMarker.createMarker(destinationCoords);
            this.destinationMarker.position.setCoordinates(coords);

            return this.destinationMarker
        }

        updateRoute() {
            const newRoute = [
                this.startMarker.position,
                this.destinationMarker.position
            ];
            setRoute(newRoute);

            if (newRoute[0] && newRoute[1]) {
                dispatch(fetchRouteLine(newRoute, profileRef.current))
            };
        }
    }

    const Marker = class {
        constructor(name, icon) {
            this.marker = null;
            this.position = null;

            this.name = name;
            this.icon = icon;

            this.setMarkerPosition = (coords) => {this.marker.setLatLng(coords)}
        }

        createMarker(coords) {
            // coords: Coordinates instance
            const map = mapRef.current;
            if (!map) return;

            this.marker = L.marker([0, 0], { icon: this.icon, draggable: true })
                .addTo(map)
                .bindPopup(this.name)
                .on('dragend', (e) => {
                    const newCoords = e.target.getLatLng();
                    this.setPosition(newCoords);
                });
            
            if (coords instanceof Coordinates) {
                this.position = coords;
            } else {
                throw new Error("Coordinates must be an instance of Coordinates class");
            }

            if (coords.lat != null && coords.lng != null) {
                this.setPosition(coords);
            }
        }

        setPosition({lat, lng}) {
            // coords: {lat, lng} or whatever
            const map = mapRef.current;
            if (!map) return;

            this.position.setCoordinates({ lat, lng });
        }
    }

    const [router, setRouter] = useState(new Router());
    const createStartMarker = ({lat, lng}) => { return router.createStartMarker({ lat: lat, lng: lng }) };
    const createDestinationMarker = ({lat, lng}) => { return router.createDestinationMarker({ lat: lat, lng: lng }) };

    const disconnecteRoadMarkerRef = useRef([]);
    disconnectedRoadRef.current = [(d) => {
        const map = mapRef.current;
        if (!map) return;

        disconnecteRoadMarkerRef.current.forEach((marker) => marker.remove());
        disconnecteRoadMarkerRef.current = [];

        const posA = [d.a_lat, d.a_lng];
        const posB = [d.b_lat, d.b_lng];
        const markerA = L.marker(posA, { icon: dis_icon, draggable: false })
            .addTo(map)
            .bindPopup("PosA");
        const markerB = L.marker(posB, { icon: dis_icon, draggable: false })
            .addTo(map)
            .bindPopup("PosB");
            
        const pp = L.polyline([posA, posB], {
            color: 'blue',
            weight: 8,
            opacity: 0.7,
            smoothFactor: 1
        }).addTo(map);

        disconnecteRoadMarkerRef.current.push(markerA, markerB, pp);

        mapRef.current.flyTo(posA, mapView.zoom, {
          duration: 1
        });
    },
    () => {
        disconnecteRoadMarkerRef.current.forEach((marker) => marker.remove());
        disconnecteRoadMarkerRef.current = [];
    },
    async () => {
        const map = mapRef.current;
        if (!map) return;
        const data = await getNodeList();

        const ways = data.ways;
        const nodes = {};

        for (let node of data.nodes) {
            nodes[node.id] = node;
        }

        const layerGroup = L.layerGroup().addTo(map);
        for (let way of ways) {
            const randomInt = Math.floor(Math.random() * 0xffffff);
            const hex = randomInt.toString(16).padStart(6, '0');
            const clo = `#${hex}`;

            const latlngs = [];
            for (let id of way.nodes) {
                let node = nodes[id];
                latlngs.push([node.lat / 1e7, node.lon / 1e7]);
            }

            const polyline = L.polyline(latlngs, {
                color: clo,
                weight: 5,
                opacity: 0.7,
            }).addTo(layerGroup);
        }
    }];

    // Listen for drawing start event
    const onDrawStart = (e) => {
        setIsDrawingPolygon(true);
    };

    // Listen for drawing stop/cancel event
    const onDrawStop = (e) => {
        setIsDrawingPolygon(false);
    };

    // Used when a new polygon/line is drawn.
    const onDrawCreated = async (e) => {
        const { layerType, layer } = e;
        
        // Reset drawing state when polygon is completed
        setIsDrawingPolygon(false);
        
        if (layerType === 'polygon' || layerType === 'Linestring') {
            const cords={geometry: {type: "Polygon", coordinates: [layer.getLatLngs()[0].map(latlng => ([latlng.lng, latlng.lat]))]}};
            cords.geometry.coordinates[0].push(cords.geometry.coordinates[0][0]);
            const latLngs = layer.getLatLngs()[0].map(latlng => ({ lat: latlng.lat, long: latlng.lng }));
            if (!intersectSelf(cords)) {
            setCoordinates(latLngs);
            }
            if (zonesRef.current) {
                zonesRef.current.removeLayer(layer);
            }
        }
    };

    // Used when user hovers over a polygon/line
    const handleMouseOver = (e) => {
        const layer = e.target;
        layer.setStyle({
            fillColor: 'black',
            fillOpacity: 0.7
        });
        if (editMode){
        onClickHandler(e.target.options);
        }
    };

    // Used when user stops hovering over a polygon/line
    const handleMouseOut = (e) => {
        const layer = e.target;
        layer.setStyle({
            fillColor: layer.options.originalColor,
            fillOpacity: 0.5
        });
    };

    // Used when changing to editmode
    const enableEditMode = () => {
        if (!isOpen) {
            dispatch(changeListView(null));
            setSidebar(true)
        }
        setEditing(true);
        setEditMode(true);
        dispatch(setModifiedPolygons(polygons));

        enableSelectedPolygonEdit();

        if (Lines) {
            editRef.current.startPolyline();
        } else {
            editRef.current.startPolygon();
        }
    };

    // Enable editing for only the selected polygon
    const enableSelectedPolygonEdit = () => {
        if (!editingZonesRef.current || !selectedPolygon) return;
        
        editingZonesRef.current.getLayers().forEach((layer) => {
            // edit only the selected polygon
            if (layer.options.id === selectedPolygon) {
                layer.disableEdit();
                layer.enableEdit();
                
                if (!layer.listens("editable:vertex:dragstart")) {
                    layer.on("editable:vertex:dragstart", (e) => {
                        originalLatLngs = layer.getLatLngs();
                    });
                }
                
                if (!layer.listens("editable:vertex:dragend")) {
                    layer.on("editable:vertex:dragend", (e) => {
                        const { name, type, id, IsLine, effectValue } = e.layer.options;
                        const geoJSON = e.layer.toGeoJSON();
                        geoJSON.properties = {
                            name, type, id, IsLine, effectValue
                        };
                        
                        if (!intersectSelf(geoJSON)) {
                            dispatch(modifyPolygon(geoJSON));
                        } else {
                            layer.setLatLngs(originalLatLngs);
                            layer.redraw();
                            setUpdateFlag((prev) => !prev);
                            showTimedAlert({ text: "Polygon can't intersect itself", variant: 'failure'});
                        }
                    });
                }
                
                setupClickListener(layer);
            }
        });
    };

    // Used when canceling editmode
    const cancelEdits = () => {
        // Remove all tracked faults as data resets on cancel
        dispatch(setFaults({id: 0, type: 2}));
        dispatch(changeListView(null));
        setEditing(false);
        setEditMode(false);
        setLines(0);
        setSelectedPolygon(null);
        setShowEditButton(false);

        if (isOpen) {
            setSidebar(false)
        }
        editRef.current.props.map.editTools.stopDrawing();
    }

    // Used when a new polygon is drawn in editmode
    const onDrawingCommit = (shape) => {
        const geoJSON = shape.layer.toGeoJSON()
        geoJSON.properties = {
            name: generateName(),
            IsLine: Lines,
            type: "roadblock",
            id: uuidv4()
        }
        shape.layer.remove()
        if (!intersectSelf(geoJSON)) {
            dispatch(addPolygon(geoJSON))
        } else {
            editRef.current.props.map.editTools.stopDrawing()
           if (Lines) {
            editRef.current.startPolyline()
           } else {
            editRef.current.startPolygon()
           }
        }
    }

    const onCancelDrawing = (e) => {
        e.layer.remove()
    }

    // Used when saving edits. sends all added/deleted polygons to the backend and updates the map with new polygons and new route
    const saveEdits = async () => {
        dispatch(changeListView(null));
        const added = Object.values(modifiedPolygons).filter(zone => 
            Object.keys(sendIds).includes(String(zone.properties.id)) &&
            !Object.keys(calcelEditIds).includes(String(zone.properties.id))
        );

        // Prepare deleted polygons as [{id, updated_at}]
        const deleted = Object.keys(deleteIds).map(id => {
            // Find the original polygon from polygons array
            const polygon = polygons.find(p => String(p.properties.id) === String(id));
            return {
                id,
                updated_at: polygon?.properties?.updated_at
            };
        }).filter(d => d.updated_at); // Only include if updated_at is present

        editRef.current.props.map.editTools.stopDrawing();
        await ChangePolygons(added, deleted);
        setEditMode(false);
        setEditing(false);
        setLines(0);
        setSidebar(false);
        setSelectedPolygon(null);  
        setShowEditButton(false);

        dispatch(refreshTileLayer());
        dispatch(fetchPolygons());
        dispatch(fetchRouteLine(undefined, profileRef.current));
        cancelEdits();
    };

    // Used to change the list view when a polygon is clicked on map
    const onClickHandler = (properties) => {
        if (!isOpen) {
            setSidebar(true);
        }
        dispatch(changeListView(properties.id));

        setSelectedPolygon(properties.id);
        setShowEditButton(true);
    };
    
    // Set up click listeners for layers
    const setupClickListener = (layer) => {
        if (!layer.listens("click")) {
            layer.on("click", (e) => {
                // Handle both GeoJSON and direct polygon data structures
                const properties = e.layer.feature?.properties || e.layer.options;
                onClickHandler(properties);
            });
        }
    };

    // Used to update polygon when user edits an already drawn polygon by dragging its vertices in editmode
    const enableLayerEdits = () => {
        if (editingZonesRef.current !== null) {
            editingZonesRef.current.getLayers().forEach((layer) => {
                layer.disableEdit();
                layer.enableEdit();
                if (!layer.listens("editable:vertex:dragstart")) {
                    layer.on("editable:vertex:dragstart", (e) => {
                        // Store the original coordinates before drag starts
                       originalLatLngs = layer.getLatLngs();
                    });
                }
                if (!layer.listens("editable:vertex:dragend")) {
                    layer.on("editable:vertex:dragend", (e) => {
                        const { name, type, id, IsLine, effectValue } = e.layer.options;
                        const geoJSON = e.layer.toGeoJSON();
                        geoJSON.properties = {
                            name, type, id, IsLine, effectValue
                        };
                        if(!intersectSelf(geoJSON)){
                            dispatch(modifyPolygon(geoJSON));
                        } else {
                            layer.setLatLngs(originalLatLngs);
                            layer.redraw()
                            setUpdateFlag((prev) => !prev);
                            showTimedAlert({ text: "Polygon can't intersect itself", variant: 'failure'});
                        }
                    });
                }
                setupClickListener(layer);
            });
        }
    
        if (editing && editRef.current != null) {
            if (!editRef.current.props.map?.editTools?.drawing()) {
                if (Lines) {
                    editRef.current.startPolyline();
                } else {
                    editRef.current.startPolygon();
                }
            }
        }
    };

    // Effect for selected polygon editing
    useEffect(() => {
        if (editing && selectedPolygon) {
            enableSelectedPolygonEdit();
        }
    }, [editing, selectedPolygon, Lines]);

    // Effect to control marker dragging based on drawing state
    useEffect(() => {
        if (router && router.startMarker && router.destinationMarker) {
            const startMarker = router.startMarker.marker;
            const destMarker = router.destinationMarker.marker;
            
            if (startMarker && destMarker) {
                if (isDrawingPolygon) {
                    // Disable marker dragging during polygon drawing
                    startMarker.dragging.disable();
                    destMarker.dragging.disable();
                } else {
                    // Enable marker dragging when not drawing
                    startMarker.dragging.enable();
                    destMarker.dragging.enable();
                }
            }
        }
    }, [isDrawingPolygon, router]);

    // Generates the color and opacity for the polygons based on their type and effect value. Used outside of editmode
    const geoJsonStyle = (feature) => {
        let {color, opacity} = getColorAndOpacity(feature.properties.type, feature.properties.effect_value);
        if(!Number(opacity)){
            opacity=0.5
        }
        return {
            color: color,
            fillOpacity: opacity
        };
    };

    // Adds hover listeners and click handlers to each polygon/line. Used outside of editmode
    const onEachFeature = (feature, layer) => {
        // Keep polygon hover functionality regardless of drawing state
        layer.on({
            mouseover: handleMouseOver,
            mouseout: handleMouseOut,
        });

        // Direct click handler for GeoJSON polygons
        layer.on('click', (e) => {
            onClickHandler(feature.properties);
        });

        if (feature.properties.type && feature.properties.name) {
            layer.bindTooltip(`${feature.properties.name} | ${feature.properties.type}`);
        }
    };

    // Toggle to use lines instead of polygons when drawing
    const ChangeLines = () => {
        setLines(1)
        editRef.current.props.map.editTools.stopDrawing()
        editRef.current.startPolyline()
    }

    // Toggle to use polygons instead of lines when drawing
    const ChangedrawPolygons = () => {
        setLines(0)
        editRef.current.props.map.editTools.stopDrawing()
        editRef.current.startPolygon()
    }

    // Used to change view to the center of the selected polygon/line
    function handleOnFlyTo() {
        const { leafletElement: map } = mapRef;
        if (mapView.center !== undefined){
            mapRef.current.flyTo(mapView.center, mapView.zoom, {
                duration: 1
            });
        }
    }
    
    useEffect(() => {
        handleOnFlyTo();
    }, [mapView]);
    
    // Used to place start and destination positions on the map when user clicks on the map
    const ClickHandler = () => {
        useMapEvent('click', async (event) => {
            let {lat, lng} = event.latlng;
            const map = mapRef.current;
            // Handle node selection for temporary roads
            if (nodeSelectionMode && nodeSelectionMode.active) {
                if (onNodeSelection) {
                    onNodeSelection(null, [lat, lng]);
                } else {
                    console.error('[Map_Displayer] onNodeSelection is not defined when nodeSelectionMode is active.');
                }
                return;
            }
            // Check if polygon was clicked
            const clickedPolygon = event.originalEvent.target.closest('.leaflet-interactive');
            if (clickedPolygon) {
                // Polygon was clicked, skip other logic
                return;
            }
            
            // Clicked on empty area, hide edit button
            if (!editing) {
                setShowEditButton(false);
                setSelectedPolygon(null);
            }
            
            // Prevent marker placement during polygon drawing or edit mode
            if (editMode || editHover || isDrawingPolygon) {
                return null;
            }
            
            // Marker placement logic
            if (markerCount === 0) {
                setMarkerCount(prevCount => prevCount + 1);
                const startMarker = createStartMarker({lat, lng});
            } else if (markerCount === 1) {
                setMarkerCount(prevCount => prevCount + 1);
                const destinationMarker = createDestinationMarker({lat, lng});
            } else if (markerCount === 2) {
                // Show popup to ask which marker to move
                const mapContainerRect = map.getContainer().getBoundingClientRect();
                const cursorPosition = {
                    x: event.originalEvent.clientX - mapContainerRect.left,
                    y: event.originalEvent.clientY - mapContainerRect.top,
                };
              
                if (!popupPosition) {
                    setPopupPosition(cursorPosition);
                    setPopupCoordinates({ lat, lng });
                } else {
                    if (!popupContainer.current) { return null }
                    const buttonPosition = popupContainer.current.getBoundingClientRect();

                    if (cursorPosition.x < buttonPosition.left - mapContainerRect.left || 
                        cursorPosition.x > buttonPosition.right - mapContainerRect.left || 
                        cursorPosition.y < buttonPosition.top - mapContainerRect.top || 
                        cursorPosition.y > buttonPosition.bottom - mapContainerRect.top) {

                        setPopupPosition(null);
                        setPopupCoordinates(null);
                    }
                }
            }
        });
        return null;
    };
      
    const handleClick = (event) => {
        // Empty function kept for compatibility
    };

    // Used to bring route polylines to the front, so that the polylines are not hidden by polygons
    useEffect(() => {
        let map = mapRef.current
        if (map === null) {
            return
        }
        const bringPolylinesToFront = () => {
            map.eachLayer((layer) => {
                if (layer instanceof L.Polyline) {
                    if (layer._latlngs.length > 2 && layer.options.weight === 7){
                        layer.bringToFront();
                    }
                }
            });
        };

        // Call this function initially and whenever routedata changes
        bringPolylinesToFront();
    }, [routedata]);  
        
    // Used to track if user hovers over the edit button
    const handleEditMouseOver = () => {
        setEditHover(true);
    };
          
    const handleEditMouseOut = () => {
        setEditHover(false);
    };

    // Add CSS for node selection visual feedback
    useEffect(() => {
        if (!document.getElementById('node-selection-styles')) {
            const style = document.createElement('style');
            style.id = 'node-selection-styles';
            style.textContent = `
                .node-selection-marker {
                    filter: hue-rotate(120deg) brightness(1.2);
                    animation: pulse 1s infinite;
                }
                
                @keyframes pulse {
                    0% { transform: scale(1); }
                    50% { transform: scale(1.1); }
                    100% { transform: scale(1); }
                }
                
                /* More specific selectors to override Leaflet styles */
                .leaflet-container.node-selection-active,
                .leaflet-container.node-selection-active .leaflet-zoom-box,
                .leaflet-container.node-selection-active .leaflet-interactive,
                .leaflet-container.node-selection-active .leaflet-marker-icon,
                .leaflet-container.node-selection-active .leaflet-marker-shadow,
                .leaflet-container.node-selection-active .leaflet-tile-pane,
                .leaflet-container.node-selection-active .leaflet-tile,
                .leaflet-container.node-selection-active .leaflet-overlay-pane,
                .leaflet-container.node-selection-active .leaflet-shadow-pane,
                .leaflet-container.node-selection-active .leaflet-marker-pane,
                .leaflet-container.node-selection-active .leaflet-tooltip-pane,
                .leaflet-container.node-selection-active .leaflet-popup-pane {
                    cursor: crosshair !important;
                }
                
                /* Force crosshair on all child elements */
                .node-selection-active * {
                    cursor: crosshair !important;
                }
                
                /* Override specific Leaflet cursors */
                .leaflet-container.node-selection-active.leaflet-grab {
                    cursor: crosshair !important;
                }
                
                .leaflet-container.node-selection-active.leaflet-grabbing {
                    cursor: crosshair !important;
                }
            `;
            document.head.appendChild(style);
        }

        // Update map container and body class based on node selection mode
        const mapContainer = mapRef.current?.getContainer();
        if (mapContainer) {
            if (nodeSelectionMode && nodeSelectionMode.active) {
                mapContainer.classList.add('node-selection-active');
                document.body.style.cursor = 'crosshair';
                mapContainer.style.cursor = 'crosshair !important';
            } else {
                mapContainer.classList.remove('node-selection-active');
                document.body.style.cursor = '';
                mapContainer.style.cursor = '';
            }
        }

        // Cleanup function
        return () => {
            if (nodeSelectionMode && !nodeSelectionMode.active) {
                document.body.style.cursor = '';
                if (mapContainer) {
                    mapContainer.style.cursor = '';
                }
            }
        };
    }, [nodeSelectionMode]);

    // Add this effect to handle map clicks for node selection, with debug logs
    useEffect(() => {
        const map = mapRef.current;
        if (!map) return;
        const handleMapClick = (e) => {
            if (nodeSelectionMode && nodeSelectionMode.active) {
                if (typeof onNodeSelection === 'function') {
                    onNodeSelection(null, [e.latlng.lat, e.latlng.lng]);
                } else {
                    console.error('[Map_Displayer] onNodeSelection is not a function when nodeSelectionMode is active:', onNodeSelection);
                }
            }
        };
        map.on('click', handleMapClick);
        return () => {
            map.off('click', handleMapClick);
        };
    }, [nodeSelectionMode, onNodeSelection]);

    return (
        <ReactLeafletEditable
            ref={editRef}
            map={mapRef.current}
            onDrawingCommit={onDrawingCommit}
            onCancelDrawing={onCancelDrawing}
        >
            <MapContainer
                editable={true}
                center={position}
                zoom={initialState.zoom}
                scrollWheelZoom={true}
                style={{ flex: 1, width: "100%", height: "100%", zIndex: 0,}}
                whenCreated={(map) => { mapRef.current = map; }}
                ref={mapRef}
            >   
                <div className="edit-pane" style={{
                    display: (showEditButton || editing) ? 'block' : 'none'
                }}>
                    <button
                        onClick={enableEditMode}
                        onMouseOver={handleEditMouseOver}
                        onMouseOut={handleEditMouseOut}
                        className="edit-button"
                        style={{ 
                            display: (showEditButton && !editing) ? 'inline-block' : 'none'
                        }}
                    >
                        Edit Selected
                    </button>

                    {cansave !== 0 && (
                        <div className="alert-message">
                            Some changes are forbidden
                        </div>
                    )}

                    <button
                        hidden={!editing}
                        disabled={cansave !== 0}
                        onClick={saveEdits}
                        className="edit-button"
                    >
                        Save
                    </button>
                    
                    <button
                        hidden={!editing}
                        onClick={cancelEdits}
                        className="edit-button"
                    >
                        Cancel
                    </button>
                    
                    {Lines === 0 ? (
                        <button
                            hidden={!editing}
                            disabled={!editing}
                            onClick={() => ChangeLines()}
                            className="toggle-button"
                        >
                            Change to Lines
                        </button>
                    ) : (
                        <button
                            hidden={!editing}
                            onClick={() => ChangedrawPolygons()}
                            className="toggle-button"
                        >
                            Change to Polygons
                        </button>
                    )}
                </div>
                
                <VectorTileLayer
                    key={tileLayer}
                    styleUrl={roadStyle}
                />

                <TempRoadDisplay visibleRoads={visibleTempRoads} />

                {renderLimits()}

                {routedata.slice().reverse().map((route, index) => (
                    <Polyline 
                        key={index} 
                        positions={route.route} 
                        color={route.color} 
                        pathOptions={{
                            color: route.color, 
                            zIndex: route.color === '#661e87' ? 1000000000 : 100000000,
                            weight: 7,
                        }}
                        eventHandlers={{
                            add: (e) => {
                                e.target.bringToFront();
                            },
                        }}  
                    />
                ))}
                
                {segments.map((segment, index) => (
                    <Polyline
                        key={index}
                        id={segment.id}
                        positions={segment.map(point => [point.lat, point.lon])}
                        color="red"
                    >
                        <Tooltip>
                            {"ids: " + segment.map(point => point.id).join(' ') + 
                            " difference: " + Math.abs(segment[0].id - segment[1].id)}
                        </Tooltip>
                    </Polyline>
                ))}
                
                {editing ? (
                    <FeatureGroup ref={editingZonesRef}>
                        {Object.values(modifiedPolygons).map((polygon, index) => {
                            const { color, opacity } = getColorAndOpacity(polygon.properties.type, polygon.properties.effectValue);
                            
                            if (polygon.properties.IsLine === 1) {
                                return (
                                    <Polyline
                                        key={polygon.properties.id}
                                        id={polygon.properties.id}
                                        name={polygon.properties.name}
                                        type={polygon.properties.type}
                                        effectValue={polygon.properties.effectValue}
                                        IsLine={polygon.properties.IsLine}
                                        positions={polygon.geometry.coordinates.map(coord => [coord[1], coord[0]])}
                                        color={color}
                                        fillOpacity={0.5}
                                        weight={7}
                                        width={7}
                                        eventHandlers={{
                                            mouseover: handleMouseOver,
                                            mouseout: handleMouseOut,
                                        }}
                                        pathOptions={{
                                            zIndex: 10000000
                                        }}
                                        originalColor={color}
                                        originalOpacity={opacity}
                                    >
                                        <Tooltip>{`${polygon.properties.name} | ${polygon.properties.type}`}</Tooltip>
                                    </Polyline>
                                );
                            } else {
                                return (
                                    <Polygon
                                        key={polygon.properties.id}
                                        id={polygon.properties.id}
                                        name={polygon.properties.name}
                                        type={polygon.properties.type}
                                        effectValue={polygon.properties.effectValue}
                                        positions={polygon.geometry.coordinates[0].map(coord => [coord[1], coord[0]])}
                                        color={color}
                                        fillOpacity={0.5}
                                        eventHandlers={{
                                            mouseover: handleMouseOver,
                                            mouseout: handleMouseOut,
                                        }}
                                        originalColor={color}
                                        originalOpacity={opacity}
                                    >
                                        <Tooltip>{`${polygon.properties.name} | ${polygon.properties.type}`}</Tooltip>
                                    </Polygon>
                                );
                            }
                        })}
                    </FeatureGroup>
                ) : (
                    <FeatureGroup ref={zonesRef}>
                        {polygons.map((feature, index) => (
                            <GeoJSON
                                key={feature.properties.id}
                                data={feature}
                                style={geoJsonStyle}
                                onEachFeature={onEachFeature}
                            />
                        ))}
                        
                        <EditControl
                            position="topright"
                            onCreated={onDrawCreated}
                            onDrawStart={onDrawStart}
                            onDrawStop={onDrawStop}
                            draw={{
                                polygon: true,
                                rectangle: false,
                                polyline: false,
                                circle: false,
                                circlemarker: false,
                                marker: false
                            }}
                            edit={{
                                edit: false,
                                remove: false
                            }}
                        />
                    </FeatureGroup>
                )}
                
                {/* Hide popup during polygon drawing */}
                {popupPosition && !isDrawingPolygon && (
                    <div
                        style={{
                            position: 'absolute',
                            top: popupPosition.y,
                            left: popupPosition.x,
                            zIndex: 1000,
                            display: 'flex',
                            flexDirection: 'column',
                        }}
                        ref={popupContainer}
                    >
                        <button onClick={() => {
                            router.startMarker.setPosition({lat: popupCoordinates.lat, lng: popupCoordinates.lng}); 
                            setPopupPosition(null);
                        }}>
                            Start Marker
                        </button>
                        <button onClick={() => {
                            router.destinationMarker.setPosition({lat: popupCoordinates.lat, lng: popupCoordinates.lng}); 
                            setPopupPosition(null);
                        }}>
                            End Marker
                        </button>
                    </div>
                )}
                
                <ClickHandler onClick={handleClick} />
            </MapContainer>
        </ReactLeafletEditable>
    );
}

export default Map_Displayer;